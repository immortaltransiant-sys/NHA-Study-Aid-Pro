
import React, { useState, useCallback } from 'react';
import Layout from './components/Layout';
import { View, ExamType, Question, Flashcard, EkgFlashcard, BodyPositionFlashcard } from './types';
import { 
  generatePracticeExam, 
  generateFlashcards, 
  generateMedicalShorthandFlashcards,
  generateTubeDrawFlashcards,
  generateEkgFlashcards,
  generateBodyPositionFlashcards,
  generateEkgLeadsFlashcards,
  generateGriefFlashcards,
  generateVitalsLabsFlashcards,
  generatePreventiveCareFlashcards,
  generatePathologyFlashcards,
  generateSpecializedCollectionsFlashcards,
  generateStudyGuide
} from './services/geminiService';
import { saveExamResult, getExamHistory } from './services/storageService';
import PracticeExam from './components/PracticeExam';
import Flashcards from './components/Flashcards';
import EkgFlashcards from './components/EkgFlashcards';
import BodyPositionFlashcards from './components/BodyPositionFlashcards';
import History from './components/History';
import Profile from './components/Profile';
import LoadingScreen from './components/LoadingScreen';
import { BookOpenIcon, ClipboardIcon, HeartIcon, BeakerIcon, PencilSquareIcon, UserIcon, CheckCircleIcon, ArrowPathIcon, ClockIcon } from './components/icons';

var EXAM_TYPES = [ExamType.CCMA, ExamType.PHLEBOTOMY, ExamType.EKG];

var TOPICS = {
  GENERAL: 'GENERAL',
  SHORTHAND: 'SHORTHAND',
  BODY_POSITIONS: 'BODY_POSITIONS',
  TUBE_DRAW: 'TUBE_DRAW',
  SPECIALIZED: 'SPECIALIZED',
  EKG_INTERPRETATION: 'EKG_INTERPRETATION',
  EKG_LEADS: 'EKG_LEADS',
  GRIEF: 'GRIEF',
  VITALS: 'VITALS',
  PREVENTIVE: 'PREVENTIVE',
  PATHOLOGY: 'PATHOLOGY'
};

// Theme Helper
function getExamTheme(examType) {
    if (examType === ExamType.CCMA) return 'emerald';
    if (examType === ExamType.PHLEBOTOMY) return 'rose';
    if (examType === ExamType.EKG) return 'cyan';
    return 'violet';
}

function App() {
  var viewState = useState(View.HOME);
  var view = viewState[0];
  var setView = viewState[1];
  
  var selectedExamState = useState(null);
  var selectedExam = selectedExamState[0];
  var setSelectedExam = selectedExamState[1];

  var currentTopicState = useState(null);
  var currentTopic = currentTopicState[0];
  var setCurrentTopic = currentTopicState[1];

  var questionsState = useState([]);
  var questions = questionsState[0];
  var setQuestions = questionsState[1];

  var flashcardsState = useState([]);
  var flashcards = flashcardsState[0];
  var setFlashcards = flashcardsState[1];

  var ekgFlashcardsState = useState([]);
  var ekgFlashcards = ekgFlashcardsState[0];
  var setEkgFlashcards = ekgFlashcardsState[1];

  var bodyPositionFlashcardsState = useState([]);
  var bodyPositionFlashcards = bodyPositionFlashcardsState[0];
  var setBodyPositionFlashcards = bodyPositionFlashcardsState[1];

  var studyGuideState = useState(null);
  var studyGuide = studyGuideState[0];
  var setStudyGuide = studyGuideState[1];

  var examHistoryState = useState([]);
  var examHistory = examHistoryState[0];
  var setExamHistory = examHistoryState[1];
  
  // Track the ID of the current exam result being shown so we can update it with a study guide
  var currentResultIdState = useState(null);
  var currentResultId = currentResultIdState[0];
  var setCurrentResultId = currentResultIdState[1];

  var isGeneratingGuideState = useState(false);
  var isGeneratingGuide = isGeneratingGuideState[0];
  var setIsGeneratingGuide = isGeneratingGuideState[1];

  // For history retrospective generation
  var currentGeneratingIdState = useState(null);
  var currentGeneratingId = currentGeneratingIdState[0];
  var setCurrentGeneratingId = currentGeneratingIdState[1];
  
  var isLoadingState = useState(false);
  var isLoading = isLoadingState[0];
  var setIsLoading = isLoadingState[1];
  
  var loadingMessageState = useState('');
  var loadingMessage = loadingMessageState[0];
  var setLoadingMessage = loadingMessageState[1];
  
  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];
  
  var handleGeneration = useCallback(function(
    generationFn, 
    loadingMsg, 
    successCallback
  ) {
    setIsLoading(true);
    setLoadingMessage(loadingMsg);
    setError(null);
    generationFn()
      .then(function(data) {
        setIsLoading(false);
        successCallback(data);
      })
      .catch(function(e) {
        setIsLoading(false);
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      });
  }, []);

  var handleGenerateStudyGuide = function(arg1, arg2, arg3) {
      var examTypeForGuide;
      var questionsToProcess;
      var targetId;

      // Handle overloaded call signatures:
      // 1. (examType: string, questions: any[], id: string) - used by History and handleExamComplete
      // 2. (questions: any[], id?: string) - used by PracticeExam (implies selectedExam)
      if (typeof arg1 === 'string') {
           examTypeForGuide = arg1;
           questionsToProcess = arg2;
           targetId = arg3;
      } else {
           examTypeForGuide = selectedExam;
           questionsToProcess = arg1;
           targetId = arg2 || currentResultId;
      }

      if (!examTypeForGuide) return;
      
      setIsGeneratingGuide(true);
      if(targetId) setCurrentGeneratingId(targetId);

      generateStudyGuide(examTypeForGuide, questionsToProcess)
        .then(function(guide) {
            setStudyGuide(guide);
            setIsGeneratingGuide(false);
            setCurrentGeneratingId(null);
            
            // Update storage if we have an ID
            if (targetId) {
                getExamHistory().then(function(history) {
                    var record = null;
                    for(var i=0; i<history.length; i++) {
                        if(history[i].id === targetId) {
                            record = history[i];
                            break;
                        }
                    }
                    if (record) {
                        record.studyGuide = guide;
                        saveExamResult(record).then(function() {
                             // Refresh history view if active
                             if (view === View.HISTORY) {
                                 setExamHistory(function(prev) {
                                     return prev.map(function(r) { return r.id === targetId ? record : r; });
                                 });
                             }
                        });
                    }
                });
            }
        })
        .catch(function(err) {
            console.error(err);
            setIsGeneratingGuide(false);
            setCurrentGeneratingId(null);
        });
  };

  var handleStartExam = function() {
    if (!selectedExam) return;
    setCurrentTopic(null);
    setStudyGuide(null); 
    setCurrentResultId(null); // Reset current result ID
    handleGeneration(
      function() { return generatePracticeExam(selectedExam); },
      'Generating your practice exam...',
      function(data) {
        setQuestions(data);
        setView(View.EXAM);
      }
    );
  };

  var handleExamComplete = function(stats) {
      // Create result object
      var resultId = Date.now().toString();
      var result = {
          id: resultId,
          timestamp: Date.now(),
          examType: selectedExam,
          score: stats.score,
          totalQuestions: stats.totalQuestions,
          incorrectAnswers: stats.incorrectAnswers,
          studyGuide: null
      };
      
      setCurrentResultId(resultId);
      saveExamResult(result).then(function() {
          // Automatically generate study guide if there are incorrect answers
          if (stats.incorrectAnswers && stats.incorrectAnswers.length > 0) {
              handleGenerateStudyGuide(selectedExam, stats.incorrectAnswers, resultId);
          }
      }).catch(function(e) {
          console.error("Error saving result", e);
      });
  };
  
  var handleViewHistory = function() {
      setIsLoading(true);
      getExamHistory().then(function(data) {
          setExamHistory(data);
          setIsLoading(false);
          setView(View.HISTORY);
      });
  };

  var handleViewProfile = function() {
      setView(View.PROFILE);
  };

  var handleStartFlashcards = function(forceRefresh) {
    if (!selectedExam) return;
    setCurrentTopic(TOPICS.GENERAL);
    handleGeneration(
      function() { return generateFlashcards(selectedExam, forceRefresh); },
      forceRefresh ? 'Regenerating deck...' : 'Loading general flashcard deck...',
      function(data) {
        setFlashcards(data);
        setView(View.FLASHCARDS);
      }
    );
  };
  
  var handleStartShorthand = function(forceRefresh) {
    setCurrentTopic(TOPICS.SHORTHAND);
    handleGeneration(
      function() { return generateMedicalShorthandFlashcards(forceRefresh); },
      forceRefresh ? 'Regenerating deck...' : 'Loading Medical Shorthand flashcards...',
      function(data) {
        setFlashcards(data);
        setView(View.FLASHCARDS);
      }
    );
  };

  var handleStartGrief = function(forceRefresh) {
    setCurrentTopic(TOPICS.GRIEF);
    handleGeneration(
        function() { return generateGriefFlashcards(forceRefresh); },
        forceRefresh ? 'Regenerating deck...' : 'Loading Psychology & Grief flashcards...',
        function(data) { setFlashcards(data); setView(View.FLASHCARDS); }
    );
  };

  var handleStartVitals = function(forceRefresh) {
    setCurrentTopic(TOPICS.VITALS);
    handleGeneration(
        function() { return generateVitalsLabsFlashcards(forceRefresh); },
        forceRefresh ? 'Regenerating deck...' : 'Loading Vitals & Lab Values flashcards...',
        function(data) { setFlashcards(data); setView(View.FLASHCARDS); }
    );
  };

  var handleStartPreventive = function(forceRefresh) {
    setCurrentTopic(TOPICS.PREVENTIVE);
    handleGeneration(
        function() { return generatePreventiveCareFlashcards(forceRefresh); },
        forceRefresh ? 'Regenerating deck...' : 'Loading Preventive Care flashcards...',
        function(data) { setFlashcards(data); setView(View.FLASHCARDS); }
    );
  };

  var handleStartPathology = function(forceRefresh) {
    setCurrentTopic(TOPICS.PATHOLOGY);
    handleGeneration(
        function() { return generatePathologyFlashcards(forceRefresh); },
        forceRefresh ? 'Regenerating deck...' : 'Loading Pathology & Disease flashcards...',
        function(data) { setFlashcards(data); setView(View.FLASHCARDS); }
    );
  };

  var handleStartTubeDraw = function(forceRefresh) {
    setCurrentTopic(TOPICS.TUBE_DRAW);
    handleGeneration(
      function() { return generateTubeDrawFlashcards(forceRefresh); },
      forceRefresh ? 'Regenerating deck...' : 'Loading Tube Order of Draw flashcards...',
      function(data) {
        setFlashcards(data);
        setView(View.FLASHCARDS);
      }
    );
  };

  var handleStartSpecialized = function(forceRefresh) {
    setCurrentTopic(TOPICS.SPECIALIZED);
    handleGeneration(
      function() { return generateSpecializedCollectionsFlashcards(forceRefresh); },
      forceRefresh ? 'Regenerating deck...' : 'Loading Specialized Collections flashcards...',
      function(data) { setFlashcards(data); setView(View.FLASHCARDS); }
    );
  };

  var handleStartEkgLeads = function(forceRefresh) {
    setCurrentTopic(TOPICS.EKG_LEADS);
    handleGeneration(
        function() { return generateEkgLeadsFlashcards(forceRefresh); },
        forceRefresh ? 'Regenerating deck...' : 'Loading EKG Leads & Anatomy flashcards...',
        function(data) { setFlashcards(data); setView(View.FLASHCARDS); }
    );
  };

  var handleStartEkgRhythms = function(forceRefresh) {
    setCurrentTopic(TOPICS.EKG_INTERPRETATION);
    handleGeneration(
      function() { return generateEkgFlashcards(forceRefresh); },
      forceRefresh ? 'Regenerating EKG strips...' : 'Loading EKG Rhythm flashcards (images may take a moment)...',
      function(data) {
        setEkgFlashcards(data);
        setView(View.EKG_FLASHCARDS);
      }
    );
  };

  var handleStartBodyPositions = function(forceRefresh) {
    setCurrentTopic(TOPICS.BODY_POSITIONS);
    handleGeneration(
      function() { return generateBodyPositionFlashcards(forceRefresh); },
      forceRefresh ? 'Regenerating illustrations...' : 'Loading Body Positions flashcards (images may take a moment)...',
      function(data) {
        setBodyPositionFlashcards(data);
        setView(View.BODY_POSITIONS_FLASHCARDS);
      }
    );
  };

  var handleRegenerate = function() {
    if (!currentTopic) return;
    
    if (currentTopic === TOPICS.GENERAL) handleStartFlashcards(true);
    else if (currentTopic === TOPICS.SHORTHAND) handleStartShorthand(true);
    else if (currentTopic === TOPICS.GRIEF) handleStartGrief(true);
    else if (currentTopic === TOPICS.VITALS) handleStartVitals(true);
    else if (currentTopic === TOPICS.PREVENTIVE) handleStartPreventive(true);
    else if (currentTopic === TOPICS.PATHOLOGY) handleStartPathology(true);
    else if (currentTopic === TOPICS.TUBE_DRAW) handleStartTubeDraw(true);
    else if (currentTopic === TOPICS.SPECIALIZED) handleStartSpecialized(true);
    else if (currentTopic === TOPICS.EKG_LEADS) handleStartEkgLeads(true);
    else if (currentTopic === TOPICS.EKG_INTERPRETATION) handleStartEkgRhythms(true);
    else if (currentTopic === TOPICS.BODY_POSITIONS) handleStartBodyPositions(true);
  };

  var getSidebarItems = function() {
      // Always show History and Profile in sidebar
      var items = [
          { label: 'Profile & Settings', desc: 'Billing & Info', icon: <UserIcon className="w-5 h-5"/>, onClick: handleViewProfile },
          { label: 'My Exam History', desc: 'Past Results & Guides', icon: <ClockIcon className="w-5 h-5"/>, onClick: handleViewHistory }
      ];

      if (!selectedExam) return items;
      
      items = items.concat([
          { label: 'Practice Exam', desc: 'Comprehensive Test', icon: <PencilSquareIcon className="w-5 h-5"/>, onClick: handleStartExam },
          { label: 'General Flashcards', desc: 'Core Terms', icon: <BookOpenIcon className="w-5 h-5"/>, onClick: function() { handleStartFlashcards(false); } }
      ]);

      if (selectedExam === ExamType.CCMA) {
          items = items.concat([
            { label: 'Medical Shorthand', desc: 'Abbreviations', icon: <BookOpenIcon className="w-5 h-5"/>, onClick: function() { handleStartShorthand(false); } },
            { label: 'Body Positions', desc: 'Visual Guide', icon: <UserIcon className="w-5 h-5"/>, onClick: function() { handleStartBodyPositions(false); } },
            { label: 'Psychology & Grief', desc: 'Stages & Coping', icon: <HeartIcon className="w-5 h-5"/>, onClick: function() { handleStartGrief(false); } },
            { label: 'Vitals & Lab Values', desc: 'Normal Ranges', icon: <HeartIcon className="w-5 h-5"/>, onClick: function() { handleStartVitals(false); } },
            { label: 'Preventive Care', desc: 'Screenings', icon: <CheckCircleIcon className="w-5 h-5"/>, onClick: function() { handleStartPreventive(false); } },
            { label: 'Pathology', desc: 'Disease Types', icon: <BeakerIcon className="w-5 h-5"/>, onClick: function() { handleStartPathology(false); } }
          ]);
      } else if (selectedExam === ExamType.PHLEBOTOMY) {
          items = items.concat([
            { label: 'Order of Draw', desc: 'Tubes & Additives', icon: <BeakerIcon className="w-5 h-5"/>, onClick: function() { handleStartTubeDraw(false); } },
            { label: 'Specialized Collections', desc: 'Handling & Prep', icon: <BeakerIcon className="w-5 h-5"/>, onClick: function() { handleStartSpecialized(false); } }
          ]);
      } else if (selectedExam === ExamType.EKG) {
          items = items.concat([
            { label: 'Rhythm Strips', desc: 'Interpretation', icon: <HeartIcon className="w-5 h-5"/>, onClick: function() { handleStartEkgRhythms(false); } },
            { label: 'Leads & Anatomy', desc: 'Placement & Biology', icon: <ClipboardIcon className="w-5 h-5"/>, onClick: function() { handleStartEkgLeads(false); } }
          ]);
      }
      return items;
  };

  var renderHome = function() {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <header className="mb-12 text-center animate-fade-in-down">
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 mb-4 drop-shadow-sm">NHA Study Aid Pro</h1>
            <p className="text-xl text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
                Select your certification path to begin.
            </p>
        </header>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 max-w-lg w-full text-center shadow-md" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            {EXAM_TYPES.map(function(type) {
                var theme = getExamTheme(type);
                var colors = "";
                var icon = null;
                
                if (theme === 'emerald') { // CCMA
                    colors = "hover:border-emerald-500 hover:shadow-emerald-500/20";
                    icon = <ClipboardIcon className="w-12 h-12 text-emerald-500 mb-4"/>;
                } else if (theme === 'rose') { // Phlebotomy
                    colors = "hover:border-rose-500 hover:shadow-rose-500/20";
                    icon = <BeakerIcon className="w-12 h-12 text-rose-500 mb-4"/>;
                } else { // EKG
                    colors = "hover:border-cyan-500 hover:shadow-cyan-500/20";
                    icon = <HeartIcon className="w-12 h-12 text-cyan-500 mb-4"/>;
                }

                return (
                    <button
                        key={type}
                        onClick={function() { setSelectedExam(type); }}
                        className={"bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-2 border-transparent transition-all duration-300 transform hover:-translate-y-1 " + colors + (selectedExam === type ? " border-" + theme + "-500 ring-2 ring-" + theme + "-200 dark:ring-" + theme + "-900" : "")}
                    >
                        <div className="flex flex-col items-center">
                            {icon}
                            <span className="text-xl font-bold text-slate-800 dark:text-white">{type.split(" ")[0]}</span>
                            <span className="text-sm text-slate-500 dark:text-gray-400 mt-2">{type.includes("CCMA") ? "Medical Assistant" : type.includes("Phlebotomy") ? "Technician" : "Technician"}</span>
                        </div>
                    </button>
                );
            })}
        </div>
        
        <div className="mt-8 flex gap-4">
            <button onClick={handleViewHistory} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 font-semibold rounded-lg shadow-md border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition">
                <ClockIcon className="w-5 h-5" /> History
            </button>
             <button onClick={handleViewProfile} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 font-semibold rounded-lg shadow-md border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition">
                <UserIcon className="w-5 h-5" /> Profile
            </button>
        </div>
        
        {selectedExam && (
            <div className="mt-12 w-full max-w-4xl px-4 animate-fade-in-up">
                 <div className="bg-slate-100 dark:bg-gray-800/50 rounded-xl p-6 text-center border border-slate-200 dark:border-gray-700">
                    <p className="text-slate-600 dark:text-gray-300 mb-6">
                        You have selected <strong className="text-slate-900 dark:text-white">{selectedExam}</strong>. <br/>
                        Choose a module from the menu or start with the basics below.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={handleStartExam} className={"px-6 py-3 rounded-lg font-bold text-white shadow-lg transition transform hover:scale-105 " + (getExamTheme(selectedExam) === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : getExamTheme(selectedExam) === 'rose' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-cyan-600 hover:bg-cyan-700')}>
                            Start Practice Exam
                        </button>
                        <button onClick={function() { handleStartFlashcards(false); }} className="px-6 py-3 bg-white dark:bg-gray-700 text-slate-800 dark:text-white font-bold rounded-lg shadow-md border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600 transition transform hover:scale-105">
                            General Flashcards
                        </button>
                    </div>
                 </div>
            </div>
        )}
      </div>
    );
  };

  var activeTheme = selectedExam ? getExamTheme(selectedExam) : 'violet';
  var title = selectedExam ? selectedExam + " - " + (view === View.HOME ? "Dashboard" : view.replace(/_/g, " ")) : "NHA Study Aid Pro";
  if (view === View.HISTORY) title = "Exam History";
  if (view === View.PROFILE) title = "Profile & Settings";

  return (
    <Layout 
        title={title} 
        colorTheme={activeTheme} 
        showBack={view !== View.HOME}
        onBack={function() { setView(View.HOME); }}
        menuItems={getSidebarItems()}
    >
      {isLoading && <LoadingScreen message={loadingMessage} />}
      
      {view === View.HOME && renderHome()}
      
      {view === View.HISTORY && (
          <History 
            results={examHistory} 
            onGenerateGuide={handleGenerateStudyGuide}
            isGeneratingGuide={isGeneratingGuide}
            currentGeneratingId={currentGeneratingId}
          />
      )}

      {view === View.PROFILE && (
          <Profile colorTheme={activeTheme} />
      )}
      
      {view === View.EXAM && (
        <PracticeExam 
            questions={questions} 
            examType={selectedExam} 
            onFinish={function() { setView(View.HOME); }}
            colorTheme={activeTheme}
            onGenerateGuide={handleGenerateStudyGuide}
            studyGuide={studyGuide}
            isGeneratingGuide={isGeneratingGuide}
            onExamComplete={handleExamComplete}
        />
      )}
      
      {view === View.FLASHCARDS && (
        <Flashcards 
            flashcards={flashcards} 
            onFinish={function() { setView(View.HOME); }}
            onRegenerate={handleRegenerate}
            colorTheme={activeTheme}
        />
      )}

      {view === View.EKG_FLASHCARDS && (
        <EkgFlashcards
            flashcards={ekgFlashcards}
            onFinish={function() { setView(View.HOME); }}
            onRegenerate={handleRegenerate}
            colorTheme={activeTheme}
        />
      )}

      {view === View.BODY_POSITIONS_FLASHCARDS && (
        <BodyPositionFlashcards
            flashcards={bodyPositionFlashcards}
            onFinish={function() { setView(View.HOME); }}
            onRegenerate={handleRegenerate}
            colorTheme={activeTheme}
        />
      )}
    </Layout>
  );
};

export default App;
