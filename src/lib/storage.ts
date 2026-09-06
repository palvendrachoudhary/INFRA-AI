import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export const uploadFile = async (
  file: File, 
  folder: string = "complaints",
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    console.log(`Starting upload for ${file.name} to ${folder}...`);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        }, 
        (error) => {
          console.error(`Error uploading ${file.name}:`, error);
          reject(new Error(`Failed to upload ${file.name}: ${error.message}`));
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log(`URL retrieved for ${file.name}: ${downloadURL}`);
          resolve(downloadURL);
        }
      );
    });
  } catch (error: any) {
    console.error(`Unexpected error in uploadFile for ${file.name}:`, error);
    throw error;
  }
};
