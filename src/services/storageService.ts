import { db, auth } from "../lib/firebase";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { WebsiteProject } from '../types';

// Helper to check auth
const checkAuth = () => {
  if (!auth.currentUser) throw new Error("User must be logged in to access storage.");
  return auth.currentUser;
};

export const saveProject = async (project: WebsiteProject): Promise<void> => {
  const user = checkAuth();
  try {
    const projectRef = doc(db, "projects", project.id);
    
    // Create a lean version of the project object for indexing/metadata
    // In a full implementation, 'draftSections' might be stored in a subcollection
    // to avoid the 1MB document limit of Firestore. For MVP, we store in the doc.
    const projectData = {
      ...project,
      ownerId: user.uid,
      updatedAt: new Date().toISOString(),
      sectionCount: project.draftSections.length
    };

    await setDoc(projectRef, projectData, { merge: true });
  } catch (error) {
    console.error('Firestore Save Error:', error);
    throw new Error('Could not save project to cloud.');
  }
};

export const loadProject = async (projectId: string): Promise<WebsiteProject | null> => {
  const user = checkAuth();
  try {
    const projectRef = doc(db, "projects", projectId);
    const snap = await getDoc(projectRef);
    
    if (snap.exists()) {
      const data = snap.data() as WebsiteProject & { ownerId: string };
      // Security check in client (Rules handle backend)
      if (data.ownerId !== user.uid) {
        throw new Error("Unauthorized access to this project.");
      }
      return data;
    }
    return null;
  } catch (error) {
    console.error('Firestore Load Error:', error);
    return null;
  }
};

export const getCurrentProject = async (): Promise<WebsiteProject | null> => {
  const user = auth.currentUser;
  if (!user) return null; // Graceful return if not logged in

  try {
    // Get the most recently updated project
    const q = query(
      collection(db, "projects"), 
      where("ownerId", "==", user.uid),
      orderBy("updatedAt", "desc"),
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as WebsiteProject;
    }
    return null;
  } catch (error) {
    console.error('Firestore Get Current Error:', error);
    // Fallback: If index is missing for orderBy, try basic query
    try {
        const qFallback = query(collection(db, "projects"), where("ownerId", "==", user.uid));
        const snap = await getDocs(qFallback);
        return !snap.empty ? snap.docs[0].data() as WebsiteProject : null;
    } catch (e) {
        return null;
    }
  }
};

export const getAllProjects = async (): Promise<WebsiteProject[]> => {
  const user = checkAuth();
  try {
    const q = query(
      collection(db, "projects"), 
      where("ownerId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as WebsiteProject);
  } catch (error) {
    console.error('Firestore List Error:', error);
    return [];
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  checkAuth();
  try {
    await deleteDoc(doc(db, "projects", projectId));
  } catch (error) {
    console.error('Firestore Delete Error:', error);
    throw new Error('Could not delete project');
  }
};
