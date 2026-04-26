import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order, PaginatedResponse } from '@shared/models';
import { User } from '../../../../shared/models/user.model';

import { UserService } from '../../../../shared/services/user.service';
import { OrderService } from '@shared/services/order.service';

export interface OrderDetailsResponse {
  order: Order;
  user: User;
}

@Component({
  selector: 'app-order-management',
  standalone: false,
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css'],
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Filters
  filterForm: FormGroup;
  
  // Order details with user info
  selectedOrderDetails: { [key: number]: { order: Order; user: User } } = {};
  loadingOrderDetails: { [key: number]: boolean } = {};

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.formBuilder.group({
      orderId: [''],
      userId: [''],
      username: [''],
      status: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.isLoading = true;
    this.error = null;

    const filters = this.filterForm.value;
    const cleanFilters = Object.keys(filters).reduce((acc, key) => {
      if (filters[key] && filters[key].toString().trim()) {
        acc[key] = filters[key];
      }
      return acc;
    }, {} as any);

    console.log('Fetching all admin orders with filters:', cleanFilters);

    this.orderService.getAllOrders().subscribe({
      next: (orders: Order[]) => {
        console.log('Orders received:', orders);

        // If you want filtering on frontend:
        this.orders = orders.filter(order => {
          let matches = true;
          if (cleanFilters.status) {
            matches = matches && order.status === cleanFilters.status;
          }
          if (cleanFilters.orderId) {
            matches = matches && order.orderId == cleanFilters.orderId;
          }
          if (cleanFilters.userId) {
            matches = matches && order.userId == cleanFilters.userId;
          }
          return matches;
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
        this.error = 'Failed to load orders. Please try again later.';
        this.isLoading = false;
        this.showErrorSnackBar('Failed to load orders');
      },
    });
  }

  applyFilters(): void {
    this.fetchOrders();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.fetchOrders();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'bg-success';
      case 'SHIPPED':
        return 'bg-info';
      case 'PROCESSING':
        return 'bg-warning';
      case 'PENDING':
        return 'bg-secondary';
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusDisplayText(status: string): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  hasOrders(): boolean {
    return this.orders && this.orders.length > 0;
  }

  getOrderRange(): string {
    if (!this.totalElements) {
      return '0-0 of 0';
    }
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
    return `${start}-${end} of ${this.totalElements}`;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (!this.totalPages || this.totalPages <= 0) {
      return pages;
    }

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      const start = Math.max(1, this.currentPage - 1);
      const end = Math.min(this.totalPages - 2, this.currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (this.totalPages > 1) {
        pages.push(this.totalPages - 1);
      }
    }

    return pages;
  }

  getUserDetails(orderId: number): User | null {
    return this.selectedOrderDetails[orderId]?.user || null;
  }

  loadOrderDetails(orderId: number): void { 
    if (this.selectedOrderDetails[orderId] || this.loadingOrderDetails[orderId]) { 
      return; 
    } 
    this.loadingOrderDetails[orderId] = true;
    this.orderService.getOrderDetails(orderId).subscribe({ 
      next: (response: OrderDetailsResponse) => { 
        this.selectedOrderDetails[orderId] = response; 
        this.loadingOrderDetails[orderId] = false; 
        console.log('Order details loaded:', response); 
      }, 
      error: (error) => { 
        console.error('Error loading order details:', error); 
        this.loadingOrderDetails[orderId] = false; 
        this.showErrorSnackBar('Failed to load order details'); 
      } 
    }); 
  }

  isOrderDetailsLoading(orderId: number): boolean {
    return this.loadingOrderDetails[orderId] || false;
  }

  private showErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}