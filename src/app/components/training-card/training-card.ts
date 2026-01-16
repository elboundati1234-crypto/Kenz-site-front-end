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

  
  handleImageError(event: any) {
    event.target.src = 'placeholder.jpg';
  }

  // Détermine la couleur du tag en haut de la carte
  getCategoryClass(): string {
    if (!this.training.category) return 'bg-light text-secondary';
    
    switch (this.training.category) {
      case 'Development': 
        return 'bg-primary-subtle text-primary'; 
      case 'Design': 
        return 'bg-info-subtle text-info-emphasis'; 
      case 'Business': 
        return 'bg-warning-subtle text-warning-emphasis'; 
      case 'Data Science': 
        return 'bg-success-subtle text-success'; 
      case 'Marketing': 
        return 'bg-danger-subtle text-danger-emphasis'; 
      default: 
        return 'bg-light text-secondary';
    }
  }

  // Détermine le style visuel du badge
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