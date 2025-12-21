import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Opportunity } from '../models/opportunity';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {

  // C'est ici que nous définissons toutes les cartes "en dur" (Mock Data)
  private opportunities: Opportunity[] = [
    // CARTE 1 : Celle de la page principale (Master's Excellence)
    {
      id: 1,
      title: "Master's Excellence Scholarship 2024",
      type: 'Scholarship',
      organization: 'University of Toronto',
      location: 'Toronto, Canada',
      updatedAt: '2 days ago',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzVdf5pEShN21PMJh5FgtmbWFyMxG745kiY1O9iAmH-sJDd6Xwo096ZkdD3HxUBUjmyrOnDHINSjZyqyic-QI5zSDNbrIeb8cLmoWWxpzPfGYQGlEGwj0DOuHALekHTDM76kO4FC-3yTXRY-55lvBdDkwRvTvAVXhWjjsVXYvNAinaDG77OfZ9p-h3vlKKaHf-0ZriNQej2ytxUsiyztcytZefeTxEAMwAEKJwhpUfg0Ju1UoyrMQXaKSPij0IBjrfmAAjAcqX2WQ', // Image Campus
      logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-xI8JqdpaSSNYcdKGLV5oy1XcpyVjOD-yfqiXRzUwdVPqd_pvGR_bZodg_sfN6sijcW-Ix_fpFPM46OUY_Z_SVh5eXTq95snVnR6kXiZ4cQGG6mrod7Epvvml7PVDygGG24et6u2w-Lmy4sOAVSiV-NMZAVSIgqDSRsts5jb_6rJF0DSb1Eg-5bd0dCbP9uUA53zS1WgCzyWM8fEvTcQSEgDoORQFk_7ue2sJ4adxjj4wlXgUt5sq067Id0mrvOmpjdUvPdSgzHY', // Logo Université
      description: "The Master's Excellence Scholarship is designed to attract high-achieving international students to pursue their graduate studies at the University of Toronto. This prestigious award recognizes academic merit and leadership potential.",
      benefits: "Recipients of this scholarship will join a vibrant community of scholars dedicated to solving global challenges. The program includes mentorship opportunities, networking events with industry leaders, and full tuition coverage for the duration of the master's degree.",
      eligibility: [
        "Must be an international student (non-Canadian citizen/PR).",
        "Hold a bachelor's degree with a minimum GPA of 3.8/4.0.",
        "Demonstrate leadership through extracurricular activities or community service.",
        "Proof of English proficiency (IELTS 7.5 or equivalent)."
      ],
      deadline: "Oct 15, 2024",
      value: "$35,000 / year",
      duration: "2 Years",
      language: "English",
      registrationLink: "https://utoronto.ca/apply"
    },

    // CARTE 2 : International Student Fair (Event)
    {
      id: 2,
      title: "International Student Fair",
      type: 'Event',
      organization: 'Global Education',
      location: 'London, UK',
      updatedAt: '1 week ago',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQGIiIYiYJrUnTffhyBs8YhtFTiYVwWEzV3VkD_hLUwF-V-Z_Ax8oIUCjdkQZ37A6GIslYMNnizE_cprTemFgn8j0SA_f8EVQPA8YSdRdtIl65Q4nVpuJURPWOof6XuGmAWj9XVrJfnUZmFMqruB5MFY7HbvA0CJI8aO1GHlz8kO2t1P6p0WiGrKIyZUGuySIbbjsjkfdfwVVk8cYBekjkkiS2elzOPedc_VtSQtEkCWg2Eend8VL_eJpw8TrK6vLcf5HY855kGxw', // Image Étudiants qui parlent
      logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-xI8JqdpaSSNYcdKGLV5oy1XcpyVjOD-yfqiXRzUwdVPqd_pvGR_bZodg_sfN6sijcW-Ix_fpFPM46OUY_Z_SVh5eXTq95snVnR6kXiZ4cQGG6mrod7Epvvml7PVDygGG24et6u2w-Lmy4sOAVSiV-NMZAVSIgqDSRsts5jb_6rJF0DSb1Eg-5bd0dCbP9uUA53zS1WgCzyWM8fEvTcQSEgDoORQFk_7ue2sJ4adxjj4wlXgUt5sq067Id0mrvOmpjdUvPdSgzHY',
      description: "Join us for the biggest international student fair in London. Meet representatives from over 50 universities worldwide.",
      benefits: "Free entry, free career counseling, and on-spot admission assessments.",
      eligibility: ["Open to all students", "Registration required"],
      deadline: "Nov 12, 2024",
      value: "Free Entry",
      duration: "1 Day",
      language: "English",
      registrationLink: "#"
    },

    // CARTE 3 : Data Science Bootcamp (Training)
    {
      id: 3,
      title: "Data Science Bootcamp",
      type: 'Training',
      organization: 'Tech Academy',
      location: 'Online',
      updatedAt: '3 days ago',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQC7MQsZ9q3WRhvR8Mr5Qav3XoIYZjk8An_UOH55XRIHAc6WlzUsH_QCxVAwexPK30FegBL2WgZqFd-aBOyAllERegfxAvv_H1QmkAipz93UGW21yY6TudutMHjibqKuUPEcTy8hkP8fMTQayJS2bminTJeQBdqycR-0BlgvDtzfpJPmH5F8Uh9tKnD2grxw0EnVvUDy_9iiX1CMDDQRa-FiifWVQU_UrgXHel9tpUmrijtdgO5uZ0s2O03bm6ktK1UwYklCuIPxo', // Image Salle de réunion
      logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-xI8JqdpaSSNYcdKGLV5oy1XcpyVjOD-yfqiXRzUwdVPqd_pvGR_bZodg_sfN6sijcW-Ix_fpFPM46OUY_Z_SVh5eXTq95snVnR6kXiZ4cQGG6mrod7Epvvml7PVDygGG24et6u2w-Lmy4sOAVSiV-NMZAVSIgqDSRsts5jb_6rJF0DSb1Eg-5bd0dCbP9uUA53zS1WgCzyWM8fEvTcQSEgDoORQFk_7ue2sJ4adxjj4wlXgUt5sq067Id0mrvOmpjdUvPdSgzHY',
      description: "An intensive 6-month bootcamp to master Python, Machine Learning, and Big Data technologies.",
      benefits: "Get industry-recognized certification and job placement support upon completion.",
      eligibility: ["Basic programming knowledge", "Mathematics background preferred"],
      deadline: "Dec 1, 2024",
      value: "Open",
      duration: "6 Months",
      language: "English",
      registrationLink: "#"
    },

    // CARTE 4 : Women in Tech Grant (Scholarship)
    {
      id: 4,
      title: "Women in Tech Grant",
      type: 'Scholarship',
      organization: 'Women Who Code',
      location: 'Global',
      updatedAt: '1 day ago',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0Q2RLR7_xwQRJxajuitmqEa7ZYurrVsUTJeZB6y6QcapcbuzBXLndnnry3Tc6Fg4b4ICx8FOYurgWMnQyykwOX4jRWXW8CIrvstlSUMV3uvRc1S5a_-bg2lpxoBXVzmMZGDvFYW-1a8Xmhj4KaPYaN3UWLcXkx7Ru65q5eXBQUzRdk3oB5GSNQHPIpMH4trN1lzUnYRxov5a_UthFvvOpC_ZtJxvpUGiX4NlI3tpJ6xCqdfgKmGmU6GaiPuXmQwVlOls42PtCMX0', // Image Livres
      logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-xI8JqdpaSSNYcdKGLV5oy1XcpyVjOD-yfqiXRzUwdVPqd_pvGR_bZodg_sfN6sijcW-Ix_fpFPM46OUY_Z_SVh5eXTq95snVnR6kXiZ4cQGG6mrod7Epvvml7PVDygGG24et6u2w-Lmy4sOAVSiV-NMZAVSIgqDSRsts5jb_6rJF0DSb1Eg-5bd0dCbP9uUA53zS1WgCzyWM8fEvTcQSEgDoORQFk_7ue2sJ4adxjj4wlXgUt5sq067Id0mrvOmpjdUvPdSgzHY',
      description: "Supporting the next generation of women leaders in technology. This grant provides financial support for STEM studies.",
      benefits: "Financial grant of $5,000 and access to an exclusive mentorship network.",
      eligibility: ["Female student in STEM", "Enrollment proof required"],
      deadline: "Annual",
      value: "$5,000",
      duration: "One-off",
      language: "English",
      registrationLink: "#"
    },

    // CARTE 5 : Future Leaders Award (Scholarship)
    {
      id: 5,
      title: "Future Leaders Award",
      type: 'Scholarship',
      organization: 'Melbourne University',
      location: 'Melbourne, AU',
      updatedAt: '5 hours ago',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1XY49nFFW4D9_bYex5N5cbzifKXqRIFT9JP2Uce2vALmS1fadKIA1BN4ZwEzkSgUXK_Cuxn-tT-ay1oNZblCTnifZBB-wxZNOGZ4dSZLvjmfp8hLD1xGeJd4KDR5Ae_OOieVjki5kn9DeloiDjPN0fQPYrtymd4NQ6XjKh0yARj6SX9pPzMkKYQH9Rq1wRFjkIMtR5TY6WyLrfnkIkMsOxGcSza23QG-jOPBWwwV7Dywt1ppwUmTdGoZxPcvhueL_gvStiqlXFZg', // Image Architecture
      logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-xI8JqdpaSSNYcdKGLV5oy1XcpyVjOD-yfqiXRzUwdVPqd_pvGR_bZodg_sfN6sijcW-Ix_fpFPM46OUY_Z_SVh5eXTq95snVnR6kXiZ4cQGG6mrod7Epvvml7PVDygGG24et6u2w-Lmy4sOAVSiV-NMZAVSIgqDSRsts5jb_6rJF0DSb1Eg-5bd0dCbP9uUA53zS1WgCzyWM8fEvTcQSEgDoORQFk_7ue2sJ4adxjj4wlXgUt5sq067Id0mrvOmpjdUvPdSgzHY',
      description: "A comprehensive scholarship for students demonstrating exceptional leadership skills and community impact.",
      benefits: "Full tuition coverage for undergraduate studies and accommodation stipend.",
      eligibility: ["High school graduate", "Leadership experience"],
      deadline: "Jan 10, 2025",
      value: "Full Tuition",
      duration: "3 Years",
      language: "English",
      registrationLink: "#"
    }
  ];

  constructor() { }

  // 1. Récupérer TOUTES les cartes (pour la liste du bas)
  getOpportunities(): Observable<Opportunity[]> {
    return of(this.opportunities);
  }

  // 2. Récupérer UNE SEULE carte par son ID (pour la page de détails)
  getOpportunityById(id: number): Observable<Opportunity | undefined> {
    const found = this.opportunities.find(item => item.id === id);
    return of(found);
  }
}