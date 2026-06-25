import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AppScreen from '../../components/layout/AppScreen';
import AppHeader from '../../components/common/AppHeader';
import AvatarBadge from '../../components/common/AvatarBadge';
import { useAppSelector } from '../../redux/hooks';
import {getProfileImageUri} from '../../utils/profileImage';
import { Colors, Fonts } from '../../theme';

/* ─── Helpers ──────────────────────────────────────────────────────────── */

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const calculateExperience = (doj?: string): string => {
  if (!doj) return '—';
  const join = new Date(doj);
  if (isNaN(join.getTime())) return '—';
  const now = new Date();
  let years = now.getFullYear() - join.getFullYear();
  let months = now.getMonth() - join.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years < 1) return `${months} months`;
  return `${years}y ${months}m`;
};

/* ─── Profile Section Header ──────────────────────────────────────────── */

const ProfileHeader: React.FC<{
  initials: string;
  fullName: string;
  designation: string;
  department: string;
  imageUrl?: string | null;
}> = ({ initials, fullName, designation, department, imageUrl }) => (
  <View style={styles.heroSection}>
    <View style={styles.heroBg} />
    <View style={styles.heroContent}>
      <View style={styles.avatarOuterRing}>
        <View style={styles.avatarInnerRing}>
          <AvatarBadge initials={initials} size={70} imageUrl={imageUrl} />
        </View>
      </View>
      <Text style={styles.heroName}>{fullName}</Text>
      <Text style={styles.heroDesignation}>{designation}</Text>
      <View style={styles.heroChipRow}>
        <View style={styles.heroChip}>
          <Text style={styles.heroChipText}>{department}</Text>
        </View>
      </View>
    </View>
  </View>
);

/* ─── Info Card ────────────────────────────────────────────────────────── */

interface InfoCardProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, children }) => (
  <View style={styles.infoCard}>
    <View style={styles.infoCardHeader}>
      <View style={styles.infoCardIconWrap}>
        <Text style={styles.infoCardIcon}>{icon}</Text>
      </View>
      <Text style={styles.infoCardTitle}>{title}</Text>
    </View>
    <View style={styles.infoCardBody}>
      {children}
    </View>
  </View>
);

/* ─── Info Row ─────────────────────────────────────────────────────────── */

interface InfoRowProps {
  label: string;
  value?: string | null;
}

const ProfileInfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoRowLabel}>{label}</Text>
    <Text style={styles.infoRowValue} numberOfLines={1}>{value || '—'}</Text>
  </View>
);

/* ─── Stat Block ────────────────────────────────────────────────────────── */

interface StatBlockProps {
  value: string;
  label: string;
}

const StatBlock: React.FC<StatBlockProps> = ({ value, label }) => (
  <View style={styles.statBlock}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/* ─── Component ──────────────────────────────────────────────────────── */

const ProfileScreen: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return (
      <AppScreen style={styles.center}>
        <Text style={styles.emptyText}>No profile data available</Text>
      </AppScreen>
    );
  }

  const initials = `${user.FirstName?.charAt(0) || ''}${user.LastName?.charAt(0) || ''}`;
  const fullName = `${user.FirstName || ''} ${user.LastName || ''}`.trim();
  const mentorName = `${user.mentorFirstName || ''} ${user.mentorLastName || ''}`.trim();
  const mentorInitials = `${user.mentorFirstName?.charAt(0) || ''}${user.mentorLastName?.charAt(0) || ''}`;

  return (
    <AppScreen>
      <AppHeader title="My Profile" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <ProfileHeader
          initials={initials}
          fullName={fullName}
          designation={user.Designation}
          department={user.Department}
          imageUrl={getProfileImageUri(user.ProfilePicture)}
        />

        {/* ── Stats ────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatBlock value={user.EmployeeCode || '—'} label="Employee Code" />
          <View style={styles.statDivider} />
          <StatBlock value={calculateExperience(user.DateOfJoining)} label="Experience" />
          <View style={styles.statDivider} />
          <StatBlock value={user.ResourceNo || '—'} label="Resource No" />
        </View>

        {/* ── Employment ───────────────────────────────────────────── */}
        <InfoCard icon="&#128188;" title="Employment">
          <ProfileInfoRow label="Employee ID" value={user.EmployeeID} />
          <ProfileInfoRow label="Tech Stream" value={user.TechStream} />
          <ProfileInfoRow label="Date of Joining" value={formatDate(user.DateOfJoining)} />
          <ProfileInfoRow label="Resource" value={user.ResourceName} />
          <ProfileInfoRow
            label="Internal Resource"
            value={user.IsInternalResource ? 'Yes' : 'No'}
          />
        </InfoCard>

        {/* ── Personal ─────────────────────────────────────────────── */}
        <InfoCard icon="&#128100;" title="Personal">
          <ProfileInfoRow label="Full Name" value={fullName} />
          <ProfileInfoRow label="Father's Name" value={user.FatherName} />
          <ProfileInfoRow label="Date of Birth" value={formatDate(user.DateOfBirth)} />
          <ProfileInfoRow label="Marital Status" value={user.MaritalStatus} />
          <ProfileInfoRow label="Blood Group" value={user.BloodGroup} />
        </InfoCard>

        {/* ── Contact ──────────────────────────────────────────────── */}
        <InfoCard icon="&#128231;" title="Contact">
          <ProfileInfoRow label="Corporate Email" value={user.CorporateEmailID} />
        </InfoCard>

        {/* ── Mentor / Backup Lead ──────────────────────────────────── */}
        <InfoCard icon="&#128170;" title="Mentor / Backup Lead">
          <View style={styles.mentorRow}>
            <View style={styles.mentorAvatarWrap}>
              <AvatarBadge
                initials={mentorInitials || '?'}
                size={48}
                imageUrl={getProfileImageUri(user.MentorProfilePicture)}
              />
            </View>
            <View style={styles.mentorInfo}>
              <Text style={styles.mentorName}>{mentorName || '—'}</Text>
              <Text style={styles.mentorEmail}>{user.mentorCorporateEmailID || '—'}</Text>
            </View>
          </View>
        </InfoCard>

        {/* ── Documents ────────────────────────────────────────────── */}
        <InfoCard icon="&#128196;" title="Documents & IDs">
          <ProfileInfoRow label="PAN No" value={user.PANNo} />
          <ProfileInfoRow label="PF No" value={user.PFNo} />
          <ProfileInfoRow label="ESI No" value={user.ESINo} />
          <ProfileInfoRow label="Passport No" value={user.PassPortNo} />
        </InfoCard>
      </ScrollView>
    </AppScreen>
  );
};

/* ─── Styles ──────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  /* ── Hero Section ──────────────────────────────────────────────── */
  heroSection: {
    position: 'relative',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  avatarOuterRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInnerRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroName: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroDesignation: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heroChip: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  heroChipText: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },

  /* ── Stats Row ─────────────────────────────────────────────────── */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  /* ── Info Card ─────────────────────────────────────────────────── */
  infoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  infoCardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoCardIcon: {
    fontSize: 16,
  },
  infoCardTitle: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  infoCardBody: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  /* ── Info Row ──────────────────────────────────────────────────── */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border + '60',
  },
  infoRowLabel: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    flex: 1,
  },
  infoRowValue: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
    textAlign: 'right',
    flex: 1.2,
  },

  /* ── Mentor ────────────────────────────────────────────────────── */
  mentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  mentorAvatarWrap: {
    marginRight: 14,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  mentorEmail: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
});

export default ProfileScreen;
