import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Importation nécessaire pour le bouton "View Details"
import { Training } from '../../models/training';

@Component({
  selector: 'app-training-card',
  standalone: true,
  imports: [CommonModule, RouterLink], // RouterLink ajouté ici pour fonctionner dans le HTML
  templateUrl: './training-card.html',
  styleUrls: ['./training-card.css']
})
export class TrainingCardComponent {
  @Input() training!: Training;

  // Détermine la couleur du tag en haut de la carte
  getCategoryClass(): string {
    if (!this.training.category) return 'bg-light text-secondary';
    
    switch (this.training.category) {
      case 'Development': return 'bg-primary-subtle text-primary';
      case 'Design': return 'bg-info-subtle text-info-emphasis';
      case 'Business': return 'bg-warning-subtle text-warning-emphasis';
      case 'Health': return 'bg-danger-subtle text-danger';
      case 'Data Science': return 'bg-primary-subtle text-primary';
      case 'Marketing': return 'bg-danger-subtle text-danger-emphasis';
      default: return 'bg-light text-secondary';
    }
  }

  // Détermine le style visuel du badge (Featured, Popular, Free)
  getBadgeClass(): string {
    switch (this.training.badgeType) {
      case 'Featured': return 'bg-white bg-opacity-75 text-dark backdrop-blur';
      case 'Popular': return 'bg-warning-subtle text-warning-emphasis';
      case 'Free': return 'bg-success-subtle text-success-emphasis';
      default: return '';
    }
  }
}