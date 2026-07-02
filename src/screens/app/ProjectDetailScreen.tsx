import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Colors, Fonts } from '../../theme';
import AppScreen from '../../components/layout/AppScreen';
import AppHeader from '../../components/common/AppHeader';
import { ProjectService } from '../../services/ProjectService';
import { useSocket } from '../../context/SocketContext';
import DocumentsTab from '../../components/project/DocumentsTab';
import ChatTab from '../../components/project/ChatTab';
import HighlightsTab from '../../components/project/HighlightsTab';

type ParamList = {
  ProjectDetail: { projectId: string };
};

const TABS = [
  { key: 'documents', label: 'Documents' },
  { key: 'chat', label: 'Chat' },
  { key: 'highlights', label: 'Highlights' },
];

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  in_progress: { label: 'In Progress', color: '#003C64' },
  completed: { label: 'Completed', color: '#16A34A' },
  on_hold: { label: 'On Hold', color: '#C5122C' },
};

const ProjectDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'ProjectDetail'>>();
  const { projectId } = route.params;
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState('documents');
  const { joinProject, leaveProject } = useSocket();

  const project = ProjectService.getProjectById(projectId);
  const documents = useMemo(() => ProjectService.getDocuments(projectId), [projectId]);
  const highlights = useMemo(() => ProjectService.getHighlights(projectId), [projectId]);

  useEffect(() => {
    joinProject(projectId);
    return () => leaveProject();
  }, [projectId, joinProject, leaveProject]);

  const headerCollapseAnim = useRef(new Animated.Value(0)).current;
  const isChat = activeTab === 'chat';

  useEffect(() => {
    Animated.timing(headerCollapseAnim, {
      toValue: isChat ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isChat, headerCollapseAnim]);

  const headerTranslateY = headerCollapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -140],
  });

  const headerOpacity = headerCollapseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1, 0],
  });

  const tabsTranslateY = headerCollapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const tabsOpacity = headerCollapseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1, 0],
  });

  const handleBack = useCallback(() => {
    if (isChat) {
      setActiveTab('documents');
    } else {
      navigation.goBack();
    }
  }, [isChat, navigation]);

  if (!project) {
    return (
      <AppScreen>
        <AppHeader title="Project" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Project not found.</Text>
        </View>
      </AppScreen>
    );
  }

  const statusCfg = STATUS_LABEL[project.status] || STATUS_LABEL.in_progress;
  const tabWidth = (width - 32) / TABS.length;

  return (
    <AppScreen>
      <AppHeader title={project.name} onBack={handleBack} />
      <View style={styles.root}>
        <Animated.View
          style={[
            styles.headerCollapsible,
            {opacity: headerOpacity, transform: [{translateY: headerTranslateY}]},
            isChat && styles.collapsedLayout,
          ]}
        >
        <View style={styles.projectHeader}>
          <View style={styles.headerTopRow}>
            <Text style={styles.projectName} numberOfLines={4}>{project.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + '18' }]}>
              <Text style={[styles.statusText, { color: statusCfg.color }]}>
                {statusCfg.label}
              </Text>
            </View>
          </View>
          <Text style={styles.projectDesc}>{project.description}</Text>
          <View style={styles.projectMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Deadline</Text>
              <Text style={styles.metaValue}>{project.deadline}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Team</Text>
              <Text style={styles.metaValue}>{project.teamMembers} members</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Progress</Text>
              <Text style={styles.metaValue}>{project.progress}%</Text>
            </View>
          </View>
        </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.tabsCollapsible,
            {opacity: tabsOpacity, transform: [{translateY: tabsTranslateY}]},
            isChat && styles.collapsedLayout,
          ]}
        >
        <View style={styles.segmentBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.segmentTab,
                  { width: tabWidth },
                  isActive && styles.segmentTabActive,
                ]}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.segmentLabel,
                    isActive && styles.segmentLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        </Animated.View>

        <View style={styles.tabContent}>
          {activeTab === 'documents' && <DocumentsTab documents={documents} />}
          {activeTab === 'chat' && <ChatTab projectId={projectId} isFullScreen={isChat} />}
          {activeTab === 'highlights' && <HighlightsTab highlights={highlights} />}
        </View>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.subtle,
  },
  headerCollapsible: {
    zIndex: 2,
  },
  collapsedLayout: {
    height: 0,
    overflow: 'hidden',
    paddingVertical: 0,
    marginVertical: 0,
    borderWidth: 0,
  },
  tabsCollapsible: {
    zIndex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  projectHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  projectName: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 10,
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
  projectDesc: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  projectMeta: {
    flexDirection: 'row',
    gap: 20,
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
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  segmentTab: {
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentTabActive: {
    backgroundColor: Colors.primary,
  },
  segmentLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentLabelActive: {
    color: Colors.white,
  },
  tabContent: {
    flex: 1,
  },
});

export default ProjectDetailScreen;
