import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Opportunity } from '../models/opportunity';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {

  private opportunities: Opportunity[] = [
    {
      id: 1,
      title: "Master's Excellence Scholarship 2024",
      type: 'Scholarship',
      organization: 'University of Toronto',
      orgDescription: 'Leading public research university in Toronto, Ontario.',
      location: 'Toronto, Canada',
      updatedAt: '2 days ago',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzVdf5pEShN21PMJh5FgtmbWFyMxG745kiY1O9iAmH-sJDd6Xwo096ZkdD3HxUBUjmyrOnDHINSjZyqyic-QI5zSDNbrIeb8cLmoWWxpzPfGYQGlEGwj0DOuHALekHTDM76kO4FC-3yTXRY-55lvBdDkwRvTvAVXhWjjsVXYvNAinaDG77OfZ9p-h3vlKKaHf-0ZriNQej2ytxUsiyztcytZefeTxEAMwAEKJwhpUfg0Ju1UoyrMQXaKSPij0IBjrfmAAjAcqX2WQ',
      logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-xI8JqdpaSSNYcdKGLV5oy1XcpyVjOD-yfqiXRzUwdVPqd_pvGR_bZodg_sfN6sijcW-Ix_fpFPM46OUY_Z_SVh5eXTq95snVnR6kXiZ4cQGG6mrod7Epvvml7PVDygGG24et6u2w-Lmy4sOAVSiV-NMZAVSIgqDSRsts5jb_6rJF0DSb1Eg-5bd0dCbP9uUA53zS1WgCzyWM8fEvTcQSEgDoORQFk_7ue2sJ4adxjj4wlXgUt5sq067Id0mrvOmpjdUvPdSgzHY', // Logo U of T
      description: "The Master's Excellence Scholarship is designed to attract high-achieving international students to pursue their graduate studies at the University of Toronto. This prestigious award recognizes academic merit and leadership potential.",
      benefits: "Recipients of this scholarship will join a vibrant community of scholars dedicated to solving global challenges. The program includes mentorship opportunities and full tuition coverage.",
      eligibility: [
        "Must be an international student.",
        "Hold a bachelor's degree with a minimum GPA of 3.8/4.0.",
        "Proof of English proficiency (IELTS 7.5)."
      ],
      deadline: "Oct 15, 2024",
      value: "$35,000 / year",
      duration: "2 Years",
      language: "English",
      registrationLink: "#"
    },
    {
      id: 2,
      title: "International Student Fair",
      type: 'Event',
      organization: 'Global Education',
      orgDescription: 'Connecting students with top universities worldwide.',
      location: 'London, UK • Nov 12',
      updatedAt: '1 week ago',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQGIiIYiYJrUnTffhyBs8YhtFTiYVwWEzV3VkD_hLUwF-V-Z_Ax8oIUCjdkQZ37A6GIslYMNnizE_cprTemFgn8j0SA_f8EVQPA8YSdRdtIl65Q4nVpuJURPWOof6XuGmAWj9XVrJfnUZmFMqruB5MFY7HbvA0CJI8aO1GHlz8kO2t1P6p0WiGrKIyZUGuySIbbjsjkfdfwVVk8cYBekjkkiS2elzOPedc_VtSQtEkCWg2Eend8VL_eJpw8TrK6vLcf5HY855kGxw',
      logoUrl: 'https://uploads.turbologo.com/uploads/design/preview_image/472636/draw_svg20250109-11786-196169.svg.png', // Tu peux changer l'URL du logo ici
      description: "Meet representatives from over 50 universities worldwide in London.",
      benefits: "Free entry and on-spot admission assessments.",
      eligibility: ["Open to all students"],
      deadline: "Nov 12, 2024",
      value: "Free Entry",
      duration: "1 Day",
      language: "English",
      registrationLink: "#"
    },
    {
      id: 3,
      title: "Data Science Bootcamp",
      type: 'Training',
      organization: 'Tech Academy',
      orgDescription: 'International coding school specializing in Data & AI.',
      location: 'Online • Starts Dec 1',
      updatedAt: '3 days ago',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQC7MQsZ9q3WRhvR8Mr5Qav3XoIYZjk8An_UOH55XRIHAc6WlzUsH_QCxVAwexPK30FegBL2WgZqFd-aBOyAllERegfxAvv_H1QmkAipz93UGW21yY6TudutMHjibqKuUPEcTy8hkP8fMTQayJS2bminTJeQBdqycR-0BlgvDtzfpJPmH5F8Uh9tKnD2grxw0EnVvUDy_9iiX1CMDDQRa-FiifWVQU_UrgXHel9tpUmrijtdgO5uZ0s2O03bm6ktK1UwYklCuIPxo',
      logoUrl: 'https://previews.123rf.com/images/captainvector/captainvector1703/captainvector170309945/74377645-university-logo-element.jpg', // Logo Tech Academy
      description: "An intensive training to master Python and Machine Learning.",
      benefits: "Industry-recognized certification.",
      eligibility: ["Basic programming knowledge"],
      deadline: "Dec 1, 2024",
      value: "Open",
      duration: "6 Months",
      language: "English",
      registrationLink: "#"
    },
    {
      id: 4,
      title: "Women in Tech Grant",
      type: 'Scholarship',
      organization: 'Women Who Code',
      orgDescription: 'Non-profit empowering women in technology.',
      location: 'Global • Annual',
      updatedAt: '1 day ago',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0Q2RLR7_xwQRJxajuitmqEa7ZYurrVsUTJeZB6y6QcapcbuzBXLndnnry3Tc6Fg4b4ICx8FOYurgWMnQyykwOX4jRWXW8CIrvstlSUMV3uvRc1S5a_-bg2lpxoBXVzmMZGDvFYW-1a8Xmhj4KaPYaN3UWLcXkx7Ru65q5eXBQUzRdk3oB5GSNQHPIpMH4trN1lzUnYRxov5a_UthFvvOpC_ZtJxvpUGiX4NlI3tpJ6xCqdfgKmGmU6GaiPuXmQwVlOls42PtCMX0',
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh_NMd1OsfXtGc_InkYtQdiDWL8QfPwtCVDw&s',
      description: "Supporting women leaders in technology.",
      benefits: "$5,000 grant and mentorship.",
      eligibility: ["Female student in STEM"],
      deadline: "Annual",
      value: "$5,000",
      duration: "1 Year",
      language: "English, French",
      registrationLink: "#"
    },
    {
      id: 5,
      title: "Future Leaders Award",
      type: 'Scholarship',
      organization: 'Melbourne University',
      orgDescription: 'Public research university located in Melbourne, Australia.',
      location: 'Melbourne, AU • Jan 10',
      updatedAt: '5 hours ago',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1XY49nFFW4D9_bYex5N5cbzifKXqRIFT9JP2Uce2vALmS1fadKIA1BN4ZwEzkSgUXK_Cuxn-tT-ay1oNZblCTnifZBB-wxZNOGZ4dSZLvjmfp8hLD1xGeJd4KDR5Ae_OOieVjki5kn9DeloiDjPN0fQPYrtymd4NQ6XjKh0yARj6SX9pPzMkKYQH9Rq1wRFjkIMtR5TY6WyLrfnkIkMsOxGcSza23QG-jOPBWwwV7Dywt1ppwUmTdGoZxPcvhueL_gvStiqlXFZg',
      logoUrl: 'https://img.freepik.com/vecteurs-premium/logo-universite_10250-708.jpg?semt=ais_hybrid&w=740&q=80',
      description: "Scholarship for exceptional leadership skills.",
      benefits: "Full tuition coverage.",
      eligibility: ["Leadership experience"],
      deadline: "Jan 10, 2025",
      value: "Full Tuition",
      duration: "3 Years",
      language: "English, French, Spanish",
      registrationLink: "#"
    }
  ];

  getOpportunities(): Observable<Opportunity[]> {
    return of(this.opportunities);
  }

  getOpportunityById(id: number): Observable<Opportunity | undefined> {
    return of(this.opportunities.find(o => o.id === id));
  }
}