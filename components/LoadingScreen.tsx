
import React from 'react';

function LoadingScreen(props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-violet-500 mb-4"></div>
      <p className="text-white text-xl font-semibold">{props.message}</p>
      <p className="text-gray-300 mt-2">This may take up to a minute. Please don't close this window.</p>
    </div>
  );
};

export default LoadingScreen;
