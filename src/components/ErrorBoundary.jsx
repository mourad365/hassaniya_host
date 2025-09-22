import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isProduction } from '@/utils/config';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Math.random().toString(36).substr(2, 9)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo
    });

    // In production, you might want to log this to an error reporting service
    if (isProduction()) {
      console.error('Production Error Caught:', {
        error: error.toString(),
        errorInfo,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      // Here you could send to error tracking service like Sentry
      // Sentry.captureException(error, { extra: errorInfo });
    } else {
      console.error('Development Error Caught:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  }

  handleGoHome = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state;
      
      return (
        <div className="min-h-screen bg-sand-light flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertTriangle className="h-20 w-20 text-red-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-gray-900 arabic-title mb-4">
              حدث خطأ غير متوقع
            </h1>
            
            <p className="text-gray-600 arabic-body mb-6 text-lg">
              نعتذر، حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
            </p>

            {!isProduction() && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-bold text-red-800 mb-2">Development Error Details:</h3>
                <pre className="text-red-700 text-sm overflow-auto max-h-40">
                  {error.toString()}
                </pre>
                {errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-red-800 font-medium">
                      Component Stack
                    </summary>
                    <pre className="text-red-600 text-xs mt-2 overflow-auto max-h-32">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {isProduction() && errorId && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-gray-600 text-sm">
                  رقم الخطأ: <code className="bg-gray-200 px-2 py-1 rounded text-xs">{errorId}</code>
                </p>
                <p className="text-gray-500 text-xs mt-1 arabic-body">
                  يرجى ذكر هذا الرقم عند التواصل مع الدعم الفني
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={this.handleReload}
                className="flex items-center gap-2"
                size="lg"
              >
                <RefreshCw className="h-5 w-5" />
                إعادة تحميل الصفحة
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex items-center gap-2"
                size="lg"
              >
                <Home className="h-5 w-5" />
                العودة للرئيسية
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm arabic-body">
                إذا استمر هذا الخطأ، يرجى التواصل مع الدعم الفني
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
