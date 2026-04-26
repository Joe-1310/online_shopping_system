import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { OrderDetailsResponse } from '../../../../shared/models/order.model';
import { OrderAdminService } from '../../services/order-admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-details-modal',
  standalone: false,
  templateUrl: './order-details-modal.component.html',
  styleUrls: ['./order-details-modal.component.css']
})
export class OrderDetailsModalComponent implements OnChanges {
  @Input() show: boolean = false;
  @Input() orderId: number | null = null;
  @Output() close = new EventEmitter<void>();

  orderDetails: OrderDetailsResponse | null = null;
  loading = false;

  constructor(
    private orderService: OrderAdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Order details modal ngOnChanges:', changes);
    console.log('show:', this.show, 'orderId:', this.orderId);
    
    if (changes['show'] && this.show && this.orderId) {
      console.log('Loading order details triggered by show change');
      this.loadOrderDetails();
    }
    
    if (changes['orderId'] && this.show && this.orderId) {
      console.log('Loading order details triggered by orderId change');
      this.loadOrderDetails();
    }
  }

  loadOrderDetails(): void {
    if (!this.orderId) return;

    console.log('Loading order details for orderId:', this.orderId);
    this.loading = true;
    this.orderDetails = null;

    this.orderService.getOrderDetails(this.orderId).subscribe({
      next: (details) => {
        console.log('Order details response:', details);
        this.orderDetails = details;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        
        let errorMessage = 'Failed to load order details. Please try again.';
        
        if (error.status === 404) {
          errorMessage = 'Order not found.';
        } else if (error.status === 500) {
          errorMessage = 'Server error while loading order details.';
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'bg-warning text-dark',
      'PROCESSING': 'bg-info text-dark',
      'SHIPPED': 'bg-primary',
      'DELIVERED': 'bg-success',
      'CANCELLED': 'bg-danger'
    };
    return statusMap[status] || 'bg-secondary';
  }

  closeModal(): void {
    this.close.emit();
    this.orderDetails = null;
  }
}
