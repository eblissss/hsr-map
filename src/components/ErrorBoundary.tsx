import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // In production, you might want to send this to an error reporting service
    // reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 bg-[var(--color-substrate)] flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-8! max-w-md text-center">
            <div className="text-4xl mb-4!">⚠️</div>
            <h2 className="text-xl font-display font-medium text-[var(--color-text-primary)] mb-2!">
              Something went wrong
            </h2>
            <p className="text-[var(--color-text-muted)] mb-6!">
              The map failed to load. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6! py-2! bg-[var(--color-mach-1)] text-black font-medium rounded-lg hover:bg-[var(--color-mach-1)]/80 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
