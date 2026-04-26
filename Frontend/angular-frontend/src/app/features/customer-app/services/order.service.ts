import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cart } from '../../../shared/models';
import { environment } from '../../../../environments/environment';

export interface OrderItemDTO {
  productId: number;
  quantity: number;
  price: number;
  productName: string;
  productDescription?: string;
  imageUrl?: string;
}

export interface OrderDTO {
  orderId?: number;
  userId?: number;
  Name?: string;
  totalPrice: number;
  status: string;
  createdAt?: string;
  items: OrderItemDTO[];
}

export interface OrderCreationRequest {
  totalPrice: number;
  status: string;
  items: OrderItemDTO[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/orders`;

  constructor(private http: HttpClient) {}

  placeOrder(cart: Cart): Observable<OrderDTO> {
    // Convert cart items to order items
    const orderItems: OrderItemDTO[] = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      productName: item.productName,
      productDescription: 'Product from cart',
      imageUrl: item.imageUrl,
    }));

    // Calculate total price
    const totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const request: OrderCreationRequest = {
      totalPrice,
      status: 'PENDING', // Initial status
      items: orderItems,
    };

    return this.http.post<OrderDTO>(this.apiUrl, request);
  }

  getOrders(): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(this.apiUrl);
  }

  getOrderById(orderId: number): Observable<OrderDTO> {
    return this.http.get<OrderDTO>(`${this.apiUrl}/${orderId}/details`);
  }
}
