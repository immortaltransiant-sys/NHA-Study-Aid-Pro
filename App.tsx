import React, { useState, useCallback } from 'react';
import { View, ExamType, Question, Flashcard, EkgFlashcard } from './types';
import { 
  generatePracticeExam, 
  generateFlashcards, 
  generateMedicalShorthandFlashcards,
  generateTubeDrawFlashcards,
  generateEkgFlashcards
} from './services/geminiService';
import PracticeExam from './components/PracticeExam';
import Flashcards from './components/Flashcards';
import EkgFlashcards from './components/EkgFlashcards';
import LoadingScreen from './components/LoadingScreen';
import { BookOpenIcon, ClipboardIcon, HeartIcon, BeakerIcon, PencilSquareIcon } from './components/icons';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.HOME);
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [ekgFlashcards, setEkgFlashcards] = useState<EkgFlashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleGeneration = useCallback(async (
    generationFn: () => Promise<any>, 
    loadingMsg: string, 
    successCallback: (data: any) => void
  ) => {
    setIsLoading(true);
    setLoadingMessage(loadingMsg);
    setError(null);
    try {
      const data = await generationFn();
      successCallback(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setView(View.HOME);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartExam = () => {
    if (!selectedExam) return;
    handleGeneration(
      () => generatePracticeExam(selectedExam),
      'Generating your 150-question practice exam...',
      (data: Question[]) => {
        setQuestions(data);
        setView(View.EXAM);
      }
    );
  };
  
  const handleStartFlashcards = () => {
    if (!selectedExam) return;
    handleGeneration(
      () => generateFlashcards(selectedExam),
      'Creating your general flashcard deck...',
      (data: Flashcard[]) => {
        setFlashcards(data);
        setView(View.FLASHCARDS);
      }
    );
  };
  
  const handleStartShorthand = () => handleGeneration(
    generateMedicalShorthandFlashcards,
    'Building shorthand flashcards...',
    (data: Flashcard[]) => {
      setFlashcards(data);
      setView(View.FLASHCARDS);
    }
  );

  const handleStartTubeDraw = () => handleGeneration(
    generateTubeDrawFlashcards,
    'Assembling lab tube guide...',
    (data: Flashcard[]) => {
      setFlashcards(data);
      setView(View.FLASHCARDS);
    }
  );

  const handleStartEkg = () => handleGeneration(
    generateEkgFlashcards,
    'Generating EKG strips... this may take a bit longer.',
    (data: EkgFlashcard[]) => {
      setEkgFlashcards(data);
      setView(View.EKG_FLASHCARDS);
    }
  );

  const resetToHome = () => {
    setView(View.HOME);
    setSelectedExam(null);
    setQuestions([]);
    setFlashcards([]);
    setEkgFlashcards([]);
    setError(null);
  };
  
  const renderHome = () => (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-gray-100">NHA Study Aid Pro</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-gray-400">Your AI-powered assistant for exam success.</p>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {!selectedExam ? (
        <>
          <h2 className="text-2xl font-bold text-center text-slate-700 dark:text-gray-200 mb-6">1. Choose Your Exam</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.values(ExamType) as ExamType[]).map(exam => (
              <button 
                key={exam} 
                onClick={() => setSelectedExam(exam)}
                className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <span className="text-xl font-semibold text-slate-700 dark:text-gray-200">{exam}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
         <div className="space-y-12">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-bold text-center text-slate-700 dark:text-gray-200 mb-2">2. Select a Study Mode</h2>
                <p className="text-center text-slate-500 dark:text-gray-400 mb-8">You've selected: <span className="font-bold text-violet-600 dark:text-violet-400">{selectedExam}</span></p>

                <div className="flex flex-col md:flex-row gap-6 justify-center">
                    <button onClick={handleStartExam} className="flex-1 p-8 bg-violet-50 dark:bg-violet-900/50 rounded-lg text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/80 transition-colors text-center">
                        <ClipboardIcon className="w-12 h-12 mx-auto mb-4"/>
                        <span className="text-xl font-semibold">150 Question Practice Exam</span>
                    </button>
                    <button onClick={handleStartFlashcards} className="flex-1 p-8 bg-violet-50 dark:bg-violet-900/50 rounded-lg text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/80 transition-colors text-center">
                        <BookOpenIcon className="w-12 h-12 mx-auto mb-4"/>
                        <span className="text-xl font-semibold">General Flashcard Review</span>
                    </button>
                </div>
            </div>
            
            {/* Exam-Specific Study Module */}
            {(selectedExam === ExamType.CCMA || selectedExam === ExamType.PHLEBOTOMY || selectedExam === ExamType.EKG) && (
              <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-bold text-center text-slate-700 dark:text-gray-200 mb-8">Exam-Specific Study Module</h2>
                <div className="flex justify-center">
                  {selectedExam === ExamType.CCMA && (
                    <button onClick={handleStartShorthand} className="w-full md:w-2/3 p-6 bg-teal-50 dark:bg-teal-900/50 rounded-lg text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/80 transition-all duration-300 text-center flex flex-col items-center shadow-lg hover:shadow-xl hover:-translate-y-1">
                        <PencilSquareIcon className="w-10 h-10 mx-auto mb-3"/>
                        <span className="text-lg font-semibold">Medical Shorthand</span>
                        <span className="text-sm text-teal-600 dark:text-teal-400 mt-1">Key abbreviations for CCMA.</span>
                    </button>
                  )}
                  {selectedExam === ExamType.PHLEBOTOMY && (
                    <button onClick={handleStartTubeDraw} className="w-full md:w-2/3 p-6 bg-amber-50 dark:bg-amber-900/50 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/80 transition-all duration-300 text-center flex flex-col items-center shadow-lg hover:shadow-xl hover:-translate-y-1">
                        <BeakerIcon className="w-10 h-10 mx-auto mb-3"/>
                        <span className="text-lg font-semibold">Lab Tube Guide</span>
                        <span className="text-sm text-amber-600 dark:text-amber-400 mt-1">Master tube tops and tests.</span>
                    </button>
                  )}
                  {selectedExam === ExamType.EKG && (
                    <button onClick={handleStartEkg} className="w-full md:w-2/3 p-6 bg-rose-50 dark:bg-rose-900/50 rounded-lg text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-all duration-300 text-center flex flex-col items-center shadow-lg hover:shadow-xl hover:-translate-y-1">
                        <HeartIcon className="w-10 h-10 mx-auto mb-3"/>
                        <span className="text-lg font-semibold">EKG Interpretation</span>
                        <span className="text-sm text-rose-600 dark:text-rose-400 mt-1">Identify key cardiac rhythms.</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="text-center">
                <button onClick={() => setSelectedExam(null)} className="text-slate-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 font-semibold transition">
                    Change Exam
                </button>
            </div>
         </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case View.EXAM:
        return <PracticeExam questions={questions} examType={selectedExam!} onFinish={resetToHome} />;
      case View.FLASHCARDS:
        return <Flashcards flashcards={flashcards} onFinish={resetToHome} />;
      case View.EKG_FLASHCARDS:
        return <EkgFlashcards flashcards={ekgFlashcards} onFinish={resetToHome} />;
      case View.HOME:
      default:
        return renderHome();
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-black text-slate-900 dark:text-gray-200 py-10">
      {isLoading && <LoadingScreen message={loadingMessage} />}
      {renderContent()}
    </main>
  );
};

export default App;