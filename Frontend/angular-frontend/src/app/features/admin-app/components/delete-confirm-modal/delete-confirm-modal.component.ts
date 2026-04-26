import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: false,
  templateUrl: './delete-confirm-modal.component.html',
  styleUrls: ['./delete-confirm-modal.component.css'],
})
export class DeleteConfirmModalComponent {
  @Input() show = false;
  @Input() itemName = 'this item';
  @Input() itemType = 'item';
  @Input() confirmMessage?: string;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  get defaultMessage(): string {
    return (
      this.confirmMessage ||
      `Are you sure you want to delete "${this.itemName}"? This action cannot be undone.`
    );
  }

  onCancel(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
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
}
