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
} from "lucide-react";

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

  // Check browser support (only on client side)
  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" && "showDirectoryPicker" in window
    );
  }, []);

  // Request permission to access device folder with WRITE access
  const selectDeviceFolder = async () => {
    if (!isSupported) {
      setError(
        "Your browser does not support File System Access API. Please use Chrome or Edge."
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Show folder picker with WRITE permission
      const dirHandle = await window.showDirectoryPicker({
        mode: "readwrite", // Request write permission
        startIn: "videos",
      });

      setFolderHandle(dirHandle);
      setFolderPath(dirHandle.name);
      setHasWritePermission(true);

      // Save handle to IndexedDB for persistence
      await saveHandleToIndexedDB(dirHandle);

      // Load all files from selected folder
      await loadFilesFromFolder(dirHandle);

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

  // Save folder handle to IndexedDB for persistence
  const saveHandleToIndexedDB = async (handle) => {
    try {
      const db = await openDB();
      const tx = db.transaction("handles", "readwrite");
      await tx.objectStore("handles").put(handle, "videoFolder");
    } catch (error) {
      console.error("Failed to save handle:", error);
    }
  };

  // Load folder handle from IndexedDB
  const loadHandleFromIndexedDB = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction("handles", "readonly");
      const handle = await tx.objectStore("handles").get("videoFolder");

      if (handle) {
        // Verify the handle is still valid
        try {
          await handle.queryPermission({ mode: "read" });
        } catch (e) {
          // Handle is no longer valid, clear it
          console.error("Stored handle is invalid:", e);
          const clearTx = db.transaction("handles", "readwrite");
          await clearTx.objectStore("handles").delete("videoFolder");
          return;
        }

        // Check if we already have write permission
        let permission = await handle.queryPermission({ mode: "readwrite" });

        // If permission is already granted, use it without prompting
        if (permission === "granted") {
          setFolderHandle(handle);
          setFolderPath(handle.name);
          setHasWritePermission(true);
          await loadFilesFromFolder(handle);
        } else {
          // Only request permission if not already granted
          console.log("Write permission not granted, will request when needed");
        }
      }
    } catch (error) {
      console.error("Failed to load handle:", error);
      setError(
        "Failed to restore previous folder. Please select folder again."
      );
    }
  };

  // Open IndexedDB
  const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("VideoFolderDB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("handles")) {
          db.createObjectStore("handles");
        }
      };
    });
  };

  // Load all files from device folder (videos and text files)
  const loadFilesFromFolder = async (dirHandle) => {
    try {
      setLoading(true);
      const videoFiles = [];
      const textFiles = [];

      // Iterate through all files in folder
      for await (const entry of dirHandle.values()) {
        if (entry.kind === "file") {
          const file = await entry.getFile();

          // Check if it's a video file
          if (
            file.type.startsWith("video/") ||
            file.name.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i)
          ) {
            const url = URL.createObjectURL(file);

            videoFiles.push({
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              size: file.size,
              type: file.type,
              url: url,
              file: file,
              fileHandle: entry,
              lastModified: file.lastModified,
              fileType: "video",
            });
          }
          // Check if it's a text file
          else if (
            file.type.startsWith("text/") ||
            file.name.match(/\.(txt|json|md|csv|log)$/i)
          ) {
            textFiles.push({
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              size: file.size,
              type: file.type,
              file: file,
              fileHandle: entry,
              lastModified: file.lastModified,
              fileType: "text",
            });
          }
        }
      }

      // Sort by name
      videoFiles.sort((a, b) => a.name.localeCompare(b.name));
      textFiles.sort((a, b) => a.name.localeCompare(b.name));

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
      if (!folderHandle || !hasWritePermission) {
        setError("No write permission for folder");
        return;
      }

      // Remove the file
      await folderHandle.removeEntry(fileItem.name);

      // Refresh file list
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
      const file = await fileItem.fileHandle.getFile();
      const content = await file.text();

      setEditingFile(fileItem);
      setEditContent(content);
    } catch (error) {
      console.error("Error reading file:", error);
      setError(`Failed to read file: ${error.message}`);
    }
  };

  // Save edited text file
  const saveTextFile = async () => {
    if (!editingFile || !hasWritePermission) return;

    try {
      // Get writable stream
      const writable = await editingFile.fileHandle.createWritable();

      // Write content
      await writable.write(editContent);

      // Close file
      await writable.close();

      alert(`"${editingFile.name}" saved successfully!`);

      // Close editor
      setEditingFile(null);
      setEditContent("");

      // Refresh files
      await refreshFiles();
    } catch (error) {
      console.error("Error saving file:", error);
      setError(`Failed to save file: ${error.message}`);
    }
  };

  // Upload new files to folder
  const uploadFiles = async (files) => {
    if (!folderHandle || !hasWritePermission) {
      setError("No write permission for folder");
      return;
    }

    try {
      setLoading(true);

      for (const file of files) {
        // Create new file in folder
        const newFileHandle = await folderHandle.getFileHandle(file.name, {
          create: true,
        });

        // Write file content
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
      }

      setLoading(false);
      setShowUpload(false);

      alert(`${files.length} file(s) uploaded successfully!`);

      // Refresh file list
      await refreshFiles();
    } catch (error) {
      console.error("Error uploading files:", error);
      setError(`Failed to upload files: ${error.message}`);
      setLoading(false);
    }
  };

  // Refresh file list
  const refreshFiles = async () => {
    if (folderHandle) {
      // Revoke old URLs to prevent memory leaks
      allFiles.forEach((file) => {
        if (file.url) URL.revokeObjectURL(file.url);
      });
      await loadFilesFromFolder(folderHandle);
    }
  };

  // Play video
  const playVideo = (video) => {
    setCurrentVideo(video);
    setShowPlayer(true);
  };

  // Close player
  const closePlayer = () => {
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

  // Load saved folder on mount
  useEffect(() => {
    if (isSupported) {
      loadHandleFromIndexedDB();
    }
  }, [isSupported]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      allFiles.forEach((file) => {
        if (file.url) URL.revokeObjectURL(file.url);
      });
    };
  }, [allFiles]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <HardDrive className="w-10 h-10" />
            Device Folder Manager
          </h1>
          <p className="text-purple-200">
            Access, edit, and delete files directly from your device storage
          </p>
        </div>

        {/* Browser Support Warning */}
        {!isSupported && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-300 flex-shrink-0" />
              <div>
                <h3 className="text-red-300 font-bold text-lg mb-2">
                  Browser Not Supported
                </h3>
                <p className="text-red-200 mb-3">
                  Your browser does not support the File System Access API
                  needed to access device folders.
                </p>
                <p className="text-red-200 font-semibold">
                  Please use Google Chrome or Microsoft Edge (version 86+)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Folder Selection */}
        {isSupported && !folderHandle && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6 border border-white/20 text-center">
            <Folder className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              Select Folder from Device
            </h2>
            <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
              Click the button below to choose a folder on your device (like
              D:\Videos\). You'll get full read/write access to edit and delete
              files. Permission persists across sessions.
            </p>
            <button
              onClick={selectDeviceFolder}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 mx-auto transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <Folder className="w-6 h-6" />
              {loading ? "Loading..." : "Choose Folder from Device"}
            </button>

            <div className="mt-6 bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 text-left max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-100">
                  <p className="font-semibold mb-2">Permissions:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-200">
                    <li>✅ Read files from folder</li>
                    <li>✅ Edit text files</li>
                    <li>✅ Delete files</li>
                    <li>✅ Upload new files</li>
                    <li>✅ Permission persists across sessions</li>
                    <li>✅ Access from any route in this domain</li>
                  </ul>
                </div>
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
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6 border border-white/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-white font-semibold">
                    Connected to folder:
                  </p>
                  <p className="text-purple-200 font-mono">{folderPath}</p>
                  {hasWritePermission && (
                    <p className="text-green-300 text-sm mt-1">
                      ✅ Write permission granted (persists across sessions)
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUpload(true)}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload Files
                </button>
                <button
                  onClick={refreshFiles}
                  disabled={loading}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
                <button
                  onClick={selectDeviceFolder}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
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
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <File className="w-6 h-6" />
                Files in Folder ({allFiles.length})
              </span>
              <span className="text-sm font-normal text-purple-200">
                {videos.length} videos, {allFiles.length - videos.length} other
                files
              </span>
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
                <p className="text-white text-lg">
                  Loading files from device...
                </p>
              </div>
            ) : allFiles.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60 text-lg">
                  No files found in this folder
                </p>
                <p className="text-white/40 text-sm">
                  Add files to the folder and click Refresh
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {allFiles.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-400/50 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-purple-300">
                        {getFileIcon(fileItem)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {fileItem.name}
                        </h3>
                        <div className="text-sm text-purple-200 flex gap-4">
                          <span>{formatSize(fileItem.size)}</span>
                          <span>{formatDate(fileItem.lastModified)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {fileItem.fileType === "video" ? (
                        <button
                          onClick={() => playVideo(fileItem)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Play
                        </button>
                      ) : (
                        <button
                          onClick={() => editTextFile(fileItem)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => deleteFile(fileItem)}
                        className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
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
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={closePlayer}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all group"
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
                <h3 className="text-white text-2xl font-bold mb-2">
                  {currentVideo.name}
                </h3>
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
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all group"
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
                <button
                  onClick={saveTextFile}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
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
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all group"
            >
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
            </button>

            <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Upload Files to {folderPath}
              </h2>

              <div className="border-2 border-dashed border-purple-400/50 rounded-lg p-12 text-center hover:border-purple-400 transition-colors">
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
                      Files will be added to your device folder
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-4 bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  ⚠️ Files will be permanently added to your device folder:{" "}
                  <span className="font-mono">{folderPath}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
