
import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, XCircleIcon } from './icons';

function PracticeExam(props) {
  var questions = props.questions;
  var examType = props.examType;
  var onFinish = props.onFinish;
  var colorTheme = props.colorTheme || 'violet';
  var onGenerateGuide = props.onGenerateGuide;
  var studyGuide = props.studyGuide;
  var isGeneratingGuide = props.isGeneratingGuide;
  var onExamComplete = props.onExamComplete; // New prop for saving results
  
  var currentQuestionIndexState = useState(0);
  var currentQuestionIndex = currentQuestionIndexState[0];
  var setCurrentQuestionIndex = currentQuestionIndexState[1];

  var userAnswersState = useState([]);
  var userAnswers = userAnswersState[0];
  var setUserAnswers = userAnswersState[1];

  var showResultsState = useState(false);
  var showResults = showResultsState[0];
  var setShowResults = showResultsState[1];

  // Helper for theme colors
  var getThemeColor = function() {
    var prefix = "";
    if (colorTheme === 'emerald') prefix = "emerald";
    else if (colorTheme === 'rose') prefix = "rose";
    else if (colorTheme === 'cyan') prefix = "cyan";
    else prefix = "violet";
    
    return prefix;
  };

  var themeColor = getThemeColor();
  
  var currentQuestion = questions[currentQuestionIndex];
  
  var userAnswerForCurrent = null;
  for (var i = 0; i < userAnswers.length; i++) {
    if (userAnswers[i].question === currentQuestion.question) {
        userAnswerForCurrent = userAnswers[i];
        break;
    }
  }

  var handleAnswerSelect = function(selectedAnswer) {
    var alreadyAnswered = false;
    for (var i = 0; i < userAnswers.length; i++) {
        if (userAnswers[i].question === currentQuestion.question) {
            alreadyAnswered = true;
            break;
        }
    }
    if (alreadyAnswered) {
      return; 
    }
    
    var isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setUserAnswers(
        userAnswers.concat([{ 
            question: currentQuestion.question, 
            selectedAnswer: selectedAnswer, 
            isCorrect: isCorrect,
            correctAnswer: currentQuestion.correctAnswer,
            explanation: currentQuestion.explanation 
        }])
    );
  };
  
  var goToNext = function() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinish();
    }
  };

  var goToPrevious = function() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  var handleFinish = function() {
      // Calculate final stats
      var finalScore = userAnswers.filter(function(a) { return a.isCorrect; }).length;
      var incorrect = userAnswers.filter(function(a) { return !a.isCorrect; });
      
      // Save result via parent callback
      if (onExamComplete) {
          onExamComplete({
              score: finalScore,
              totalQuestions: questions.length,
              incorrectAnswers: incorrect
          });
      }
      setShowResults(true);
  };

  var score = useMemo(function() {
    return userAnswers.filter(function(a) { return a.isCorrect; }).length;
  }, [userAnswers]);

  var incorrectAnswers = useMemo(function() {
    return userAnswers.filter(function(a) { return !a.isCorrect; });
  }, [userAnswers]);

  if (showResults) {
    var percentage = (score / questions.length) * 100;
    var scoreColor = percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-amber-400' : 'text-red-400';

    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-gray-100 mb-2">Exam Complete!</h2>
        <p className="text-lg text-center text-slate-600 dark:text-gray-300 mb-8">{examType}</p>
        <div className="text-center mb-8">
            <div className={"w-48 h-48 rounded-full mx-auto flex flex-col items-center justify-center shadow-lg bg-gradient-to-br from-" + themeColor + "-500 to-" + themeColor + "-700"}>
                <p className={"text-5xl font-bold text-white"}>
                    {score}/{questions.length}
                </p>
            </div>
            <p className={"text-3xl font-bold mt-4 " + scoreColor}>
                {percentage.toFixed(1)}%
            </p>
        </div>
        
        {/* Study Guide Section */}
        {incorrectAnswers.length > 0 && (
            <div className="mb-8 w-full animate-fade-in-up">
                {!studyGuide && isGeneratingGuide && (
                    <div className="p-6 bg-slate-50 dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500 mb-2"></div>
                        <p className="text-slate-600 dark:text-gray-300">Generating personalized analysis...</p>
                    </div>
                )}
                
                {!studyGuide && !isGeneratingGuide && (
                    <div className="text-center">
                        <p className="text-slate-600 dark:text-gray-300 mb-4">
                            Analysis generation failed or pending.
                        </p>
                        <button
                            onClick={function() { onGenerateGuide(incorrectAnswers); }}
                            className={"px-6 py-3 text-white font-semibold rounded-lg shadow-md bg-" + themeColor + "-600 hover:bg-" + themeColor + "-700"}
                        >
                            Retry Analysis
                        </button>
                    </div>
                )}

                {studyGuide && (
                    <div className="p-6 bg-slate-50 dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 text-left">
                        <h3 className={"text-2xl font-bold mb-4 text-" + themeColor + "-600 dark:text-" + themeColor + "-400"}>Your Personalized Study Guide</h3>
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-slate-700 dark:text-gray-300">
                            {studyGuide}
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="flex justify-center">
            <button
                onClick={onFinish}
                className={"px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 bg-gray-600 hover:bg-gray-700"}
            >
                Back to Home
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-gray-800">
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className={"text-lg font-bold text-" + themeColor + "-600 dark:text-" + themeColor + "-400"}>{examType}</h2>
                <span className="text-sm font-semibold text-slate-500 dark:text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
             <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                <div className={"h-2.5 rounded-full bg-" + themeColor + "-600"} style={{ width: ((currentQuestionIndex + 1) / questions.length) * 100 + '%' }}></div>
            </div>
            <p className="text-xl font-semibold text-slate-800 dark:text-gray-100 mb-6 min-h-[6rem]">{currentQuestion.question}</p>
            
            <div className="space-y-4">
                {currentQuestion.options.map(function(option, index) {
                    var isSelected = userAnswerForCurrent && userAnswerForCurrent.selectedAnswer === option;
                    var isCorrect = currentQuestion.correctAnswer === option;
                    
                    var buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-between ";

                    if (userAnswerForCurrent) {
                        if (isCorrect) {
                           buttonClass += "bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200";
                        } else if (isSelected) {
                            buttonClass += "bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200";
                        } else {
                            buttonClass += "bg-slate-100 dark:bg-gray-800 border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-400 cursor-not-allowed opacity-60";
                        }
                    } else {
                        buttonClass += "bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-700 hover:border-" + themeColor + "-500 hover:bg-" + themeColor + "-50 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-200";
                    }

                    return (
                        <button key={index} onClick={function() { handleAnswerSelect(option); }} disabled={!!userAnswerForCurrent} className={buttonClass}>
                            <span>{option}</span>
                            {userAnswerForCurrent && isCorrect && <CheckCircleIcon className="w-6 h-6 text-green-500"/>}
                            {userAnswerForCurrent && isSelected && !isCorrect && <XCircleIcon className="w-6 h-6 text-red-500"/>}
                        </button>
                    );
                })}
            </div>
            {userAnswerForCurrent && (
                <div className="mt-6 p-4 bg-slate-100 dark:bg-gray-800 rounded-lg border-l-4 border-slate-400">
                    <h3 className="font-bold text-slate-800 dark:text-gray-100">Explanation:</h3>
                    <p className="text-slate-600 dark:text-gray-300 mt-1">{currentQuestion.explanation}</p>
                </div>
            )}
        </div>
        <div className="bg-slate-50 dark:bg-black/50 p-4 flex justify-between items-center border-t border-slate-200 dark:border-gray-800">
            <button onClick={goToPrevious} disabled={currentQuestionIndex === 0} className="px-4 py-2 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 font-semibold rounded-lg shadow-sm border border-slate-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-gray-700">
                <ArrowLeftIcon className="w-5 h-5"/> Previous
            </button>
            {userAnswerForCurrent && (currentQuestionIndex < questions.length - 1) &&
             <button onClick={goToNext} className={"px-6 py-2 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 flex items-center gap-2 bg-" + themeColor + "-600 hover:bg-" + themeColor + "-700"}>
                Next <ArrowRightIcon className="w-5 h-5"/>
            </button>}
            {userAnswerForCurrent && (currentQuestionIndex === questions.length - 1) &&
             <button onClick={handleFinish} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105">
                Finish & See Results
            </button>}
        </div>
      </div>
    </div>
  );
};

export default PracticeExam;
