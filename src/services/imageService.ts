import { storage, auth } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Image compression failed:', error);
    return file;
  }
};

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const uploadImageToLocalStorage = async (file: File): Promise<string> => {
  // If user is not logged in, fallback to Base64 immediately
  if (!auth.currentUser) {
    console.warn("User not authenticated, using Base64 fallback for image.");
    return convertToBase64(file);
  }

  try {
    const compressed = await compressImage(file);
    
    // Generate unique path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const storageRef = ref(storage, `users/${auth.currentUser.uid}/uploads/${fileName}`);
    
    // Upload
    const snapshot = await uploadBytes(storageRef, compressed);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Firebase Storage Upload Failed, falling back to Base64:', error);
    // Graceful fallback so the user experience isn't broken
    return convertToBase64(file);
  }
};