import React, {useRef, useState, useCallback, useMemo} from 'react';
import {
  FlatList,
  ScrollView,
  ActivityIndicator,
  View,
  StyleSheet,
  FlatListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ViewStyle,
} from 'react-native';

import {ScrollIndicator, ScrollIndicatorType} from './ScrollIndicators';
import {ScrollableListProps, PaginationState} from './types';

/* ── Constants ──────────────────────────────────────────────────────── */

/** Distance from top before showing the "scroll to top" button. */
const SCROLL_TOP_THRESHOLD = 150;

/** Distance from bottom before showing the "scroll to bottom" button. */
const SCROLL_BOTTOM_THRESHOLD = 150;

/* ── Component ──────────────────────────────────────────────────────── */

/**
 * A reusable, fully-featured scrollable list component with:
 *  - Scroll-to-top and scroll-to-bottom floating buttons
 *  - Pull-to-refresh support
 *  - Pagination (load more on end reach)
 *  - Loading states for initial load and pagination
 *  - Full TypeScript support for item type `T`
 */
export function ScrollableList<T extends object>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  contentContainerStyle,
  scrollIndicatorStyle,
  showScrollIndicators = true,
  loadingMore = false,
  isLoading = false,
  emptyText = 'No items found',
  initialNumToRender = 10,
  maxToRenderPerBatch = 10,
  windowSize = 10,
  scrollToTopThreshold = SCROLL_TOP_THRESHOLD,
  scrollToBottomThreshold = SCROLL_BOTTOM_THRESHOLD,
  scrollIndicatorType = ScrollIndicatorType.FLOATING,
  ...flatListProps
}: ScrollableListProps<T>) {
  const listRef = useRef<FlatList<T>>(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  /* ── Scroll Handlers ──────────────────────────────────────────────── */

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
      const scrollY = contentOffset.y;
      const maxScrollY = contentSize.height - layoutMeasurement.height;

      setShowScrollTop(scrollY > scrollToTopThreshold);
      setShowScrollBottom(maxScrollY - scrollY > scrollToBottomThreshold && maxScrollY > 0);

      flatListProps.onScroll?.(event);
    },
    [flatListProps.onScroll, scrollToTopThreshold, scrollToBottomThreshold],
  );

  /* ── Scroll Actions ───────────────────────────────────────────────── */

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({offset: 0, animated: true});
  }, []);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({animated: true});
  }, []);

  /* ── Pagination Footer ────────────────────────────────────────────── */

  const FooterComponent = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={COLORS.navy} />
        </View>
      );
    }

    if (ListFooterComponent) {
      return <>{ListFooterComponent}</>;
    }

    return null;
  }, [loadingMore, ListFooterComponent]);

  /* ── Empty State ──────────────────────────────────────────────────── */

  const EmptyComponent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer} testID="scrollable-loading">
          <ActivityIndicator size="large" color={COLORS.navy} />
        </View>
      );
    }

    if (ListEmptyComponent) {
      return <>{ListEmptyComponent}</>;
    }

    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconCircle}>
          <View style={styles.emptyIcon} />
        </View>
        <View style={styles.emptyTextContainer}>
          <View style={styles.emptyTitle}>
            <View style={styles.emptyTitleLine} />
          </View>
          <View style={styles.emptySubtitle}>
            <View style={styles.emptySubtitleLine} />
          </View>
        </View>
      </View>
    );
  }, [isLoading, ListEmptyComponent, emptyText]);

  /* ── Render ───────────────────────────────────────────────────────── */

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.navy]}
              tintColor={COLORS.navy}
            />
          ) : undefined
        }
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={FooterComponent}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={[
          styles.contentContainer,
          data?.length === 0 && styles.emptyContentContainer,
          contentContainerStyle,
        ]}
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={maxToRenderPerBatch}
        windowSize={windowSize}
        {...flatListProps}
      />

      {showScrollIndicators && (
        <>
          {showScrollTop && (
            <ScrollIndicator
              type="top"
              onPress={scrollToTop}
              variant={scrollIndicatorType}
              style={scrollIndicatorStyle}
              testID="scroll-to-top"
            />
          )}
          {showScrollBottom && (
            <ScrollIndicator
              type="bottom"
              onPress={scrollToBottom}
              variant={scrollIndicatorType}
              style={scrollIndicatorStyle}
              testID="scroll-to-bottom"
            />
          )}
        </>
      )}
    </View>
  );
}

/* ── Colors ────────────────────────────────────────────────────────── */

const COLORS = {
  navy: '#003C64',
  white: '#FFFFFF',
  dark: '#1A1A2E',
  gray: '#706B6B',
  subtle: '#F5F6F8',
};

/* ── Styles ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.navy}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.navy}15`,
  },
  emptyTextContainer: {
    alignItems: 'center',
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyTitleLine: {
    width: 120,
    height: 16,
    borderRadius: 4,
    backgroundColor: `${COLORS.dark}15`,
  },
  emptySubtitle: {
    marginBottom: 4,
  },
  emptySubtitleLine: {
    width: 180,
    height: 12,
    borderRadius: 4,
    backgroundColor: `${COLORS.gray}15`,
  },
  footerLoader: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ScrollableList;
