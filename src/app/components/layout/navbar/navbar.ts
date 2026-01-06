import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styles: [`
    .nav-link { font-weight: 500; color: #4b5563; }
    .nav-link.active { color: #2563EB !important; font-weight: 600; }
  `]
})
export class NavbarComponent {}
