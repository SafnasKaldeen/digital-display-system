// components/VideoUploader.tsx
import React, { useState, useEffect, useRef } from "react";
import { Upload, Video as VideoIcon, X, Play, Loader2 } from "lucide-react";

interface VideoUploaderProps {
  videoUrl: string;
  onChange: (url: string) => void;
  userId?: string;
  displayId?: string;
  environment?: "preview" | "production";
}

export function VideoUploader({
  videoUrl,
  onChange,
  userId,
  displayId = "1",
  environment = "preview",
}: VideoUploaderProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadMethod, setUploadMethod] = useState<string>("");
  const [mediaUploadedVideos, setMediaUploadedVideos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch uploaded videos from media library
  useEffect(() => {
    const fetchVideos = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/media?userId=${userId}&fileType=video`
        );
        if (!response.ok) {
          console.error("Failed to fetch videos:", await response.text());
          return;
        }

        const allMedia = await response.json();

        console.log("Fetched videos:", allMedia.length);

        // Filter for videos of type "advertisement" AND fileType "video"
        const filteredVideos = allMedia
          .filter((item: any) => {
            const isCorrectType = item.type === "advertisement";
            const isVideo = item.fileType === "video";
            console.log("Video item:", {
              url: item.fileUrl,
              type: item.type,
              fileType: item.fileType,
              matches: isCorrectType && isVideo,
            });
            return isCorrectType && isVideo;
          })
          .map((item: any) => item.fileUrl);

        console.log(
          "Filtered videos for advertisement:",
          filteredVideos.length
        );
        setMediaUploadedVideos(filteredVideos);
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchVideos();
    }
  }, [userId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!userId) {
      setUploadError("User ID is required for upload");
      return;
    }

    if (!displayId) {
      setUploadError("Display ID is required for upload");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    setUploadMethod("");

    try {
      const file = files[0];

      // Validate video file
      if (!file.type.startsWith("video/")) {
        throw new Error("Please select a video file (MP4, WebM, etc.)");
      }

      // Check file size (max 500MB for direct upload)
      if (file.size > 500 * 1024 * 1024) {
        throw new Error("Video file is too large (maximum 500MB)");
      }

      // Get video duration
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";

      await new Promise<void>((resolve, reject) => {
        videoElement.onloadedmetadata = () => {
          window.URL.revokeObjectURL(videoElement.src);
          if (videoElement.duration > 300) {
            // 5 minutes
            reject(new Error("Video is too long (maximum 5 minutes)"));
          } else {
            resolve();
          }
        };

        videoElement.onerror = () => {
          reject(new Error("Could not load video file"));
        };

        videoElement.src = URL.createObjectURL(file);
      });

      // Upload video with automatic fallback
      await uploadVideoWithFallback(file);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadMethod("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const uploadVideoWithFallback = async (file: File) => {
    const fileSize = file.size / 1024 / 1024; // Size in MB

    // If file is larger than 10MB, go directly to Cloudinary
    if (fileSize > 10) {
      console.log(`📦 File is ${fileSize.toFixed(2)}MB, using direct upload`);
      setUploadMethod("Direct to Cloudinary (large file)");
      await uploadDirectToCloudinary(file);
      return;
    }

    // Try server upload first for smaller files
    try {
      setUploadMethod("Uploading via server...");
      await uploadViaServer(file);
    } catch (error: any) {
      console.warn("Server upload failed, trying direct upload:", error);

      // Check if error indicates we should use direct upload
      if (
        error.message.includes("too large") ||
        error.message.includes("413") ||
        error.message.includes("body") ||
        error.message.includes("multipart")
      ) {
        setUploadMethod("Direct to Cloudinary (fallback)");
        setUploadProgress(0);
        await uploadDirectToCloudinary(file);
      } else {
        throw error;
      }
    }
  };

  const uploadViaServer = async (file: File) => {
    const formData = new FormData();
    formData.append("images", file);
    formData.append("userId", userId!);
    formData.append("displayId", displayId);
    formData.append("type", "advertisement");
    formData.append("environment", environment);

    const response = await fetch("/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    // Check if server suggests using direct upload
    if (!response.ok && (data.useDirectUpload || response.status === 413)) {
      throw new Error("File too large for server upload");
    }

    if (!response.ok) {
      throw new Error(data.error || "Video upload failed");
    }

    if (data.urls && data.urls.length > 0) {
      onChange(data.urls[0]);
      await refreshVideoLibrary();
    } else if (data.url) {
      onChange(data.url);
      await refreshVideoLibrary();
    } else {
      throw new Error("No URL returned from upload");
    }
  };

  const uploadDirectToCloudinary = async (file: File) => {
    // Step 1: Get signature from API
    const signatureResponse = await fetch(
      `/api/media/upload?userId=${userId}&displayId=${displayId}&type=advertisement&isVideo=true`
    );

    if (!signatureResponse.ok) {
      throw new Error("Failed to get upload signature");
    }

    const { signature, timestamp, folder, cloudName, apiKey } =
      await signatureResponse.json();

    // Step 2: Upload directly to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp.toString());
    formData.append("folder", folder);
    formData.append("api_key", apiKey);
    formData.append("resource_type", "video");

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", async () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          console.log("✓ Direct upload successful:", result.secure_url);

          onChange(result.secure_url);
          await refreshVideoLibrary();
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload aborted"));
      });

      xhr.open("POST", cloudinaryUrl);
      xhr.send(formData);
    });
  };

  const refreshVideoLibrary = async () => {
    if (!userId) return;

    try {
      const videosResponse = await fetch(
        `/api/media?userId=${userId}&fileType=video`
      );
      if (videosResponse.ok) {
        const allMedia = await videosResponse.json();
        const newVideos = allMedia
          .filter(
            (item: any) =>
              item.type === "advertisement" && item.fileType === "video"
          )
          .map((item: any) => item.fileUrl);
        setMediaUploadedVideos(newVideos);
      }
    } catch (error) {
      console.error("Failed to refresh video library:", error);
    }
  };

  const handleRemoveVideo = () => {
    onChange("");
    setPreviewUrl(null);
  };

  const handleVideoClick = (url: string) => {
    onChange(url);
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
  };

  const supportedFormats = ".mp4,.webm,.ogg,.mov,.avi,.m4v";

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={supportedFormats}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !userId || !displayId}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-blue-600 rounded-lg hover:border-blue-500 hover:bg-blue-700/30 text-blue-400 hover:text-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">
            {isUploading ? "Uploading..." : "Upload Video"}
          </span>
        </button>
        <p className="text-xs text-slate-500 mt-2 text-center">
          Supported: MP4, WebM, OGG, MOV, AVI (max 500MB, 5 minutes)
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-400">{uploadMethod}</span>
            <span className="text-blue-400 font-medium">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{uploadError}</p>
        </div>
      )}

      {/* Selected Video */}
      {videoUrl && (
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-2">
            Currently Selected Video
          </label>
          <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300 truncate">
                  {videoUrl.split("/").pop() || "Selected video"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePreview(videoUrl)}
                  className="p-1.5 bg-slate-700 rounded hover:bg-slate-600"
                  title="Preview video"
                >
                  <Play className="w-3 h-3 text-slate-300" />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="p-1.5 bg-red-500/20 rounded hover:bg-red-500/30"
                  title="Remove video"
                >
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>

            <div className="relative aspect-video bg-slate-900 rounded overflow-hidden">
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                controls={false}
                muted
                onMouseEnter={(e) => {
                  const video = e.currentTarget as HTMLVideoElement;
                  video.play().catch(console.error);
                }}
                onMouseLeave={(e) => {
                  const video = e.currentTarget as HTMLVideoElement;
                  video.pause();
                  video.currentTime = 0;
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-3 bg-black/50 rounded-full">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Hover to preview • Click play button for fullscreen
            </p>
          </div>
        </div>
      )}

      {/* Video Library */}
      {(isLoading || mediaUploadedVideos.length > 0) && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-blue-400">
                Video Library ({mediaUploadedVideos.length})
              </span>
            </label>
          </div>

          {isLoading ? (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent"></div>
              <p className="text-xs text-slate-400 mt-2">
                Loading video library...
              </p>
            </div>
          ) : mediaUploadedVideos.length === 0 ? (
            <div className="text-center py-6 bg-slate-800 rounded-lg border border-slate-700">
              <VideoIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                No advertisement videos yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
              {mediaUploadedVideos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group cursor-pointer"
                  onClick={() => handleVideoClick(url)}
                >
                  <div className="relative aspect-video bg-slate-900 rounded border-2 transition-colors overflow-hidden">
                    <video
                      src={url}
                      className={`w-full h-full object-cover ${
                        videoUrl === url
                          ? "opacity-100"
                          : "opacity-90 group-hover:opacity-100"
                      }`}
                      controls={false}
                      muted
                      onMouseEnter={(e) => {
                        const video = e.currentTarget as HTMLVideoElement;
                        video.play().catch(console.error);
                      }}
                      onMouseLeave={(e) => {
                        const video = e.currentTarget as HTMLVideoElement;
                        video.pause();
                        video.currentTime = 0;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-2 bg-black/50 rounded-full">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div
                      className={`absolute inset-0 border-2 rounded transition-colors ${
                        videoUrl === url
                          ? "border-blue-500"
                          : "border-slate-600 group-hover:border-blue-400"
                      }`}
                    />
                  </div>
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Video {idx + 1}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {videoUrl === url ? "✓ Selected" : "Click to use"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Video Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Video Preview</h3>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="p-2 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            <div className="p-2">
              <video
                src={previewUrl}
                className="w-full rounded-lg"
                controls
                autoPlay
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}

export default VideoUploader;
