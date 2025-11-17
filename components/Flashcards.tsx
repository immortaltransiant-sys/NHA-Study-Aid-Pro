import React, { useState } from 'react';
import { Flashcard } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon } from './icons';

interface FlashcardsProps {
  flashcards: Flashcard[];
  onFinish: () => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ flashcards, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const goToNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const goToPrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };
  
  const currentCard = flashcards[currentIndex];

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
            <p className="text-2xl md:text-3xl font-bold text-center text-slate-800 dark:text-gray-100">{currentCard.term}</p>
          </div>
          {/* Back of card */}
          <div className="absolute w-full h-full bg-violet-600 text-white rounded-xl shadow-2xl flex items-center justify-center p-6 cursor-pointer" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <p className="text-lg md:text-xl text-center">{currentCard.definition}</p>
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

export default Flashcards;