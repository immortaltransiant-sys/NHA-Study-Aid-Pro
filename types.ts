
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
  BODY_POSITIONS_FLASHCARDS = "BODY_POSITIONS_FLASHCARDS",
  HISTORY = "HISTORY",
  PROFILE = "PROFILE"
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
  context: string;
}

export interface EkgFlashcard {
  image: string;
  interpretation: string;
  explanation: string;
  responseProcedure: string;
}

export interface BodyPositionFlashcard {
  image: string;
  positionName: string;
  description: string;
  purpose: string;
}

export type UserAnswer = {
  question: string;
  selectedAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
};

export interface ExamResult {
  id: string;
  timestamp: number;
  examType: string;
  score: number;
  totalQuestions: number;
  incorrectAnswers: UserAnswer[];
  studyGuide: string | null;
}
