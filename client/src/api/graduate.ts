import { saveToSheet } from './sheets';

export interface GraduateRegistration {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  stage: string;
  institution: string;
  course: string;
  graduationYear: string;
  /** The questions the visitor wants help with, as readable text. */
  questions: string[];
  notes: string;
  /** Honeypot; always empty for real visitors. */
  website: string;
}

export function submitGraduateRegistration(data: GraduateRegistration) {
  return saveToSheet('graduate-clarity', data);
}
