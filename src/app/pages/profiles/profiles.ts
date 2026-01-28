import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../../services/user';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-profiles',
  standalone: true, // ✅ Add this if using standalone components
  imports: [  CommonModule,        // ✅ for *ngIf, *ngFor
    ReactiveFormsModule,
    RouterModule ],
  templateUrl: './profiles.html',
  styleUrl: './profiles.css',
})
export class Profiles implements OnInit {

  profileForm!: FormGroup;
  user!: User;
  profileCompletion = 0;
  loading = true;
  isFirstCompletion = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.loadProfile(user.id);
      }
    });

    this.initForm();
  }

  initForm() {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [{ value: '', disabled: true }], // ✅ correct
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
  
        this.loading = false; // ✅ SUCCESS
      },
      error: (err) => {
        console.error('Profile load failed', err);
        this.loading = false; // ✅ EVEN ON ERROR
      }
    });
  }
  


submit() {
  if (this.profileForm.invalid) return;

  const payload = {
    ...this.profileForm.getRawValue(),
    profileCompletion: this.calculateProfileCompletion()
  };

  this.userService.updateProfile(this.user.id, payload).subscribe(res => {
    this.profileCompletion = payload.profileCompletion;
  });
}

  calculateProfileCompletion(): number {
    const values = this.profileForm.getRawValue();
  
    const fields = [
      values.firstName,
      values.lastName,
      values.educationLevel,
      values.studyDomain,
      values.phone,
      values.destinationContinent,
      values.secondaryDomain
    ];
  
    const filled = fields.filter(v => v && v.trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  }
}
