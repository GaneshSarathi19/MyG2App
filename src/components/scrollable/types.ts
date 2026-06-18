import {FlatListProps, ViewStyle} from 'react-native';
import {ScrollIndicatorType} from './ScrollIndicators';

/**
 * Pagination state for tracking load-more progress.
 * Use this to manage pagination in parent components.
 */
export interface PaginationState {
  /** Current page number (0-indexed). */
  page: number;
  /** Number of items per page. */
  pageSize: number;
  /** Whether more data is being fetched. */
  loadingMore: boolean;
  /** Whether all data has been loaded. */
  hasMore: boolean;
  /** Total number of items available from the API. */
  totalCount: number | null;
}

/** Default pagination state. */
export const defaultPaginationState: PaginationState = {
  page: 0,
  pageSize: 20,
  loadingMore: false,
  hasMore: true,
  totalCount: null,
};

/**
 * Props for the `ScrollableList` component.
 * Extends `FlatListProps` so all standard FlatList props are available.
 */
export interface ScrollableListProps<T extends object = any> extends Omit<FlatListProps<T>, 'refreshControl'> {
  /**
   * Called when the user scrolls near the end of the list.
   * Use this to trigger pagination / load more data.
   */
  onEndReached?: (info: {distanceFromEnd: number}) => void;

  /**
   * Called when the user pulls down to refresh.
   * If provided, a `RefreshControl` is automatically attached.
   */
  onRefresh?: () => void;

  /**
   * Whether the list is in a loading state (initial load).
   * Shows a loading spinner when the list is empty.
   */
  isLoading?: boolean;

  /**
   * Whether more data is being loaded (pagination in progress).
   * Shows a loading spinner at the bottom of the list.
   */
  loadingMore?: boolean;

  /** Custom style for the scroll indicator buttons. */
  scrollIndicatorStyle?: ViewStyle;

  /** Whether to show scroll-to-top/bottom indicator buttons. @default true */
  showScrollIndicators?: boolean;

  /** Text to show when the list is empty and not loading. @default 'No items found' */
  emptyText?: string;

  /** Distance scrolled from top (in px) before showing the scroll-to-top button. @default 150 */
  scrollToTopThreshold?: number;

  /** Distance remaining from bottom (in px) before showing the scroll-to-bottom button. @default 150 */
  scrollToBottomThreshold?: number;

  /** Visual style variant for the scroll indicator buttons. @default FLOATING */
  scrollIndicatorType?: ScrollIndicatorType;
}

/**
 * Helper to update pagination state after a successful API call.
 *
 * @param state - Current pagination state.
 * @param itemCount - Number of items fetched in this batch.
 * @param totalCount - Total number of items available from the API.
 * @returns Updated PaginationState.
 */
export function updatePagination(
  state: PaginationState,
  itemCount: number,
  totalCount: number,
): PaginationState {
  const newTotal = totalCount ?? state.totalCount;
  const newHasMore = itemCount === state.pageSize && (state.page + 1) * state.pageSize < (newTotal ?? Infinity);

  return {
    ...state,
    page: state.page + 1,
    loadingMore: false,
    hasMore: newHasMore,
    totalCount: newTotal,
  };
}

/**
 * Helper to reset pagination state.
 *
 * @param pageSize - Optional page size to set. @default 20
 * @returns Reset PaginationState.
 */
export function resetPagination(pageSize?: number): PaginationState {
  return {
    ...defaultPaginationState,
    pageSize: pageSize ?? defaultPaginationState.pageSize,
  };
}
