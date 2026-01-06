import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Search, ArrowRight, Calendar, MapPin, Grid, GraduationCap, BookOpen, LayoutGrid } from 'lucide-angular';

interface Opportunity {
  id: number;
  title: string;
  category: 'Bourse' | 'Formation' | 'Événement';
  image: string;
  date?: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  opportunities: Opportunity[] = [
    {
      id: 1,
      title: "Bourse d'Excellence 2024",
      category: 'Bourse',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: "Une opportunité unique pour les étudiants brillants souhaitant poursuivre leurs études à l'étranger..."
    },
    {
      id: 2,
      title: 'Intro à la Data Science',
      category: 'Formation',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Maîtrisez les bases de l\'analyse de données avec Python. Cours certifiant de 4 semaines.'
    },
    {
      id: 3,
      title: "Salon de l'Étudiant",
      category: 'Événement',
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      date: '15 Oct. 2024',
      description: 'Rencontrez les représentants de plus de 50 universités et entreprises lors de notre grand salon.'
    },
    {
      id: 4,
      title: 'Aide à la Mobilité',
      category: 'Bourse',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Subvention spéciale pour les stages à l\'international d\'une durée minimale de 3 mois.'
    },
    {
      id: 5,
      title: 'Leadership & Management',
      category: 'Formation',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Développez votre potentiel de leader grâce à des ateliers pratiques et des études de cas.'
    },
    {
      id: 6,
      title: 'Hackathon Tech 2024',
      category: 'Événement',
      image: 'https://images.unsplash.com/photo-1504384308090-c54be3855833?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      date: '22 Nov. 2024',
      description: '48 heures pour innover. Rejoignez des centaines de développeurs et designers pour créer le futur.'
    }
  ];

  // Icons
  readonly SearchIcon = Search;
  readonly ArrowRightIcon = ArrowRight;
  readonly CalendarIcon = Calendar;
  readonly GridIcon = LayoutGrid;
  readonly ScholarshipIcon = GraduationCap;
  readonly TrainingIcon = BookOpen;

  constructor() {}

  ngOnInit() {}

  // Helper to get color theme based on category
  getCategoryTheme(category: string): { badge: string, btn: string, icon: string } {
    switch(category) {
      case 'Bourse':
        return { 
          badge: 'bg-primary text-white', 
          btn: 'bg-primary-subtle text-primary',
          icon: 'text-primary'
        };
      case 'Formation':
        return { 
          badge: 'bg-success text-white', 
          btn: 'bg-success-subtle text-success',
          icon: 'text-success'
        };
      case 'Événement':
        return { 
          badge: 'bg-warning text-dark', 
          btn: 'bg-warning-subtle text-dark',
          icon: 'text-warning'
        };
      default:
        return { badge: 'bg-secondary', btn: 'bg-light', icon: 'text-secondary' };
    }
  }
}