
import React, { useState } from 'react';

function History(props) {
  var results = props.results || [];
  var onGenerateGuide = props.onGenerateGuide;
  var isGeneratingGuide = props.isGeneratingGuide;
  var currentGeneratingId = props.currentGeneratingId;

  var expandedIdState = useState(null);
  var expandedId = expandedIdState[0];
  var setExpandedId = expandedIdState[1];

  var toggleExpand = function(id) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  var getThemeColor = function(examType) {
    if (examType && examType.includes("CCMA")) return "emerald";
    if (examType && examType.includes("Phlebotomy")) return "rose";
    if (examType && examType.includes("EKG")) return "cyan";
    return "violet";
  };

  if (results.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <p className="text-xl text-slate-500 dark:text-gray-400">No past exam results found.</p>
        <p className="mt-2 text-slate-400 dark:text-gray-500">Complete a practice exam to see your history here.</p>
      </div>
    );
  }

  // Sort by date descending (newest first)
  var sortedResults = results.slice().sort(function(a, b) {
    return b.timestamp - a.timestamp;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Exam History</h2>
      {sortedResults.map(function(result) {
        var theme = getThemeColor(result.examType);
        var date = new Date(result.timestamp).toLocaleDateString() + ' ' + new Date(result.timestamp).toLocaleTimeString();
        var percentage = (result.score / result.totalQuestions) * 100;
        var isExpanded = expandedId === result.id;
        var scoreColor = percentage >= 80 ? 'text-green-500' : percentage >= 60 ? 'text-amber-500' : 'text-red-500';

        return (
          <div key={result.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-slate-200 dark:border-gray-800 overflow-hidden">
            <div 
              className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800/50 transition flex flex-col md:flex-row justify-between items-center gap-4"
              onClick={function() { toggleExpand(result.id); }}
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className={"w-2 h-16 rounded-full bg-" + theme + "-500 hidden md:block"}></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{result.examType}</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">{date}</p>
                 </div>
              </div>
              
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                 <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Score</p>
                    <p className={"text-2xl font-bold " + scoreColor}>{percentage.toFixed(1)}%</p>
                 </div>
                 <div className={"w-10 h-10 rounded-full flex items-center justify-center " + (isExpanded ? "bg-" + theme + "-100 text-" + theme + "-600 rotate-180" : "bg-slate-100 text-slate-500")} style={{transition: 'transform 0.3s'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                 </div>
              </div>
            </div>

            {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-gray-800 animate-fade-in">
                    <div className="mb-4">
                        <p className="text-slate-600 dark:text-gray-300">
                            <strong>Details:</strong> Correct: {result.score} | Incorrect: {result.totalQuestions - result.score} | Total: {result.totalQuestions}
                        </p>
                    </div>

                    {result.studyGuide ? (
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700">
                            <h4 className={"font-bold mb-2 text-" + theme + "-600 dark:text-" + theme + "-400"}>AI Study Guide Analysis</h4>
                            <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-gray-300 whitespace-pre-wrap">
                                {result.studyGuide}
                            </div>
                        </div>
                    ) : (
                        result.incorrectAnswers && result.incorrectAnswers.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm text-slate-500 mb-2">You missed {result.incorrectAnswers.length} questions. Generate an analysis to review.</p>
                                <button 
                                    onClick={function(e) { 
                                        e.stopPropagation(); 
                                        onGenerateGuide(result.examType, result.incorrectAnswers, result.id); 
                                    }}
                                    disabled={isGeneratingGuide}
                                    className={"px-4 py-2 text-white text-sm font-semibold rounded-lg shadow bg-" + theme + "-600 hover:bg-" + theme + "-700 disabled:opacity-50"}
                                >
                                    {isGeneratingGuide && currentGeneratingId === result.id ? 'Generating...' : 'Generate Retroactive Study Guide'}
                                </button>
                            </div>
                        )
                    )}
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default History;
