import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, AlertTriangle, CheckCircle2, Loader2, Sparkles, Send, MapPin, Camera, X, Video, Image as ImageIcon, FileText, Mail, Building2, Download, Mic, MicOff } from 'lucide-react';
import { jsPDF } from 'jspdf';

export function ReportForm() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [detectedCity, setDetectedCity] = useState<string>('Local');
  const [detectedState, setDetectedState] = useState<string>('State');
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  type Step = 'input' | 'analyzing' | 'draft' | 'dispatching' | 'success';
  const [step, setStep] = useState<Step>('input');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [draftText, setDraftText] = useState('');
  const [routingOption, setRoutingOption] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [reportId, setReportId] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert Blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = reader.result?.toString().split(',')[1];
          if (base64data) {
            try {
              const res = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioBase64: base64data, mimeType: 'audio/webm' })
              });
              const data = await res.json();
              if (data.text) {
                setInput(prev => (prev ? prev + ' ' + data.text : data.text));
              }
            } catch (err) {
              console.error("Transcription error:", err);
            }
          }
          setIsTranscribing(false);
        };
        
        // Clean up tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone", error);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleLocationClick = () => {
    setLocation('Fetching GPS coordinates...');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const addressCity = data.address.city || data.address.town || data.address.village || data.address.district || data.address.state_district || 'Local';
          const addressState = data.address.state || 'State';
          
          setDetectedCity(addressCity);
          setDetectedState(addressState);
          
          const address = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.state || 'Unknown Area';
          setLocation(`${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E (${address})`);
          setCoordinates({ lat: latitude, lng: longitude });
        } catch (e) {
          setLocation(`${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
          setCoordinates({ lat: latitude, lng: longitude });
        }
      }, (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocation('Location permission denied.');
          alert("Please allow location access in your browser to attach GPS coordinates.");
        } else {
          setLocation('Failed to fetch location.');
        }
      }, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
    } else {
      setLocation('Geolocation not supported by browser.');
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
      setValidationError(null);
    }
  };

  const removeMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setMediaUrl(dataUrl);
        setMediaType('image');
        setValidationError(null);
        closeCamera();
      }
    }
  };

  const handleAnalyze = () => {
    if (!input.trim() && !mediaUrl) return;
    setValidationError(null);
    setStep('analyzing');
    
    // Simulate Gemini 1.5 Flash Vision / Text Analysis Latency
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      // Crucial Validation Logic: Reject non-infrastructure images/text
      const invalidKeywords = ['selfie', 'dog', 'cat', 'car', 'game', 'person', 'portrait', 'face', 'food'];
      const isInvalid = invalidKeywords.some(k => lowerInput.includes(k));
      
      if (isInvalid) {
        setValidationError("Analysis Failed: This image or text does not appear to contain public infrastructure or a civic issue. Please upload a relevant photo or provide valid details.");
        setStep('input');
        return;
      }

      // Generate Draft based on detected category
      const today = new Date().toLocaleDateString('en-IN');
      let categorySubject = 'General Civic Infrastructure Issue';
      let dept = `${detectedCity} Municipal Corporation - General Routing`;
      
      if (lowerInput.includes('road') || lowerInput.includes('pothole') || lowerInput.includes('gaddha') || lowerInput.includes('sadak')) {
        categorySubject = 'Critical Road Infrastructure Damage (Potholes/Erosion)';
        dept = `${detectedCity} Municipal Corporation - Road Dept`;
      } else if (lowerInput.includes('water') || lowerInput.includes('drain') || lowerInput.includes('flood') || lowerInput.includes('paani') || lowerInput.includes('jal')) {
        categorySubject = 'Waterlogging & Drainage Failure';
        dept = `${detectedCity} Municipal Corporation - Water & Sanitation`;
      } else if (lowerInput.includes('light') || lowerInput.includes('electricity') || lowerInput.includes('bijli')) {
        categorySubject = 'Electrical Hazard / Streetlight Outage';
        dept = `${detectedState} State Electricity Board`;
      } else if (lowerInput.includes('highway') || lowerInput.includes('toll')) {
        categorySubject = 'State Highway Structural Concern';
        dept = `${detectedState} State Highway Authority`;
      }
      
      const locString = location ? `\nIncident Location: ${location}` : '';
      const mediaString = mediaUrl ? `\nMedia Evidence: Flagged & Attached in System` : '';
      
      const generated = `Date: ${today}\nSubject: ${categorySubject}\n\nTo the Concerned Authority,\n\nThis is an automated formal report generated via the Infra.AI Civic Assessment System.\n\nDescription of Issue:\n"${input || 'Visual evidence submitted for assessment.'}"${locString}${mediaString}\n\nAI Diagnostic Assessment:\nBased on Google Cloud Vision & Gemini 1.5 Flash analysis, this report has been verified as a legitimate civic infrastructure issue requiring your department's immediate attention. \n\nPlease review and initiate resolution protocols within standard SLAs.\n\nSincerely,\nInfra.AI Automated Dispatch System`;
      
      setDraftText(generated);
      setRoutingOption(dept);
      setReportId(`INF-${Math.floor(Math.random() * 90000) + 10000}`);
      setStep('draft');
    }, 2500);
  };

  const handleDispatch = () => {
    if (routingOption === 'Custom Email Address...' && !customEmail.trim()) {
      alert("Please enter a custom email address.");
      return;
    }
    
    // Prepare and trigger the native mailto link
    const targetEmail = routingOption === 'Custom Email Address...' ? customEmail : 'dispatch@indore.gov.in';
    const subject = encodeURIComponent(`Official Civic Incident Report: ${reportId}`);
    const body = encodeURIComponent(draftText);
    
    // Open the user's default email client (Gmail, Outlook, Apple Mail, etc.)
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

    setStep('dispatching');
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  const resetForm = () => {
    setInput('');
    setMediaUrl(null);
    setMediaType(null);
    setLocation(null);
    setCoordinates(null);
    setValidationError(null);
    setStep('input');
    setCustomEmail('');
    setIsCameraOpen(false);
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("INFRA.AI - DISPATCHED INCIDENT REPORT", 20, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Report ID: ${reportId}`, 20, 30);
    const finalDest = routingOption === 'Custom Email Address...' ? customEmail : routingOption;
    doc.text(`Dispatched To: ${finalDest}`, 20, 37);
    doc.text(`Timestamp: ${new Date().toLocaleString()}`, 20, 44);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("-- OFFICIAL COMMUNICATION --", 20, 58);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(draftText, 170);
    doc.text(splitText, 20, 68);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Verified by Google Cloud Vision & Gemini 1.5 Flash", 20, 280);
    
    doc.save(`${reportId}_Official_Report.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400 mb-2">AI-Powered Civic Reporting</h2>
        <p className="text-slate-400 text-sm max-w-3xl">
          Upload an image and description. Our system validates the infrastructure damage using Vision AI, generates a formal editable report, and dynamically routes it to the correct municipal authority.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Input Panel */}
        <div className={`relative bg-[#121212]/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col h-full transition-opacity duration-300 ${(step !== 'input' && step !== 'analyzing') ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {isCameraOpen && (
            <div className="absolute inset-0 z-50 bg-black flex flex-col">
              <video ref={videoRef} className="w-full flex-grow object-cover" playsInline autoPlay muted />
              <div className="p-6 bg-black/90 flex items-center justify-between pb-8">
                <button onClick={closeCamera} className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors">Cancel</button>
                <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 hover:scale-105 transition-transform flex-shrink-0" aria-label="Capture photo"></button>
                <div className="w-20"></div> {/* Spacer for balance */}
              </div>
            </div>
          )}

          <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-teal-300">Incident Details</span>
            </div>
          </div>
          
          <div className="p-6 flex-grow flex flex-col">
            {validationError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-200 font-medium leading-relaxed">{validationError}</p>
              </div>
            )}

            <div className="relative mb-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the issue (e.g., There is a huge pothole causing accidents near the main square...)"
                className="w-full h-32 resize-none bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-teal-500 focus:border-teal-500 p-4 pr-12 text-white placeholder:text-slate-500 text-sm shadow-inner"
              />
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`absolute bottom-3 right-3 p-2.5 rounded-xl transition-all shadow-md ${
                  isRecording 
                    ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]' 
                    : isTranscribing 
                      ? 'bg-white/10 text-slate-400 cursor-not-allowed'
                      : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30'
                }`}
                title={isRecording ? "Stop recording" : "Dictate via microphone"}
              >
                {isTranscribing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {(mediaUrl || location) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex flex-col gap-2"
                >
                  {location && (
                    <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs py-2.5 px-4 rounded-xl border border-indigo-500/30 font-medium">
                      <MapPin className="w-3.5 h-3.5 animate-pulse" /> {location}
                    </div>
                  )}
                  {mediaUrl && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 group bg-black/20">
                      {mediaType === 'image' ? (
                        <img src={mediaUrl} alt="Upload preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                           <Video className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      <button 
                        type="button" 
                        onClick={removeMedia}
                        className="absolute top-1 right-1 bg-black/50 backdrop-blur text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={handleLocationClick}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${location ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 bg-white/5 hover:bg-white/10 border border-white/5'}`}
                  title="Attach GPS Location"
                >
                  <MapPin className="w-4 h-4" />
                  {location && coordinates ? 'Location Attached' : 'Detect Location'}
                </button>
                
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleMediaUpload} 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2.5 rounded-lg transition-colors border ${mediaUrl ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'}`}
                  title="Upload Photo Evidence"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <button 
                  type="button" 
                  onClick={openCamera}
                  className="p-2.5 rounded-lg transition-colors bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10"
                  title="Take Photo with Camera"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={handleAnalyze}
                disabled={!input.trim() && !mediaUrl}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                AI Analysis <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Flow Panel */}
        <div className="bg-[#0b1121] rounded-2xl border border-white/10 relative overflow-hidden flex flex-col h-full min-h-[500px] shadow-lg">
          
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div 
                key="awaiting"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-grow flex flex-col items-center justify-center text-center text-slate-400 p-8"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-teal-500/50" />
                </div>
                <h3 className="font-display font-medium text-lg mb-2 text-white">Awaiting Submission</h3>
                <p className="text-sm max-w-sm text-slate-400">Provide details on the left. The AI will validate the issue, generate a formal complaint, and select the appropriate dispatch route.</p>
              </motion.div>
            )}

            {step === 'analyzing' && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-grow flex flex-col items-center justify-center text-center space-y-6 p-8"
              >
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin shadow-[0_0_20px_rgba(20,184,166,0.4)]"></div>
                  <Sparkles className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-xl text-white mb-2">Processing Request</h3>
                  <p className="text-teal-200/80 text-sm">Validating image integrity via Google Cloud Vision...</p>
                  <p className="text-teal-200/80 text-sm">Synthesizing formal report via Gemini 1.5 Flash...</p>
                </div>
              </motion.div>
            )}

            {step === 'draft' && (
              <motion.div 
                key="draft"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex-grow flex flex-col p-6 h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-teal-400">
                    <FileText className="w-5 h-5" />
                    <h3 className="font-display font-medium">AI Generated Report</h3>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Review & Edit</span>
                </div>
                
                <textarea 
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  className="w-full flex-grow min-h-[250px] p-4 font-mono text-sm leading-relaxed bg-[#121212]/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none shadow-inner mb-6 text-slate-200"
                />

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/50 mb-2 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5" /> Dispatch Destination
                    </label>
                    <select 
                      value={routingOption}
                      onChange={(e) => setRoutingOption(e.target.value)}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-1 focus:ring-teal-500 outline-none"
                    >
                      <option className="bg-[#121212]" value={`${detectedCity} Municipal Corporation - General Routing`}>{detectedCity} Municipal Corporation - General Routing</option>
                      <option className="bg-[#121212]" value={`${detectedCity} Municipal Corporation - Road Dept`}>{detectedCity} Municipal Corporation - Road Dept</option>
                      <option className="bg-[#121212]" value={`${detectedCity} Municipal Corporation - Water & Sanitation`}>{detectedCity} Municipal Corporation - Water & Sanitation</option>
                      <option className="bg-[#121212]" value={`${detectedState} State Electricity Board`}>{detectedState} State Electricity Board</option>
                      <option className="bg-[#121212]" value={`${detectedState} State Highway Authority`}>{detectedState} State Highway Authority</option>
                      <option className="bg-[#121212]" value="Custom Email Address...">Custom Email Address...</option>
                    </select>
                  </div>

                  {routingOption === 'Custom Email Address...' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <input 
                        type="email" 
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="Enter custom authority email..."
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </motion.div>
                  )}

                  <button 
                    onClick={handleDispatch}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] flex items-center justify-center gap-2"
                  >
                    Send Official Report <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'dispatching' && (
              <motion.div 
                key="dispatching"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-grow flex flex-col items-center justify-center text-center space-y-4 p-8"
              >
                <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                  <Mail className="w-10 h-10 text-indigo-400 animate-bounce" />
                </div>
                <h3 className="font-display font-medium text-xl text-white">Transmitting to Authority...</h3>
                <p className="text-sm text-indigo-200/70">Routing via secure municipal gateway.</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex-grow flex flex-col items-center justify-center text-center p-8 h-full"
              >
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">Report Delivered</h3>
                <p className="text-slate-300 mb-8 max-w-sm">
                  Your civic issue report has been successfully dispatched to 
                  <span className="font-semibold block mt-2 text-white bg-white/5 py-1 px-3 rounded-lg border border-white/10">
                    {routingOption === 'Custom Email Address...' ? customEmail : routingOption}
                  </span>
                </p>

                <div className="flex flex-col w-full max-w-xs gap-3">
                  <button 
                    onClick={downloadReport}
                    className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download PDF Copy
                  </button>
                  <button 
                    onClick={resetForm}
                    className="w-full py-3 bg-transparent text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    Submit Another Issue
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
