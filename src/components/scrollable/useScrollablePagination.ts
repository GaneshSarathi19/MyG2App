import {useState, useCallback} from 'react';

import {defaultPaginationState, resetPagination as doReset, updatePagination, PaginationState} from './types';
export type {PaginationState};

/**
 * Hook for managing pagination state in conjunction with `ScrollableList`.
 *
 * Usage:
 * ```ts
 * const { pagination, onLoadMore, onRefresh, setPagination } = useScrollablePagination(20);
 *
 * <ScrollableList
 *   data={items}
 *   onEndReached={onLoadMore}
 *   onRefresh={onRefresh}
 *   loadingMore={pagination.loadingMore}
 *   isLoading={loading}
 * />
 * ```
 *
 * @param pageSize - Number of items per page. @default 20
 * @returns Pagination controls and state.
 */
export function useScrollablePagination(pageSize = 20) {
  const [pagination, setPagination] = useState<PaginationState>({
    ...defaultPaginationState,
    pageSize,
  });

  /**
   * Call this in `onEndReached` to start the next page load.
   * Use `fetchNextPage` for the actual API call.
   */
  const onLoadMore = useCallback(() => {
    if (!pagination.hasMore || pagination.loadingMore) {
      return;
    }
    setPagination(prev => ({...prev, loadingMore: true}));
  }, [pagination.hasMore, pagination.loadingMore]);

  /**
   * Call this in `onRefresh` to reset pagination state.
   */
  const onRefresh = useCallback(() => {
    setPagination(doReset(pageSize));
  }, [pageSize]);

  /**
   * Call this after a successful API fetch to update pagination.
   *
   * @param itemCount - Number of items fetched in this batch.
   * @param totalCount - Total number of items available from the API.
   */
  const afterFetch = useCallback(
    (itemCount: number, totalCount: number) => {
      setPagination(prev => updatePagination(prev, itemCount, totalCount));
    },
    [],
  );

  return {
    pagination,
    setPagination,
    onLoadMore,
    onRefresh,
    afterFetch,
  };
}
