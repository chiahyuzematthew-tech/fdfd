"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, Star, Video, Mic, Square, Send, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PRIMARY_BTN, BRAND_FILL, PAGE_BG, HEADER, Spinner } from "./design-system";

export function SubmitView() {
  const { view, setView } = useAppStore();
  const { toast } = useToast();
  const slug = view.page === "submit" ? view.slug : "";

  const [spaceName, setSpaceName] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [headline, setHeadline] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerTitle, setCustomerTitle] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [rating, setRating] = useState(0);
  const [textContent, setTextContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [nameError, setNameError] = useState("");

  // Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const res = await fetch(`/api/wall?slug=${slug}`);
        const data = await res.json();
        if (res.ok && data.space) {
          setSpaceName(data.space.name);
          setSpaceId(data.space.id);
          setHeadline(data.space.headline || "");
        }
      } catch {
        // Space not found
      }
    };
    if (slug) fetchSpace();
  }, [slug]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraReady(true);
    } catch {
      toast({ title: "Camera access denied", description: "Enable camera permissions to record", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  const startRecording = async () => {
    if (!cameraReady) await startCamera();
    chunksRef.current = [];
    setTimeout(() => {
      if (!streamRef.current) return;
      const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm;codecs=vp9" });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        setVideoPreview(URL.createObjectURL(blob));
        setRecordingTime(0);
        stopCamera();
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    }, 300);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsRecording(false);
  };

  const discardVideo = () => {
    setRecordedBlob(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setRecordingTime(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");

    if (!customerName.trim()) {
      setNameError("Your name is required");
      return;
    }
    if (!textContent.trim() && !recordedBlob) {
      toast({ title: "Add text or a video", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      let videoUrl: string | null = null;
      if (recordedBlob) {
        const formData = new FormData();
        formData.append("video", recordedBlob, "video.webm");
        formData.append("spaceId", spaceId);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) videoUrl = uploadData.videoUrl;
      }

      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId, customerName, customerTitle, customerCompany,
          rating: rating || null, textContent, videoUrl,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        toast({ title: data.error || "Submission failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const hasContent = textContent.trim() || recordedBlob;

  // Success state
  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${PAGE_BG} p-4`}>
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <Check className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Thanks for sharing!</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Your testimonial is in review and will appear on the wall once approved.
          </p>
          <Button variant="outline" onClick={() => setView({ page: "wall", slug })}>
            View the wall
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${PAGE_BG}`}>
      {/* Header — consistent h-14 */}
      <header className={HEADER}>
        <div className="max-w-xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back to wall" onClick={() => setView({ page: "wall", slug })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Heart className={`h-5 w-5 ${BRAND_FILL}`} />
          <span className="text-sm font-medium">{spaceName || "Kudos"}</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading — single clear purpose */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            {headline || "Share your experience"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Your honest feedback helps us improve
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star rating */}
          <fieldset className="text-center">
            <Label className="text-sm font-medium mb-2.5 block">Rating</Label>
            <div className="flex justify-center gap-1.5" role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={i === rating}
                  aria-label={`${i} star${i !== 1 ? "s" : ""}`}
                  onClick={() => setRating(i)}
                  className="p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300 hover:text-amber-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          {/* Name (required) */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm">Your name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="Jane Smith"
              value={customerName}
              onChange={(e) => { setCustomerName(e.target.value); setNameError(""); }}
              className="h-9"
              required
              aria-invalid={!!nameError}
            />
            {nameError && <p className="text-xs text-destructive" role="alert">{nameError}</p>}
          </div>

          {/* Title + Company — side by side */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm">Job title</Label>
              <Input id="title" placeholder="Product Manager" value={customerTitle} onChange={(e) => setCustomerTitle(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company" className="text-sm">Company</Label>
              <Input id="company" placeholder="Acme Inc" value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)} className="h-9" />
            </div>
          </div>

          {/* Testimonial text */}
          <div className="space-y-1.5">
            <Label htmlFor="text" className="text-sm">Your testimonial</Label>
            <Textarea
              id="text"
              placeholder="What was your experience like?"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Video recording */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Video (optional)</Label>

            {videoPreview ? (
              <div className="space-y-2">
                <div className="rounded-lg overflow-hidden bg-black aspect-video">
                  <video src={videoPreview} className="w-full h-full object-contain" controls autoPlay />
                </div>
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={discardVideo}>
                  Discard and re-record
                </Button>
              </div>
            ) : isRecording ? (
              <div className="space-y-2">
                <div className="rounded-lg overflow-hidden bg-black aspect-video relative">
                  <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted playsInline />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    REC {formatTime(recordingTime)}
                  </div>
                </div>
                <Button type="button" variant="destructive" size="sm" className="w-full" onClick={stopRecording}>
                  <Square className="h-3.5 w-3.5 mr-1.5" />
                  Stop recording
                </Button>
              </div>
            ) : cameraReady ? (
              <div className="space-y-2">
                <div className="rounded-lg overflow-hidden bg-black aspect-video">
                  <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted playsInline />
                </div>
                <Button type="button" size="sm" className={`w-full ${PRIMARY_BTN}`} onClick={startRecording}>
                  <Mic className="h-3.5 w-3.5 mr-1.5" />
                  Start recording
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="w-full rounded-lg border border-dashed border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors p-6 text-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                aria-label="Enable camera to record video"
              >
                <Video className="h-7 w-7 text-gray-400 group-hover:text-gray-500 mx-auto mb-2 transition-colors" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-700">
                  Record a video
                </span>
                <span className="block text-xs text-muted-foreground mt-0.5">
                  Click to enable camera
                </span>
              </button>
            )}
          </div>

          {/* Submit — single clear primary action */}
          <Button
            type="submit"
            className={`w-full h-10 ${PRIMARY_BTN}`}
            disabled={submitting || !hasContent}
          >
            {submitting && <Spinner className="h-4 w-4 mr-1.5" />}
            {submitting ? "Submitting…" : "Submit testimonial"}
          </Button>
        </form>
      </main>
    </div>
  );
}
