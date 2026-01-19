import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, User, Phone, GraduationCap, BookOpen, Globe } from 'lucide-angular';
import { UserService } from '../../services/user'; // Vérifiez le chemin

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

  // Icons
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
    private userService: UserService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      // Étape 1 : Infos de base
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      studyLevel: ['', Validators.required],
      studyDomain: ['', Validators.required],
      
      // Étape 2 : Infos complémentaires
      phone: [''],
      targetCountries: [''],
      secondaryDomain: [''],
      acceptTerms: [false, Validators.requiredTrue],
      acceptNotifications: [false]
    }, { validators: this.passwordMatchValidator });
  }

  // Validateur personnalisé pour comparer les mots de passe
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    if (confirmPassword.value === '') return null;
    
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Nettoyage de l'erreur si ça correspond
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) confirmPassword.setErrors(null);
      }
      return null;
    }
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  // Vérification Étape 1
  isStep1Valid(): boolean {
    const step1Controls = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'studyLevel', 'studyDomain'];
    // Vérifie si tous les contrôles de l'étape 1 sont valides
    return step1Controls.every(controlName => this.registerForm.get(controlName)?.valid);
  }

  // Vérification Étape 2
  isStep2Valid(): boolean {
    // Le plus important ici est d'avoir accepté les conditions
    return this.registerForm.get('acceptTerms')?.value === true;
  }

  // Passage à l'étape suivante
  nextStep() {
    if (this.isStep1Valid()) {
      this.currentStep = 2;
    } else {
      // Affiche les erreurs rouges si l'utilisateur essaie de passer sans remplir
      this.registerForm.markAllAsTouched();
    }
  }

  // Bouton "Passer" (Skip)
  skipAdditionalInfo() {
    // On lance l'inscription sans les données de l'étape 2 (sauf celles de base)
    this.performRegistration(false);
  }

  // Bouton "S'inscrire" (Submit final)
  onSubmit() {
    if (this.currentStep === 2 && this.isStep2Valid()) {
      this.performRegistration(true);
    } else {
      // Affiche les erreurs (ex: Terms not accepted)
      this.registerForm.markAllAsTouched();
    }
  }

  // Logique d'appel à l'API
  private performRegistration(includeProfileData: boolean) {
    this.loading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;

    // Préparation de l'objet pour l'API
    const registerData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      password: formValue.password,
      confirmPassword: formValue.confirmPassword,
      educationLevel: formValue.studyLevel, // Mapping important : studyLevel -> educationLevel
      studyDomain: formValue.studyDomain,
      
      // Si on inclut l'étape 2, on ajoute les champs optionnels
      ...(includeProfileData && {
          phone: formValue.phone,
          secondaryDomain: formValue.secondaryDomain,
          // Transformation de la chaine "Pays1, Pays2" en tableau si nécessaire
          destinationContinent: formValue.targetCountries // Assurez-vous que le nom correspond à votre API
      })
    };

    this.userService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registration success:', response);
        this.loading = false;
        // Redirection vers le login après succès
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        this.errorMessage = err.error?.message || "Une erreur est survenue lors de l'inscription.";
      }
    });
  }
}