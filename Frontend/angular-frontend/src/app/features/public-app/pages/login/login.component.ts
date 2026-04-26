import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.renderGoogleButton();
  }

  private renderGoogleButton(): void {
    google.accounts.id.initialize({
      client_id: this.authService.googleClientId,
      callback: (response: any) => {
        const idToken = response.credential;
        this.authService.loginWithGoogle(idToken);
      },
    });

    google.accounts.id.renderButton(document.getElementById('googleButton')!, {
      theme: 'outline',
      size: 'large',
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.snackBar.open('Please fill in all required fields.', 'Close', {
        duration: 5000,
        verticalPosition: 'top',
      });
      this.loginForm.markAllAsTouched();
      return;
    }

    const formValue = this.loginForm.value;

    // Show loading state
    this.snackBar.open('Logging in...', 'Close', {
      duration: 2000,
      verticalPosition: 'top',
    });

    this.authService.login(formValue.username, formValue.password).subscribe({
      next: () => {
        // Login successful - redirect will happen automatically
      },
      error: (error) => {
        console.error('Login failed:', error);
        const message = error?.error?.message || 'Login failed. Please check your credentials.';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          verticalPosition: 'top',
        });
      },
    });
  }

  loginWithGithub() {
    this.authService.loginWithGithub();
  }
}
