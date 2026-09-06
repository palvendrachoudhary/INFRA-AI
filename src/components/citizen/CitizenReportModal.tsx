"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Send, Camera, User, Mail, Phone, 
  MessageSquare, Upload, FileText, Video, 
  Music, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { uploadFile } from "../../lib/storage";

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
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRefs = {
    photo: useRef<HTMLInputElement>(null),
    video: useRef<HTMLInputElement>(null),
    audio: useRef<HTMLInputElement>(null),
    document: useRef<HTMLInputElement>(null),
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (type: keyof FileState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFiles(prev => ({ ...prev, [type]: file }));
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
      // 1. Upload files first
      const uploadPromises = [
        files.photo ? uploadFile(files.photo, "photos") : Promise.resolve(""),
        files.video ? uploadFile(files.video, "videos") : Promise.resolve(""),
        files.audio ? uploadFile(files.audio, "audio") : Promise.resolve(""),
        files.document ? uploadFile(files.document, "documents") : Promise.resolve(""),
      ];

      const [photoUrl, videoUrl, audioUrl, documentUrl] = await Promise.all(uploadPromises);
      
      const attachmentUrls = [photoUrl, videoUrl, audioUrl, documentUrl]
        .filter(url => url !== "")
        .join(",");

      // 2. Prepare JSON payload
      const payload = {
        submitted_at: new Date().toISOString(),
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        complaint_text: form.complaint,
        photo_url: photoUrl,
        video_url: videoUrl,
        audio_url: audioUrl,
        document_url: documentUrl,
        attachment_urls: attachmentUrls
      };

      // 3. Send to Server Proxy (bypasses CORS and is more reliable)
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

                  {/* Upload Section */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evidence Attachments</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <FileButton 
                        icon={<Camera className="w-6 h-6" />} 
                        label="Photo" 
                        file={files.photo} 
                        onClick={() => fileInputRefs.photo.current?.click()} 
                      />
                      <FileButton 
                        icon={<Video className="w-6 h-6" />} 
                        label="Video" 
                        file={files.video} 
                        onClick={() => fileInputRefs.video.current?.click()} 
                      />
                      <FileButton 
                        icon={<Music className="w-6 h-6" />} 
                        label="Audio" 
                        file={files.audio} 
                        onClick={() => fileInputRefs.audio.current?.click()} 
                      />
                      <FileButton 
                        icon={<FileText className="w-6 h-6" />} 
                        label="Document" 
                        file={files.document} 
                        onClick={() => fileInputRefs.document.current?.click()} 
                      />
                    </div>

                    {/* Hidden Inputs */}
                    <input type="file" ref={fileInputRefs.photo} accept="image/*" className="hidden" onChange={handleFileChange("photo")} />
                    <input type="file" ref={fileInputRefs.video} accept="video/*" className="hidden" onChange={handleFileChange("video")} />
                    <input type="file" ref={fileInputRefs.audio} accept="audio/*" className="hidden" onChange={handleFileChange("audio")} />
                    <input type="file" ref={fileInputRefs.document} accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange("document")} />
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
                  disabled={isSubmitting}
                  className="flex-[2] py-3.5 bg-neon-green hover:bg-neon-green/90 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,255,135,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading & Processing...
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

const FileButton = ({ icon, label, file, onClick }: any) => (
  <button 
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all ${
      file 
        ? "bg-neon-green/10 border-neon-green text-neon-green" 
        : "bg-white/5 border-white/10 text-slate-500 hover:border-white/30 hover:text-slate-300"
    }`}
  >
    <div className="w-6 h-6 flex items-center justify-center">
      {file ? <CheckCircle2 className="w-6 h-6" /> : icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-tight truncate w-full text-center px-1">
      {file ? file.name : label}
    </span>
  </button>
);
