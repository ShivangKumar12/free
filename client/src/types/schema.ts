export type ProjectCategory = 'web' | 'app' | 'graphic' | 'poster' | 'all';

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  tags: string[];
  liveUrl?: string;
  codeUrl?: string;
}

export interface Review {
  id: number;
  name: string;
  email: string;
  company?: string;
  rating: number;
  comment: string;
  projectType?: string;
  createdAt: Date;
  approved: boolean;
}

export interface Skill {
  name: string;
  percentage: number;
}

export interface SkillCategory {
  title: string;
  icon: string;
  skills: Skill[];
}
