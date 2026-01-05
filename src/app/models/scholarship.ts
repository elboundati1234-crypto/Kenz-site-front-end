export interface Scholarship {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string; // Ex: 'Scholarship', 'Grant', 'Internship'
  badgeColor: string; // Ex: 'success', 'primary', 'warning', 'info'
  level: string;      // Ex: "Master's", "PhD", "Undergrad"
  location: string;
  deadline: string;
  daysLeft?: number;  // Optionnel, pour le texte "3 days left"
  amount: string;
  tags: string[];     // Pour le filtrage (Engineering, Fully Funded...)
}