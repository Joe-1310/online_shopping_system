import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../../shared/models/user.model';
import { UserService } from '../../../../shared/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrderService, CustomerStats, RecentActivity } from '../../../../shared/services/order.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: false,
})
export class ProfilePageComponent implements OnInit {
  user: User | null = null;
  currentUser: User | null = null;

  nameForm: FormGroup;
  emailForm: FormGroup;

  isLoading = false;
  isNameSubmitting = false;
  isEmailSubmitting = false;

  cartItemCount = 0;
  customerStats: CustomerStats | null = null;
  recentActivity: RecentActivity[] | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cartService: CartService,
    private orderService: OrderService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.nameForm = this.fb.group({
      name: ['', [Validators.required]],
    });

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadDashboardData();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userService.getProfile().subscribe({
      next: (userData: User) => {
        this.user = userData;
        this.currentUser = userData;
        this.populateForms(userData);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.snackBar.open('Failed to load profile data', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.isLoading = false;
      },
    });
  }

  loadDashboardData(): void {
    // Load cart item count
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cartItemCount = cart.items?.length || 0;
      },
      error: (error) => {
        console.error('Error loading cart data:', error);
        this.cartItemCount = 0;
      },
    });

    // Load customer stats
    this.orderService.getCustomerStats().subscribe({
      next: (stats) => {
        this.customerStats = stats;
      },
      error: (error) => {
        console.error('Error loading customer stats:', error);
        this.customerStats = {
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          orderStatusCounts: {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
          },
        };
      },
    });

    // Load recent activity
    this.orderService.getRecentActivity(5).subscribe({
      next: (activity) => {
        this.recentActivity = activity;
      },
      error: (error) => {
        console.error('Error loading recent activity:', error);
        this.recentActivity = [];
      },
    });
  }

  populateForms(userData: User): void {
    this.nameForm.patchValue({
      name: userData.username,
    });

    this.emailForm.patchValue({
      email: userData.email,
    });
  }

  onNameSubmit(): void {
    if (this.nameForm.valid && this.nameForm.dirty) {
      this.isNameSubmitting = true;

      const updateData = {
        username: this.nameForm.value.name,
      };

      this.userService.updateProfile(updateData).subscribe({
        next: (updatedUser: User) => {
          this.user = updatedUser;
          this.currentUser = updatedUser;
          this.authService.updateCurrentUser(updatedUser);
          this.nameForm.markAsPristine();
          this.snackBar.open('Username updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.isNameSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating username:', error);
          this.snackBar.open('Failed to update username. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.isNameSubmitting = false;
        },
      });
    }
  }

  onEmailSubmit(): void {
    if (this.emailForm.valid && this.emailForm.dirty) {
      this.isEmailSubmitting = true;

      const updateData = {
        email: this.emailForm.value.email,
      };

      this.userService.updateProfile(updateData).subscribe({
        next: (updatedUser: User) => {
          this.user = updatedUser;
          this.currentUser = updatedUser;
          this.authService.updateCurrentUser(updatedUser);
          this.emailForm.markAsPristine();
          this.snackBar.open('Email updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.isEmailSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating email:', error);
          this.snackBar.open('Failed to update email. Please try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.isEmailSubmitting = false;
        },
      });
    }
  }

  getJoinDate(): string {
    return new Date().toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'order_delivered':
        return 'bi-check-circle';
      case 'order_shipped':
        return 'bi-truck';
      case 'order_created':
        return 'bi-cart-check';
      case 'order_cancelled':
        return 'bi-x-circle';
      case 'cart_updated':
        return 'bi-cart';
      default:
        return 'bi-activity';
    }
  }

  getActivityIconClass(type: string): string {
    switch (type) {
      case 'order_delivered':
        return 'bg-success';
      case 'order_shipped':
        return 'bg-info';
      case 'order_created':
        return 'bg-primary';
      case 'order_cancelled':
        return 'bg-danger';
      case 'cart_updated':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }
}
