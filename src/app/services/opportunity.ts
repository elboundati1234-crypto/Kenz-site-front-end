import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Opportunity } from '../models/opportunity';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {

  constructor() { }

  // Simuler la récupération d'une opportunité par ID
  getOpportunityById(id: number): Observable<Opportunity> {
    const mockData: Opportunity = {
      id: 1,
      title: "Master's Excellence Scholarship 2024",
      type: 'Scholarship',
      organization: 'University of Toronto',
      location: 'Toronto, Canada',
      updatedAt: '2 days ago',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzVdf5pEShN21PMJh5FgtmbWFyMxG745kiY1O9iAmH-sJDd6Xwo096ZkdD3HxUBUjmyrOnDHINSjZyqyic-QI5zSDNbrIeb8cLmoWWxpzPfGYQGlEGwj0DOuHALekHTDM76kO4FC-3yTXRY-55lvBdDkwRvTvAVXhWjjsVXYvNAinaDG77OfZ9p-h3vlKKaHf-0ZriNQej2ytxUsiyztcytZefeTxEAMwAEKJwhpUfg0Ju1UoyrMQXaKSPij0IBjrfmAAjAcqX2WQ', // Remplace par tes images
      logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-xI8JqdpaSSNYcdKGLV5oy1XcpyVjOD-yfqiXRzUwdVPqd_pvGR_bZodg_sfN6sijcW-Ix_fpFPM46OUY_Z_SVh5eXTq95snVnR6kXiZ4cQGG6mrod7Epvvml7PVDygGG24et6u2w-Lmy4sOAVSiV-NMZAVSIgqDSRsts5jb_6rJF0DSb1Eg-5bd0dCbP9uUA53zS1WgCzyWM8fEvTcQSEgDoORQFk_7ue2sJ4adxjj4wlXgUt5sq067Id0mrvOmpjdUvPdSgzHY',
      description: "The Master's Excellence Scholarship is designed to attract high-achieving international students to pursue their graduate studies at the University of Toronto. This prestigious award recognizes academic merit and leadership potential.",
      benefits: "Recipients of this scholarship will join a vibrant community of scholars. The program includes mentorship opportunities, networking events, and full tuition coverage.",
      eligibility: [
        "Must be an international student (non-Canadian citizen/PR).",
        "Hold a bachelor's degree with a minimum GPA of 3.8/4.0.",
        "Demonstrate leadership through extracurricular activities.",
        "Proof of English proficiency (IELTS 7.5 or equivalent)."
      ],
      deadline: "Oct 15, 2024",
      value: "$35,000 / year",
      duration: "2 Years",
      language: "English",
      registrationLink: "https://utoronto.ca/apply"
    };

    return of(mockData);
  }
}