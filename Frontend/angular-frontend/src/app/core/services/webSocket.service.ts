import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private messageSubject = new BehaviorSubject<WebSocketMessage | null>(null);

  constructor(private authService: AuthService) {}

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.stompClient?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    // Get authentication token (assuming it's stored in cookies or can be accessed)
    const token = this.getAuthToken();

    if (!token) {
      console.error('No authentication token available');
      return;
    }

    this.stompClient = new Client({
      brokerURL: `ws://${environment.wsUrl}/ws`,
      connectHeaders: {
        'Authorization': `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP Debug: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected');
        this.connectionStatus.next(true);
        this.setupSubscriptions();
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        this.connectionStatus.next(false);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket Error: ', error);
      },
      onStompError: (frame) => {
        console.error('STOMP Error: ', frame);
      }
    });

    this.stompClient.activate();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connectionStatus.next(false);
      console.log('WebSocket connection closed');
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  /**
   * Get message observable
   */
  getMessages(): Observable<WebSocketMessage | null> {
    return this.messageSubject.asObservable();
  }

  /**
   * Subscribe to specific topics
   */
  private setupSubscriptions(): void {
    if (!this.stompClient?.connected) return;

    // Subscribe to order notifications (for all users)
    this.stompClient.subscribe('/topic/orders', (message) => {
      const parsedMessage: WebSocketMessage = {
        type: 'order_notification',
        data: JSON.parse(message.body),
        timestamp: new Date()
      };
      this.messageSubject.next(parsedMessage);
    });

    // Subscribe to admin-specific notifications
    if (this.authService.isAdmin()) {
      this.stompClient.subscribe('/topic/admin', (message) => {
        const parsedMessage: WebSocketMessage = {
          type: 'admin_notification',
          data: JSON.parse(message.body),
          timestamp: new Date()
        };
        this.messageSubject.next(parsedMessage);
      });
    }

    // Subscribe to user-specific notifications
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser) {
      this.stompClient.subscribe(`/topic/user/${currentUser.username}`, (message) => {
        const parsedMessage: WebSocketMessage = {
          type: 'user_notification',
          data: JSON.parse(message.body),
          timestamp: new Date()
        };
        this.messageSubject.next(parsedMessage);
      });
    }
  }

  /**
   * Send message to server
   */
  sendMessage(destination: string, message: any): void {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: `/app${destination}`,
        body: JSON.stringify(message)
      });
    } else {
      console.error('WebSocket is not connected');
    }
  }

  /**
   * Get authentication token (implement based on your auth storage strategy)
   */
  private getAuthToken(): string | null {
    return null;

    // If you're using JWT tokens stored in localStorage
   // return localStorage.getItem('auth_token');

    // If you're using cookies, you might not need to explicitly get the token
    // as it will be sent automatically with the request
    // In that case, you can modify the backend to accept token from cookies
    // return null;
  }
}



/*

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import SockJS from 'sockjs-client';
import { Client, IMessage, Stomp } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private messageSubject = new BehaviorSubject<any>(null);

  constructor() {}

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create SockJS connection
        const socket = new SockJS('http://localhost:8080/ws');

        // Create STOMP client
        this.stompClient = Stomp.over(socket);

        // Configure STOMP client
        this.stompClient.configure({
          connectHeaders: {
            Authorization: `Bearer ${token}`
          },
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          onConnect: (frame) => {
            console.log('WebSocket Connected:', frame);
            this.connectionStatus.next(true);
            resolve();
          },
          onStompError: (frame) => {
            console.error('STOMP Error:', frame);
            this.connectionStatus.next(false);
            reject(new Error(`STOMP error: ${frame.body}`));
          },
          onWebSocketClose: (event) => {
            console.log('WebSocket Closed:', event);
            this.connectionStatus.next(false);
          },
          onWebSocketError: (event) => {
            console.error('WebSocket Error:', event);
            this.connectionStatus.next(false);
            reject(new Error('WebSocket connection error'));
          }
        });

        // Activate the connection
        this.stompClient.activate();
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.connectionStatus.next(false);
      console.log('WebSocket Disconnected');
    }
  }

  isConnected(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  // Subscribe to notifications (for admin users)
  subscribeToNotifications(): Observable<any> {
    return new Observable(observer => {
      if (this.stompClient && this.stompClient.connected) {
        const subscription = this.stompClient.subscribe('/topic/notifications', (message: IMessage) => {
          try {
            const notification = JSON.parse(message.body);
            observer.next(notification);
          } catch (error) {
            console.error('Error parsing notification:', error);
            observer.error(error);
          }
        });

        // Return unsubscribe function
        return () => {
          subscription.unsubscribe();
        };
      } else {
        observer.error(new Error('WebSocket not connected'));
      }
    });
  }

  // Subscribe to order updates
  subscribeToOrderUpdates(): Observable<any> {
    return new Observable(observer => {
      if (this.stompClient && this.stompClient.connected) {
        const subscription = this.stompClient.subscribe('/topic/orders', (message: IMessage) => {
          try {
            const orderUpdate = JSON.parse(message.body);
            observer.next(orderUpdate);
          } catch (error) {
            console.error('Error parsing order update:', error);
            observer.error(error);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } else {
        observer.error(new Error('WebSocket not connected'));
      }
    });
  }

  // Send message to server
  sendMessage(destination: string, body: any): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(body)
      });
    } else {
      console.error('WebSocket not connected. Cannot send message.');
    }
  }

  // Generic subscribe method
  subscribe(topic: string): Observable<any> {
    return new Observable(observer => {
      if (this.stompClient && this.stompClient.connected) {
        const subscription = this.stompClient.subscribe(topic, (message: IMessage) => {
          try {
            const data = JSON.parse(message.body);
            observer.next(data);
          } catch (error) {
            console.error('Error parsing message:', error);
            observer.error(error);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } else {
        observer.error(new Error('WebSocket not connected'));
      }
    });
  }
}
*/
