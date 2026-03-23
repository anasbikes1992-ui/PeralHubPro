import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/store/useStore";
import { Loader2, X, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Security constants ─────────────────────────────────────
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_FILE_SIZE_MB   = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function validateImageFile(file: File): string | null {
  // Check MIME type (not just the extension — extension can be spoofed)
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return `"${file.name}" is not allowed. Only JPG, PNG, WEBP, and GIF images are accepted.`;
  }
  // Double-check extension
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `"${file.name}" has an unsupported extension.`;
  }
  // Size guard
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`;
  }
  // Basic filename sanitation — reject path traversal characters
  if (/[/<>:"\\|?*\x00-\x1F]/.test(file.name)) {
    return `"${file.name}" contains invalid characters.`;
  }
  return null;
}

interface ImageUploadProps {
  bucket: "listings" | "avatars";
  maxFiles?: number;
  onUpload: (urls: string[]) => void;
  existingUrls?: string[];
  className?: string;
  label?: string;
  circular?: boolean;
}

const ImageUpload = ({
  bucket,
  maxFiles = 5,
  onUpload,
  existingUrls = [],
  className = "",
  label = "Upload Photos",
  circular = false,
}: ImageUploadProps) => {
  const { currentUser, showToast } = useStore();
  const [previews, setPreviews]   = useState<string[]>(existingUrls);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [dragOver, setDragOver]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!currentUser) {
      showToast("Authentication required for upload.", "error");
      return;
    }

    const remaining = maxFiles - previews.length;
    if (remaining <= 0) {
      showToast(`Maximum of ${maxFiles} images allowed.`, "warning");
      return;
    }

    // ── Validate each file before uploading ─────────────────
    const validated: File[] = [];
    for (const file of files.slice(0, remaining)) {
      const error = validateImageFile(file);
      if (error) {
        showToast(error, "error");
        return; // Stop on first invalid file
      }
      validated.push(file);
    }

    if (validated.length === 0) return;

    setUploading(true);
    setProgress(0);
    const newUrls: string[] = [];

    for (let i = 0; i < validated.length; i++) {
      const file = validated[i];
      // Generate a safe, random path — never trust user filename for the storage path
      const safeExt = file.type.split("/")[1].replace("jpeg", "jpg");
      const path = `${currentUser.id}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false, contentType: file.type });

      if (error) {
        showToast(`Upload failed for image ${i + 1}: ${error.message}`, "error");
        console.error("Upload error:", error);
        continue;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
      setProgress(Math.round(((i + 1) / validated.length) * 100));
    }

    if (newUrls.length > 0) {
      const updated = [...previews, ...newUrls];
      setPreviews(updated);
      onUpload(updated);
      showToast(`${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded.`, "success");
    }

    setUploading(false);
    setProgress(0);
  }, [currentUser, bucket, maxFiles, previews, onUpload, showToast]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(Array.from(e.target.files));
    // Reset input so the same file can be re-selected after removal
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) uploadFiles(Array.from(e.dataTransfer.files));
  };

  const removeImage = (idx: number) => {
    const updated = previews.filter((_, i) => i !== idx);
    setPreviews(updated);
    onUpload(updated);
  };

  if (circular) {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <div
          onClick={() => inputRef.current?.click()}
          className="w-24 h-24 rounded-full border-2 border-dashed border-white/10 hover:border-primary/50 cursor-pointer overflow-hidden flex items-center justify-center bg-white/5 transition-all relative group shadow-2xl"
        >
          {previews.length > 0 ? (
            <img src={previews[0]} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Plus size={20} className="text-primary/60" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-primary mb-1" size={16} />
              <span className="text-[10px] font-black">{progress}%</span>
            </div>
          )}
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} className="text-[10px] text-mist font-black uppercase tracking-widest hover:text-primary transition-colors">
          {previews.length > 0 ? "Change Photo" : "Upload Photo"}
        </button>
        <p className="text-[10px] text-mist/50 text-center">JPG, PNG, WEBP · Max {MAX_FILE_SIZE_MB}MB</p>
        <input ref={inputRef} type="file" accept={ALLOWED_MIME_TYPES.join(",")} onChange={handleFiles} className="hidden" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">{label}</label>
        <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] font-black px-2 py-0.5">
          {previews.length} / {maxFiles}
        </Badge>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => previews.length < maxFiles && !uploading && inputRef.current?.click()}
        className={`relative h-32 border-2 border-dashed rounded-[1.5rem] bg-white/[0.02] flex flex-col items-center justify-center transition-all duration-300 group overflow-hidden ${
          dragOver ? "border-primary bg-primary/5 scale-[0.98]" : "border-white/10 hover:border-primary/30"
        } ${previews.length >= maxFiles || uploading ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-primary animate-pulse">Uploading… {progress}%</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 group-hover:translate-y-[-2px] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-mist group-hover:text-primary transition-colors">
              <Upload size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-mist/60 group-hover:text-mist transition-colors">
              Drop Images or Browse
            </span>
            <span className="text-[9px] text-mist/30">JPG, PNG, WEBP, GIF · Max {MAX_FILE_SIZE_MB} MB each</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(",")}
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {previews.length > 0 && (
        <div className="flex gap-3 mt-6 flex-wrap">
          {previews.map((url, i) => (
            <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 group shadow-lg hover:border-primary/50 transition-all duration-300">
              <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                  className="w-8 h-8 rounded-full bg-destructive/90 text-white flex items-center justify-center hover:bg-destructive transition-colors backdrop-blur-sm"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
          {previews.length < maxFiles && !uploading && (
            <div
              onClick={() => inputRef.current?.click()}
              className="w-20 h-20 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center text-mist/40 hover:text-primary/60 hover:border-primary/20 cursor-pointer transition-all"
            >
              <Plus size={20} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
