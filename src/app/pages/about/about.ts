import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user'; // Vérifiez le chemin
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
  isLoggedIn = false;

  // Icônes
  readonly TargetIcon = Target;
  readonly UsersIcon = Users;
  readonly GlobeIcon = Globe;
  readonly AwardIcon = Award;
  readonly BookIcon = BookOpen;
  readonly RocketIcon = Rocket;

  ngOnInit() {
    // Vérifier si l'utilisateur est connecté
    this.userService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user; // true si utilisateur existe, false sinon
    });
  }
}