import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../../../../shared/models/product.model';
import { Category } from '../../../../shared/models/category.model';
import { ProductService } from '../../../../shared/services/product.service';
import { CategoryService } from '../../../../shared/services/category.service';
import { PaginatedResponse, ProductListParams } from '../../../../shared/models';

@Component({
  selector: 'app-product-management',
  standalone: false,
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css'],
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  sampleCategories: Category[] = [];
  loading = true;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  filterForm: FormGroup;

  showFormModal = false;
  showDeleteModal = false;
  formMode: 'add' | 'edit' = 'add';
  selectedProduct: Product | null = null;
  productToDelete: Product | null = null;
  isFormLoading = false; // Add loading state for form

  Math = Math;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      id: [''],
      name: [''],
      stock: [''],
      categoryId: [''],
      minPrice: [''],
      maxPrice: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.loading = true;
    const filters = this.getFilters();

    const params: ProductListParams = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'id',
      direction: 'asc',
    };

    // Apply filters if they exist
    if (filters) {
      if (filters.name) {
        params.name = filters.name;
      }
      if (filters.categoryId) {
        params.categoryId = Number(filters.categoryId);
      }
      if (filters.minPrice) {
        params.minPrice = Number(filters.minPrice);
      }
      if (filters.maxPrice) {
        params.maxPrice = Number(filters.maxPrice);
      }
    }

    console.log('Loading products with params:', params);

    this.productService.getProducts(params).subscribe({
      next: (response: PaginatedResponse<Product>) => {
        console.log('API Response:', response);

        this.products = response.content;
        this.currentPage = response.pageNumber;
        this.totalElements = response.totalElements;
        this.totalPages = Math.ceil(response.totalElements / response.pageSize);
        this.loading = false;

        console.log('Products processed:', this.products.length, 'Total pages:', this.totalPages);
      },
      error: (error) => {
        console.error('Error loading products:', error);

        let errorMessage = 'Failed to load products. Please try again.';

        if (error.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to view products.';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to server. Please check your connection.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        this.loading = false;

        this.products = [];
        this.totalPages = 0;
        this.totalElements = 0;
      },
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.sampleCategories = categories;
        console.log('Categories loaded:', categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.snackBar.open('Failed to load categories. Using default categories.', 'Close', {
          duration: 4000,
          panelClass: ['warning-snackbar'],
        });
      },
    });
  }

  openAddModal(): void {
    this.formMode = 'add';
    this.selectedProduct = null;
    this.showFormModal = true;
  }

  openEditModal(product: Product): void {
    this.formMode = 'edit';
    this.selectedProduct = { ...product };
    this.showFormModal = true;
  }

  openDeleteModal(product: Product): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  onFormModalClose(): void {
    this.showFormModal = false;
    this.selectedProduct = null;
  }

  onFormSave(productData: Product, selectedFile: File | null): void {
    this.isFormLoading = true; 

    if (this.formMode === 'add') {
      this.productService.createProduct(productData).subscribe({
        next: (newProduct) => {
          console.log('Product added:', newProduct);

          if (selectedFile) {
            this.productService.uploadProductImage(newProduct.id!, selectedFile).subscribe({
              next: (imageUrl) => {
                newProduct.imageUrl = imageUrl;
                console.log('Image uploaded:', imageUrl);
                this.snackBar.open('Product and image added successfully!', 'Close', {
                  duration: 3000,
                  panelClass: ['success-snackbar'],
                });
                this.loadProducts();
                this.onFormModalClose();
                this.isFormLoading = false; 
              },
              error: (err) => {
                console.error('Error uploading image:', err);
                this.snackBar.open('Product added but failed to upload image.', 'Close', {
                  duration: 5000,
                  panelClass: ['warning-snackbar'],
                });
                this.loadProducts();
                this.onFormModalClose();
                this.isFormLoading = false; 
              },
            });
          } else {
            this.snackBar.open('Product added successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.loadProducts();
            this.onFormModalClose();
            this.isFormLoading = false;
          }
        },
        error: (error) => {
          console.error('Error adding product:', error);
          this.snackBar.open('Failed to add product. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          this.isFormLoading = false; 
        },
      });
    } else if (this.formMode === 'edit' && this.selectedProduct?.id) {
      this.productService.updateProduct(this.selectedProduct.id, productData).subscribe({
        next: (updatedProduct) => {
          console.log('Product updated:', updatedProduct);

          if (selectedFile) {
            this.productService.uploadProductImage(updatedProduct.id!, selectedFile).subscribe({
              next: (imageUrl) => {
                updatedProduct.imageUrl = imageUrl;
                console.log('Image updated:', imageUrl);
                this.snackBar.open('Product and image updated successfully!', 'Close', {
                  duration: 3000,
                  panelClass: ['success-snackbar'],
                });
                this.loadProducts();
                this.onFormModalClose();
                this.isFormLoading = false; 
              },
              error: (err) => {
                console.error('Error updating image:', err);
                this.snackBar.open('Product updated but failed to update image.', 'Close', {
                  duration: 5000,
                  panelClass: ['warning-snackbar'],
                });
                this.loadProducts();
                this.onFormModalClose();
                this.isFormLoading = false; 
              },
            });
          } else {
            this.snackBar.open('Product updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.loadProducts();
            this.onFormModalClose();
            this.isFormLoading = false; 
          }
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.snackBar.open('Failed to update product. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          this.isFormLoading = false; 
        },
      });
    }
  }

  onDeleteModalClose(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  onDeleteConfirm(): void {
    if (this.productToDelete?.id) {
      this.productService.deleteProduct(this.productToDelete.id).subscribe({
        next: (response) => {
          console.log('Product deleted:', response);
          this.snackBar.open('Product deleted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.loadProducts();
          this.onDeleteModalClose();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.snackBar.open('Failed to delete product. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }

  getFilters(): any {
    const formFilters = this.filterForm.value;
    const filters: any = {};

    Object.keys(formFilters).forEach((key) => {
      if (formFilters[key] && formFilters[key].toString().trim()) {
        filters[key] = formFilters[key];
      }
    });

    return Object.keys(filters).length > 0 ? filters : undefined;
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 0 && !this.loading;
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages - 1 && !this.loading;
  }

  getPageNumbers(): number[] {
    const pages = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 3);

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
