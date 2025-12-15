"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, Lock, Sparkles, CheckCircle2, ArrowRight, AlertTriangle, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { createCVInterview } from "@/lib/actions/cv.actions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { db } from "@/firebase/client"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { CVScoreDisplay } from "./CVScoreDisplay";

// Download Libraries
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver"; // Usually needed for docx, but we can use blobs directly

interface CVInterviewClientProps {
  userId: string;
}

type DialogType = "locked" | "upsell" | "enhancing" | "success" | null;

export default function CVInterviewClient({ userId }: CVInterviewClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [ratingResult, setRatingResult] = useState<any>(null); 
  const [dialogType, setDialogType] = useState<DialogType>(null);
  
  // Track CV IDs
  const [baseCvId, setBaseCvId] = useState<string | null>(null);
  const [enhancedCvId, setEnhancedCvId] = useState<string | null>(null);
  const [enhancedCvText, setEnhancedCvText] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (ratingResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [ratingResult]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      if (uploadedFile.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Max size is 5MB.");
        return;
      }
      setFile(uploadedFile);
      setRatingResult(null); 
      setDialogType(null);
      setBaseCvId(null);
      setEnhancedCvId(null);
      setEnhancedCvText(null);
      toast.success("File uploaded successfully!");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
  });

  const rateCVFn = async (fileToRate: File) => {
    const formData = new FormData();
    formData.append("file", fileToRate);
    formData.append("userId", userId);
    
    // 1. Parse
    const parseResponse = await fetch("/api/cv/parse", {
      method: "POST",
      body: formData,
    });
    
    if (!parseResponse.ok) {
      const errorData = await parseResponse.json();
      throw new Error(errorData.error || `Parse error: ${parseResponse.status}`);
    }
    const { cvId } = await parseResponse.json();
    setBaseCvId(cvId); // Store ID for later
    
    // 2. Rate
    const rateResponse = await fetch("/api/cv/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvId, userId }), 
    });
    
    if (!rateResponse.ok) throw new Error("Failed to rate CV");
    
    const data = await rateResponse.json();
    return data.rating;
  };

  const handleEnhanceCV = async (currentCvId: string) => {
      setIsEnhancing(true);
      setDialogType("enhancing"); // Show loading dialog

      try {
          const response = await fetch("/api/cv/enhance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cvId: currentCvId, userId }),
          });

          if (!response.ok) throw new Error("Enhancement failed");

          const data = await response.json();
          setEnhancedCvId(data.enhancedCvId);
          setEnhancedCvText(data.enhancedText);
          
          setDialogType("success"); // Show download dialog
      } catch (error) {
          console.error(error);
          toast.error("Failed to enhance Resume");
          setDialogType(null);
      } finally {
          setIsEnhancing(false);
      }
  };

  const generatePDF = (text: string) => {
      const doc = new jsPDF();
      doc.setFont("helvetica");
      doc.setFontSize(12);
      
      const lines = doc.splitTextToSize(text, 180); // Wrap to 180mm width
      let y = 10;
      
      lines.forEach((line: string) => {
          if (y > 280) { // New page
              doc.addPage();
              y = 10;
          }
          // Basic Markdown handling 
          if(line.startsWith("# ")) {
             doc.setFontSize(18);
             doc.setFont("helvetica", "bold");
             doc.text(line.replace("# ", ""), 10, y);
             doc.setFont("helvetica", "normal");
             doc.setFontSize(12);
             y += 10;
          } else if (line.startsWith("## ")) {
             doc.setFontSize(14);
             doc.setFont("helvetica", "bold");
             doc.text(line.replace("## ", ""), 10, y);
             doc.setFont("helvetica", "normal");
             doc.setFontSize(12);
             y += 8;
          } else {
             doc.text(line, 10, y);
             y += 7;
          }
      });
      
      doc.save("Enhanced_Resume.pdf");
  };

  const generateDOCX = (text: string) => {
    // Basic Markdown Text -> Paragraph conversion
    const paragraphs = text.split("\n").map(line => {
        if (line.startsWith("# ")) {
             return new Paragraph({
                 text: line.replace("# ", ""),
                 heading: HeadingLevel.HEADING_1,
                 spacing: { after: 200 }
             });
        }
        if (line.startsWith("## ")) {
             return new Paragraph({
                 text: line.replace("## ", ""),
                 heading: HeadingLevel.HEADING_2,
                 spacing: { before: 200, after: 100 }
             });
        }
        if (line.startsWith("- ")) {
             return new Paragraph({
                 text: line.replace("- ", ""),
                 bullet: { level: 0 }, 
             });
        }
        return new Paragraph({
            children: [new TextRun(line)],
             spacing: { after: 100 }
        });
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs,
        }],
    });

    Packer.toBlob(doc).then((blob) => {
        const url = URL.createObjectURL(blob);
        const element = document.createElement("a");
        element.href = url;
        element.download = "Enhanced_Resume.docx";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    });
  };

  const handleDownloadEnhanced = () => {
    if(!enhancedCvText || !file) return;
    
    const fileType = file.name.split(".").pop()?.toLowerCase();
    
    if (fileType === "pdf") {
       generatePDF(enhancedCvText);
    } else if (fileType === "docx" || fileType === "doc") {
       generateDOCX(enhancedCvText);
    } else {
       // Default to Markdown for text files or others
        const element = document.createElement("a");
        const blob = new Blob([enhancedCvText], {type: 'text/markdown'});
        element.href = URL.createObjectURL(blob);
        element.download = "Enhanced_Resume.md";
        document.body.appendChild(element); 
        element.click();
        document.body.removeChild(element);
    }
  };

  const handleRateCV = async () => {
    if (!file) return;
    setIsRating(true);
    setRatingResult(null);

    try {
      const rating = await rateCVFn(file);
      setRatingResult(rating);
      toast.success("CV Analysis Complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to rate CV");
    } finally {
      setIsRating(false);
    }
  };

  const onGenerateClick = async () => {
    if (!file) return;
    if (!userId) {
      toast.error("You must be logged in to generate an interview");
      return;
    }

    let currentRating = ratingResult;

    // Auto-rate if missing
    if (!currentRating) {
      setIsRating(true);
      toast.info("Checking CV score...");
      try {
        currentRating = await rateCVFn(file);
        setRatingResult(currentRating);
      } catch (error) {
        console.error(error);
        toast.error("Failed to validate CV");
        setIsRating(false);
        return;
      }
      setIsRating(false);
    }

    const score = currentRating?.scores?.overall || 0;

    // If we already have an enhanced version, skip logic
    if (enhancedCvId) {
        performInterviewGeneration(enhancedCvId);
        return;
    }

    if (score < 60) {
      setDialogType("locked");
    } else {
      setDialogType("upsell");
    }
  };

  const performInterviewGeneration = async (specificCvId?: string) => {
    const cvIdToUse = specificCvId || baseCvId;

    if (!cvIdToUse) {
       // Fallback logic could go here
    }

    setIsGenerating(true);
    
    try {
      let finalCvId = cvIdToUse;
      const formData = new FormData();
      if(file) formData.append("file", file); // Always use physically uploaded file
      formData.append("userId", userId);
      
      // Standard Parse & Question Gen (using uploaded file for questions to maintain context stability)
      // Note: Ideally we'd use the Enhanced Text for questions, but that requires a new API route.
      // Given constraints, we generate questions from original but link interview to Enhanced ID if present.
      
      const response = await fetch("/api/cv/parse", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const { analysis, cvId } = await response.json();
      
      // Use Enhanced ID if available to link it?
      finalCvId = enhancedCvId || cvId; 

      const result = await createCVInterview({
        userId,
        cvId: finalCvId!,
        name: analysis.name || "Candidate",
        language: analysis.language || "en",
        role: analysis.role || "General Interview",
        techstack: analysis.techstack || [],
        level: analysis.level || "Mid-level",
        type: analysis.type || "Technical",
        questions: analysis.questions || [],
        cvContext: analysis.cvContext || "",
      });
      
      if (!result.success || !result.interviewId) {
        throw new Error(result.error || "Failed to create interview");
      }
      
      toast.success("Interview generated! Redirecting...");

      // Immediate Client Notification
      if (userId) {
          addDoc(collection(db, "users", userId, "notifications"), {
              title: "Interview Created",
              message: "Redirecting you to your interview session...",
              type: "redirect",
              read: false,
              createdAt: serverTimestamp(),
          }).catch(e => console.error("Notification failed", e));
      }

      router.push(`/interview/${result.interviewId}`);
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate interview");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePayment = (amount: number) => {
    toast.success(`Processing Payment (${amount} TND)...`);
    
    // Simulate payment
    setTimeout(() => {
       toast.success("Payment Successful!");
       // Trigger Enhancement
       if (baseCvId) {
           handleEnhanceCV(baseCvId);
       } else {
           // Fallback if weird state
           setDialogType(null);
       }
    }, 1500);
  };

  const handleSkip = () => {
    setDialogType(null);
    performInterviewGeneration();
  };

  // Renders the specific content based on dialog state
  const renderDialogContent = () => {
    if (dialogType === "enhancing") {
        return (
            <DialogContent className="bg-dark-200 border-neon-cyan/20 text-white sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <div className="flex flex-col items-center py-10 gap-6">
                    <Loader2 className="w-16 h-16 text-neon-cyan animate-spin" />
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-bold text-white">Enhancing Your Resume...</h3>
                        <p className="text-gray-400">Our AI is rewriting your summary, optimizing keywords, and fixing formatting.</p>
                    </div>
                </div>
            </DialogContent>
        );
    }

    if (dialogType === "success") {
        return (
            <DialogContent className="bg-gradient-to-br from-green-900/20 to-black border-2 border-green-500/40 text-white sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
                 <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-center text-green-400 flex flex-col items-center gap-2">
                        <div className="p-3 bg-green-500/10 rounded-full mb-2">
                            <Sparkles className="w-8 h-8 text-green-400" />
                        </div>
                        Resume Enhanced!
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-300 text-lg">
                        Your optimized CV is ready. It has been tailored for maximum ATS impact.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 px-4">
                     <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-neon-cyan" />
                            <div>
                                <p className="font-semibold text-white">
                                    Enhanced_Resume.{file?.name.split(".").pop()?.toLowerCase() || "md"}
                                </p>
                                <p className="text-xs text-gray-400">Optimized • Ready for Download</p>
                            </div>
                        </div>
                        <Button onClick={handleDownloadEnhanced} size="sm" variant="outline" className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black">
                            <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                     </div>
                     
                     <p className="text-center text-sm text-gray-400 mb-2">
                         Click below to start your interview using this new version.
                     </p>
                </div>

                <DialogFooter>
                    <Button 
                        onClick={() => {
                            setDialogType(null);
                            performInterviewGeneration(enhancedCvId!);
                        }} 
                        variant="neon" 
                        className="w-full text-lg h-12"
                    >
                        Start Interview Simulation <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        );
    }

    if (dialogType === "locked") {
      return (
        <DialogContent className="bg-gradient-to-br from-dark-200 to-black border-2 border-red-500/40 text-white sm:max-w-lg p-0 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)]" onPointerDownOutside={(e) => e.preventDefault()}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70"></div>
          
          <div className="p-8 pb-4">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-red-500 to-white flex flex-col items-center gap-4 pb-2">
                 <div className="relative">
                   <div className="absolute -inset-2 bg-red-500/20 blur-xl rounded-full"></div>
                   <Lock className="w-12 h-12 text-red-500 relative z-10" />
                 </div>
                 Interview Locked
              </DialogTitle>
              <DialogDescription className="text-center text-gray-300 text-lg">
                Your CV Score <span className="text-red-400 font-bold">({ratingResult?.scores?.overall || 0})</span> is too low for this interview simulation.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 relative group cursor-pointer" onClick={() => handlePayment(30)}>
              {/* Card Container */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-500 animate-tilt"></div>
              <div className="relative flex items-center justify-between p-6 bg-black rounded-xl border border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">Unlock & Optimize</h3>
                  </div>
                  <p className="text-sm text-gray-400">Boost Score to 80+ instantly</p>
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-bold text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">30 TND</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3 px-2">
               <p className="text-center text-gray-400 text-sm italic">
                  "Candidates with scores &lt; 60 fail 90% of screenings. Let's fix that."
               </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-3 bg-white/5 p-6 border-t border-white/5 mt-2">
            <Button 
              onClick={() => handlePayment(30)} 
              variant="destructive" 
              className="w-full text-lg font-bold h-14 shadow-lg hover:shadow-red-500/20 transition-all border border-red-500/50"
            >
              Unlock Access (30 TND)
            </Button>
            
            <button 
              onClick={() => setDialogType(null)}
              className="text-gray-500 text-sm hover:text-white flex items-center justify-center gap-1 transition-colors py-2"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      );
    }

    if (dialogType === "upsell") {
      return (
        <DialogContent className="bg-gradient-to-br from-dark-200 to-black border-2 border-neon-cyan/40 text-white sm:max-w-lg p-0 overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.15)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-70"></div>
          
          <div className="p-8 pb-4">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-neon-cyan to-white flex flex-col items-center gap-4 pb-2">
                 <div className="relative">
                   <div className="absolute -inset-2 bg-neon-cyan/20 blur-xl rounded-full"></div>
                   <Sparkles className="w-12 h-12 text-neon-cyan relative z-10" />
                 </div>
                 Maximize Your Chances
              </DialogTitle>
              <DialogDescription className="text-center text-gray-300 text-lg">
                Your CV is good, but our AI can make it <span className="text-white font-semibold">perfect</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 relative group cursor-pointer" onClick={() => handlePayment(50)}>
              {/* Card Container */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-cyan via-purple-500 to-neon-cyan rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-500 animate-tilt"></div>
              <div className="relative flex items-center justify-between p-6 bg-black rounded-xl border border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">Premium Rewrite</h3>
                    <span className="bg-neon-cyan/20 text-neon-cyan text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-neon-cyan/30">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Guaranteed ATS 95+ Score</p>
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-bold text-neon-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">50 TND</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3 px-2">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="p-1 rounded-full bg-green-500/10">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm">Complete executive summary rewrite</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="p-1 rounded-full bg-green-500/10">
                   <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm">Advanced keyword optimization for this role</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-3 bg-white/5 p-6 border-t border-white/5 mt-2">
            <Button 
              onClick={() => handlePayment(50)} 
              variant="neon" 
              className="w-full text-lg font-bold h-14 shadow-lg hover:shadow-neon-cyan/20 transition-all"
            >
              Get Best Version & Generate
            </Button>
            
            <button 
              onClick={handleSkip} 
              className="text-gray-500 text-sm hover:text-white flex items-center justify-center gap-1 transition-colors py-2"
            >
              No thanks, I'll take my chances
              <ArrowRight className="w-3 h-3" />
            </button>
          </DialogFooter>
        </DialogContent>
      );
    }
    
    return null;
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Transform Your CV into an{" "}
            <span className="text-neon-cyan">Interview</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your resume and let our AI create a personalized mock interview
            tailored to your experience, or get detailed feedback to improve it.
          </p>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            relative group cursor-pointer
            border-2 border-dashed rounded-3xl p-10
            transition-all duration-300 ease-in-out
            flex flex-col items-center justify-center gap-4
            min-h-[300px]
            ${
              isDragActive
                ? "border-neon-cyan bg-neon-cyan/5 scale-[1.02]"
                : "border-gray-700 bg-black/40 hover:border-neon-cyan/50 hover:bg-black/60"
            }
          `}
        >
          <input {...getInputProps()} />
          
          <div className="p-4 bg-dark-200 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <UploadCloud className="w-10 h-10 text-neon-cyan opacity-80 group-hover:opacity-100" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-white group-hover:text-neon-cyan transition-colors">
              {file ? file.name : "Drop your resume here"}
            </p>
            <p className="text-gray-400">
              {file
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : "Support PDF, DOCX, TXT (Max 5MB)"}
            </p>
          </div>

          {file && (
            <div className="absolute top-4 right-4">
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setRatingResult(null);
                  setDialogType(null); // Reset dialog
                  setBaseCvId(null);
                  setEnhancedCvId(null);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Remove file"
               >
                 <span className="text-gray-400 hover:text-white text-xl">×</span>
               </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-8">
          <Button
            onClick={handleRateCV}
            disabled={!file || isRating || isGenerating || isEnhancing}
            size="xl"
            variant="neon-purple"
            className={`
              min-w-[240px] text-lg font-bold shadow-[0_0_10px_rgba(188,19,254,0.3)]
              ${(!file || isRating || isGenerating || isEnhancing) && "opacity-50 cursor-not-allowed"}
            `}
          >
            {isRating ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Rate CV"
            )}
          </Button>

          <Button
            onClick={onGenerateClick}
            disabled={!file || isRating || isGenerating || isEnhancing}
            size="xl"
            variant="neon"
            className={`
               min-w-[240px] text-lg font-bold shadow-[0_0_10px_rgba(0,243,255,0.3)]
              ${(!file || isRating || isGenerating || isEnhancing) && "opacity-50 cursor-not-allowed"}
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Interview"
            )}
          </Button>
        </div>

        {/* Results Display */}
        {ratingResult && (
          <div ref={resultsRef}>
            <CVScoreDisplay rating={ratingResult} />
          </div>
        )}

        {/* Dynamic Dialog (Gate vs Upsell vs Processing) */}
        <Dialog open={!!dialogType} onOpenChange={(open) => { 
          if(!open) setDialogType(null);
        }}>
          {renderDialogContent()}
        </Dialog>
      </div>
    </section>
  );
}
