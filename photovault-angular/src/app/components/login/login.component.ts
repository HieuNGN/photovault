import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  logging = false;
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  onLogin(): void {
    if (!this.username || !this.password) {
      this.snackBar.open('Please enter username and password', 'Close', { duration: 3000 });
      return;
    }

    this.logging = true;
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.snackBar.open('✅ Login successful!', 'Close', { duration: 2000 });
        this.logging = false;
        // The app will automatically redirect due to auth guard
      },
      error: (error) => {
        console.error('Login error:', error);
        this.snackBar.open('❌ Login failed. Check your username and password.', 'Close', { duration: 5000 });
        this.logging = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
