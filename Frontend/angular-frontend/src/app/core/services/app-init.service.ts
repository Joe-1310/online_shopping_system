import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { WebSocketService } from './webSocket.service';
import { NotificationService } from '../../shared/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  constructor(
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService
  ) {
    this.initializeApp();
  }

  private initializeApp(): void {
    // Subscribe to authentication changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User is logged in, connect to WebSocket
        console.log('User logged in, connecting to WebSocket');
        this.webSocketService.connect();
      } else {
        // User is logged out, disconnect from WebSocket
        console.log('User logged out, disconnecting from WebSocket');
        this.webSocketService.disconnect();
      }
    });

    // Try to get current user on app start
    if (this.authService.isLoggedIn()) {
      this.authService.getCurrentUserSilent().subscribe({
        next: (user) => {
          console.log('Current user retrieved, connecting to WebSocket');
        },
        error: (error) => {
          console.log('No current user session');
        }
      });
    }
  }
}
