import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';


declare var google: any;

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  role = 'CUSTOMER';
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.signupForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
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

    google.accounts.id.renderButton(
      document.getElementById("googleButton")!,
      { theme: "outline", size: "large" }
    );
  }

  // Getter for easy access to form controls in template
  get f() {
    return this.signupForm.controls;
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.snackBar.open('Please fix the errors before submitting.', 'Close', {
        duration: 5000,
        verticalPosition: 'top',
      });
      // Mark all fields as touched to show validation errors
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const formValue = this.signupForm.value;
    this.authService
      .signup(
        formValue.username,
        formValue.email,
        this.role,
        formValue.password,
        formValue.confirmPassword
      )
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.snackBar.open('Account created successfully!', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
          });
        },
        error: (err) => {
          this.loading.set(false);
          const message = err?.error?.message || 'Signup failed. Please try again.';
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
