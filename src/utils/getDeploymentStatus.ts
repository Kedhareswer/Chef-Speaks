export async function getDeploymentStatus(id: string) {
  try {
    const response = await fetch(`/api/deployment-status?id=${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch deployment status: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching deployment status:', error);
    throw error;
  }
}