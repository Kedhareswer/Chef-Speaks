import React, { useEffect } from 'react';
import { useDeploymentStatus } from '../hooks/useDeploymentStatus';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

interface DeploymentStatusProps {
  deployId: string;
  onDeploymentComplete?: (url: string) => void;
}

export const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ 
  deployId,
  onDeploymentComplete
}) => {
  const { status, loading } = useDeploymentStatus(deployId);

  useEffect(() => {
    if (status.status === 'success' && status.url && onDeploymentComplete) {
      onDeploymentComplete(status.url);
    }
  }, [status, onDeploymentComplete]);

  if (!deployId) {
    return null;
  }

  return (
    <div className="glass-organic rounded-3xl p-6 shadow-soft-lg border border-soft-brown-200/50 mb-6">
      <h3 className="text-xl font-bold text-soft-brown-900 mb-4">Deployment Status</h3>
      
      <div className="flex items-center gap-4 mb-4">
        {status.status === 'pending' && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warm-green-500"></div>
            <div>
              <p className="font-medium text-soft-brown-800">Deployment in progress...</p>
              <p className="text-sm text-soft-brown-600">This may take a few minutes</p>
            </div>
          </>
        )}
        
        {status.status === 'success' && (
          <>
            <CheckCircle className="w-8 h-8 text-warm-green-500" />
            <div>
              <p className="font-medium text-soft-brown-800">Deployment successful!</p>
              {status.claimed && (
                <p className="text-sm text-soft-brown-600">Your site has been claimed and is now live.</p>
              )}
            </div>
          </>
        )}
        
        {status.status === 'error' && (
          <>
            <XCircle className="w-8 h-8 text-terracotta-500" />
            <div>
              <p className="font-medium text-soft-brown-800">Deployment failed</p>
              <p className="text-sm text-terracotta-600">{status.error || 'An unknown error occurred'}</p>
            </div>
          </>
        )}
        
        {status.status === 'unknown' && !loading && (
          <>
            <Clock className="w-8 h-8 text-soft-brown-400" />
            <div>
              <p className="font-medium text-soft-brown-800">Checking deployment status...</p>
            </div>
          </>
        )}
      </div>

      {status.url && (
        <div className="bg-warm-green-50 border border-warm-green-200 rounded-2xl p-4">
          <p className="font-medium text-warm-green-800 mb-2">Your site is live at:</p>
          <a 
            href={status.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-warm-green-600 hover:text-warm-green-700 font-medium"
          >
            {status.url} <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {status.claimUrl && !status.claimed && (
        <div className="mt-4 bg-creamy-yellow-50 border border-creamy-yellow-200 rounded-2xl p-4">
          <p className="font-medium text-soft-brown-800 mb-2">Want to own this deployment?</p>
          <p className="text-sm text-soft-brown-600 mb-3">
            You can claim this deployment to your own Netlify account to manage it directly.
          </p>
          <a 
            href={status.claimUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-warm-green-500 to-terracotta-500 hover:from-warm-green-600 hover:to-terracotta-600 text-white px-4 py-2 rounded-xl transition-all"
          >
            Claim this site <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};