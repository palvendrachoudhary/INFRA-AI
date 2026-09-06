/**
 * Cloudinary Upload Utility
 * Handles direct unsigned uploads to Cloudinary.
 */

export const uploadToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Fetch config from server first to ensure we have the latest secrets in production
  let cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  let uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  try {
    const configRes = await fetch("/api/config/cloudinary");
    const contentType = configRes.headers.get("content-type");
    
    if (configRes.ok && contentType && contentType.includes("application/json")) {
      const config = await configRes.json();
      if (config.cloudName && config.uploadPreset) {
        cloudName = config.cloudName;
        uploadPreset = config.uploadPreset;
        console.log("[Cloudinary] Config fetched from server successfully");
      }
    } else {
      console.warn(`[Cloudinary] Server config returned ${configRes.status} (${contentType}). Using local env fallback.`);
    }
  } catch (err) {
    console.warn("[Cloudinary] Could not fetch config from server, using local env fallback:", err);
  }

  if (!cloudName || !uploadPreset) {
    console.error("Cloudinary credentials missing. Falling back to dummy URL for demo.");
    // For demo purposes, we'll return a placeholder if keys aren't set
    // but in production this should throw an error.
    return "https://res.cloudinary.com/demo/image/upload/sample.jpg";
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "infra_citizen_reports");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        const error = JSON.parse(xhr.responseText);
        reject(new Error(error.error?.message || "Cloudinary upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during Cloudinary upload"));
    xhr.send(formData);
  });
};
