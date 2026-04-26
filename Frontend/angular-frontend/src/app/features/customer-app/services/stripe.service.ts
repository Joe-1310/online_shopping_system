import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

declare var Stripe: any;

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripe: any;

  constructor() {
    this.initializeStripe();
  }

  private initializeStripe(): void {
    if (typeof Stripe !== 'undefined') {
      this.stripe = Stripe(environment.stripePublishableKey);
    } else {
      console.error('Stripe.js not loaded');
    }
  }

  redirectToCheckout(sessionId: string): Promise<any> {
    if (!this.stripe) {
      return Promise.reject(new Error('Stripe not initialized'));
    }

    return this.stripe.redirectToCheckout({
      sessionId: sessionId,
    });
  }

  isStripeLoaded(): boolean {
    if (typeof Stripe === 'undefined') {
      console.warn(
        'Stripe.js is not loaded. This might be due to an ad-blocker or network issues.'
      );
      return false;
    }
    if (!this.stripe) {
      console.warn('Stripe instance is not initialized.');
      return false;
    }
    return true;
  }
}
