
import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon } from './icons';

function EkgFlashcards(props) {
  var flashcards = props.flashcards;
  var onRegenerate = props.onRegenerate;
  var colorTheme = props.colorTheme || 'cyan'; // Default EKG color

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

  if (!currentCard) {
    return (
        <div className="w-full max-w-2xl mx-auto p-4 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">No EKG Flashcards</h2>
            <button onClick={onRegenerate} className={"px-6 py-2 text-white font-semibold rounded-lg shadow-md bg-" + themeColor + "-600"}>
                Try Again
            </button>
        </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
       <div className="w-full flex justify-between items-center mb-6 px-2">
         <span className={"font-bold text-lg text-" + themeColor + "-600 dark:text-" + themeColor + "-400"}>
            Strip {currentIndex + 1} / {flashcards.length}
         </span>
         <button onClick={onRegenerate} className="text-sm flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition">
            <ArrowPathIcon className="w-4 h-4" /> Regenerate
         </button>
      </div>

      <div className="w-full" style={{ perspective: '1000px' }}>
        <div 
          className="relative w-full h-80 md:h-96 transition-transform duration-700"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onClick={function() { setIsFlipped(!isFlipped); }}
        >
          {/* Front of card */}
          <div className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-700 flex flex-col items-center justify-center p-4 cursor-pointer" style={{ backfaceVisibility: 'hidden' }}>
            <p className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-2">Identify this Rhythm</p>
            {currentCard.image ? (
                <div className="bg-white p-2 rounded border border-slate-200 w-full h-full flex items-center justify-center overflow-hidden">
                    <img src={currentCard.image} alt="EKG Strip" className="max-w-full max-h-full object-contain"/>
                </div>
            ) : (
                <div className="w-full h-32 bg-slate-100 dark:bg-gray-800 flex items-center justify-center rounded-md">
                    <span className="text-slate-400">Image not available</span>
                </div>
            )}
             <div className={"absolute bottom-4 text-xs font-semibold uppercase tracking-widest text-" + themeColor + "-500 opacity-50"}>Click to Reveal</div>
          </div>

          {/* Back of card */}
          <div className={"absolute w-full h-full text-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 cursor-pointer overflow-y-auto bg-gradient-to-br from-" + themeColor + "-600 to-" + themeColor + "-800"} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="flex flex-col h-full justify-center w-full">
                <h3 className="text-2xl md:text-3xl font-bold text-center mb-4 leading-tight">{currentCard.interpretation}</h3>
                <p className="text-sm md:text-base text-center mb-6 text-white/90 bg-black/10 p-3 rounded-lg">{currentCard.explanation}</p>
                
                {currentCard.responseProcedure && (
                    <div className="pt-4 border-t border-white/20 w-full text-center">
                        <h4 className={"font-bold text-xs uppercase tracking-wider mb-2 text-" + themeColor + "-100"}>Required Response</h4>
                        <div className="text-sm md:text-md font-bold text-slate-900 bg-white p-2 rounded-lg shadow-sm inline-block w-full">
                            {currentCard.responseProcedure}
                        </div>
                    </div>
                )}
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

export default EkgFlashcards;
