import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { User } from '../../../../shared/models/user.model';
import { UserService } from '../../../../shared/services/user.service';

interface UserWithMetadata extends User {
  orderCount?: number;
  lastOrderDate?: string | null;
}

@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: UserWithMetadata[] = [];
  loading = true;

  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  // Filter form
  filterForm: FormGroup;

  // Modal state
  showRoleModal = false;
  selectedUser: User | null = null;

  // Expose Math for template
  Math = Math;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      id: [''],
      name: [''],
      email: [''],
      role: [''],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    const filters = this.filterForm.value;

    this.userService
      .getUsers(
        this.currentPage,
        this.pageSize,
        filters.name || undefined,
        filters.email || undefined,
        filters.role || undefined,
        filters.id || undefined
      )
      .subscribe({
        next: (response) => {
          // Handle both paginated and simple array responses
          if (response.content) {
            // Paginated response
            this.users = response.content;
            this.totalPages = response.totalPages || 1;
            this.totalElements = response.totalElements || this.users.length;
          } else if (Array.isArray(response)) {
            // Simple array response
            this.users = response;
            this.totalPages = 1;
            this.totalElements = this.users.length;
          } else {
            this.users = [];
            this.totalPages = 1;
            this.totalElements = 0;
          }

          this.loadUserMetadata();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.snackBar.open('Failed to load users. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          this.loading = false;
        },
      });
  }

  loadUserMetadata(): void {
    if (this.users.length === 0) {
      this.loading = false;
      return;
    }

    console.log(
      'Loading metadata for users:',
      this.users.map((u) => ({ id: u.id, username: u.username }))
    );

    const orderCountRequests = this.users.map((user) => {
      console.log('Requesting order count for user ID:', user.id);
      return this.userService.getUserOrderCount(user.id);
    });

    const lastOrderRequests = this.users.map((user) => {
      console.log('Requesting last order date for user ID:', user.id);
      return this.userService.getUserLastOrderDate(user.id);
    });

    forkJoin([forkJoin(orderCountRequests), forkJoin(lastOrderRequests)]).subscribe({
      next: ([orderCounts, lastOrderDates]) => {
        console.log('Order counts received:', orderCounts);
        console.log('Last order dates received:', lastOrderDates);

        this.users.forEach((user, index) => {
          user.orderCount = orderCounts[index] || 0;
          user.lastOrderDate = lastOrderDates[index] || null;
          console.log(
            `User ${user.username}: ${user.orderCount} orders, last order: ${user.lastOrderDate}`
          );
        });
        this.loading = false;
        console.log('User metadata loaded:', this.users);
      },
      error: (error) => {
        console.error('Error loading user metadata:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);

        this.users.forEach((user) => {
          user.orderCount = 0;
          user.lastOrderDate = null;
        });
        this.loading = false;
        this.snackBar.open('Users loaded, but order information unavailable.', 'Close', {
          duration: 4000,
          panelClass: ['warning-snackbar'],
        });
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 3);

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getUserRoleName(user: User): string {
    if (!user || !user.role) return 'Unknown';

    if (typeof user.role === 'string') {
      return user.role;
    }

    if (user.role && user.role.roleName) {
      return user.role.roleName;
    }

    return 'Unknown';
  }

  getRoleBadgeClass(role: string): string {
    const roleMap: { [key: string]: string } = {
      ADMIN: 'bg-danger',
      SUPER_ADMIN: 'bg-danger',
      CUSTOMER: 'bg-primary',
      VENDOR: 'bg-success',
    };
    return roleMap[role] || 'bg-secondary';
  }

  openRoleModal(user: User): void {
    this.selectedUser = { ...user };
    this.showRoleModal = true;
    this.cdr.detectChanges();
  }

  onRoleModalClose(): void {
    this.showRoleModal = false;
    this.selectedUser = null;
    this.cdr.detectChanges();
  }

  onRoleUpdate(event: { userId: number; newRole: string }): void {
    this.userService.updateUserRole(event.userId, event.newRole).subscribe({
      next: (response) => {
        this.snackBar.open('User role updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });

        // Close modal and reload data
        this.onRoleModalClose();
        this.loadUsers();
      },
      error: (error) => {
        // Check if it's actually a success response mis-categorized as error
        if (error.status === 200 || (error.status >= 200 && error.status < 300)) {
          this.snackBar.open('User role updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.onRoleModalClose();
          this.loadUsers();
        } else {
          this.snackBar.open('Failed to update user role. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        }
      },
    });
  }
}
