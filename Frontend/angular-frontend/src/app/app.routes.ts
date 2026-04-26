import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'public',
    loadChildren: () =>
      import('./features/public-app/public-app.module').then((m) => m.PublicAppModule),
  },
  {
    path: 'shop',
    loadChildren: () =>
      import('./features/customer-app/customer-app.module').then((m) => m.CustomerAppModule),
    canActivate: [authGuard],
    data: { role: 'CUSTOMER' },
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin-app/admin-app.module').then((m) => m.AdminAppModule),
    canActivate: [authGuard],
    data: { role: 'ADMIN' }, // This will match both ADMIN and SUPER_ADMIN
  },
  {
    path: '',
    redirectTo: '/public',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/public',
  },
];
