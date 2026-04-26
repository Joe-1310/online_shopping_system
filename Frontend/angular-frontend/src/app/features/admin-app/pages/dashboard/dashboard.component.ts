import { Component, signal, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  protected readonly title = signal('Online Shopping System - Admin Dashboard');
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }
}
