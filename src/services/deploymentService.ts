import { getDeploymentStatus } from '../utils/getDeploymentStatus';

export interface DeploymentResult {
  success: boolean;
  deployId?: string;
  error?: string;
}

export const deploymentService = {
  async getDeploymentStatus(deployId: string) {
    try {
      return await getDeploymentStatus(deployId);
    } catch (error) {
      console.error('Error getting deployment status:', error);
      throw error;
    }
  }
};