import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { 
  LucideAngularModule, 
  Search, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Grid, 
  GraduationCap, 
  BookOpen, 
  LayoutGrid 
} from 'lucide-angular';


import { Opportunity } from '../../models/opportunity';
import { OpportunityService } from '../../services/opportunity';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule,RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  
  opportunities: Opportunity[] = [];

  // Icons
  readonly SearchIcon = Search;
  readonly ArrowRightIcon = ArrowRight;
  readonly CalendarIcon = Calendar;
  readonly MapPinIcon = MapPin;
  readonly GridIcon = LayoutGrid;
  readonly ScholarshipIcon = GraduationCap;
  readonly TrainingIcon = BookOpen;

  constructor(private opportunityService: OpportunityService) {}

  ngOnInit() {
    this.opportunityService.getOpportunities().subscribe(data => {
      // On prend seulement les 6 premières pour la page d'accueil
      this.opportunities = data.slice(0, 6);
    });
  }

  // Helper pour les couleurs selon le type (qui vient du Service en Anglais)
  getCategoryTheme(type: string): { badge: string, btn: string, icon: string } {
    switch(type) {
      case 'Scholarship': // Correspond aux données du service
        return { 
          badge: 'bg-primary-subtle text-primary', 
          btn: 'bg-primary-subtle text-primary',
          icon: 'text-primary'
        };
      case 'Training':
        return { 
          badge: 'bg-success-subtle text-success', 
          btn: 'bg-success-subtle text-success',
          icon: 'text-success'
        };
      case 'Event':
        return { 
          badge: 'bg-warning-subtle text-dark', 
          btn: 'bg-warning-subtle text-dark',
          icon: 'text-warning'
        };
      default:
        return { badge: 'bg-secondary-subtle text-secondary', btn: 'bg-light', icon: 'text-secondary' };
    }
  }

  // Helper pour traduire le type anglais en français pour l'affichage
  translateType(type: string): string {
    const map: { [key: string]: string } = {
      'Scholarship': 'Bourse',
      'Training': 'Formation',
      'Event': 'Événement'
    };
    return map[type] || type;
  }
}