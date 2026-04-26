import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { Category } from '../../../../shared/models/category.model';
import { CategoryService } from '../../../../shared/services/category.service';

@Component({
  selector: 'app-category-management',
  standalone: false,
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css'],
})
export class CategoryManagementComponent implements OnInit {
  categories: (Category & { productCount?: number })[] = [];
  loading = true;

  showFormModal = false;
  showDeleteModal = false;
  formMode: 'add' | 'edit' = 'add';
  selectedCategory: Category | null = null;
  categoryToDelete: Category | null = null;

  constructor(private categoryService: CategoryService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;

    this.categoryService.getCategoriesPaginated().subscribe({
      next: (response) => {
        this.categories = response.content || response;
        this.loadProductCounts();
        console.log('Categories loaded:', this.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.snackBar.open('Failed to load categories. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        this.loading = false;
      },
    });
  }

  loadProductCounts(): void {
    if (this.categories.length === 0) {
      this.loading = false;
      return;
    }

    const countRequests = this.categories.map((category) =>
      this.categoryService.getCategoryProductCount(category.id!)
    );

    forkJoin(countRequests).subscribe({
      next: (counts) => {
        this.categories.forEach((category, index) => {
          category.productCount = counts[index];
        });
        this.loading = false;
        console.log('Product counts loaded:', this.categories);
      },
      error: (error) => {
        console.error('Error loading product counts:', error);
        // Still show categories even if product counts fail
        this.categories.forEach((category) => {
          category.productCount = 0;
        });
        this.loading = false;
        this.snackBar.open('Categories loaded, but product counts unavailable.', 'Close', {
          duration: 4000,
          panelClass: ['warning-snackbar'],
        });
      },
    });
  }

  openAddModal(): void {
    this.formMode = 'add';
    this.selectedCategory = null;
    this.showFormModal = true;
  }

  openEditModal(category: Category): void {
    this.formMode = 'edit';
    this.selectedCategory = { ...category };
    this.showFormModal = true;
  }

  openDeleteModal(category: Category): void {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }

  onFormModalClose(): void {
    this.showFormModal = false;
    this.selectedCategory = null;
  }

  onFormSave(categoryData: Category): void {
    if (this.formMode === 'add') {
      this.categoryService.createCategory(categoryData).subscribe({
        next: (newCategory) => {
          console.log('Category added:', newCategory);
          this.snackBar.open('Category added successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.loadCategories();
          this.onFormModalClose();
        },
        error: (error) => {
          console.error('Error adding category:', error);
          this.snackBar.open('Failed to add category. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    } else if (this.formMode === 'edit' && this.selectedCategory?.id) {
      this.categoryService.updateCategory(this.selectedCategory.id, categoryData).subscribe({
        next: (response) => {
          console.log('Category updated:', response);
          this.snackBar.open('Category updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.loadCategories();
          this.onFormModalClose();
        },
        error: (error) => {
          console.error('Error updating category:', error);
          this.snackBar.open('Failed to update category. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }

  onDeleteModalClose(): void {
    this.showDeleteModal = false;
    this.categoryToDelete = null;
  }

  onDeleteConfirm(): void {
    if (this.categoryToDelete?.id) {
      this.categoryService.deleteCategory(this.categoryToDelete.id).subscribe({
        next: (response) => {
          console.log('Category deleted:', response);
          this.snackBar.open('Category deleted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.loadCategories();
          this.onDeleteModalClose();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.snackBar.open('Failed to delete category. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }
}
