import React, { useState, useEffect } from 'react';
import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ErrorAlert = ({ 
  error, 
  title = 'Erreur', 
  onClose, 
  autoHide = false,
  autoHideDelay = 5000,
  variant = 'error' // error, warning, info
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, visible, onClose]);

  if (!visible || !error) return null;

  const variants = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-800',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonHover: 'hover:bg-red-200'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-800',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonHover: 'hover:bg-yellow-200'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonHover: 'hover:bg-blue-200'
    }
  };

  const style = variants[variant] || variants.error;

  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.graphQLErrors?.[0]?.message) return error.graphQLErrors[0].message;
    return 'Une erreur est survenue';
  };

  const getErrorDetails = () => {
    if (error?.graphQLErrors?.[0]?.extensions) {
      return error.graphQLErrors[0].extensions;
    }
    if (error?.networkError) {
      return { type: 'network', message: 'Erreur de connexion réseau' };
    }
    return null;
  };

  const errorMessage = getErrorMessage();
  const errorDetails = getErrorDetails();

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div className={`rounded-lg border ${style.bg} ${style.border} p-4 mb-4 relative`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${style.iconBg} rounded-full p-1`}>
          <XCircleIcon className={`h-5 w-5 ${style.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${style.text}`}>
            {title}
          </h3>
          <div className={`mt-2 text-sm ${style.text}`}>
            <p>{errorMessage}</p>
            {errorDetails && (
              <details className="mt-2 text-xs opacity-75">
                <summary>Détails techniques</summary>
                <pre className="mt-1 whitespace-pre-wrap">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </details>
            )}
          </div>
          {error?.graphQLErrors?.length > 1 && (
            <div className="mt-2 text-xs">
              <p className="font-medium">Autres erreurs:</p>
              <ul className="list-disc list-inside">
                {error.graphQLErrors.slice(1).map((err, idx) => (
                  <li key={idx}>{err.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          className={`ml-4 p-1 rounded-full ${style.buttonHover} transition-colors`}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Error boundary component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
           <ErrorAlert
            error={this.state.error}
            title="Erreur inattendue"
            onClose={() => this.setState({ hasError: false, error: null })}
          />
          {this.props.fallback || (
            <div className="text-center">
              <p className="text-gray-600">Quelque chose s'est mal passé.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 btn-primary"
              >
                Recharger la page
              </button>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Form error display component
export const FormErrorAlert = ({ errors, field }) => {
  if (!errors || !field) return null;
  
  const fieldError = errors[field];
  if (!fieldError) return null;
  
  return (
    <p className="mt-1 text-xs text-red-600">
      {fieldError.message || fieldError}
    </p>
  );
};

// API Error handler utility
export const handleApiError = (error, context = 'API') => {
  console.error(`[${context}] Error:`, error);
  
  let message = 'Une erreur est survenue';
  
  if (error?.graphQLErrors?.length) {
    message = error.graphQLErrors[0].message;
  } else if (error?.networkError) {
    message = 'Erreur de connexion. Vérifiez votre réseau.';
  } else if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
  }
  
  return message;
};

// Network status component
export const NetworkStatusAlert = ({ isOnline }) => {
  if (isOnline === undefined) return null;
  
  return (
    !isOnline && (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">Connexion internet perdue</p>
              <p className="text-xs">Les données peuvent ne pas être à jour</p>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ErrorAlert;