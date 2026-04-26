import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from '../../shared/components/product-list/product-list.component';
import { ProductDetailComponent } from '../../shared/components/product-detail/product-detail.component';
import { Unauthorized } from './pages/unauthorized/unauthorized';
import { guestGuard } from '../../core/guards/guest.guard';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [guestGuard],
      },
      {
        path: 'signup',
        component: SignupComponent,
        canActivate: [guestGuard],
      },
      {
        path: 'home',
        component: HomeComponent,
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
        path: 'unauthorized',
        component: Unauthorized,
      },
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicAppRoutingModule {}
