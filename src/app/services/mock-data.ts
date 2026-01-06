import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Opportunity {
  id: number;
  title: string;
  category: 'Scholarship' | 'Event' | 'Training' | 'Workshop' | 'Hackathon';
  image: string;
  date?: string;
  location: string;
  description: string;
  isOnline: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private opportunities: Opportunity[] = [
    {
      id: 1,
      title: 'Global Tech Scholarship 2026',
      category: 'Scholarship',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'London, UK',
      description: 'Full funding for computer science students worldwide.',
      isOnline: false
    },
    {
      id: 2,
      title: 'Angular Global Summit',
      category: 'Event',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      date: '2026-03-15',
      location: 'Online',
      description: 'The biggest gathering of Angular developers.',
      isOnline: true
    },
    {
      id: 3,
      title: 'AI for Beginners Workshop',
      category: 'Workshop',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      date: '2026-02-10',
      location: 'Paris, France',
      description: 'Learn the basics of Machine Learning and AI integration.',
      isOnline: false
    },
    {
      id: 4,
      title: 'Backend Mastery Bootcamp',
      category: 'Training',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'Berlin, Germany',
      description: 'Intensive backend training using Node.js and Python.',
      isOnline: false
    },
    {
      id: 5,
      title: 'Spring Hackathon 2026',
      category: 'Hackathon',
      image: 'https://images.unsplash.com/photo-1504384308090-c54be3855833?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      date: '2026-04-20',
      location: 'Online',
      description: '48 hours of coding to solve real-world problems.',
      isOnline: true
    }
  ];

  getOpportunities(): Observable<Opportunity[]> {
    return of(this.opportunities);
  }
}
