import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../features/customer-app/services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  // Authentication state
  isLoggedIn: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    // Reactively get product ID from route parameters and fetch product
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.error = 'Invalid product ID';
            return [];
          }

          this.isLoading = true;
          this.error = null;
          return this.productService.getProductById(id);
        })
      )
      .subscribe({
        next: (product: Product) => {
          this.product = product;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading product:', error);

          // Handle specific error cases
          if (error.status === 404) {
            this.error = 'Product not found';
          } else {
            this.error = 'Failed to load product. Please try again later.';
          }

          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBackToProducts(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/shop/products']);
    } else {
      this.router.navigate(['/public/products']);
    }
  }


  retryLoading(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.error = null;

      this.productService
        .getProductById(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (product: Product) => {
            this.product = product;
            this.isLoading = false;
          },
          error: (error: any) => {
            console.error('Error loading product:', error);
            this.error = 'Failed to load product. Please try again later.';
            this.isLoading = false;
          },
        });
    }
  }

  addToCart(productId: number): void {
    if (!this.isLoggedIn) {
      console.warn('User must be logged in to add items to cart');
      return;
    }

    this.cartService
      .addToCart(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Product added to cart successfully:', response);
          // TODO: Add toast notification or success feedback
        },
        error: (error: any) => {
          console.error('Error adding product to cart:', error);
          // TODO: Add error notification
        },
      });
  }
}
