import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // 1. Importer ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user'; 
import { LucideAngularModule, Target, Users, Globe, Award, BookOpen, Rocket } from 'lucide-angular';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class AboutComponent implements OnInit {
  
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef); // 2. Injecter le détecteur de changement
  
  isLoggedIn = false;

  // Icônes
  readonly TargetIcon = Target;
  readonly UsersIcon = Users;
  readonly GlobeIcon = Globe;
  readonly AwardIcon = Award;
  readonly BookIcon = BookOpen;
  readonly RocketIcon = Rocket;

  ngOnInit() {
    // S'abonner aux changements d'état de l'utilisateur
    this.userService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user; // true si connecté, false sinon
      
      this.cdr.detectChanges(); // 3. FORCER LE RAFRAÎCHISSEMENT DE LA VUE
    });
  }
}