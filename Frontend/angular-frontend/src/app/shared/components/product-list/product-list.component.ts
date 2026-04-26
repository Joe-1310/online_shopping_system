import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Product, ProductListParams, PaginatedResponse, Category } from '../../models';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../features/customer-app/services/cart.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit, OnDestroy {
  // Component state
  products: Product[] = [];
  categories: Category[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  // Authentication state
  isLoggedIn: boolean = false;

  // Pagination state
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 12;

  // Filter state
  searchTerm: string = '';
  selectedCategory: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadCategories();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.categoryService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories: Category[]) => {
          this.categories = categories;
        },
        error: (error: any) => {
          console.error('Error loading categories:', error);
        },
      });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;

    const params: ProductListParams = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'name',
      direction: 'asc',
    };

    // Add filters if they exist
    if (this.searchTerm.trim()) {
      params.name = this.searchTerm.trim();
    }
    if (this.selectedCategory !== null) {
      params.categoryId = this.selectedCategory;
    }
    if (this.minPrice !== null) {
      params.minPrice = this.minPrice;
    }
    if (this.maxPrice !== null) {
      params.maxPrice = this.maxPrice;
    }

    this.productService
      .getProducts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Product>) => {
          this.products = response.content;
          this.currentPage = response.pageNumber;
          this.totalElements = response.totalElements;
          // The backend doesn't provide totalPages, so we calculate it.
          this.totalPages = Math.ceil(response.totalElements / response.pageSize);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading products:', error);
          this.error = 'Failed to load products. Please try again later.';
          this.isLoading = false;
        },
      });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  onCategoryChange(categoryId: string | null): void {
    this.selectedCategory = categoryId ? parseInt(categoryId, 10) : null;
    this.currentPage = 0;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.currentPage = 0;
    this.loadProducts();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
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
