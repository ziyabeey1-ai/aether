import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1,
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

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const uploadImageToLocalStorage = async (file: File): Promise<string> => {
  try {
    const compressed = await compressImage(file);
    const base64 = await convertToBase64(compressed);
    
    // Store in localStorage with unique key
    const key = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, base64);
    
    return base64;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Failed to upload image');
  }
};