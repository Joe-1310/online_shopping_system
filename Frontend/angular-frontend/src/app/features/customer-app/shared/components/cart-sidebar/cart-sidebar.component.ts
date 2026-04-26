import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CartService } from '../../../services/cart.service';
import { ProductService } from '../../../../../shared/services/product.service';
import { Cart, CartItem } from '../../../../../shared/models';

@Component({
  selector: 'app-cart-sidebar',
  standalone: false,
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.css'],
})
export class CartSidebarComponent implements OnInit, OnDestroy {
  cart$!: Observable<Cart | null>;
  cartWithImages$!: Observable<Cart | null>;
  isSidebarOpen$!: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cart$ = this.cartService.cart$;
    this.cartWithImages$ = this.cart$.pipe(
      switchMap((cart) => {
        if (!cart || !cart.items || cart.items.length === 0) {
          return of(cart);
        }

        // Fetch product details for each cart item to get images
        const productRequests = cart.items.map((item) =>
          this.productService.getProductById(item.productId).pipe(
            map((product) => ({ ...item, imageUrl: product.imageUrl })),
            // Fallback to placeholder if product fetch fails
            map((itemWithImage) => itemWithImage)
          )
        );

        return forkJoin(productRequests).pipe(
          map((itemsWithImages) => ({ ...cart, items: itemsWithImages }))
        );
      })
    );
    this.isSidebarOpen$ = this.cartService.isSidebarOpen$;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeSidebar(): void {
    this.cartService.closeSidebar();
  }

  removeItem(productId: number): void {
    this.cartService
      .removeItem(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Item removed from cart');
        },
        error: (error) => {
          console.error('Error removing item from cart:', error);
        },
      });
  }

  updateItemQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    this.cartService
      .updateItemQuantity(productId, quantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Cart item quantity updated');
        },
        error: (error) => {
          console.error('Error updating cart item quantity:', error);
        },
      });
  }

  viewFullCart(): void {
    this.closeSidebar();
    this.router.navigate(['/shop/cart']);
  }

  proceedToCheckout(): void {
    this.closeSidebar();
    // TODO: Implement checkout navigation when checkout page is available
    console.log('Proceeding to checkout...');
  }

  calculateSubtotal(cart: Cart | null): number {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (total: number, item: CartItem) => total + item.price * item.quantity,
      0
    );
  }

  getTotalItems(cart: Cart | null): number {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
  }

  trackByProductId(index: number, item: CartItem): number {
    return item.productId;
  }

  hasItems(cart: Cart | null): boolean {
    return cart !== null && cart.items !== undefined && cart.items.length > 0;
  }

  isEmpty(cart: Cart | null): boolean {
    return !cart || !cart.items || cart.items.length === 0;
  }
}
