import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-cancel',
  standalone: false,
  templateUrl: './checkout-cancel.component.html',
  styleUrls: ['./checkout-cancel.component.css'],
})
export class CheckoutCancelComponent {
  constructor(private router: Router) {}

  returnToCart(): void {
    this.router.navigate(['/shop/cart']);
  }

  continueShopping(): void {
    this.router.navigate(['/shop/products']);
  }
}
