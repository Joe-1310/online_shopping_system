import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { OrderService, OrderDTO } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { Cart } from '../../../../shared/models';

@Component({
  selector: 'app-checkout-success',
  standalone: false,
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.css'],
})
export class CheckoutSuccessComponent implements OnInit, OnDestroy {
  order: OrderDTO | null = null;
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.finalizeOrder();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private finalizeOrder(): void {
    console.log('Starting order finalization...');

    this.cartService
      .getCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (currentCart) => {
          console.log('Cart fetched from backend:', currentCart);
          console.log('Cart items count:', currentCart?.items?.length || 0);

          if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
            console.warn('Cart is empty or null:', currentCart);
            // Check if we have session_id in URL params (from Stripe)
            const sessionId = this.route.snapshot.queryParams['session_id'];
            if (sessionId) {
              console.log('Found session_id in URL, payment was successful');
              // Show success message even without cart items
              this.error = null;
              this.isLoading = false;
              return;
            } else {
              this.error = 'No items found to place order.';
              this.isLoading = false;
              return;
            }
          }

          // Place the order
          console.log('Placing order with cart items:', currentCart.items);
          this.orderService
            .placeOrder(currentCart)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (order) => {
                console.log('Order placed successfully:', order);
                this.order = order;

                // Clear the cart after successful order placement
                this.cartService
                  .clearCart()
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: () => {
                      console.log('Cart cleared successfully');
                      this.isLoading = false;
                    },
                    error: (error) => {
                      console.error('Error clearing cart:', error);
                      this.isLoading = false;
                    },
                  });
              },
              error: (error) => {
                console.error('Error placing order:', error);
                this.error = 'Failed to place order. Please contact support.';
                this.isLoading = false;
              },
            });
        },
        error: (error) => {
          console.error('Error fetching cart:', error);
          this.error = 'Failed to retrieve cart information. Please contact support.';
          this.isLoading = false;
        },
      });
  }

  continueShopping(): void {
    this.router.navigate(['/shop/products']);
  }

  viewOrders(): void {
    this.router.navigate(['/shop/order-history']);
  }

  viewOrderDetails(): void {
    if (this.order?.orderId) {
      this.router.navigate(['/shop/order-history'], {
        queryParams: { orderId: this.order.orderId },
      });
    }
  }
}
