export interface Opportunity {
  id: number;
  title: string;
  type: 'Scholarship' | 'Training' | 'Event';
  organization: string;
  location: string;
  updatedAt: string;
  imageUrl: string;
  logoUrl: string;
  description: string;
  benefits: string;
  eligibility: string[];
  deadline: string;
  value: string;
  duration: string;
  language: string;
  registrationLink: string;
}