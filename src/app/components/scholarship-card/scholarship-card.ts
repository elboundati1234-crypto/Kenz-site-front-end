import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Scholarship } from '../../models/scholarship';

@Component({
  selector: 'app-scholarship-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './scholarship-card.html',
  styleUrls: ['./scholarship-card.css']
})
export class ScholarshipCardComponent {
  @Input() scholarship!: Scholarship;

  // Cette fonction remplace l'image par défaut si le lien du backend est mort
  handleImageError(event: any) {
    // Comme votre image est dans 'public/placeholder.jpg', 
    // l'URL finale est juste 'placeholder.jpg'
    event.target.src = 'placeholder.jpg';
  }
}