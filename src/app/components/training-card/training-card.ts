import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; 
import { Training } from '../../models/training';

@Component({
  selector: 'app-training-card',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './training-card.html',
  styleUrls: ['./training-card.css']
})
export class TrainingCardComponent {
  @Input() training!: Training;

  // Détermine la couleur du tag en haut de la carte
  getCategoryClass(): string {
    if (!this.training.category) return 'bg-light text-secondary';
    
    switch (this.training.category) {
      case 'Development': 
        return 'bg-primary-subtle text-primary'; // Bleu
      case 'Design': 
        return 'bg-info-subtle text-info-emphasis'; // Cyan
      case 'Business': 
        return 'bg-warning-subtle text-warning-emphasis'; // Jaune/Orange
      case 'Data Science': 
        return 'bg-success-subtle text-success'; // Vert (ou Purple si vous avez du CSS custom)
      case 'Marketing': 
        return 'bg-danger-subtle text-danger-emphasis'; // Rouge
      default: 
        return 'bg-light text-secondary';
    }
  }

  // Détermine le style visuel du badge (Featured, Popular, Free)
  getBadgeClass(): string {
    switch (this.training.badgeType) {
      case 'Featured': 
        return 'bg-white bg-opacity-75 text-dark backdrop-blur';
      case 'Popular': 
        return 'bg-warning text-dark';
      case 'Free': 
        return 'bg-success text-white';
      default: 
        return '';
    }
  }
}