import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: false,
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.css'],
})
export class OrderSuccessComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
  }

  continueShopping(): void {
    this.router.navigate(['/shop/products']);
  }

  viewOrders(): void {
    this.router.navigate(['/shop/order-history']);
  }
}
