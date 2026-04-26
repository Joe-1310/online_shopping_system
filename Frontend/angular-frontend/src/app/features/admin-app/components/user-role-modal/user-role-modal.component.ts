import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-role-modal',
  standalone: false,
  templateUrl: './user-role-modal.component.html',
  styleUrls: ['./user-role-modal.component.css'],
})
export class UserRoleModalComponent implements OnInit, OnChanges {
  @Input() show: boolean = false;
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ userId: number; newRole: string }>();

  roleForm!: FormGroup;
  submitting = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.populateForm();
    }
    // Reset submitting state when modal is closed
    if (changes['show'] && !this.show) {
      this.submitting = false;
    }
  }

  initializeForm(): void {
    this.roleForm = this.fb.group({
      role: ['', [Validators.required]],
    });
  }

  populateForm(): void {
    if (this.user) {
      // Extract role name from either Role object or string
      let roleName: string = '';
      if (typeof this.user.role === 'string') {
        roleName = this.user.role;
      } else if (this.user.role && this.user.role.roleName) {
        roleName = this.user.role.roleName;
      }

      this.roleForm.patchValue({ role: roleName });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.roleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.roleForm.valid && this.user) {
      this.submitting = true;

      const newRole = this.roleForm.value.role;
      this.save.emit({ userId: this.user.id, newRole });

      // Don't reset submitting here - let the parent component handle the response
    } else {
      Object.keys(this.roleForm.controls).forEach((key) => {
        this.roleForm.get(key)?.markAsTouched();
      });
    }
  }

  closeModal(): void {
    this.submitting = false;
    this.roleForm.reset();
    this.close.emit();
  }
}
