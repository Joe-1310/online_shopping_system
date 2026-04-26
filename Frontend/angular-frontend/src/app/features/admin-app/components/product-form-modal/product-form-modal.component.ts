import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../../../shared/models/product.model';
import { Category } from '../../../../shared/models/category.model';

@Component({
  selector: 'app-product-form-modal',
  standalone: false,
  templateUrl: './product-form-modal.component.html',
  styleUrls: ['./product-form-modal.component.css'],
})
export class ProductFormModalComponent implements OnInit, OnChanges {
  @Input() show = false;
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() product: Product | null = null;
  @Input() categories: Category[] = [];
  @Input() isLoading = false; // Add loading state input

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ product: Product; file: File | null }>();

  // Reactive form
  productForm: FormGroup;
  submitted = false;

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  dragOver = false;

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', [Validators.required]],
    });
  }

  // Getter for easy access to form controls in template
  get f() {
    return this.productForm.controls;
  }

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] || changes['mode']) {
      this.resetForm();
    }

    if (changes['show'] && changes['show'].currentValue) {
      // Autofocus on first input
      setTimeout(() => {
        const firstInput = document.querySelector('.modal input') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  private resetForm(): void {
    this.submitted = false;
    this.selectedFile = null;
    this.imagePreview = null;

    if (this.mode === 'edit' && this.product) {
      // Edit mode: populate form with product data
      this.productForm.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        stock: this.product.stock,
        categoryId: this.product.category.id,
      });
      // Set image preview for edit mode
      if (this.product.imageUrl) {
        this.imagePreview = this.product.imageUrl;
      }
    } else {
      // Add mode: reset to empty form
      this.productForm.reset({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryId: '',
      });
    }
  }

  get modalTitle(): string {
    return this.mode === 'add' ? 'Add New Product' : `Edit Product: ${this.product?.name || ''}`;
  }

  isFormValid(): boolean {
    return this.productForm.valid;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      const selectedCategory = this.categories.find(
        (cat) => cat.id === parseInt(formValue.categoryId)
      );

      const productToSave: Product = {
        id: this.mode === 'edit' ? this.product?.id : undefined,
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        stock: formValue.stock,
        category: selectedCategory!,
        imageUrl: this.product?.imageUrl || '',
      };

      // Emit the save event with form data
      this.save.emit({ product: productToSave, file: this.selectedFile });
    } else {
      // Mark all fields as touched to show validation errors
      this.productForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.close.emit();
  }

  // Utility method to check if field has error
  hasError(fieldName: string): boolean {
    const control = this.productForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || this.submitted));
  }

  // Utility method to get specific error message for a field
  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (control && control.errors) {
      if (control.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (control.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${
          control.errors['minlength'].requiredLength
        } characters`;
      }
      if (control.errors['min']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be greater than ${
          control.errors['min'].min
        }`;
      }
    }
    return '';
  }

  // Handle modal backdrop click
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  // Handle escape key
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onCancel();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.createImagePreview(this.selectedFile);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.selectedFile = file;
        this.createImagePreview(file);
      }
    }
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    console.log('removeImage() called'); // Debug log
    this.selectedFile = null;
    this.imagePreview = null;
    // Reset file input
    const fileInput = document.getElementById('productImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
