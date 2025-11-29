
import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon } from './icons';

function BodyPositionFlashcards(props) {
  var flashcards = props.flashcards;
  var onRegenerate = props.onRegenerate;
  var colorTheme = props.colorTheme || 'emerald';

  var currentIndexState = useState(0);
  var currentIndex = currentIndexState[0];
  var setCurrentIndex = currentIndexState[1];
  
  var isFlippedState = useState(false);
  var isFlipped = isFlippedState[0];
  var setIsFlipped = isFlippedState[1];

  var getThemeColor = function() {
      if (colorTheme === 'emerald') return "emerald";
      if (colorTheme === 'rose') return "rose";
      if (colorTheme === 'cyan') return "cyan";
      return "violet";
  };
  var themeColor = getThemeColor();

  var goToNext = function() {
    setIsFlipped(false);
    setTimeout(function() {
        setCurrentIndex(function(prev) { return (prev + 1) % flashcards.length; });
    }, 150)
  };

  var goToPrevious = function() {
    setIsFlipped(false);
    setTimeout(function() {
        setCurrentIndex(function(prev) { return (prev - 1 + flashcards.length) % flashcards.length; });
    }, 150);
  };
  
  var currentCard = flashcards[currentIndex];

  if (!currentCard) return null;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
       <div className="w-full flex justify-between items-center mb-6 px-2">
         <span className={"font-bold text-lg text-" + themeColor + "-600 dark:text-" + themeColor + "-400"}>
            Position {currentIndex + 1} / {flashcards.length}
         </span>
         <button onClick={onRegenerate} className="text-sm flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition">
            <ArrowPathIcon className="w-4 h-4" /> Regenerate
         </button>
      </div>

      <div className="w-full" style={{ perspective: '1000px' }}>
        <div 
          className="relative w-full h-[28rem] transition-transform duration-700"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onClick={function() { setIsFlipped(!isFlipped); }}
        >
          {/* Front of card */}
          <div className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-700 flex flex-col items-center justify-center p-6 cursor-pointer" style={{ backfaceVisibility: 'hidden' }}>
            <p className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider">Patient Body Position</p>
            <div className="w-full h-64 flex items-center justify-center">
                <img src={currentCard.image} alt={currentCard.positionName} className="max-w-full max-h-full object-contain rounded-md"/>
            </div>
             <div className={"absolute bottom-6 text-xs font-semibold uppercase tracking-widest text-" + themeColor + "-500 opacity-50"}>Click for Details</div>
          </div>
          
          {/* Back of card */}
          <div className={"absolute w-full h-full text-white rounded-2xl shadow-xl flex flex-col justify-center p-8 cursor-pointer overflow-y-auto bg-gradient-to-br from-" + themeColor + "-600 to-" + themeColor + "-800"} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <h3 className="text-3xl font-bold text-center mb-8 border-b border-white/20 pb-4">{currentCard.positionName}</h3>
            <div className="space-y-6 text-left">
                <div>
                    <h4 className={"font-bold mb-1 text-" + themeColor + "-200 uppercase text-sm"}>Description</h4>
                    <p className="text-md leading-relaxed">{currentCard.description}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-lg">
                    <h4 className={"font-bold mb-1 text-" + themeColor + "-200 uppercase text-sm"}>Clinical Purpose</h4>
                    <p className="text-md leading-relaxed italic">{currentCard.purpose}</p>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex gap-8">
        <button onClick={goToPrevious} className="p-4 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 rounded-full shadow-lg border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition transform hover:-translate-y-1">
          <ArrowLeftIcon className="w-6 h-6"/>
        </button>
        <button onClick={goToNext} className="p-4 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 rounded-full shadow-lg border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition transform hover:-translate-y-1">
          <ArrowRightIcon className="w-6 h-6"/>
        </button>
      </div>
    </div>
  );
};

export default BodyPositionFlashcards;
