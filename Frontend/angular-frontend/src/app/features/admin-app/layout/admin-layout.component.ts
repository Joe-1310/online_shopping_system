import { Component, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent {
  protected readonly title = signal('Online Shopping System - Admin Panel');

  constructor(private authService: AuthService) {}

  handleLogout() {
    this.authService.logout().subscribe();
  }
}
