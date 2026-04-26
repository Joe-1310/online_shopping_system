import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import {
  Cart,
  CartItem,
  AddToCartRequestDto,
  UpdateCartItemRequestDto,
} from '../../../shared/models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/cart`;

  private cartState = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartState.asObservable();

  // Sidebar visibility control
  private isSidebarOpen = new BehaviorSubject<boolean>(false);
  public isSidebarOpen$ = this.isSidebarOpen.asObservable();

  public cartItemCount$ = this.cart$.pipe(
    map((cart) => cart?.items?.reduce((count, item) => count + item.quantity, 0) || 0)
  );

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap((cart) => {
        this.cartState.next(cart);
      })
    );
  }

  addItem(productId: number, quantity: number = 1): Observable<Cart> {
    const request: AddToCartRequestDto = { productId, quantity };
    return this.http.post<Cart>(this.apiUrl, request).pipe(
      tap((cart) => {
        this.cartState.next(cart);
        // Automatically open sidebar after successful addition
        this.openSidebar();
      })
    );
  }

  updateItemQuantity(productId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/${productId}?quantity=${quantity}`, {}).pipe(
      tap((cart) => {
        this.cartState.next(cart);
      })
    );
  }

  removeItem(productId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/${productId}`).pipe(
      tap((cart) => {
        this.cartState.next(cart);
      })
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(this.apiUrl).pipe(
      tap(() => {
        this.cartState.next({ items: [] });
      })
    );
  }

  getCurrentCartState(): Cart | null {
    return this.cartState.value;
  }

  // Sidebar control methods
  openSidebar(): void {
    this.isSidebarOpen.next(true);
  }

  closeSidebar(): void {
    this.isSidebarOpen.next(false);
  }

  addToCart(productId: number, quantity: number = 1): Observable<Cart> {
    return this.addItem(productId, quantity);
  }
}
