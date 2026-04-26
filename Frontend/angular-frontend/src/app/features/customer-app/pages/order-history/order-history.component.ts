import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../shared/services/order.service';
import { ProductService } from '../../../../shared/services/product.service';
import { Order, PaginatedResponse, OrderItemDTO } from '@shared/models';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-order-history',
  standalone: false,
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit {
  // Component state management
  orders: Order[] = [];
  isLoading = true;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(private orderService: OrderService, private productService: ProductService) {}

  ngOnInit(): void {
    this.fetchOrders(0);
  }

  fetchOrders(page: number): void {
    this.isLoading = true;
    this.error = null;

    console.log('Fetching orders for page:', page, 'with size:', this.pageSize);

    this.orderService.getOrders(page, this.pageSize).subscribe({
      next: (response: PaginatedResponse<Order>) => {
        console.log('API Response:', response);
        console.log('Orders received:', response.content);
        console.log('Total elements:', response.totalElements);
        console.log('Total pages:', response.totalPages);

        // Fetch product images for all order items
        this.fetchOrderImages(response.content).then((ordersWithImages) => {
          this.orders = ordersWithImages;
          this.currentPage = response.pageNumber;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        });
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
        this.error = 'Failed to load orders. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  private async fetchOrderImages(orders: Order[]): Promise<Order[]> {
    const ordersWithImages = await Promise.all(
      orders.map(async (order) => {
        if (order.items && order.items.length > 0) {
          const itemsWithImages = await Promise.all(
            order.items.map(async (item) => {
              try {
                const product = await this.productService
                  .getProductById(item.productId)
                  .toPromise();
                return { ...item, imageUrl: product?.imageUrl };
              } catch (error) {
                console.warn(`Failed to fetch image for product ${item.productId}:`, error);
                return item; // Return item without image if fetch fails
              }
            })
          );
          return { ...order, items: itemsWithImages };
        }
        return order;
      })
    );
    return ordersWithImages;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.fetchOrders(page);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.fetchOrders(this.currentPage + 1);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.fetchOrders(this.currentPage - 1);
    }
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
}
