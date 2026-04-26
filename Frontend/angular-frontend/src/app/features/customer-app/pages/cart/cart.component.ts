import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { StripeService } from '../../services/stripe.service';
import { ProductService } from '../../../../shared/services/product.service';
import { Cart, CartItem, Product } from '../../../../shared/models';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  cart$: Observable<Cart | null>;
  cartWithImages$: Observable<Cart | null>;

  // Client-side calculated totals
  subtotal = 0;
  tax = 0;
  grandTotal = 0;
  taxRate = 0.14; // 14% tax rate

  // Loading and error states
  isLoading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private stripeService: StripeService,
    private productService: ProductService,
    private router: Router
  ) {
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
  }

  ngOnInit(): void {
    this.loadCart();
    this.subscribeToCartChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToCartChanges(): void {
    this.cartWithImages$.pipe(takeUntil(this.destroy$)).subscribe((cart) => {
      if (cart) {
        this.calculateTotals(cart);
      } else {
        this.resetTotals();
      }
    });
  }

  calculateTotals(cart: Cart): void {
    this.subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.tax = this.subtotal * this.taxRate;
    this.grandTotal = this.subtotal + this.tax;

    // Round to 2 decimal places
    this.subtotal = Math.round(this.subtotal * 100) / 100;
    this.tax = Math.round(this.tax * 100) / 100;
    this.grandTotal = Math.round(this.grandTotal * 100) / 100;
  }

  private resetTotals(): void {
    this.subtotal = 0;
    this.tax = 0;
    this.grandTotal = 0;
  }

  loadCart(): void {
    this.isLoading = true;
    this.error = null;

    this.cartService
      .getCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => {
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading cart:', error);
          this.error = 'Failed to load cart. Please try again later.';
          this.isLoading = false;
        },
      });
  }

  updateQuantity(productId: number, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeFromCart(productId);
      return;
    }

    this.cartService
      .updateItemQuantity(productId, newQuantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Cart state and totals are automatically updated via subscription
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
          this.error = 'Failed to update quantity. Please try again.';
        },
      });
  }

  removeFromCart(productId: number): void {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    this.cartService
      .removeItem(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Cart state and totals are automatically updated via subscription
        },
        error: (error) => {
          console.error('Error removing item:', error);
          this.error = 'Failed to remove item. Please try again.';
        },
      });
  }

  increaseQuantity(item: CartItem): void {
    this.cartService
      .updateItemQuantity(item.productId, item.quantity + 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Cart state and totals are automatically updated via subscription
        },
        error: (error) => {
          console.error('Error increasing quantity:', error);
          this.error = 'Failed to update quantity. Please try again.';
        },
      });
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      return;
    }

    this.cartService
      .updateItemQuantity(item.productId, item.quantity - 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
        },
        error: (error) => {
          console.error('Error decreasing quantity:', error);
          this.error = 'Failed to update quantity. Please try again.';
        },
      });
  }

  clearCart(): void {
    if (
      !window.confirm(
        'Are you sure you want to clear your entire cart? This action cannot be undone.'
      )
    ) {
      return;
    }

    this.cartService
      .clearCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Cart cleared successfully');
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
          this.error = 'Failed to clear cart. Please try again.';
        },
      });
  }

  continueShopping(): void {
    this.router.navigate(['/shop/products']);
  }

  proceedToCheckout(): void {
    const currentCart = this.cartService.getCurrentCartState();

    if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
      this.error = 'Your cart is empty. Please add items before proceeding to checkout.';
      return;
    }

    if (!this.stripeService.isStripeLoaded()) {
      this.error = 'Payment system is not available. Please try again later.';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.checkoutService
      .createCheckoutSession()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.stripeService
            .redirectToCheckout(response.sessionId)
            .then((result: any) => {
              if (result.error) {
                this.error = 'Checkout failed: ' + result.error.message;
                this.isLoading = false;
              }
            })
            .catch((error: any) => {
              console.error('Stripe checkout error:', error);
              this.error = 'Failed to redirect to checkout. Please try again.';
              this.isLoading = false;
            });
        },
        error: (error) => {
          console.error('Error creating checkout session:', error);

          // Provide more specific error messages
          if (error.status === 500) {
            this.error = 'Server error occurred. Please try again later or contact support.';
          } else if (error.status === 401) {
            this.error = 'Please log in to proceed with checkout.';
          } else if (error.status === 400) {
            this.error = error.error?.error || 'Invalid request. Please check your cart.';
          } else {
            this.error = 'Failed to create checkout session. Please try again.';
          }

          this.isLoading = false;
        },
      });
  }

  getItemCount(cart: Cart): number {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  retryLoadCart(): void {
    this.loadCart();
  }
}
