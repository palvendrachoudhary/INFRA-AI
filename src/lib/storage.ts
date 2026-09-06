import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export const uploadFile = async (file: File, folder: string = "complaints"): Promise<string> => {
  const fileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};
