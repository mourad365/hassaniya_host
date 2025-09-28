import React, { useState } from 'react';
import { debugFacebookAPI } from '../../utils/facebookDebug';

const FacebookDebugger = () => {
  const [debugResult, setDebugResult] = useState(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const runDebug = async () => {
    setIsDebugging(true);
    setDebugResult(null);
    
    try {
      const result = await debugFacebookAPI();
      setDebugResult(result);
    } catch (error) {
      setDebugResult({
        success: false,
        error: 'Debug failed',
        details: error.message
      });
    } finally {
      setIsDebugging(false);
    }
  };

  const envVars = {
    PAGE_ID: import.meta.env.VITE_FACEBOOK_PAGE_ID,
    ACCESS_TOKEN: import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN,
    ACCESS_TOKEN_LENGTH: import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN?.length || 0
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Facebook API Debugger</h2>
        <p className="text-gray-600">Use this tool to diagnose Facebook API issues in production.</p>
      </div>

      {/* Environment Variables */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Environment Variables</h3>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex items-center">
            <span className="text-gray-600 w-40">PAGE_ID:</span>
            <span className={envVars.PAGE_ID ? 'text-green-600' : 'text-red-600'}>
              {envVars.PAGE_ID || 'Not set'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 w-40">ACCESS_TOKEN:</span>
            <span className={envVars.ACCESS_TOKEN ? 'text-green-600' : 'text-red-600'}>
              {envVars.ACCESS_TOKEN ? `Set (${envVars.ACCESS_TOKEN_LENGTH} characters)` : 'Not set'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 w-40">Token Preview:</span>
            <span className="text-gray-500">
              {envVars.ACCESS_TOKEN ? `${envVars.ACCESS_TOKEN.substring(0, 20)}...` : 'Not available'}
            </span>
          </div>
        </div>
      </div>

      {/* Debug Button */}
      <div className="mb-6">
        <button
          onClick={runDebug}
          disabled={isDebugging}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isDebugging
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isDebugging ? 'Running Debug...' : 'Run Facebook API Debug'}
        </button>
      </div>

      {/* Results */}
      {debugResult && (
        <div className="mb-6 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Debug Results</h3>
          
          <div className={`p-3 rounded-md mb-3 ${
            debugResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              <span className={`text-lg ${debugResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {debugResult.success ? '✅' : '❌'}
              </span>
              <span className={`ml-2 font-semibold ${debugResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {debugResult.success ? 'Success' : 'Failed'}
              </span>
            </div>
            
            {debugResult.message && (
              <p className={debugResult.success ? 'text-green-700' : 'text-red-700'}>
                {debugResult.message}
              </p>
            )}
            
            {debugResult.error && (
              <p className="text-red-700 font-medium">
                Error: {debugResult.error}
              </p>
            )}
            
            {debugResult.postsCount !== undefined && (
              <p className="text-green-700">
                Successfully fetched {debugResult.postsCount} posts
              </p>
            )}
          </div>

          {debugResult.details && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Details:</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(debugResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">How to Fix Facebook API Issues</h3>
        <ol className="text-blue-700 space-y-2 text-sm">
          <li><strong>1. Check Token Expiry:</strong> Facebook access tokens expire. Generate a new one from Graph API Explorer.</li>
          <li><strong>2. Verify Permissions:</strong> Ensure your token has 'pages_show_list' and 'pages_read_engagement' permissions.</li>
          <li><strong>3. Update Vercel Environment:</strong> Make sure VITE_FACEBOOK_PAGE_ACCESS_TOKEN is set in Vercel dashboard.</li>
          <li><strong>4. Test Locally:</strong> Verify the same token works in localhost before deploying.</li>
          <li><strong>5. Check Console:</strong> Open browser console to see detailed error messages.</li>
        </ol>
      </div>
    </div>
  );
};

export default FacebookDebugger;
