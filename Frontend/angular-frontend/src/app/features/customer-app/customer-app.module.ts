import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomerAppRoutingModule } from './customer-app-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { CustomerLayoutComponent } from './layout/customer-layout.component';
import { CustomerSharedModule } from './imports/customer-shared.module';
import { ProfilePageComponent } from './pages/profile/profile.component';
import { CartComponent } from './pages/cart/cart.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { OrderSuccessComponent } from './pages/order-success/order-success.component';
import { CheckoutSuccessComponent } from './pages/checkout-success/checkout-success.component';
import { CheckoutCancelComponent } from './pages/checkout-cancel/checkout-cancel.component';
import { CartSidebarComponent } from './shared/components/cart-sidebar/cart-sidebar.component';

@NgModule({
  declarations: [
    CustomerLayoutComponent,
    ProfilePageComponent,
    CartComponent,
    OrderHistoryComponent,
    OrderSuccessComponent,
    CheckoutSuccessComponent,
    CheckoutCancelComponent,
    CartSidebarComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CustomerAppRoutingModule,
    CustomerSharedModule,
  ],
})
export class CustomerAppModule {}
