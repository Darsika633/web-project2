import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log the error to an error reporting service here
    console.error('ErrorBoundary caught error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded text-red-700">
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm">An unexpected error occurred while rendering this section.</p>
          <details className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
            {String(this.state.error && this.state.error.stack ? this.state.error.stack : this.state.error)}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
