import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, User, Phone, GraduationCap, BookOpen, Globe } from 'lucide-angular';
import { SupabaseService } from '../../services/opportunity';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  currentStep = 1;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  errorMessage = '';

  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly GraduationCapIcon = GraduationCap;
  readonly BookOpenIcon = BookOpen;
  readonly PhoneIcon = Phone;
  readonly GlobeIcon = Globe;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      studyLevel: ['', Validators.required],
      studyDomain: ['', Validators.required],
      phone: [''],
      targetCountries: [''],
      secondaryDomain: [''],
      acceptTerms: [false],
      acceptNotifications: [false]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.value === '') {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
      return null;
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isStep1Valid(): boolean {
    const step1Controls = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'studyLevel', 'studyDomain'];
    return step1Controls.every(controlName => {
      const control = this.registerForm.get(controlName);
      return control && control.valid;
    });
  }

  isStep2Valid(): boolean {
    const phone = this.registerForm.get('phone')?.value;
    const targetCountries = this.registerForm.get('targetCountries')?.value;
    const secondaryDomain = this.registerForm.get('secondaryDomain')?.value;
    const acceptTerms = this.registerForm.get('acceptTerms')?.value;
    const acceptNotifications = this.registerForm.get('acceptNotifications')?.value;

    return phone && targetCountries && secondaryDomain && acceptTerms && acceptNotifications;
  }

  nextStep() {
    if (this.isStep1Valid()) {
      this.currentStep = 2;
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  async skipAdditionalInfo() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const formValue = this.registerForm.value;
      await this.supabaseService.signUp({
        email: formValue.email,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        studyLevel: formValue.studyLevel,
        studyDomain: formValue.studyDomain,
        acceptTerms: false,
        acceptNotifications: false
      });
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
      console.error('Registration error:', error);
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (this.currentStep === 2 && this.isStep2Valid()) {
      this.loading = true;
      this.errorMessage = '';

      try {
        const formValue = this.registerForm.value;
        const targetCountriesArray = formValue.targetCountries
          ? formValue.targetCountries.split(',').map((country: string) => country.trim())
          : [];

        await this.supabaseService.signUp({
          email: formValue.email,
          password: formValue.password,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          studyLevel: formValue.studyLevel,
          studyDomain: formValue.studyDomain,
          phone: formValue.phone,
          secondaryDomain: formValue.secondaryDomain,
          targetCountries: targetCountriesArray,
          acceptTerms: formValue.acceptTerms,
          acceptNotifications: formValue.acceptNotifications
        });
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
        console.error('Registration error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
