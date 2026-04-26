import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../shared/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <!-- Notification Bell Icon -->
      <div class="notification-bell" (click)="toggleNotifications()">
        <i class="bi bi-bell"></i>
        <span *ngIf="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
      </div>

      <!-- Notification Dropdown -->
      <div *ngIf="showNotifications" class="notification-dropdown">
        <div class="notification-header">
          <h6>Notifications</h6>
          <button
            *ngIf="notifications.length > 0"
            class="btn btn-sm btn-link"
            (click)="markAllAsRead()">
            Mark all as read
          </button>
        </div>

        <div class="notification-list">
          <div
            *ngFor="let notification of notifications; trackBy: trackByNotificationId"
            class="notification-item"
            [class.unread]="!notification.read"
            (click)="markAsRead(notification.id)">

            <div class="notification-icon" [ngClass]="'icon-' + notification.type">
              <i class="bi" [ngClass]="{
                'bi-check-circle': notification.type === 'success',
                'bi-exclamation-triangle': notification.type === 'warning',
                'bi-x-circle': notification.type === 'error',
                'bi-info-circle': notification.type === 'info'
              }"></i>
            </div>

            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>

            <div *ngIf="!notification.read" class="unread-indicator"></div>
          </div>

          <div *ngIf="notifications.length === 0" class="no-notifications">
            No notifications
          </div>
        </div>

        <div *ngIf="notifications.length > 0" class="notification-footer">
          <button class="btn btn-sm btn-outline-danger" (click)="clearAll()">
            Clear All
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      *ngIf="showNotifications"
      class="notification-backdrop"
      (click)="closeNotifications()">
    </div>
  `,
  styles: [`
    .notification-container {
      position: relative;
      display: inline-block;
    }

    .notification-bell {
      position: relative;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .notification-bell:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .notification-badge {
      position: absolute;
      top: 0;
      right: 0;
      background-color: #dc3545;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(25%, -25%);
    }

    .notification-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 320px;
      max-height: 400px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      margin-top: 8px;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
    }

    .notification-header h6 {
      margin: 0;
      font-weight: 600;
    }

    .notification-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
    }

    .notification-item:hover {
      background-color: #f8f9fa;
    }

    .notification-item.unread {
      background-color: #f0f8ff;
    }

    .notification-icon {
      margin-right: 12px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-success { color: #28a745; }
    .icon-warning { color: #ffc107; }
    .icon-error { color: #dc3545; }
    .icon-info { color: #17a2b8; }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .notification-message {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .notification-time {
      font-size: 11px;
      color: #999;
    }

    .unread-indicator {
      width: 8px;
      height: 8px;
      background-color: #007bff;
      border-radius: 50%;
      margin-left: 8px;
      margin-top: 4px;
    }

    .no-notifications {
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }

    .notification-footer {
      padding: 8px 16px;
      border-top: 1px solid #eee;
      text-align: center;
    }

    .notification-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999;
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.getNotifications().subscribe(notifications => {
        this.notifications = notifications;
      })
    );

    this.subscription.add(
      this.notificationService.getUnreadCount().subscribe(count => {
        this.unreadCount = count;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    this.notificationService.clearAll();
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}
