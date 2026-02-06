import { WebsiteProject } from '../types';

const STORAGE_KEY = 'aether_projects';
const CURRENT_PROJECT_KEY = 'aether_current_project';

// Helper to simulate async behavior for compatibility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const saveProject = async (project: WebsiteProject): Promise<void> => {
  await delay(50);
  try {
    const projects = await getAllProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    localStorage.setItem(CURRENT_PROJECT_KEY, project.id);
  } catch (error) {
    console.error('Failed to save project:', error);
    throw new Error('Could not save project to local storage');
  }
};

export const loadProject = async (projectId: string): Promise<WebsiteProject | null> => {
  await delay(50);
  try {
    const projects = await getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
};

export const getCurrentProject = async (): Promise<WebsiteProject | null> => {
  await delay(50);
  try {
    const currentId = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (!currentId) return null;
    return loadProject(currentId);
  } catch (error) {
    console.error('Failed to get current project:', error);
    return null;
  }
};

export const getAllProjects = async (): Promise<WebsiteProject[]> => {
  await delay(50);
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get all projects:', error);
    return [];
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await delay(50);
  try {
    const projects = await getAllProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    const currentId = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (currentId === projectId) {
      localStorage.removeItem(CURRENT_PROJECT_KEY);
    }
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw new Error('Could not delete project');
  }
};
