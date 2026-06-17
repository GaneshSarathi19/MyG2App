import {store} from '../redux/store';
import {logout, refreshTokenSuccess} from '../redux/slices/authSlice';
import {AuthService} from './AuthService';
import {logger} from '../utils/logger';
import {TOKEN_REFRESH_BUFFER_MS} from '../api/config';

/**
 * Background token refresh service.
 *
 * Automatically refreshes the auth token before it expires
 * and dispatches the updated token to the Redux store.
 */
class TokenRefreshService {
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Starts the background token refresh monitoring.
   * Call this once after successful login or on app startup.
   */
  start(): void {
    this.scheduleNextRefresh();
  }

  /**
   * Stops the background token refresh monitoring.
   * Call this on logout.
   */
  stop(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Schedules the next token refresh based on the current token expiry.
   */
  private scheduleNextRefresh(): void {
    const state = store.getState();
    const {tokenExpiry, isLoggedIn} = state.auth;

    if (!isLoggedIn || !tokenExpiry) {
      return;
    }

    const now = Date.now();
    const timeUntilExpiry = tokenExpiry - now;
    const refreshDelay = Math.max(timeUntilExpiry - TOKEN_REFRESH_BUFFER_MS, 0);

    this.stop();

    this.refreshTimer = setTimeout(() => {
      this.performRefresh();
    }, refreshDelay);

    logger.log(
      `[TokenRefreshService] Scheduled refresh in ${Math.round(refreshDelay / 1000)}s (token expires in ${Math.round(timeUntilExpiry / 1000)}s)`,
    );
  }

  /**
   * Performs the actual token refresh.
   *
   * TODO: Replace with actual backend refresh endpoint when available.
   */
  private async performRefresh(): Promise<void> {
    logger.log('[TokenRefreshService] Performing token refresh...');

    try {
      // TODO: Call actual backend refresh endpoint
      // const state = store.getState();
      // const response = await AuthService.refreshToken(state.auth.refreshToken);

      // For now, log that the endpoint needs implementation
      logger.warn(
        '[TokenRefreshService] Backend refresh endpoint not yet implemented. ' +
          'Token will expire unless backend provides refresh support.',
      );

      // Example implementation when backend is ready:
      // store.dispatch(
      //   refreshTokenSuccess({
      //     authToken: response.data.token,
      //     tokenExpiry: Date.now() + response.data.expiresIn,
      //   }),
      // );
      // this.scheduleNextRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      logger.error('[TokenRefreshService] Refresh failed:', message);

      // Refresh failed - log out the user
      store.dispatch(logout());
    }
  }
}

export const tokenRefreshService = new TokenRefreshService();
