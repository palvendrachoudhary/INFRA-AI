"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Send, Camera, User, Mail, Phone, 
  MessageSquare, Upload, FileText, Video, 
  Music, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { uploadFile } from "../../lib/storage";
import { uploadToCloudinary } from "../../lib/cloudinary";

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  complaint: string;
}

interface FileState {
  photo: File | null;
  video: File | null;
  audio: File | null;
  document: File | null;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    complaint: "",
  });

  const [files, setFiles] = useState<FileState>({
    photo: null,
    video: null,
    audio: null,
    document: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const [urls, setUrls] = useState<Record<string, string>>({
    photo: "",
    video: "",
    audio: "",
    document: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (type: keyof FileState) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) { // 15MB Limit
      setError(`${type.charAt(0).toUpperCase() + type.slice(1)} file is too large. Max limit is 15MB.`);
      return;
    }

    setError(null);
    setFiles(prev => ({ ...prev, [type]: file }));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));

    try {
      console.log(`Starting immediate upload for ${type}: ${file.name}`);
      
      const isCloudinaryConfigured = !!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && !!import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      let downloadUrl = "";
      
      if (isCloudinaryConfigured) {
        console.log("[Storage] Using Cloudinary for upload");
        downloadUrl = await uploadToCloudinary(file, (p) => {
          setUploadProgress(prev => ({ ...prev, [type]: Math.round(p) }));
        });
      } else {
        console.log("[Storage] Cloudinary not configured, falling back to Firebase Storage");
        const folderMap: Record<string, string> = {
          photo: "complaints/photos",
          video: "complaints/videos",
          audio: "complaints/audios",
          document: "complaints/documents"
        };
        downloadUrl = await uploadFile(file, folderMap[type] || `complaints/${type}s`, (p) => {
          setUploadProgress(prev => ({ ...prev, [type]: Math.round(p) }));
        });
      }
      
      setUrls(prev => ({ ...prev, [type]: downloadUrl }));
      console.log(`Upload complete for ${type}: ${downloadUrl}`);
    } catch (err: any) {
      console.error(`Upload error for ${type}:`, err);
      setError(`Failed to upload ${type}: ${err.message}`);
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      setFiles(prev => ({ ...prev, [type]: null }));
    }
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return "Full Name is required";
    if (!form.email.trim() || !form.email.includes("@")) return "Valid Email is required";
    if (!form.complaint.trim()) return "Complaint message is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Wait for any ongoing uploads
      const uploadingTypes = Object.entries(files)
        .filter(([_, file]) => file !== null)
        .filter(([type]) => !urls[type]);
      
      if (uploadingTypes.length > 0) {
        throw new Error(`Please wait, ${uploadingTypes.length} file(s) are still uploading...`);
      }

      const allUrls = Object.values(urls).filter(url => !!url);
      const attachment_urls = allUrls.join(",");

      // 2. Prepare JSON payload as per exact requested structure
      const payload = {
        submitted_at: new Date().toISOString(),
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        complaint_text: form.complaint,
        photo_url: urls.photo || "",
        video_url: urls.video || "",
        audio_url: urls.audio || "",
        document_url: urls.document || "",
        attachment_urls: attachment_urls
      };

      console.log("Sending final payload to webhook proxy:", payload);

      // 3. Send to Server Proxy
      const response = await fetch("/api/submit-complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Submission failed: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === "simulated_success") {
        console.info("Submission simulated (Webhook URL not set in Settings)");
      }

      // Success
      setSuccess(true);
      setForm({ fullName: "", email: "", phone: "", complaint: "" });
      setFiles({ photo: null, video: null, audio: null, document: null });
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);

    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-2xl bg-[#0d0e13] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#12131a]">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Citizen Grievance Form</h2>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Local Government Response Portal</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-neon-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Complaint submitted successfully</h3>
                  <p className="text-slate-400">Your report has been logged and forwarded to the local municipal council.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                      icon={<User className="w-4 h-4" />}
                      label="Full Name"
                      name="fullName"
                      placeholder="e.g. Rahul Sharma"
                      value={form.fullName}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField 
                      icon={<Mail className="w-4 h-4" />}
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="rahul@example.com"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <InputField 
                    icon={<Phone className="w-4 h-4" />}
                    label="Phone Number"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleInputChange}
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Complaint Details <span className="text-alert-red">*</span>
                    </label>
                    <textarea 
                      name="complaint"
                      value={form.complaint}
                      onChange={handleInputChange}
                      placeholder="Please describe the issue in detail (location, impact, duration)..."
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-green transition-all resize-none"
                    />
                  </div>

                  {/* Upload Section - Restructured for easier targeting and better UX */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <FileButton 
                        id="photo-upload-btn"
                        icon={<Camera className="w-6 h-6" />} 
                        label="Photo" 
                        file={files.photo} 
                        progress={uploadProgress.photo}
                        onClick={() => photoInputRef.current?.click()} 
                      />
                      <FileButton 
                        id="video-upload-btn"
                        icon={<Video className="w-6 h-6" />} 
                        label="Video" 
                        file={files.video} 
                        progress={uploadProgress.video}
                        onClick={() => videoInputRef.current?.click()} 
                      />
                      <FileButton 
                        id="audio-upload-btn"
                        icon={<Music className="w-6 h-6" />} 
                        label="Audio" 
                        file={files.audio} 
                        progress={uploadProgress.audio}
                        onClick={() => audioInputRef.current?.click()} 
                      />
                      <FileButton 
                        id="document-upload-btn"
                        icon={<FileText className="w-6 h-6" />} 
                        label="Document" 
                        file={files.document} 
                        progress={uploadProgress.document}
                        onClick={() => documentInputRef.current?.click()} 
                      />
                    </div>
                    
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Evidence Attachments (Optional)
                    </p>
 
                    {/* Hidden Inputs */}
                    <input type="file" ref={photoInputRef} accept="image/*" className="hidden" onChange={handleFileChange("photo")} />
                    <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={handleFileChange("video")} />
                    <input type="file" ref={audioInputRef} accept="audio/*" className="hidden" onChange={handleFileChange("audio")} />
                    <input type="file" ref={documentInputRef} accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange("document")} />
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-alert-red/10 border border-alert-red/30 rounded-xl flex items-center gap-3 text-alert-red text-sm font-medium"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </form>
              )}
            </div>

    {/* Footer */}
            {!success && (
              <div className="p-6 border-t border-white/5 bg-[#12131a] flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || Object.entries(files).some(([type, f]) => f !== null && !urls[type])}
                  className="flex-[2] py-3.5 bg-neon-green hover:bg-neon-green/90 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,255,135,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Report...
                    </>
                  ) : Object.entries(files).some(([type, f]) => f !== null && !urls[type]) ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading Files...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Formal Report
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const InputField = ({ label, icon, value, onChange, name, placeholder, type = "text", required = false }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
      {icon}
      {label} {required && <span className="text-alert-red">*</span>}
    </label>
    <input 
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-green transition-all"
    />
  </div>
);

const FileButton = ({ icon, label, file, onClick, id, progress }: any) => (
  <button 
    id={id}
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all duration-150 border-b-[6px] active:border-b-[2px] active:translate-y-[4px] shadow-2xl relative overflow-hidden group ${
      file 
        ? "bg-neon-green/5 border-neon-green/40 text-neon-green border-b-neon-green shadow-[0_10px_20px_-10px_rgba(0,255,135,0.3)]" 
        : "bg-[#1a1b26] border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300 border-b-[#2a2b36] hover:bg-[#1e1f2a]"
    }`}
  >
    {/* Progress Bar Background */}
    {progress !== undefined && progress > 0 && progress < 100 && (
      <div 
        className="absolute bottom-0 left-0 h-1 bg-neon-green/60 transition-all duration-300 z-20" 
        style={{ width: `${progress}%` }}
      />
    )}

    <div className={`w-10 h-10 flex items-center justify-center bg-black/60 rounded-full mb-1 relative z-10 transition-transform group-hover:scale-110 ${file ? 'text-neon-green' : 'text-slate-400'}`}>
      {file ? (
        progress === 100 ? <CheckCircle2 className="w-6 h-6 animate-pulse" /> : <Loader2 className="w-6 h-6 animate-spin" />
      ) : icon}
    </div>
    <div className="flex flex-col items-center gap-0.5 relative z-10 w-full">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] truncate w-full text-center px-1">
        {file ? (progress === 100 ? "Attached" : `${progress || 0}%`) : label}
      </span>
      {file && (
        <span className="text-[9px] font-mono opacity-40 truncate w-full px-1 text-center">{file.name}</span>
      )}
    </div>
  </button>
);
