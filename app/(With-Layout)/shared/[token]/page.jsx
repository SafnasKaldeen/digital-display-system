// Shared File Page - app/(With-Layout)/shared/[token]/page.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  File,
  Video,
  ArrowLeft,
  Download,
  AlertCircle,
  X,
  Home,
  Share2,
  FileText,
  Image as ImageIcon,
  Music,
  Globe,
  Cpu,
} from "lucide-react";
import SharedFileServer from "@/utils/fileServer";
import VideoPlayer from "@/components/VideoPlayer";

// File access bridge - communicates with main app
class FileAccessBridge {
  static async getFileFromMainApp(fileName) {
    // Try to get file from main app via postMessage
    return new Promise((resolve, reject) => {
      if ((!window.opener && !window.parent) || window.parent === window) {
        reject(new Error("No parent window found"));
        return;
      }

      const channel = new MessageChannel();
      const timeout = setTimeout(() => {
        reject(new Error("Request timeout"));
      }, 5000);

      channel.port1.onmessage = (event) => {
        clearTimeout(timeout);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
        channel.port1.close();
      };

      window.parent.postMessage(
        {
          type: "REQUEST_FILE",
          fileName: fileName,
          port: channel.port2,
        },
        "*",
        [channel.port2]
      );
    });
  }

  static async getFileDirect(fileName) {
    // Try to get from localStorage cache
    const cached = await SharedFileServer.getCachedFile(fileName);
    if (cached) {
      return cached;
    }

    // Try to get from main app
    try {
      const fileData = await this.getFileFromMainApp(fileName);
      await SharedFileServer.cacheFileData(fileName, fileData);
      return fileData;
    } catch (error) {
      console.error("Failed to get file from main app:", error);
      throw error;
    }
  }
}

export default function SharedFilePage() {
  const params = useParams();
  const router = useRouter();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Clean up expired data on mount
    SharedFileServer.cleanupExpired();

    // Listen for messages from main app
    const handleMessage = (event) => {
      if (event.data.type === "SEND_FILE") {
        if (event.data.fileName === fileName) {
          setFileContent(event.data);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [fileName]);

  useEffect(() => {
    const loadSharedFile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get file name from token
        const file = await SharedFileServer.getFileNameFromToken(params.token);
        setFileName(file);

        // Try to get file data
        try {
          const data = await FileAccessBridge.getFileDirect(file);
          setFileContent(data);
        } catch (bridgeError) {
          console.log("Bridge failed, trying alternative methods...");

          // Alternative: Check if we can create a blob URL from localStorage
          const allItems = { ...localStorage };
          for (const [key, value] of Object.entries(allItems)) {
            if (key.startsWith("filecache_")) {
              try {
                const cacheData = JSON.parse(value);
                if (cacheData.fileName === file) {
                  setFileContent({
                    url: cacheData.url,
                    type: cacheData.type,
                    size: cacheData.size,
                  });
                  break;
                }
              } catch (e) {
                // Invalid JSON, skip
              }
            }
          }

          if (!fileContent) {
            throw new Error(
              "File not available. Please open it from the main File Manager."
            );
          }
        }

        setFileData({
          name: file,
          type: getFileType(file),
          extension: file.split(".").pop().toLowerCase(),
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to load shared file:", err);
        setError(err.message || "File not found or access expired");
        setLoading(false);
      }
    };

    loadSharedFile();
  }, [params.token]);

  const getFileType = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    const videoExts = ["mp4", "webm", "mov", "avi", "mkv", "m4v"];
    const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const audioExts = ["mp3", "wav", "ogg", "flac", "m4a"];
    const textExts = [
      "txt",
      "json",
      "md",
      "csv",
      "log",
      "js",
      "jsx",
      "ts",
      "tsx",
      "html",
      "css",
    ];

    if (videoExts.includes(ext)) return "video";
    if (imageExts.includes(ext)) return "image";
    if (audioExts.includes(ext)) return "audio";
    if (textExts.includes(ext)) return "text";
    return "document";
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="w-8 h-8" />;
      case "image":
        return <ImageIcon className="w-8 h-8" />;
      case "audio":
        return <Music className="w-8 h-8" />;
      case "text":
        return <FileText className="w-8 h-8" />;
      default:
        return <File className="w-8 h-8" />;
    }
  };

  const handleDownload = () => {
    if (fileContent && fileContent.url) {
      const link = document.createElement("a");
      link.href = fileContent.url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  };

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block">
            <Cpu className="w-16 h-16 text-purple-400 animate-pulse mb-4" />
            <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Loading File Server
          </h2>
          <p className="text-purple-200">Retrieving shared file...</p>
        </div>
      </div>
    );
  }

  if (error || !fileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md border border-white/20">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            File Unavailable
          </h2>
          <p className="text-purple-200 text-center mb-6">
            {error || "File could not be loaded"}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-5 h-5" />
              Back to File Manager
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isVideo = fileData.type === "video";
  const isImage = fileData.type === "image";
  const isAudio = fileData.type === "audio";
  const isText = fileData.type === "text";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/")}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to File Manager
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <Globe className="w-4 h-4" />
                <span>Shared File Server</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    isVideo
                      ? "bg-purple-500/20"
                      : isImage
                      ? "bg-green-500/20"
                      : isAudio
                      ? "bg-blue-500/20"
                      : "bg-slate-500/20"
                  }`}
                >
                  {getFileIcon(fileData.type)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white truncate max-w-2xl">
                    {fileData.name}
                  </h1>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isVideo
                          ? "bg-purple-500/30 text-purple-200"
                          : isImage
                          ? "bg-green-500/30 text-green-200"
                          : isAudio
                          ? "bg-blue-500/30 text-blue-200"
                          : "bg-slate-500/30 text-slate-200"
                      }`}
                    >
                      {fileData.extension.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-white/10 text-white text-sm rounded-full">
                      {formatSize(fileContent?.size)}
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      Server Connected
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  disabled={!fileContent?.url}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleShare}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* File Preview/Player */}
        <div className="bg-black/50 rounded-2xl overflow-hidden mb-8">
          {fileContent?.url ? (
            isVideo ? (
              <div className="relative">
                <VideoPlayer
                  src={fileContent.url}
                  fileName={fileData.name}
                  onClose={() => router.push("/")}
                  onDownload={handleDownload}
                  onShare={handleShare}
                />
              </div>
            ) : isImage ? (
              <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <img
                  src={fileContent.url}
                  alt={fileData.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%232d3748"/><text x="50%" y="50%" font-family="Arial" font-size="20" fill="%239f7aea" text-anchor="middle" dy=".3em">Image preview not available</text></svg>`;
                  }}
                />
              </div>
            ) : isAudio ? (
              <div className="p-12 text-center">
                <Music className="w-32 h-32 text-blue-400 mx-auto mb-6" />
                <div className="max-w-md mx-auto">
                  <audio
                    ref={videoRef}
                    src={fileContent.url}
                    controls
                    className="w-full"
                  />
                </div>
              </div>
            ) : isText ? (
              <div className="p-6">
                <div className="bg-slate-900 rounded-lg p-6 min-h-[60vh]">
                  <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                    {fileContent.text ||
                      "Text content will appear here when loaded..."}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <File className="w-32 h-32 text-slate-400 mx-auto mb-6" />
                <p className="text-white text-xl mb-4">File Preview</p>
                <p className="text-purple-200">
                  This file type ({fileData.extension}) doesn't have an inline
                  preview. Use the download button to access the file.
                </p>
              </div>
            )
          ) : (
            <div className="p-12 text-center">
              <div className="inline-block p-6 bg-white/5 rounded-2xl">
                <Globe className="w-24 h-24 text-purple-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-white text-xl font-bold mb-2">
                  Connecting to File Server
                </h3>
                <p className="text-purple-200 mb-6">
                  The file server is not currently active.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Open in File Manager
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-300">File Server Active</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="text-sm text-purple-300">
              Share link expires in 24 hours
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="text-sm text-blue-300">
              Token: {params.token.substring(0, 8)}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
