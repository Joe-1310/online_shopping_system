import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Category } from '../../../../shared/models/category.model';

@Component({
  selector: 'app-category-form-modal',
  standalone: false,
  templateUrl: './category-form-modal.component.html',
  styleUrls: ['./category-form-modal.component.css']
})
export class CategoryFormModalComponent implements OnInit, OnChanges {
  @Input() show: boolean = false;
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() category: Category | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Category>();

  categoryForm!: FormGroup;
  submitting = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] || changes['mode']) {
      this.initializeForm();
      if (this.category && this.mode === 'edit') {
        this.populateForm();
      }
    }
  }

  initializeForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]]
    });
  }

  populateForm(): void {
    if (this.category) {
      this.categoryForm.patchValue({
        name: this.category.name
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.submitting = true;

      const categoryData: Category = {
        ...this.categoryForm.value
      };

      // If editing, include the ID
      if (this.mode === 'edit' && this.category?.id) {
        categoryData.id = this.category.id;
      }

      this.save.emit(categoryData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
      });
    }
  }

  closeModal(): void {
    this.submitting = false;
    this.categoryForm.reset();
    this.close.emit();
  }
}
