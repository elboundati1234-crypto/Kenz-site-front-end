export interface Training {
  id: number;
  title: string;
  category: string;
  organization: string;
  image: string;
  duration: string;
  description?: string; // <--- Ajoutez cette ligne (le '?' le rend optionnel)
  badgeType?: 'Featured' | 'Popular' | 'Free';
  isCertified?: boolean;
}