import { WebsiteProject } from '../types';

const STORAGE_KEY = 'aether_projects';
const CURRENT_PROJECT_KEY = 'aether_current_project';

export const saveProject = (project: WebsiteProject): void => {
  try {
    const projects = getAllProjects();
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

export const loadProject = (projectId: string): WebsiteProject | null => {
  try {
    const projects = getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
};

export const getCurrentProject = (): WebsiteProject | null => {
  try {
    const currentId = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (!currentId) return null;
    return loadProject(currentId);
  } catch (error) {
    console.error('Failed to get current project:', error);
    return null;
  }
};

export const getAllProjects = (): WebsiteProject[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get all projects:', error);
    return [];
  }
};

export const deleteProject = (projectId: string): void => {
  try {
    const projects = getAllProjects().filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    
    const currentId = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (currentId === projectId) {
      localStorage.removeItem(CURRENT_PROJECT_KEY);
    }
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw new Error('Could not delete project');
  }
};