import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface DatabaseErrorFallbackProps {
  error?: {
    message: string;
    retryable: boolean;
  } | null;
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export function DatabaseErrorFallback({ 
  error, 
  onRetry, 
  showRetryButton = true 
}: DatabaseErrorFallbackProps) {
  if (!error) return null;

  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-4">
          {error.retryable ? (
            <Wifi className="w-12 h-12 mx-auto text-yellow-500" />
          ) : (
            <AlertTriangle className="w-12 h-12 mx-auto text-red-500" />
          )}
        </div>
        
        <Alert className="mb-4">
          <AlertDescription className="text-center">
            {error.message}
          </AlertDescription>
        </Alert>

        {showRetryButton && error.retryable && onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}

        {!error.retryable && (
          <p className="text-sm text-muted-foreground mt-2">
            Please refresh the page or contact support if the issue persists.
          </p>
        )}
      </div>
    </div>
  );
}