import { Component, inject } from '@angular/core'; // + inject
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService, User } from '../../services/user'; // Import ton service

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  
  private userService = inject(UserService);

  // Variables pour le template
  isLoggedIn: boolean = false;
  user: User | null = null;

  constructor() {
    // ON ÉCOUTE EN DIRECT !
    // Dès que le UserService change (login/logout), ceci s'exécute
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;
      this.isLoggedIn = !!userData; // Si userData existe -> true, sinon false
    });
  }

  logout() {
    this.userService.logout();
    // isLoggedIn passera automatiquement à false grâce au subscribe du dessus
  }
}