import { storage, auth } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.5, // Aggressive compression for web performance
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file;
  }
};

export const uploadImageToLocalStorage = async (file: File): Promise<string> => {
  if (!auth.currentUser) throw new Error("User must be logged in to upload images.");

  try {
    const compressed = await compressImage(file);
    
    // Generate unique path: users/{uid}/uploads/{timestamp}_{random}.ext
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const storageRef = ref(storage, `users/${auth.currentUser.uid}/uploads/${fileName}`);
    
    // Upload
    const snapshot = await uploadBytes(storageRef, compressed);
    
    // Get Public URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Firebase Storage Upload Failed:', error);
    throw new Error('Failed to upload image to cloud storage.');
  }
};

// Deprecated: No longer converting to Base64 for persistence
export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
