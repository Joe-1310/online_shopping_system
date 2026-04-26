export interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string; // Optional image URL for cart display
}

export interface Cart {
  items: CartItem[];
}

export interface AddToCartRequestDto {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequestDto {
  quantity: number;
}
