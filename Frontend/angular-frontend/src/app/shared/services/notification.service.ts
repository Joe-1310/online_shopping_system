
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WebSocketService, WebSocketMessage } from '@app/core/services/webSocket.service';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);

  constructor(private webSocketService: WebSocketService) {
    this.initializeWebSocketListeners();
  }

  /**
   * Initialize WebSocket listeners
   */
  private initializeWebSocketListeners(): void {
    this.webSocketService.getMessages().subscribe((message: WebSocketMessage | null) => {
      if (message) {
        this.handleWebSocketMessage(message);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
    let notification: Notification;

    switch (message.type) {
      case 'order_notification':
        notification = {
          id: this.generateId(),
          type: 'info',
          title: 'Order Update',
          message: `Order #${message.data.orderId} has been ${message.data.status}`,
          timestamp: message.timestamp || new Date(),
          read: false
        };
        break;

      case 'admin_notification':
        notification = {
          id: this.generateId(),
          type: 'warning',
          title: 'Admin Alert',
          message: message.data.message || 'New admin notification',
          timestamp: message.timestamp || new Date(),
          read: false
        };
        break;

      case 'user_notification':
        notification = {
          id: this.generateId(),
          type: 'success',
          title: 'Notification',
          message: message.data.message || 'You have a new notification',
          timestamp: message.timestamp || new Date(),
          read: false
        };
        break;

      default:
        return;
    }

    this.addNotification(notification);
  }

  /**
   * Add a new notification
   */
  addNotification(notification: Notification): void {
    const currentNotifications = this.notifications.getValue();
    const updatedNotifications = [notification, ...currentNotifications];

    // Keep only the last 50 notifications
    if (updatedNotifications.length > 50) {
      updatedNotifications.splice(50);
    }

    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
  }

  /**
   * Get all notifications
   */
  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): Observable<number> {
    return this.unreadCount.asObservable();
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notifications = this.notifications.getValue();
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    const notifications = this.notifications.getValue();
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications.next([]);
    this.unreadCount.next(0);
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(): void {
    const notifications = this.notifications.getValue();
    const unreadCount = notifications.filter(n => !n.read).length;
    this.unreadCount.next(unreadCount);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}



/*
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { WebSocketService } from './webSocket.service';

export interface Notification {
  id?: string;
  type: 'order' | 'payment' | 'system' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);

  constructor(private webSocketService: WebSocketService) {}

  // Get all notifications
  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  // Get unread count
  getUnreadCount(): Observable<number> {
    return this.unreadCount.asObservable();
  }

  // Start listening for WebSocket notifications
  startListening(): void {
    // Subscribe to order notifications
    this.webSocketService.subscribeToNotifications().subscribe({
      next: (notification) => {
        this.addNotification(notification);
      },
      error: (error) => {
        console.error('Error receiving notifications:', error);
      }
    });

    // Subscribe to order updates
    this.webSocketService.subscribeToOrderUpdates().subscribe({
      next: (orderUpdate) => {
        this.addNotification({
          type: 'order',
          title: 'Order Update',
          message: `Order #${orderUpdate.orderId} has been ${orderUpdate.status}`,
          timestamp: new Date(),
          data: orderUpdate
        });
      },
      error: (error) => {
        console.error('Error receiving order updates:', error);
      }
    });
  }

  // Stop listening
  stopListening(): void {
    this.webSocketService.disconnect();
  }

  // Add notification manually
  addNotification(notification: Notification): void {
    const currentNotifications = this.notifications.value;
    const newNotification = {
      ...notification,
      id: notification.id || this.generateId(),
      read: notification.read || false,
      timestamp: notification.timestamp || new Date()
    };

    const updatedNotifications = [newNotification, ...currentNotifications];
    this.notifications.next(updatedNotifications);

    // Update unread count
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    this.unreadCount.next(unreadCount);
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );

    this.notifications.next(updatedNotifications);

    // Update unread count
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    this.unreadCount.next(unreadCount);
  }

  // Mark all as read
  markAllAsRead(): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));

    this.notifications.next(updatedNotifications);
    this.unreadCount.next(0);
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications.next([]);
    this.unreadCount.next(0);
  }

  // Remove specific notification
  removeNotification(notificationId: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== notificationId);
    this.notifications.next(updatedNotifications);

    // Update unread count
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    this.unreadCount.next(unreadCount);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
*/
