import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AdminAppRoutingModule } from './admin-app-routing.module';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminSharedModule } from './imports/admin-shared.module';
import { ProductManagementComponent } from './pages/product-management/product-management.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CategoryManagementComponent } from './pages/category-management/category-management.component';
import { OrderManagementComponent } from './pages/order-management/order-management.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { CategoryFormModalComponent } from './components/category-form-modal/category-form-modal.component';
import { DeleteConfirmModalComponent } from './components/delete-confirm-modal/delete-confirm-modal.component';
import { UserRoleModalComponent } from './components/user-role-modal/user-role-modal.component';
import { OrderDetailsModalComponent } from './components/order-details-modal/order-details-modal.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    ProductManagementComponent,
    DashboardComponent,
    CategoryManagementComponent,
    OrderManagementComponent,
    UserManagementComponent,
    CategoryFormModalComponent,
    UserRoleModalComponent,
    OrderDetailsModalComponent,
  ],
  imports: [CommonModule, RouterModule, AdminAppRoutingModule, AdminSharedModule],
})
export class AdminAppModule {}
