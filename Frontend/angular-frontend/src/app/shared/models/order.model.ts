import { User } from './user.model';
import { Product } from './product.model';

export interface Order {
  orderId: number;
  userId: number;
  Name: string;
  totalPrice: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  items?: OrderItemDTO[];
  id?: number;
  user?: User;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface OrderItemDTO {
  productId: number;
  quantity: number;
  price: number;
  productName?: string;
  productDescription?: string;
  imageUrl?: string; // Optional image URL for order display
}

export interface UserDetailsDTO {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface ProductDetailsDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryName: string;
}

export interface OrderItemDetailsDTO {
  id: number;
  product: ProductDetailsDTO;
  quantity: number;
  price: number;
}

export interface OrderDetailsResponse {
  id: number;
  user: UserDetailsDTO;
  totalPrice: number;
  status: string;
  createdAt: string;
  orderItems: OrderItemDetailsDTO[];
}
