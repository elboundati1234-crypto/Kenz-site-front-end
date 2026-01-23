import { Component, ChangeDetectorRef } from '@angular/core'; // 1. Importer ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff } from 'lucide-angular';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  loading = false;
  errorMessage = '';

  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef // 2. L'injecter ici
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const credentials = this.loginForm.value;

      this.userService.login(credentials).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Login success', response);
          this.router.navigate(['/']); 
          this.cdr.detectChanges(); // 3. FORCER LA MISE À JOUR ICI
        },
        error: (err) => {
          this.loading = false; // Arrête le spinner
          console.error('Login Error', err);
          this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect.';
          
          this.cdr.detectChanges(); // 4. ET FORCER LA MISE À JOUR ICI AUSSI
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}