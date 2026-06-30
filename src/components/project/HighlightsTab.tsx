import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors, Fonts } from '../../theme';
import { Highlight } from '../../api/interfaces/ProjectTypes';

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  feedback: { label: 'Feedback', color: '#003C64', bg: '#E8F0FE' },
  reminder: { label: 'Reminder', color: '#C5122C', bg: '#FFE8E8' },
  pointer: { label: 'Pointer', color: '#F86F18', bg: '#FFF3E0' },
};

interface Props {
  highlights: Highlight[];
}

const HighlightsTab: React.FC<Props> = ({ highlights }) => {
  if (highlights.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No highlights recorded for this project.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {highlights.map((item) => {
        const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.feedback;
        return (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.badgeText, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.author}>{item.author}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
  },
  date: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  description: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.subtle,
    paddingTop: 8,
  },
  author: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default HighlightsTab;
