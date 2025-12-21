"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Folder,
  Play,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Video,
  X,
  HardDrive,
  Trash2,
  Edit3,
  Save,
  FileText,
  Upload,
  File,
  Users,
  Globe,
  Link,
  Share2,
  Cpu,
  Database,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import { PersistentFileServer } from "@/utils/fileServer";

export default function DeviceFolderVideoManager() {
  const [folderHandle, setFolderHandle] = useState(null);
  const [videos, setVideos] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [folderPath, setFolderPath] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [hasWritePermission, setHasWritePermission] = useState(false);
  const [activeTabs, setActiveTabs] = useState(1);
  const [sharedUrls, setSharedUrls] = useState({});
  const [serverStatus, setServerStatus] = useState("offline");

  // Initialize file server
  useEffect(() => {
    const initFileServer = async () => {
      await PersistentFileServer.initialize();

      // Listen for cross-tab events
      const cleanupFolderGranted = PersistentFileServer.addListener(
        "folderGranted",
        (data) => {
          setActiveTabs((prev) => prev + 1);
          showNotification(
            `Folder accessed in another tab: ${data.folderName}`
          );
        }
      );

      const cleanupFileListRefreshed = PersistentFileServer.addListener(
        "fileListRefreshed",
        () => {
          refreshFiles();
          showNotification("File list refreshed from another tab");
        }
      );

      const cleanupFileDeleted = PersistentFileServer.addListener(
        "fileDeleted",
        (data) => {
          refreshFiles();
          showNotification(`"${data.fileName}" deleted in another tab`);
        }
      );

      return () => {
        cleanupFolderGranted();
        cleanupFileListRefreshed();
        cleanupFileDeleted();
      };
    };

    initFileServer();
  }, []);

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      const supported =
        typeof window !== "undefined" &&
        "showDirectoryPicker" in window &&
        "BroadcastChannel" in window &&
        "indexedDB" in window;

      setIsSupported(supported);

      if (supported) {
        // Try to restore previous session
        restoreSession();
      } else {
        setError(
          "Your browser doesn't support required features. Please use Chrome/Edge 86+."
        );
      }
    };

    checkSupport();
  }, []);

  // Restore previous session
  const restoreSession = async () => {
    try {
      setLoading(true);
      const handle = await PersistentFileServer.restoreFolderHandle();

      if (handle) {
        setFolderHandle(handle);
        setFolderPath(handle.name);
        setHasWritePermission(true);
        setServerStatus("online");

        // Load files
        await loadFilesFromFolder(handle);

        showNotification("Previous session restored successfully!");
      }
    } catch (err) {
      console.error("Failed to restore session:", err);
    } finally {
      setLoading(false);
    }
  };

  // Request permission to access device folder
  const selectDeviceFolder = async () => {
    if (!isSupported) {
      setError(
        "Your browser does not support required features. Please use Chrome/Edge 86+."
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Show folder picker with WRITE permission
      const dirHandle = await window.showDirectoryPicker({
        mode: "readwrite",
        startIn: "videos",
      });

      setFolderHandle(dirHandle);
      setFolderPath(dirHandle.name);
      setHasWritePermission(true);
      setServerStatus("online");

      // Store handle in persistent file server
      await PersistentFileServer.storeFolderHandle(dirHandle);

      // Load files from selected folder
      await loadFilesFromFolder(dirHandle);

      showNotification(
        "Folder access granted! Files are now shareable across routes."
      );

      setLoading(false);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Folder selection cancelled");
      } else {
        setError(`Error: ${err.message}`);
      }
      setLoading(false);
    }
  };

  // Load files from device folder
  const loadFilesFromFolder = async (dirHandle) => {
    try {
      setLoading(true);
      const files = await PersistentFileServer.getFileList();

      const videoFiles = [];
      const textFiles = [];

      for (const file of files) {
        if (file.isVideo) {
          videoFiles.push({
            ...file,
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fileType: "video",
          });
        } else if (file.isText) {
          textFiles.push({
            ...file,
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fileType: "text",
          });
        }
      }

      setVideos(videoFiles);
      setAllFiles([...videoFiles, ...textFiles]);
      setLoading(false);
    } catch (error) {
      console.error("Error loading files:", error);
      setError("Failed to load files from folder");
      setLoading(false);
    }
  };

  // Delete file from device folder
  const deleteFile = async (fileItem) => {
    if (
      !confirm(
        `Are you sure you want to delete "${fileItem.name}"? This will permanently delete the file from your device.`
      )
    ) {
      return;
    }

    try {
      await PersistentFileServer.deleteFile(fileItem.name);
      await refreshFiles();
      alert(`"${fileItem.name}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting file:", error);
      setError(`Failed to delete file: ${error.message}`);
    }
  };

  // Edit text file
  const editTextFile = async (fileItem) => {
    try {
      const fileData = await PersistentFileServer.getFileUrl(fileItem.name);
      const response = await fetch(fileData.url);
      const content = await response.text();

      setEditingFile(fileItem);
      setEditContent(content);

      // Cleanup blob URL
      URL.revokeObjectURL(fileData.url);
    } catch (error) {
      console.error("Error reading file:", error);
      setError(`Failed to read file: ${error.message}`);
    }
  };

  // Save edited text file
  const saveTextFile = async () => {
    if (!editingFile) return;

    try {
      // Create a new file with edited content
      const blob = new Blob([editContent], { type: "text/plain" });
      const file = new File([blob], editingFile.name, {
        type: "text/plain",
        lastModified: Date.now(),
      });

      await PersistentFileServer.uploadFiles([file]);

      alert(`"${editingFile.name}" saved successfully!`);

      setEditingFile(null);
      setEditContent("");

      await refreshFiles();
    } catch (error) {
      console.error("Error saving file:", error);
      setError(`Failed to save file: ${error.message}`);
    }
  };

  // Upload new files to folder
  const uploadFiles = async (files) => {
    try {
      setLoading(true);
      const uploaded = await PersistentFileServer.uploadFiles(
        Array.from(files)
      );

      setLoading(false);
      setShowUpload(false);

      if (uploaded.length > 0) {
        alert(`${uploaded.length} file(s) uploaded successfully!`);
        await refreshFiles();
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setError(`Failed to upload files: ${error.message}`);
      setLoading(false);
    }
  };

  // Refresh file list
  const refreshFiles = async () => {
    if (folderHandle) {
      await loadFilesFromFolder(folderHandle);
    }
  };

  // Play video
  const playVideo = async (video) => {
    try {
      const fileData = await PersistentFileServer.getFileUrl(video.name);

      setCurrentVideo({
        ...video,
        url: fileData.url,
      });
      setShowPlayer(true);
    } catch (error) {
      console.error("Error playing video:", error);
      setError(`Failed to play video: ${error.message}`);
    }
  };

  // Generate shareable URL for a file
  // Update the generateShareableUrl function
  const generateShareableUrl = async (fileItem) => {
    try {
      // Generate a unique token
      const token = btoa(`${Date.now()}-${Math.random()}-${fileItem.name}`)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      // Store the share link
      await SharedFileServer.storeShareLink(token, fileItem.name, 24);

      // Get file data and cache it
      const fileData = await PersistentFileServer.getFileUrl(
        fileItem.name,
        folderHandle
      );

      // Cache the file URL
      await SharedFileServer.cacheFileData(fileItem.name, {
        url: fileData.url,
        type: fileData.type,
        size: fileData.size,
      });

      const shareableUrl = `${window.location.origin}/shared/${token}`;

      setSharedUrls((prev) => ({
        ...prev,
        [fileItem.name]: {
          url: shareableUrl,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        },
      }));

      await navigator.clipboard.writeText(shareableUrl);

      showNotification(
        `Shareable URL copied to clipboard! Valid for 24 hours.`
      );
    } catch (error) {
      console.error("Error generating shareable URL:", error);
      setError(`Failed to generate shareable URL: ${error.message}`);
    }
  };

  // Close player and cleanup
  const closePlayer = () => {
    if (currentVideo && currentVideo.url) {
      URL.revokeObjectURL(currentVideo.url);
    }
    setShowPlayer(false);
    setCurrentVideo(null);
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get file icon
  const getFileIcon = (fileItem) => {
    if (fileItem.fileType === "video") {
      return <Video className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  // Show notification
  const showNotification = (message) => {
    // You can replace this with a proper notification system
    console.log("Notification:", message);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup blob URLs
      Object.values(sharedUrls).forEach((item) => {
        if (item.blobUrl) {
          URL.revokeObjectURL(item.blobUrl);
        }
      });

      // Cleanup file server
      PersistentFileServer.cleanup();
    };
  }, [sharedUrls]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Server className="w-10 h-10" />
            Persistent File Server
          </h1>
          <p className="text-purple-200">
            Access, edit, and share files across all routes with persistent
            storage
          </p>
        </div>

        {/* Server Status Banner */}
        <div className="mb-6">
          <div
            className={`backdrop-blur-lg rounded-lg p-4 border ${
              serverStatus === "online"
                ? "bg-green-500/20 border-green-500/50"
                : "bg-yellow-500/20 border-yellow-500/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    serverStatus === "online"
                      ? "bg-green-400 animate-pulse"
                      : "bg-yellow-400"
                  }`}
                />
                <div>
                  <h3 className="text-white font-bold">
                    Server Status:{" "}
                    <span
                      className={
                        serverStatus === "online"
                          ? "text-green-300"
                          : "text-yellow-300"
                      }
                    >
                      {serverStatus.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-sm text-purple-200">
                    {serverStatus === "online"
                      ? "Files are being served across all routes"
                      : "Select a folder to start the file server"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-purple-200">
                  <Users className="w-4 h-4" />
                  <span>
                    {activeTabs} active tab{activeTabs !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-purple-200">
                  <Database className="w-4 h-4" />
                  <span>{allFiles.length} files</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-purple-200">
                  <Shield className="w-4 h-4" />
                  <span>Persistent</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Browser Support Warning */}
        {!isSupported && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-300 flex-shrink-0" />
              <div>
                <h3 className="text-red-300 font-bold text-lg mb-2">
                  Browser Compatibility Required
                </h3>
                <p className="text-red-200 mb-3">
                  This app requires modern browser features:
                </p>
                <ul className="text-red-200 space-y-1">
                  <li>• File System Access API (Chrome/Edge 86+)</li>
                  <li>• BroadcastChannel API</li>
                  <li>• IndexedDB</li>
                  <li>• Persistent Storage API</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Folder Selection */}
        {isSupported && !folderHandle && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6 border border-white/20 text-center">
            <Globe className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              Start Persistent File Server
            </h2>
            <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
              Select a folder on your device to create a mini file server. Once
              granted, files will be accessible across all routes in your app
              and persist between sessions.
            </p>

            <button
              onClick={selectDeviceFolder}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 mx-auto transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <Zap className="w-6 h-6" />
              {loading ? "Starting Server..." : "Start File Server"}
            </button>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="w-5 h-5 text-green-400" />
                  <h4 className="text-white font-bold">Cross-Route Access</h4>
                </div>
                <p className="text-sm text-purple-200">
                  Access files from any route in your application using
                  shareable URLs
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  <h4 className="text-white font-bold">Session Persistence</h4>
                </div>
                <p className="text-sm text-purple-200">
                  File access persists between browser sessions and app reloads
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-white font-bold">Multi-Tab Sync</h4>
                </div>
                <p className="text-sm text-purple-200">
                  Real-time synchronization across all open tabs of your
                  application
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-300" />
            <span className="text-red-200">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-300 hover:text-red-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Connected Folder Info */}
        {folderHandle && (
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-lg p-6 mb-6 border border-purple-400/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Cpu className="w-8 h-8 text-green-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                </div>
                <div>
                  <p className="text-white font-semibold">File Server Active</p>
                  <p className="text-purple-200 font-mono text-sm bg-black/30 px-2 py-1 rounded mt-1">
                    {folderPath}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-green-300 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Persistent Storage
                    </span>
                    <span className="text-blue-300 flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Cross-Route Enabled
                    </span>
                    <span className="text-yellow-300 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {activeTabs} tab{activeTabs !== 1 ? "s" : ""} synced
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowUpload(true)}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:scale-105"
                >
                  <Upload className="w-4 h-4" />
                  Upload Files
                </button>
                <button
                  onClick={refreshFiles}
                  disabled={loading}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:scale-105 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
                <button
                  onClick={selectDeviceFolder}
                  className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:scale-105"
                >
                  <Folder className="w-4 h-4" />
                  Change Folder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {folderHandle && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-6 h-6" />
                Server Files ({allFiles.length})
              </h2>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-purple-200">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Accessible across routes</span>
                </div>
                <div className="flex items-center gap-2 text-purple-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span>Persistent between sessions</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
                <p className="text-white text-lg">
                  Synchronizing with file server...
                </p>
              </div>
            ) : allFiles.length === 0 ? (
              <div className="text-center py-12">
                <Server className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60 text-lg">
                  No files in server folder
                </p>
                <p className="text-white/40 text-sm">
                  Upload files to make them available across all routes
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {allFiles.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="group bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-400/50 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`p-2 rounded-lg ${
                          fileItem.fileType === "video"
                            ? "bg-purple-500/20"
                            : "bg-blue-500/20"
                        }`}
                      >
                        {getFileIcon(fileItem)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {fileItem.name}
                        </h3>
                        <div className="text-sm text-purple-200 flex gap-4 flex-wrap">
                          <span>{formatSize(fileItem.size)}</span>
                          <span>{formatDate(fileItem.lastModified)}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              fileItem.fileType === "video"
                                ? "bg-purple-500/30 text-purple-200"
                                : "bg-blue-500/30 text-blue-200"
                            }`}
                          >
                            {fileItem.fileType.toUpperCase()}
                          </span>
                          {sharedUrls[fileItem.name] && (
                            <span className="text-green-300 flex items-center gap-1">
                              <Link className="w-3 h-3" />
                              Shareable URL active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {fileItem.fileType === "video" ? (
                        <>
                          <button
                            onClick={() => playVideo(fileItem)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:scale-105"
                          >
                            <Play className="w-4 h-4" />
                            Play
                          </button>
                          <button
                            onClick={() => generateShareableUrl(fileItem)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:scale-105"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => editTextFile(fileItem)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:scale-105"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => generateShareableUrl(fileItem)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:scale-105"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteFile(fileItem)}
                        className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white px-4 py-2 rounded-lg transition-colors hover:scale-105 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {showPlayer && currentVideo && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl">
            <div className="absolute -top-12 right-0 flex gap-2">
              <button
                onClick={closePlayer}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium transition-all hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={closePlayer}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all group hover:scale-105"
              >
                <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
              <video
                src={currentVideo.url}
                controls
                autoPlay
                className="w-full aspect-video"
              >
                Your browser does not support the video tag.
              </video>

              <div className="bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-2xl font-bold">
                    {currentVideo.name}
                  </h3>
                  <button
                    onClick={() => generateShareableUrl(currentVideo)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Get Shareable URL
                  </button>
                </div>
                <div className="flex gap-6 text-sm text-purple-200">
                  <span>Size: {formatSize(currentVideo.size)}</span>
                  <span>Modified: {formatDate(currentVideo.lastModified)}</span>
                  <span className="font-mono text-purple-300">
                    {folderPath}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text Editor Modal */}
      {editingFile && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col">
            <button
              onClick={() => {
                setEditingFile(null);
                setEditContent("");
              }}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all group hover:scale-105"
            >
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
            </button>

            <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-full">
              <div className="bg-slate-700 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white text-xl font-bold">
                    {editingFile.name}
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {formatSize(editingFile.size)} •{" "}
                    {formatDate(editingFile.lastModified)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveTextFile}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors hover:scale-105"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => generateShareableUrl(editingFile)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:scale-105"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 bg-slate-900 text-white p-6 font-mono text-sm resize-none focus:outline-none min-h-[500px]"
                placeholder="File content..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all group hover:scale-105"
            >
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
            </button>

            <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Upload Files to Server
              </h2>

              <div className="border-2 border-dashed border-purple-400/50 rounded-lg p-12 text-center hover:border-purple-400 transition-colors hover:scale-[1.02]">
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      uploadFiles(Array.from(e.target.files));
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <Upload className="w-16 h-16 text-purple-400" />
                  <div>
                    <p className="text-white text-lg font-semibold mb-2">
                      Click to select files
                    </p>
                    <p className="text-purple-200 text-sm">
                      Files will be added to the server and accessible across
                      all routes
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-purple-300 flex-shrink-0" />
                  <div>
                    <p className="text-purple-200 text-sm font-semibold mb-1">
                      Server Distribution
                    </p>
                    <p className="text-purple-300 text-sm">
                      Uploaded files will be immediately available across all
                      routes and synchronized with other open tabs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
