import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Order, OrderDetailsResponse } from '../../../shared/models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderAdminService {
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  getOrders(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
    filters?: {
      orderId?: number | string,
      userId?: number | string,
      username?: string,
      status?: string,
      startDate?: string,
      endDate?: string
    }
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (filters) {
      if (filters.orderId && filters.orderId.toString().trim()) {
        params = params.set('orderId', filters.orderId.toString());
      }
      if (filters.userId && filters.userId.toString().trim()) {
        params = params.set('userId', filters.userId.toString());
      }
      if (filters.username && filters.username.trim()) {
        params = params.set('username', filters.username.trim());
      }
      if (filters.status && filters.status.trim()) {
        params = params.set('status', filters.status.trim());
      }
      if (filters.startDate && filters.startDate.trim()) {
        params = params.set('startDate', filters.startDate.trim());
      }
      if (filters.endDate && filters.endDate.trim()) {
        params = params.set('endDate', filters.endDate.trim());
      }
    }

    const url = `${this.baseUrl}/orders/paged`;
    console.log('Making API call to:', url);
    console.log('With params:', params.toString());

    return this.http.get<any>(url, { params });
  }

  // Fallback method to get orders using the regular endpoint
  getOrdersFallback(): Observable<any> {
    const url = `${this.baseUrl}/orders`;
    console.log('Using fallback API call to:', url);
    return this.http.get<any>(url);
  }

  // Simple test method to check if the API is reachable
  testConnection(): Observable<any> {
    console.log('Testing connection to:', `${this.baseUrl}/orders`);
    return this.http.get<any>(`${this.baseUrl}/orders`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}`);
  }
  getOrderDetails(id: number): Observable<OrderDetailsResponse> {
  const url = `${this.baseUrl}/orders/${id}/details`;

  return this.http.get<OrderDetailsResponse>(url).pipe(
    tap((response) => {
      console.log('Order details API response:', response);
    }),
    catchError((error) => {
      console.error('Error fetching order details:', error);
      throw error;
    })
  );
}


}
