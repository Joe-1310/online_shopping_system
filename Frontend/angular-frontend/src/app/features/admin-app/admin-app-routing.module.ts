import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductManagementComponent } from './pages/product-management/product-management.component';
import { CategoryManagementComponent } from './pages/category-management/category-management.component';
import { OrderManagementComponent } from './pages/order-management/order-management.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'product-management',
        component: ProductManagementComponent,
      },
      {
        path: 'category-management',
        component: CategoryManagementComponent,
      },
      {
        path: 'order-management',
        component: OrderManagementComponent,
      },
      {
        path: 'users',
        component: UserManagementComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'user-management',
        component: UserManagementComponent,
      },
      {
        path: 'order-management',
        component: OrderManagementComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminAppRoutingModule {}
