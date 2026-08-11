"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, Star, Video, Mic, Square, Send, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
    } catch {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to record video",
        variant: "destructive",
      });
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
    if (!cameraReady) {
      await startCamera();
    }

    chunksRef.current = [];

    setTimeout(() => {
      if (!streamRef.current) return;

      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp9",
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoPreview(url);
        setRecordingTime(0);
        stopCamera();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }, 300);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const discardVideo = () => {
    setRecordedBlob(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setRecordingTime(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    if (!textContent.trim() && !recordedBlob) {
      toast({ title: "Please add text or a video", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      let videoUrl: string | null = null;

      if (recordedBlob) {
        const formData = new FormData();
        formData.append("video", recordedBlob, "video.webm");
        formData.append("spaceId", spaceId);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          videoUrl = uploadData.videoUrl;
        }
      }

      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId,
          customerName,
          customerTitle,
          customerCompany,
          rating: rating || null,
          textContent,
          videoUrl,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast({ title: "Thank you!", description: "Your testimonial has been submitted for review." });
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Submission failed", variant: "destructive" });
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
          <p className="text-muted-foreground mb-6">
            Your testimonial has been submitted and is awaiting approval.
          </p>
          <Button
            variant="outline"
            onClick={() => setView({ page: "wall", slug })}
          >
            View Wall of Love
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView({ page: "wall", slug })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Heart className="h-5 w-5 text-emerald-500 fill-emerald-500" />
          <span className="font-semibold">{spaceName || "Kudos"}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            {headline || "Share your experience"}
          </h1>
          <p className="text-muted-foreground text-lg">
            Your feedback means the world to us
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="text-center">
            <Label className="text-sm font-medium mb-3 block">How would you rate us?</Label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      i <= rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200 hover:text-amber-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Name, Title, Company */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                placeholder="Jane Smith"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Product Manager"
                value={customerTitle}
                onChange={(e) => setCustomerTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Acme Inc"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Text */}
          <div>
            <Label htmlFor="text">Your Testimonial</Label>
            <Textarea
              id="text"
              placeholder="Tell us about your experience..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="mt-1.5 min-h-[120px]"
            />
          </div>

          {/* Video Recording */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Record a Video Testimonial
            </Label>

            {videoPreview ? (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden bg-black aspect-video">
                  <video
                    src={videoPreview}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={discardVideo}
                  >
                    Discard & Re-record
                  </Button>
                </div>
              </div>
            ) : isRecording ? (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    autoPlay
                    muted
                    playsInline
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    REC {formatTime(recordingTime)}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  onClick={stopRecording}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              </div>
            ) : cameraReady ? (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden bg-black aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    autoPlay
                    muted
                    playsInline
                  />
                </div>
                <Button
                  type="button"
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                  onClick={startRecording}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="w-full rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all p-8 text-center group"
              >
                <Video className="h-10 w-10 text-emerald-400 group-hover:text-emerald-500 mx-auto mb-3 transition-colors" />
                <p className="font-medium text-emerald-700 text-lg">
                  Record Video
                </p>
                <p className="text-sm text-emerald-500 mt-1">
                  Click to enable camera & start recording
                </p>
              </button>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-base"
            disabled={submitting || (!textContent.trim() && !recordedBlob)}
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Testimonial
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
