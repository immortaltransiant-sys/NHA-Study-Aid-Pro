export enum ExamType {
  CCMA = "CCMA (Certified Clinical Medical Assistant)",
  PHLEBOTOMY = "Phlebotomy Technician (CPT)",
  EKG = "EKG Technician (CET)"
}

export enum View {
  HOME = "HOME",
  EXAM = "EXAM",
  FLASHCARDS = "FLASHCARDS",
  EKG_FLASHCARDS = "EKG_FLASHCARDS",
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Flashcard {
  term: string;
  definition: string;
}

export interface EkgFlashcard {
  image: string;
  interpretation: string;
  explanation: string;
}

export type UserAnswer = {
  question: string;
  selectedAnswer: string;
  isCorrect: boolean;
};