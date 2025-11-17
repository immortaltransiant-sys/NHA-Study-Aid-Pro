import React, { useState, useMemo } from 'react';
import { Question, ExamType, UserAnswer } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from './icons';

interface PracticeExamProps {
  questions: Question[];
  examType: ExamType;
  onFinish: () => void;
}

const PracticeExam: React.FC<PracticeExamProps> = ({ questions, examType, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  const answeredQuestions = userAnswers.length;

  const handleAnswerSelect = (selectedAnswer: string) => {
    if (userAnswers.find(ua => ua.question === currentQuestion.question)) {
      return; // Already answered
    }
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setUserAnswers([
        ...userAnswers,
        { question: currentQuestion.question, selectedAnswer, isCorrect }
    ]);
  };
  
  const userAnswerForCurrent = userAnswers.find(ua => ua.question === currentQuestion.question);

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const score = useMemo(() => {
    return userAnswers.filter(a => a.isCorrect).length;
  }, [userAnswers]);

  if (showResults) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-gray-100 mb-4">Exam Results</h2>
        <p className="text-lg text-center text-slate-600 dark:text-gray-300 mb-8">{examType}</p>
        <div className="text-center mb-8">
            <p className="text-5xl font-bold text-violet-600 dark:text-violet-400">
                {score} / {questions.length}
            </p>
            <p className="text-2xl font-semibold text-slate-700 dark:text-gray-200 mt-2">
                ({((score / questions.length) * 100).toFixed(1)}%)
            </p>
        </div>
        <div className="flex justify-center">
            <button
                onClick={onFinish}
                className="px-8 py-3 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
            >
                Back to Home
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-violet-600 dark:text-violet-400">{examType}</h2>
                <span className="text-sm font-semibold text-slate-500 dark:text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
             <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                <div className="bg-violet-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
            </div>
            <p className="text-xl font-semibold text-slate-800 dark:text-gray-100 mb-6 min-h-[6rem]">{currentQuestion.question}</p>
            
            <div className="space-y-4">
                {currentQuestion.options.map((option, index) => {
                    const isSelected = userAnswerForCurrent?.selectedAnswer === option;
                    const isCorrect = currentQuestion.correctAnswer === option;
                    
                    let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-between ";

                    if (userAnswerForCurrent) {
                        if (isCorrect) {
                           buttonClass += "bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200";
                        } else if (isSelected) {
                            buttonClass += "bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200";
                        } else {
                            buttonClass += "bg-slate-100 dark:bg-gray-800 border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-400 cursor-not-allowed opacity-60";
                        }
                    } else {
                        buttonClass += "bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-200";
                    }

                    return (
                        <button key={index} onClick={() => handleAnswerSelect(option)} disabled={!!userAnswerForCurrent} className={buttonClass}>
                            <span>{option}</span>
                            {userAnswerForCurrent && isCorrect && <CheckCircleIcon className="w-6 h-6 text-green-500"/>}
                            {userAnswerForCurrent && isSelected && !isCorrect && <XCircleIcon className="w-6 h-6 text-red-500"/>}
                        </button>
                    );
                })}
            </div>
            {userAnswerForCurrent && (
                <div className="mt-6 p-4 bg-slate-100 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-bold text-slate-800 dark:text-gray-100">Explanation:</h3>
                    <p className="text-slate-600 dark:text-gray-300 mt-1">{currentQuestion.explanation}</p>
                </div>
            )}
        </div>
        <div className="bg-slate-50 dark:bg-black/50 p-4 flex justify-between items-center">
            <button onClick={goToPrevious} disabled={currentQuestionIndex === 0} className="px-4 py-2 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 font-semibold rounded-lg shadow-sm border border-slate-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <ArrowLeftIcon className="w-5 h-5"/> Previous
            </button>
            {userAnswerForCurrent && (currentQuestionIndex < questions.length - 1) &&
             <button onClick={goToNext} className="px-6 py-2 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-75 transition-transform transform hover:scale-105 flex items-center gap-2">
                Next <ArrowRightIcon className="w-5 h-5"/>
            </button>}
            {userAnswerForCurrent && (currentQuestionIndex === questions.length - 1) &&
             <button onClick={() => setShowResults(true)} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-transform transform hover:scale-105">
                Finish & See Results
            </button>}
        </div>
      </div>
       <div className="text-center mt-4">
         <button onClick={onFinish} className="text-slate-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 font-semibold transition">
            End Exam and Go Home
          </button>
       </div>
    </div>
  );
};

export default PracticeExam;