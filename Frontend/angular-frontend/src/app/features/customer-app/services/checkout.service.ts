import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cart } from '../../../shared/models';
import { environment } from '../../../../environments/environment';

export interface CheckoutSessionRequest {
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/stripe`;

  constructor(private http: HttpClient) {}

  createCheckoutSession(): Observable<CheckoutSessionResponse> {
    const request: CheckoutSessionRequest = {
      successUrl: `${window.location.origin}/shop/checkout/success`,
      cancelUrl: `${window.location.origin}/shop/checkout/cancel`,
    };

    return this.http.post<CheckoutSessionResponse>(
      `${this.apiUrl}/create-checkout-session`,
      request
    );
  }
}
