import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerLayoutComponent } from './layout/customer-layout.component';
import { ProfilePageComponent } from './pages/profile/profile.component';
import { CartComponent } from './pages/cart/cart.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { OrderSuccessComponent } from './pages/order-success/order-success.component';
import { CheckoutSuccessComponent } from './pages/checkout-success/checkout-success.component';
import { CheckoutCancelComponent } from './pages/checkout-cancel/checkout-cancel.component';
import { ProductListComponent } from '../../shared/components/product-list/product-list.component';
import { ProductDetailComponent } from '../../shared/components/product-detail/product-detail.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      {
        path: 'profile',
        component: ProfilePageComponent,
      },
      {
        path: 'products',
        component: ProductListComponent,
      },
      {
        path: 'products/:id',
        component: ProductDetailComponent,
      },
      {
        path: 'cart',
        component: CartComponent,
      },
      {
        path: 'order-history',
        component: OrderHistoryComponent,
      },
      {
        path: 'order-success',
        component: OrderSuccessComponent,
      },
      {
        path: 'checkout/success',
        component: CheckoutSuccessComponent,
      },
      {
        path: 'checkout/cancel',
        component: CheckoutCancelComponent,
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerAppRoutingModule {}
