import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../services/cart.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-customer-layout',
  standalone: false,
  templateUrl: './customer-layout.component.html',
  styleUrls: ['./customer-layout.component.css'],
})
export class CustomerLayoutComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription: Subscription = new Subscription();

  isSidebarOpen$!: Observable<boolean>;

  constructor(private authService: AuthService, private cartService: CartService) {}

  ngOnInit(): void {
    this.isSidebarOpen$ = this.cartService.isSidebarOpen$;

    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    if (!this.currentUser) {
      this.authService.getCurrentUserSilent().subscribe({
        next: (user) => {
          console.log('Refreshed user data:', user);
        },
        error: (err) => {
          console.error('Failed to get current user:', err);
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  handleLogout(event: Event): void {
    event.preventDefault();
    this.authService.logout().subscribe();
  }
}
