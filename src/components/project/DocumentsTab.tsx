import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  NativeModules,
  Platform,
} from 'react-native';
import { Colors, Fonts } from '../../theme';
import { ProjectDocument } from '../../api/interfaces/ProjectTypes';

const FILE_ICONS: Record<string, string> = {
  pdf: '\u{1F4C4}',
  doc: '\u{1F4DD}',
  image: '\u{1F5BC}',
  spreadsheet: '\u{1F4CA}',
  presentation: '\u{1F4CA}',
};

interface Props {
  documents: ProjectDocument[];
}

const enableSecureWindow = () => {
  if (Platform.OS === 'android' && NativeModules.AndroidWindow) {
    try {
      NativeModules.AndroidWindow.setSecureFlag(true);
    } catch {
      // native module not available
    }
  }
};

const disableSecureWindow = () => {
  if (Platform.OS === 'android' && NativeModules.AndroidWindow) {
    try {
      NativeModules.AndroidWindow.setSecureFlag(false);
    } catch {
      // native module not available
    }
  }
};

const DocumentsList: React.FC<{
  documents: ProjectDocument[];
  onSelect: (doc: ProjectDocument) => void;
}> = ({ documents, onSelect }) => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    {documents.map((doc) => (
      <TouchableOpacity
        key={doc.id}
        style={styles.docCard}
        activeOpacity={0.7}
        onPress={() => onSelect(doc)}
      >
        <Text style={styles.fileIcon}>{FILE_ICONS[doc.type] || '\u{1F4C4}'}</Text>
        <View style={styles.docInfo}>
          <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
          <Text style={styles.docMeta}>{doc.size} \u00B7 {doc.uploadDate}</Text>
        </View>
        <Text style={styles.chevron}>{'\u203A'}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const DocumentViewer: React.FC<{
  documents: ProjectDocument[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}> = ({ documents, currentIndex, onClose, onPrev, onNext }) => {
  const doc = documents[currentIndex];
  const total = documents.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  useEffect(() => {
    enableSecureWindow();
    return () => disableSecureWindow();
  }, []);

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.headerBtn}>{'\u2715'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.modalTitle} numberOfLines={1}>{doc.name}</Text>
          <Text style={styles.pageIndicator}>{currentIndex + 1} / {total}</Text>
        </View>
        <View style={styles.headerBtnPlaceholder} />
      </View>

      <View style={styles.securityBar}>
        <Text style={styles.securityIcon}>{'\u{1F512}'}</Text>
        <Text style={styles.securityText}>View Only  |  Screenshots Blocked  |  Download Restricted</Text>
      </View>

      <View style={styles.watermarkOverlay} pointerEvents="none">
        {[...Array(8)].map((_, i) => (
          <Text key={i} style={styles.watermarkText}>CONFIDENTIAL</Text>
        ))}
      </View>

      <ScrollView
        style={styles.documentContent}
        contentContainerStyle={styles.documentContentInner}
      >
        <Text style={styles.documentText}>{doc.content}</Text>
      </ScrollView>

      <View style={styles.navFooter}>
        <TouchableOpacity
          style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
          onPress={onPrev}
          disabled={isFirst}
        >
          <Text style={[styles.navArrow, isFirst && styles.navArrowDisabled]}>{'\u2039'}</Text>
          <Text style={[styles.navLabel, isFirst && styles.navLabelDisabled]}>Previous</Text>
        </TouchableOpacity>

        <View style={styles.navDots}>
          {documents.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.navBtn, isLast && styles.navBtnDisabled]}
          onPress={onNext}
          disabled={isLast}
        >
          <Text style={[styles.navLabel, isLast && styles.navLabelDisabled]}>Next</Text>
          <Text style={[styles.navArrow, isLast && styles.navArrowDisabled]}>{'\u203A'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DocumentsTab: React.FC<Props> = ({ documents }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = useCallback(
    (doc: ProjectDocument) => {
      const idx = documents.findIndex((d) => d.id === doc.id);
      setSelectedIndex(idx);
    },
    [documents],
  );

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null && prev < documents.length - 1 ? prev + 1 : prev,
    );
  }, [documents.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  if (documents.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No documents available for this project.</Text>
      </View>
    );
  }

  return (
    <>
      <DocumentsList documents={documents} onSelect={handleSelect} />

      <Modal
        visible={selectedIndex !== null}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          {selectedIndex !== null && (
            <DocumentViewer
              documents={documents}
              currentIndex={selectedIndex}
              onClose={handleClose}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          )}
        </View>
      </Modal>
    </>
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
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  docMeta: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textSecondary,
    marginLeft: 8,
  },

  /* ── Modal ─────────────────────────────────────────────── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
  },
  headerBtn: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '700',
    width: 32,
  },
  headerBtnPlaceholder: {
    width: 32,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  pageIndicator: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },

  /* ── Security Bar ──────────────────────────────────────── */
  securityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  securityIcon: {
    fontSize: 12,
  },
  securityText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.secondary,
  },

  /* ── Watermark ─────────────────────────────────────────── */
  watermarkOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    bottom: 64,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    transform: [{ rotate: '-25deg' }],
    gap: 28,
  },
  watermarkText: {
    fontSize: 20,
    fontWeight: '800',
    color: 'rgba(192,0,0,0.07)',
    letterSpacing: 8,
  },

  /* ── Document Content ──────────────────────────────────── */
  documentContent: {
    flex: 1,
    maxHeight: 400,
  },
  documentContentInner: {
    padding: 20,
    paddingBottom: 32,
  },
  documentText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textPrimary,
    lineHeight: 22,
  },

  /* ── Navigation Footer ─────────────────────────────────── */
  navFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navArrow: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: '700',
  },
  navArrowDisabled: {
    color: Colors.textSecondary,
  },
  navLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  navLabelDisabled: {
    color: Colors.textSecondary,
  },
  navDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});

export default DocumentsTab;
