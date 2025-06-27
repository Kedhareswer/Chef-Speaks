import { useState, useEffect } from 'react';

interface DeploymentStatus {
  status: 'pending' | 'success' | 'error' | 'unknown';
  url?: string;
  error?: string;
  claimed?: boolean;
  claimUrl?: string;
}

export const useDeploymentStatus = (deployId?: string) => {
  const [status, setStatus] = useState<DeploymentStatus>({
    status: 'unknown'
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!deployId) return;

    const checkStatus = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/deployment-status?id=${deployId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch deployment status');
        }
        const data = await response.json();
        setStatus({
          status: data.state === 'ready' ? 'success' : data.state === 'error' ? 'error' : 'pending',
          url: data.url,
          error: data.error_message,
          claimed: data.claimed,
          claimUrl: data.claim_url
        });
      } catch (error) {
        console.error('Error checking deployment status:', error);
        setStatus({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    
    // Poll for status updates every 5 seconds if deployment is pending
    const interval = setInterval(() => {
      if (status.status === 'pending') {
        checkStatus();
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [deployId, status.status]);

  return { status, loading };
};