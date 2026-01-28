import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core'; // 1. Import ChangeDetectorRef
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Import Router
import { LucideAngularModule, User as UserIcon, Mail, Phone, Globe, GraduationCap, BookOpen, Briefcase, Award } from 'lucide-angular';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './profiles.html',
  styleUrl: './profiles.css', // Attention : styleUrl (singulier) ou styleUrls (pluriel) selon version Angular
})
export class Profiles implements OnInit {

  profileForm!: FormGroup;
  user!: User;
  profileCompletion = 0;
  loading = true; // Commence à true
  isFirstCompletion = false;

  // Icônes
  readonly UserIcon = UserIcon;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly GlobeIcon = Globe;
  readonly GradIcon = GraduationCap;
  readonly BookIcon = BookOpen;
  readonly BriefcaseIcon = Briefcase;
  readonly AwardIcon = Award;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef // 2. Injection pour forcer l'affichage
  ) {}

  ngOnInit(): void {
    this.initForm();

    // S'abonner à l'utilisateur actuel
    this.userService.currentUser$.subscribe(user => {
      console.log('Utilisateur détecté dans Profiles:', user); // DEBUG 1

      if (user && user.id) {
        this.user = user;
        this.loadProfile(user.id);
      } else {
        // Si pas d'utilisateur, on arrête le chargement ou on redirige
        console.warn('Aucun utilisateur connecté ou ID manquant');
        this.loading = false;
        // Optionnel : this.router.navigate(['/login']);
      }
    });
  }

  initForm() {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [{ value: '', disabled: true }],
      educationLevel: [''],
      studyDomain: [''],
      phone: [''],
      destinationContinent: [''],
      secondaryDomain: ['']
    });
  }
    
  loadProfile(userId: string) {
    console.log('Chargement du profil pour ID:', userId); // DEBUG 2
    
    this.userService.getUserProfile(userId).subscribe({
      next: (res) => {
        console.log('Données reçues:', res); // DEBUG 3
        
        const userData = res.user || res;
  
        this.profileCompletion = userData.profileCompletion || 0;
        this.isFirstCompletion = this.profileCompletion < 100;
  
        this.profileForm.patchValue({
          firstName: userData.firstName ?? '',
          lastName: userData.lastName ?? '',
          email: userData.email ?? '',
          educationLevel: userData.profile?.educationLevel ?? '',
          studyDomain: userData.profile?.studyDomain ?? '',
          phone: userData.profile?.phone ?? '',
          destinationContinent: userData.profile?.destinationContinent ?? '',
          secondaryDomain: userData.profile?.secondaryDomain ?? ''
        });
  
        this.loading = false;
        this.cdr.detectChanges(); // 3. FORCE LA MISE À JOUR DE L'ÉCRAN
      },
      error: (err) => {
        console.error('Erreur chargement profil', err);
        this.loading = false;
        this.cdr.detectChanges(); // 4. FORCE LA MISE À JOUR MÊME EN ERREUR
      }
    });
  }
  
  submit() {
    if (this.profileForm.invalid) return;

    const completion = this.calculateProfileCompletion();
    const payload = {
      ...this.profileForm.getRawValue(),
      profileCompletion: completion
    };

    // On utilise userId ici
    this.userService.updateProfile(this.user.id, payload).subscribe({
        next: (res) => {
            console.log('Profil mis à jour', res);
            this.profileCompletion = completion;
            this.cdr.detectChanges(); // Force la mise à jour de la barre de progression
        },
        error: (err) => console.error(err)
    });
  }

  calculateProfileCompletion(): number {
    const values = this.profileForm.getRawValue();
    const fields = [
      values.firstName, values.lastName, values.educationLevel,
      values.studyDomain, values.phone, values.destinationContinent,
      values.secondaryDomain
    ];
    // On compte les champs remplis (non vides)
    const filled = fields.filter(v => v && v.toString().trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  }
}
