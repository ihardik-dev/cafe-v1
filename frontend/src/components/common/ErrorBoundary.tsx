import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen flex items-center justify-center p-6 bg-surface-secondary/40"
        >
          <div className="max-w-md w-full rounded-2xl border border-border-normal bg-surface-primary p-8 shadow-beautiful-lg text-center flex flex-col items-center">
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h1 className="text-xl font-bold text-content-primary mb-2">Something went wrong</h1>
            <p className="text-sm text-content-secondary leading-relaxed mb-6">
              We encountered an unexpected glitch while preparing this page. You can reload the page
              or return to the home screen.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReset}
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                Reload Page
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={this.handleGoHome}
                leftIcon={<Home className="h-4 w-4" />}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
