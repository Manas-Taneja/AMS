/**
 * Analytics Service
 * 
 * Abstraction layer for analytics tracking
 * Ready for integration with Google Analytics, Plausible, PostHog, or other providers
 * GDPR-compliant with consent management
 */

import { logger } from './logger';

// Analytics events types
export type AnalyticsEvent = 
  | 'page_view'
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  | 'button_click'
  | 'form_submit'
  | 'form_error'
  | 'api_error'
  | 'feature_used'
  | 'asset_created'
  | 'asset_updated'
  | 'asset_deleted'
  | 'asset_transferred'
  | 'export_data'
  | 'search'
  | 'filter_applied';

// User properties
export interface UserProperties {
  userId?: string;
  email?: string;
  role?: string;
  segment?: string;
  [key: string]: unknown;
}

// Event properties
export interface EventProperties {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

// Consent types
export type ConsentType = 'analytics' | 'marketing' | 'necessary';

class AnalyticsService {
  private isInitialized = false;
  private consent: Record<ConsentType, boolean> = {
    necessary: true, // Always true
    analytics: false,
    marketing: false,
  };
  private userId: string | null = null;
  private userProperties: UserProperties = {};

  /**
   * Initialize analytics service
   */
  init(): void {
    if (this.isInitialized) return;

    // Load consent from localStorage
    this.loadConsent();

    // Initialize analytics providers here
    // Example: Google Analytics, Plausible, PostHog, etc.
    if (this.hasConsent('analytics')) {
      this.initializeProviders();
    }

    this.isInitialized = true;
    logger.debug('Analytics service initialized', { consent: this.consent });
  }

  /**
   * Initialize analytics providers
   * Add your provider initialization code here
   */
  private initializeProviders(): void {
    // Example: Initialize Google Analytics
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('js', new Date());
    //   window.gtag('config', 'GA_MEASUREMENT_ID');
    // }

    // Example: Initialize Plausible
    // if (typeof window !== 'undefined') {
    //   const script = document.createElement('script');
    //   script.defer = true;
    //   script.dataset.domain = 'yourdomain.com';
    //   script.src = 'https://plausible.io/js/script.js';
    //   document.head.appendChild(script);
    // }

    logger.debug('Analytics providers initialized');
  }

  /**
   * Set user consent
   */
  setConsent(type: ConsentType, granted: boolean): void {
    if (type === 'necessary') return; // Cannot revoke necessary consent

    this.consent[type] = granted;
    this.saveConsent();

    if (type === 'analytics' && granted && !this.isInitialized) {
      this.initializeProviders();
    }

    logger.info('Analytics consent updated', { type, granted });
  }

  /**
   * Check if user has granted consent
   */
  hasConsent(type: ConsentType): boolean {
    return this.consent[type];
  }

  /**
   * Load consent from localStorage
   */
  private loadConsent(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('analytics_consent');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.consent = { ...this.consent, ...parsed };
      }
    } catch (error) {
      logger.error('Failed to load analytics consent', error);
    }
  }

  /**
   * Save consent to localStorage
   */
  private saveConsent(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('analytics_consent', JSON.stringify(this.consent));
    } catch (error) {
      logger.error('Failed to save analytics consent', error);
    }
  }

  /**
   * Set user ID for tracking
   */
  identify(userId: string, properties?: UserProperties): void {
    if (!this.hasConsent('analytics')) return;

    this.userId = userId;
    this.userProperties = { ...this.userProperties, ...properties, userId };

    // Send to analytics providers
    // Example: Google Analytics
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('set', { user_id: userId });
    //   window.gtag('set', 'user_properties', properties);
    // }

    logger.debug('User identified', { userId, properties });
  }

  /**
   * Clear user identification
   */
  reset(): void {
    this.userId = null;
    this.userProperties = {};

    logger.debug('Analytics user reset');
  }

  /**
   * Track a page view
   */
  pageView(path: string, title?: string): void {
    if (!this.hasConsent('analytics')) return;

    const properties = {
      path,
      title: title || document.title,
      referrer: document.referrer,
    };

    // Send to analytics providers
    // Example: Google Analytics
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', 'page_view', properties);
    // }

    logger.debug('Page view tracked', properties);
  }

  /**
   * Track an event
   */
  track(event: AnalyticsEvent, properties?: EventProperties): void {
    if (!this.hasConsent('analytics')) return;

    const eventData = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userId: this.userId,
      },
    };

    // Send to analytics providers
    // Example: Google Analytics
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', event, properties);
    // }

    logger.debug('Event tracked', eventData);
  }

  /**
   * Track a conversion
   */
  conversion(value: number, currency = 'USD'): void {
    if (!this.hasConsent('analytics')) return;

    // Send to analytics providers
    // Example: Google Analytics
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', 'conversion', {
    //     value,
    //     currency,
    //   });
    // }

    logger.debug('Conversion tracked', { value, currency });
  }

  /**
   * Track an error
   */
  trackError(error: Error, context?: Record<string, unknown>): void {
    if (!this.hasConsent('analytics')) return;

    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
    };

    // Send to analytics providers
    // Example: Google Analytics
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', 'exception', {
    //     description: error.message,
    //     fatal: false,
    //   });
    // }

    logger.debug('Error tracked', errorData);
  }

  /**
   * Track timing
   */
  timing(category: string, variable: string, value: number, label?: string): void {
    if (!this.hasConsent('analytics')) return;

    const timingData = {
      category,
      variable,
      value,
      label,
    };

    // Send to analytics providers
    // Example: Google Analytics
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', 'timing_complete', timingData);
    // }

    logger.debug('Timing tracked', timingData);
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export class for testing
export { AnalyticsService };

// Initialize analytics on module load (browser only)
if (typeof window !== 'undefined') {
  analytics.init();
}

// Export convenience functions
export default analytics;
