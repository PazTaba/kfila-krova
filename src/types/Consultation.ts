// types/Consultation.ts

export interface ConsultationAnswer {
  id: string;
  text: string;
  author?: string;
  likes: number;
  createdAt: string; // תאריך ISO
}

export type ConsultationStatus = 'open' | 'in_progress' | 'closed';

export interface ConsultationClient {
  id: string;
  userId: string;
  question: string;
  category: string;
  description?: string;
  answers: ConsultationAnswer[];
  likes: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: ConsultationStatus;
  createdAt: string;
  author?: string;
}
