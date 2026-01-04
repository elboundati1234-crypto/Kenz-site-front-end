import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; // <--- 1. Importez ceci

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive], // <--- 2. Ajoutez-les ici
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

}