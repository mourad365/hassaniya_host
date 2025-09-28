import React from 'react';
import FacebookDebugger from '../components/debug/FacebookDebugger';

const FacebookDebugPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Facebook API Debug Tool
          </h1>
          <p className="text-gray-600">
            Use this page to diagnose and fix Facebook API issues in production
          </p>
        </div>
        
        <FacebookDebugger />
        
        <div className="mt-12 text-center">
          <a 
            href="/culture" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Culture Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default FacebookDebugPage;
