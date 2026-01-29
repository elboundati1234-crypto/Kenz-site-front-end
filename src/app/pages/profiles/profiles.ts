import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
  styleUrl: './profiles.css',
})
export class Profiles implements OnInit {

  profileForm!: FormGroup;
  
  // 👇 CORRECTION 1 : On autorise le 'null' pour faire plaisir au compilateur
  user: User | null = null; 
  
  profileCompletion = 0;
  loading = true;
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.userService.currentUser$.subscribe(user => {
      if (user && user.id) {
        this.user = user;
        this.loadProfile(user.id);
      } else {
        console.warn('Utilisateur non connecté');
        this.loading = false;
        this.cdr.detectChanges();
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
    this.userService.getUserProfile(userId).subscribe({
      next: (res) => {
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement profil', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  submit() {
    // 👇 CORRECTION 2 : On vérifie que 'this.user' existe avant d'envoyer
    if (this.profileForm.invalid || !this.user) return;

    const completion = this.calculateProfileCompletion();
    const payload = {
      ...this.profileForm.getRawValue(),
      profileCompletion: completion
    };

    // Maintenant TypeScript est content car on a vérifié que user n'est pas null
  this.userService.updateProfile(this.user.id, payload).subscribe({
        next: (res) => {
            console.log('Profil mis à jour', res);
            this.profileCompletion = completion;
            this.cdr.detectChanges();
            this.router.navigate(['/home']);

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
    const filled = fields.filter(v => v && v.toString().trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  }
}
