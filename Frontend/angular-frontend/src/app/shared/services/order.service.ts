import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap, map, forkJoin } from 'rxjs';
import { Order, PaginatedResponse, User } from '@shared/models';
import { ProductService } from './product.service';
import { environment } from '../../../environments/environment';

export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  orderStatusCounts: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export interface OrderDetailsResponse {
  order: Order;
  user: User;
}

export interface OrderFilters {
  orderId?: number;
  userId?: number;
  username?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface RecentActivity {
  type: 'order_created' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'cart_updated';
  title: string;
  description: string;
  timestamp: string;
  orderId?: number;
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/orders`;

  constructor(private http: HttpClient, private productService: ProductService) {}

  getOrders(page: number, size: number): Observable<PaginatedResponse<Order>> {
    return this.http.get<Order[]>(this.apiUrl).pipe(
      switchMap((orders: Order[]) => {
        // Sort orders by creation date (newest first)
        const sortedOrders = orders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Calculate pagination
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

        // Fetch product details for all order items
        const productRequests = paginatedOrders.flatMap(
          (order) =>
            order.items?.map((item) =>
              this.productService
                .getProductById(item.productId)
                .pipe(
                  map((product) => ({ orderId: order.orderId, productId: item.productId, product }))
                )
            ) || []
        );

        if (productRequests.length === 0) {
          // No items to fetch, return orders as is
          const response: PaginatedResponse<Order> = {
            content: paginatedOrders,
            pageNumber: page,
            pageSize: size,
            totalElements: orders.length,
            totalPages: Math.ceil(orders.length / size),
          };
          return [response];
        }

        return forkJoin(productRequests).pipe(
          map((productResults) => {
            const productMap = new Map();
            productResults.forEach((result) => {
              productMap.set(result.productId, result.product);
            });

            const enhancedOrders = paginatedOrders.map((order) => ({
              ...order,
              items: order.items?.map((item) => ({
                ...item,
                productName: productMap.get(item.productId)?.name || `Product #${item.productId}`,
                productDescription: productMap.get(item.productId)?.description || '',
              })),
            }));

            const response: PaginatedResponse<Order> = {
              content: enhancedOrders,
              pageNumber: page,
              pageSize: size,
              totalElements: orders.length,
              totalPages: Math.ceil(orders.length / size),
            };

            return response;
          })
        );
      })
    );
  }

  getOrderDetails(orderId: number): Observable<OrderDetailsResponse> {
    return this.http.get<OrderDetailsResponse>(`${this.apiUrl}/${orderId}/details`);
  }

  getCustomerStats(): Observable<CustomerStats> {
    return this.http.get<Order[]>(this.apiUrl).pipe(
      map((orders: Order[]) => {
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

        // Get last order date
        const lastOrderDate =
          orders.length > 0
            ? orders.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0].createdAt
            : undefined;

        // Count orders by status
        const orderStatusCounts = {
          pending: orders.filter((o) => o.status === 'PENDING').length,
          processing: orders.filter((o) => o.status === 'PROCESSING').length,
          shipped: orders.filter((o) => o.status === 'SHIPPED').length,
          delivered: orders.filter((o) => o.status === 'DELIVERED').length,
          cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
        };

        return {
          totalOrders,
          totalSpent,
          averageOrderValue,
          lastOrderDate,
          orderStatusCounts,
        };
      })
    );
  }

  getRecentActivity(limit: number = 5): Observable<RecentActivity[]> {
    return this.http.get<Order[]>(this.apiUrl).pipe(
      map((orders: Order[]) => {
        const sortedOrders = orders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const activities: RecentActivity[] = sortedOrders.slice(0, limit).map((order) => {
          let type: RecentActivity['type'];
          let title: string;
          let description: string;

          switch (order.status) {
            case 'DELIVERED':
              type = 'order_delivered';
              title = `Order #${order.orderId} Delivered`;
              description = `Your order has been delivered successfully`;
              break;
            case 'SHIPPED':
              type = 'order_shipped';
              title = `Order #${order.orderId} Shipped`;
              description = `Your order is on the way`;
              break;
            case 'PROCESSING':
              type = 'order_created';
              title = `Order #${order.orderId} Processing`;
              description = `Your order is being processed`;
              break;
            case 'PENDING':
              type = 'order_created';
              title = `Order #${order.orderId} Created`;
              description = `Your order has been placed`;
              break;
            case 'CANCELLED':
              type = 'order_cancelled';
              title = `Order #${order.orderId} Cancelled`;
              description = `Your order has been cancelled`;
              break;
            default:
              type = 'order_created';
              title = `Order #${order.orderId} Created`;
              description = `Your order has been placed`;
          }

          return {
            type,
            title,
            description,
            timestamp: order.createdAt,
            orderId: order.orderId,
            status: order.status,
          };
        });

        return activities;
      })
    );
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrdersPaged(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
    filters: OrderFilters = {}
  ): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    // Add filters to params if they exist
    if (filters.orderId) {
      params = params.set('orderId', filters.orderId.toString());
    }
    if (filters.userId) {
      params = params.set('userId', filters.userId.toString());
    }
    if (filters.username) {
      params = params.set('username', filters.username);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<PaginatedResponse<Order>>(`${this.apiUrl}/paged`, { params });
  }

}

