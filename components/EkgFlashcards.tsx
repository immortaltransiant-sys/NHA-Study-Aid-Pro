import React, { useState } from 'react';
import { EkgFlashcard } from '../types';
import { ArrowLeftIcon, ArrowRightIcon } from './icons';

interface EkgFlashcardsProps {
  flashcards: EkgFlashcard[];
  onFinish: () => void;
}

const EkgFlashcards: React.FC<EkgFlashcardsProps> = ({ flashcards, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const goToNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150)
  };

  const goToPrevious = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };
  
  const currentCard = flashcards[currentIndex];

  if (!currentCard) {
    return (
        <div className="w-full max-w-2xl mx-auto p-4 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">No EKG Flashcards</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8">It seems we couldn't generate the EKG flashcards. Please try again later.</p>
            <button onClick={onFinish} className="px-6 py-2 bg-violet-600 text-white font-semibold rounded-lg shadow-md hover:bg-violet-700">
                Back to Home
            </button>
        </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col items-center">
      <div className="w-full" style={{ perspective: '1000px' }}>
        <div 
          className="relative w-full h-80 md:h-96 transition-transform duration-700"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of card */}
          <div className="absolute w-full h-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex items-center justify-center p-6 cursor-pointer" style={{ backfaceVisibility: 'hidden' }}>
            <img src={currentCard.image} alt="EKG Strip" className="max-w-full max-h-full object-contain rounded-md"/>
          </div>
          {/* Back of card */}
          <div className="absolute w-full h-full bg-violet-600 text-white rounded-xl shadow-2xl flex flex-col items-center justify-center p-6 cursor-pointer" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-4">{currentCard.interpretation}</h3>
            <p className="text-md md:text-lg text-center">{currentCard.explanation}</p>
          </div>
        </div>
      </div>
      <div className="text-center mt-4 text-slate-600 dark:text-gray-400">
        Click card to flip
      </div>
      <div className="mt-8 w-full flex justify-between items-center">
        <button onClick={goToPrevious} className="p-3 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 rounded-full shadow-md border border-slate-300 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-700 transition">
          <ArrowLeftIcon className="w-6 h-6"/>
        </button>
        <span className="font-semibold text-slate-700 dark:text-gray-300">{currentIndex + 1} / {flashcards.length}</span>
        <button onClick={goToNext} className="p-3 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 rounded-full shadow-md border border-slate-300 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-700 transition">
          <ArrowRightIcon className="w-6 h-6"/>
        </button>
      </div>
      <div className="mt-8">
        <button onClick={onFinish} className="text-slate-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 font-semibold transition">
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default EkgFlashcards;