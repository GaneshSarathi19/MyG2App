import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Fonts } from '../../theme';
import AppScreen from '../../components/layout/AppScreen';
import AppHeader from '../../components/common/AppHeader';
import { ProjectService } from '../../services/ProjectService';
import { TeamMember } from '../../api/interfaces/ProjectTypes';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  in_progress: { label: 'In Progress', color: '#003C64', bg: '#E8F0FE' },
  completed: { label: 'Completed', color: '#16A34A', bg: '#E8F5E9' },
  on_hold: { label: 'On Hold', color: '#C5122C', bg: '#FFE8E8' },
};

const PRIORITY_DOT: Record<string, string> = {
  high: '#C5122C',
  medium: '#F86F18',
  low: '#16A34A',
};

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <View style={styles.memberCard}>
    <View style={[styles.memberAvatar, { backgroundColor: Colors.primary }]}>
      <Text style={styles.memberAvatarText}>{member.initials}</Text>
    </View>
    <View style={styles.memberInfo}>
      <Text style={styles.memberName}>{member.name}</Text>
      <View style={styles.memberRoleRow}>
        <View style={[styles.roleDot, { backgroundColor: Colors.primary }]} />
        <Text style={styles.memberRole}>{member.role}</Text>
      </View>
    </View>
  </View>
);

const TeamModal: React.FC<{
  visible: boolean;
  projectName: string;
  members: TeamMember[];
  onClose: () => void;
}> = ({ visible, projectName, members, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderLeft}>
            <View style={styles.modalHeaderIconCircle}>
              <Text style={styles.modalHeaderIconText}>P</Text>
            </View>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle} numberOfLines={1}>{projectName}</Text>
              <Text style={styles.modalSubtitle}>{members.length} Team Member{members.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <Text style={styles.modalClose}>{'\u2715'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
          {members.map((m, i) => (
            <TeamMemberCard key={i} member={m} />
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const ProjectListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const projects = ProjectService.getProjects();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [teamModal, setTeamModal] = useState<{
    name: string;
    members: TeamMember[];
  } | null>(null);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AppScreen>
      <AppHeader title="My Projects" />
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Assigned Projects ({projects.length})</Text>
        {projects.map((project) => {
          const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.in_progress;
          const isExpanded = expanded.has(project.id);
          return (
            <View key={project.id} style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
              >
                <View style={styles.cardTop}>
                  <View style={styles.titleRow}>
                    <View style={[styles.priorityDot, { backgroundColor: PRIORITY_DOT[project.priority] }]} />
                    <Text style={styles.cardTitle} numberOfLines={1}>{project.name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                    <Text style={[styles.statusText, { color: statusCfg.color }]}>
                      {statusCfg.label}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text style={styles.cardDesc} numberOfLines={isExpanded ? undefined : 2}>
                    {project.description}
                  </Text>
                  <TouchableOpacity onPress={() => toggleExpanded(project.id)}>
                    <Text style={styles.moreText}>
                      {isExpanded ? 'less' : 'more'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Deadline</Text>
                  <Text style={styles.metaValue}>{project.deadline}</Text>
                </View>
                <TouchableOpacity
                  style={styles.metaItem}
                  onPress={() =>
                    setTeamModal({ name: project.name, members: project.members })
                  }
                >
                  <Text style={styles.metaLabel}>Team</Text>
                  <Text style={styles.metaValueLink}>{project.teamMembers} members</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
              >
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressPercent}>{project.progress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${project.progress}%` },
                        project.progress === 100 && styles.progressFillCompleted,
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <TeamModal
        visible={!!teamModal}
        projectName={teamModal?.name || ''}
        members={teamModal?.members || []}
        onClose={() => setTeamModal(null)}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.subtle,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  moreText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 4,
    marginBottom: 10,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  metaValue: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  metaValueLink: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.subtle,
    paddingTop: 10,
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  progressPercent: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.subtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  progressFillCompleted: {
    backgroundColor: '#16A34A',
  },

  /* ── Team Modal ────────────────────────────────────── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '82%',
    maxHeight: '82%',
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: Colors.primary,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  modalHeaderIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalHeaderIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.white,
  },
  modalSubtitle: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '700',
  },
  modalBody: {
    flex: 1,
    backgroundColor: Colors.subtle,
  },
  modalBodyContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 10,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  memberAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  memberAvatarText: {
    color: Colors.white,
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  memberRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  memberRole: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
});

export default ProjectListScreen;
