// components/customization/image-uploader.tsx
"use client";

import type React from "react";
import { Card } from "@/components/ui/card";
import { Upload, X, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Check max images limit
    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const filesArray = Array.from(files);
    const uploadedUrls: string[] = [];

    try {
      for (const file of filesArray) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid file",
            description: `${file.name} is not an image`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 5MB limit`,
            variant: "destructive",
          });
          continue;
        }

        // Upload to API
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          // Check if response is JSON
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error(
              "Server returned invalid response. API route may not exist."
            );
          }

          if (!response.ok) {
            const error = await response.json();
            throw new Error(
              error.error || `Upload failed with status ${response.status}`
            );
          }

          const data = await response.json();
          uploadedUrls.push(data.url);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast({
            title: "Upload failed",
            description:
              error instanceof Error
                ? error.message
                : `Failed to upload ${file.name}`,
            variant: "destructive",
          });
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
        toast({
          title: "Upload successful",
          description: `${uploadedUrls.length} image(s) uploaded`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
    toast({
      title: "Image removed",
      description: "Image has been removed",
    });
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50"
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary animate-spin" />
            <p className="font-medium text-foreground">Uploading images...</p>
            <p className="text-sm text-muted-foreground">Please wait</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium text-foreground">
              Drag and drop images here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to select files • Max {maxImages} images • 5MB per image
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <Card
              key={index}
              className="relative overflow-hidden group aspect-video"
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
                type="button"
              >
                <div className="flex flex-col items-center gap-1">
                  <X className="w-6 h-6 text-white" />
                  <span className="text-xs text-white">Remove</span>
                </div>
              </button>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No images uploaded yet
        </p>
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {images.length} / {maxImages} images
        </p>
      )}
    </div>
  );
}
