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
  Share2,
  Users,
  Link,
  Globe,
  Cpu,
  Server,
  Zap,
  Copy,
  ExternalLink,
  Clock,
  Shield,
} from "lucide-react";

// Persistent File Server Utility
class PersistentFileServer {
  static STORAGE_KEY = "persistent-folder-handles";
  static CHANNEL_NAME = "folder-manager-channel";
  static channel = null;
  static listeners = new Map();
  static dbVersion = 4; // Fixed version number

  // Initialize the file server
  static async initialize() {
    // Setup cross-tab communication
    if ("BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(this.CHANNEL_NAME);

      this.channel.onmessage = (event) => {
        this.handleBroadcastMessage(event.data);
      };
    }

    // Request persistent storage
    await this.requestStoragePersistence();

    // Initialize database
    await this.openDB();
  }

  // Request persistent storage
  static async requestStoragePersistence() {
    if (navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persist();
        console.log("Persistent storage:", isPersisted ? "Granted" : "Denied");
        return isPersisted;
      } catch (error) {
        console.error("Failed to request persistent storage:", error);
        return false;
      }
    }
    return false;
  }

  // Store folder handle
  static async storeFolderHandle(handle) {
    try {
      const db = await this.openDB();
      const tx = db.transaction("handles", "readwrite");

      const handleWithMeta = {
        handle: handle,
        metadata: {
          name: handle.name,
          grantedAt: Date.now(),
          lastAccessed: Date.now(),
        },
      };

      await tx.objectStore("handles").put(handleWithMeta, "primary");

      // Notify other tabs
      this.broadcast({
        type: "FOLDER_GRANTED",
        folderName: handle.name,
        timestamp: Date.now(),
      });

      return true;
    } catch (error) {
      console.error("Failed to store folder handle:", error);
      return false;
    }
  }

  // Restore folder handle
  static async restoreFolderHandle() {
    try {
      const db = await this.openDB();
      const tx = db.transaction("handles", "readonly");
      const stored = await tx.objectStore("handles").get("primary");

      if (stored && stored.handle) {
        // Verify permission still exists
        try {
          const permission = await stored.handle.queryPermission({
            mode: "read",
          });
          if (permission === "granted") {
            // Update last accessed time
            await this.updateLastAccessed();
            return stored.handle;
          }
        } catch (error) {
          console.log("Stored handle is invalid, removing...");
          await this.clearStoredHandle();
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to restore folder handle:", error);
      return null;
    }
  }

  // Get file as blob URL for sharing across routes
  static async getFileUrl(fileName, handle) {
    if (!handle) {
      throw new Error("No folder access available");
    }

    try {
      const fileHandle = await handle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const blobUrl = URL.createObjectURL(file);

      // Store reference for cleanup
      await this.trackBlobUrl(fileName, blobUrl);

      return {
        url: blobUrl,
        name: fileName,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      };
    } catch (error) {
      console.error(`Failed to get file "${fileName}":`, error);
      throw error;
    }
  }

  // Get file list from folder
  static async getFileList(handle) {
    if (!handle) return [];

    const files = [];

    for await (const entry of handle.values()) {
      if (entry.kind === "file") {
        const file = await entry.getFile();
        files.push({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          kind: entry.kind,
          isVideo: file.type.startsWith("video/"),
          isText: file.type.startsWith("text/"),
        });
      }
    }

    // Sort by name
    files.sort((a, b) => a.name.localeCompare(b.name));

    // Notify other tabs about the file list refresh
    this.broadcast({
      type: "FILE_LIST_REFRESHED",
      count: files.length,
      timestamp: Date.now(),
    });

    return files;
  }

  // Delete file from folder
  static async deleteFile(fileName, handle) {
    if (!handle) {
      throw new Error("No folder access available");
    }

    try {
      await handle.removeEntry(fileName);

      // Broadcast deletion
      this.broadcast({
        type: "FILE_DELETED",
        fileName: fileName,
        timestamp: Date.now(),
      });

      return true;
    } catch (error) {
      console.error(`Failed to delete file "${fileName}":`, error);
      throw error;
    }
  }

  // Upload files to folder
  static async uploadFiles(files, handle) {
    if (!handle) {
      throw new Error("No folder access available");
    }

    const uploaded = [];

    for (const file of files) {
      try {
        const fileHandle = await handle.getFileHandle(file.name, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();

        uploaded.push(file.name);
      } catch (error) {
        console.error(`Failed to upload "${file.name}":`, error);
      }
    }

    if (uploaded.length > 0) {
      this.broadcast({
        type: "FILES_UPLOADED",
        files: uploaded,
        timestamp: Date.now(),
      });
    }

    return uploaded;
  }

  // Create shareable blob URL
  static async createShareableBlobUrl(fileName, handle) {
    if (!handle) {
      throw new Error("No folder access available");
    }

    try {
      // Get file as blob URL
      const fileData = await this.getFileUrl(fileName, handle);

      // Generate a unique token for this blob URL
      const token = btoa(`${Date.now()}-${fileName}-${Math.random()}`)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      // Store the blob URL mapping in IndexedDB with expiration
      const shareData = {
        blobUrl: fileData.url,
        fileName: fileData.name,
        type: fileData.type,
        size: fileData.size,
        created: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };

      // Store in IndexedDB
      const db = await this.openDB();
      const tx = db.transaction("shareableUrls", "readwrite");
      const store = tx.objectStore("shareableUrls");
      await store.put(shareData, token);

      return {
        shareableUrl: `${window.location.origin}/shared/${token}`,
        directBlobUrl: fileData.url, // This is the actual blob:... URL
        token: token,
        fileName: fileData.name,
        fileSize: fileData.size,
        fileType: fileData.type,
        expiresAt: shareData.expiresAt,
      };
    } catch (error) {
      console.error("Failed to create shareable blob URL:", error);
      throw error;
    }
  }

  // Get blob URL by token
  static async getBlobUrlByToken(token) {
    try {
      const db = await this.openDB();
      const tx = db.transaction("shareableUrls", "readonly");
      const store = tx.objectStore("shareableUrls");
      const shareData = await store.get(token);

      if (!shareData) {
        throw new Error("Share link expired or invalid");
      }

      // Check if expired
      if (Date.now() > shareData.expiresAt) {
        await store.delete(token); // Clean up expired token
        throw new Error("Share link has expired");
      }

      return shareData.blobUrl;
    } catch (error) {
      console.error("Failed to get blob URL by token:", error);
      throw error;
    }
  }

  // Get all active share links
  static async getActiveShareLinks() {
    try {
      const db = await this.openDB();
      const tx = db.transaction("shareableUrls", "readonly");
      const store = tx.objectStore("shareableUrls");
      const allData = await store.getAll();

      const activeLinks = [];
      const now = Date.now();

      for (const item of allData) {
        if (now < item.expiresAt) {
          activeLinks.push({
            token: item.token,
            fileName: item.fileName,
            blobUrl: item.blobUrl,
            expiresAt: item.expiresAt,
            created: item.created,
          });
        } else {
          // Clean up expired
          await this.cleanupExpiredToken(item.token);
        }
      }

      return activeLinks;
    } catch (error) {
      console.error("Failed to get active share links:", error);
      return [];
    }
  }

  // Cleanup expired token
  static async cleanupExpiredToken(token) {
    try {
      const db = await this.openDB();
      const tx = db.transaction("shareableUrls", "readwrite");
      const store = tx.objectStore("shareableUrls");
      await store.delete(token);
    } catch (error) {
      console.error("Failed to cleanup expired token:", error);
    }
  }

  // Broadcast message to other tabs
  static broadcast(message) {
    if (this.channel) {
      this.channel.postMessage(message);
    }
  }

  // Handle broadcast messages
  static handleBroadcastMessage(message) {
    switch (message.type) {
      case "FOLDER_GRANTED":
        console.log(`Folder "${message.folderName}" granted in another tab`);
        this.notifyListeners("folderGranted", message);
        break;

      case "FILE_LIST_REFRESHED":
        this.notifyListeners("fileListRefreshed", message);
        break;

      case "FILE_DELETED":
        console.log(`File "${message.fileName}" deleted in another tab`);
        this.notifyListeners("fileDeleted", message);
        break;

      case "FILES_UPLOADED":
        console.log(`${message.files.length} files uploaded in another tab`);
        this.notifyListeners("filesUploaded", message);
        break;
    }
  }

  // Event listener system
  static addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return cleanup function
    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  static notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Helper methods - FIXED DATABASE VERSIONING
  static async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("FileServerDB", this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const transaction = event.target.transaction;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains("handles")) {
          db.createObjectStore("handles");
        }

        if (!db.objectStoreNames.contains("blobUrls")) {
          db.createObjectStore("blobUrls");
        }

        if (!db.objectStoreNames.contains("shareableUrls")) {
          const store = db.createObjectStore("shareableUrls");
          store.createIndex("expiresAt", "expiresAt", { unique: false });
        }

        // Handle version upgrades
        if (event.oldVersion < 2) {
          // Migration from version 1 to 2
          console.log("Migrating database from version 1 to 2");
        }

        if (event.oldVersion < 3) {
          // Migration from version 2 to 3
          console.log("Migrating database from version 2 to 3");
        }

        if (event.oldVersion < 4) {
          // Migration from version 3 to 4
          console.log("Migrating database from version 3 to 4");
        }
      };
    });
  }

  static async updateLastAccessed() {
    try {
      const db = await this.openDB();
      const tx = db.transaction("handles", "readwrite");
      const stored = await tx.objectStore("handles").get("primary");

      if (stored) {
        stored.metadata.lastAccessed = Date.now();
        await tx.objectStore("handles").put(stored, "primary");
      }
    } catch (error) {
      console.error("Failed to update last accessed:", error);
    }
  }

  static async trackBlobUrl(fileName, blobUrl) {
    try {
      const db = await this.openDB();
      const tx = db.transaction("blobUrls", "readwrite");
      await tx.objectStore("blobUrls").put({ blobUrl, fileName }, fileName);
    } catch (error) {
      console.error("Failed to track blob URL:", error);
    }
  }

  static async clearStoredHandle() {
    try {
      const db = await this.openDB();
      const tx = db.transaction("handles", "readwrite");
      await tx.objectStore("handles").delete("primary");
    } catch (error) {
      console.error("Failed to clear stored handle:", error);
    }
  }

  // Cleanup all expired data
  static async cleanupExpiredData() {
    try {
      const db = await this.openDB();
      const tx = db.transaction(["shareableUrls", "blobUrls"], "readwrite");

      // Clean expired share URLs
      const shareStore = tx.objectStore("shareableUrls");
      const index = shareStore.index("expiresAt");
      const range = IDBKeyRange.upperBound(Date.now());
      const cursor = await index.openCursor(range);

      while (cursor) {
        await cursor.delete();
        cursor.continue();
      }

      // Clean old blob URLs (older than 7 days)
      const blobStore = tx.objectStore("blobUrls");
      const allBlobs = await blobStore.getAll();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      for (const key of allBlobs) {
        // If we have metadata about when it was created, check it
        if (key.created && key.created < sevenDaysAgo) {
          await blobStore.delete(key);
        }
      }
    } catch (error) {
      console.error("Failed to cleanup expired data:", error);
    }
  }
}

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
  const [activeShareLinks, setActiveShareLinks] = useState([]);
  const [dbInitialized, setDbInitialized] = useState(false);

  // Initialize database first
  useEffect(() => {
    const initDB = async () => {
      try {
        await PersistentFileServer.initialize();
        setDbInitialized(true);
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setError("Failed to initialize database. Please refresh the page.");
      }
    };

    initDB();
  }, []);

  // Load active share links
  const loadActiveShareLinks = useCallback(async () => {
    try {
      const links = await PersistentFileServer.getActiveShareLinks();
      setActiveShareLinks(links);
    } catch (error) {
      console.error("Failed to load active share links:", error);
    }
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

      if (!supported) {
        setError(
          "Your browser doesn't support required features. Please use Chrome/Edge 86+."
        );
      }
    };

    checkSupport();
  }, []);

  // Restore previous session when DB is initialized
  useEffect(() => {
    const restoreSession = async () => {
      if (!dbInitialized || !isSupported) return;

      try {
        setLoading(true);
        const handle = await PersistentFileServer.restoreFolderHandle();

        if (handle) {
          setFolderHandle(handle);
          setFolderPath(handle.name);
          setHasWritePermission(true);
          setServerStatus("online");

          await loadFilesFromFolder(handle);
          await loadActiveShareLinks();

          showNotification("Previous session restored successfully!");
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [dbInitialized, isSupported, loadActiveShareLinks]);

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

      await loadFilesFromFolder(dirHandle);
      await loadActiveShareLinks();

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

  // Load files from device folder using PersistentFileServer
  const loadFilesFromFolder = async (dirHandle) => {
    try {
      setLoading(true);
      const files = await PersistentFileServer.getFileList(dirHandle);

      const videoFiles = [];
      const textFiles = [];

      for (const file of files) {
        if (file.isVideo || file.name.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i)) {
          videoFiles.push({
            ...file,
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fileType: "video",
          });
        } else if (
          file.isText ||
          file.name.match(/\.(txt|json|md|csv|log)$/i)
        ) {
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
      await PersistentFileServer.deleteFile(fileItem.name, folderHandle);
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
      const fileData = await PersistentFileServer.getFileUrl(
        fileItem.name,
        folderHandle
      );
      const response = await fetch(fileData.url);
      const content = await response.text();

      setEditingFile(fileItem);
      setEditContent(content);

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

      await PersistentFileServer.uploadFiles([file], folderHandle);

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
        Array.from(files),
        folderHandle
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
      await loadActiveShareLinks();
    }
  };

  // Play video with PersistentFileServer
  const playVideo = async (video) => {
    try {
      const fileData = await PersistentFileServer.getFileUrl(
        video.name,
        folderHandle
      );

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

  // Generate shareable blob URL
  const generateShareableUrl = async (fileItem) => {
    try {
      // Create shareable blob URL
      const shareData = await PersistentFileServer.createShareableBlobUrl(
        fileItem.name,
        folderHandle
      );

      // Store locally for this session
      setSharedUrls((prev) => ({
        ...prev,
        [fileItem.name]: {
          shareableUrl: shareData.shareableUrl,
          directBlobUrl: shareData.directBlobUrl,
          expiresAt: shareData.expiresAt,
          token: shareData.token,
          fileName: shareData.fileName,
        },
      }));

      // Reload active share links
      await loadActiveShareLinks();

      // Create simple dialog with copy options
      const dialog = document.createElement("div");
      dialog.className =
        "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4";

      dialog.innerHTML = `
        <div class="bg-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-white text-xl font-bold flex items-center gap-2">
              <Share2 class="w-5 h-5" />
              Shareable URLs Generated
            </h3>
            <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>
          
          <div class="mb-6">
            <h4 class="text-white font-medium mb-2">${shareData.fileName}</h4>
            <div class="text-sm text-slate-300 space-y-1">
              <div>Size: ${formatSize(shareData.fileSize)}</div>
              <div>Expires: ${formatDate(shareData.expiresAt)}</div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-slate-400 text-sm mb-2">Direct Blob URL</label>
              <div class="flex gap-2">
                <input 
                  type="text" 
                  readonly 
                  value="${shareData.directBlobUrl}" 
                  class="flex-1 bg-slate-900 text-xs text-white p-2 rounded border border-slate-700 truncate"
                  onclick="this.select()"
                />
                <button 
                  onclick="navigator.clipboard.writeText('${
                    shareData.directBlobUrl
                  }'); alert('Blob URL copied!');" 
                  class="px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Copy class="w-4 h-4 inline mr-1" />
                  Copy
                </button>
              </div>
              <p class="text-slate-500 text-xs mt-1">Works only in current browser session</p>
            </div>
            
            <div>
              <label class="block text-slate-400 text-sm mb-2">Public Share URL (24h)</label>
              <div class="flex gap-2">
                <input 
                  type="text" 
                  readonly 
                  value="${shareData.shareableUrl}" 
                  class="flex-1 bg-slate-900 text-xs text-white p-2 rounded border border-slate-700 truncate"
                  onclick="this.select()"
                />
                <button 
                  onclick="navigator.clipboard.writeText('${
                    shareData.shareableUrl
                  }'); alert('Share URL copied!');" 
                  class="px-3 py-2 bg-green-500 hover:bg-green-600 rounded text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Copy class="w-4 h-4 inline mr-1" />
                  Copy
                </button>
              </div>
              <p class="text-slate-500 text-xs mt-1">Accessible from any route for 24 hours</p>
            </div>
          </div>
          
          <div class="mt-6 pt-4 border-t border-slate-700">
            <button 
              onclick="this.closest('.fixed').remove()" 
              class="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(dialog);

      // Auto-close after 30 seconds
      setTimeout(() => {
        if (dialog.parentNode) {
          document.body.removeChild(dialog);
        }
      }, 30000);
    } catch (error) {
      console.error("Error generating shareable URL:", error);
      setError(`Failed to generate shareable URL: ${error.message}`);

      // Show specific error for database version issues
      if (
        error.message.includes("version") ||
        error.message.includes("Version")
      ) {
        setError(
          "Database version mismatch. Please refresh the page to reset."
        );
      }
    }
  };

  // Close player
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

  // Format time remaining
  const formatTimeRemaining = (expiresAt) => {
    const now = Date.now();
    const remaining = expiresAt - now;

    if (remaining <= 0) return "Expired";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
    // Simple notification implementation
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideIn";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  // Reset database (for development)
  const resetDatabase = async () => {
    if (
      confirm(
        "Are you sure you want to reset the database? This will clear all stored data."
      )
    ) {
      try {
        indexedDB.deleteDatabase("FileServerDB");
        showNotification("Database reset. Please refresh the page.");
      } catch (error) {
        console.error("Failed to reset database:", error);
      }
    }
  };

  // Active Share Links Panel
  const ActiveShareLinksPanel = () => {
    if (activeShareLinks.length === 0 || !folderHandle) return null;

    return (
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-lg rounded-lg p-6 mb-6 border border-blue-400/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-xl font-bold flex items-center gap-2">
            <Link className="w-5 h-5" />
            Active Share Links ({activeShareLinks.length})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={loadActiveShareLinks}
              className="text-blue-300 hover:text-blue-100 text-sm flex items-center gap-1 px-3 py-1 rounded bg-blue-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={resetDatabase}
              className="text-red-300 hover:text-red-100 text-sm flex items-center gap-1 px-3 py-1 rounded bg-red-500/20"
              title="Reset database"
            >
              Reset DB
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeShareLinks.map((link) => (
            <div
              key={link.token}
              className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-blue-400/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">
                    {link.fileName}
                  </h4>
                  <p className="text-blue-300 text-xs truncate">
                    {link.blobUrl?.substring(0, 40) || "No URL"}...
                  </p>
                </div>
                <div className="flex gap-1">
                  {link.blobUrl && (
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(link.blobUrl)
                      }
                      className="p-1 hover:bg-white/10 rounded"
                      title="Copy blob URL"
                    >
                      <Copy className="w-3 h-3 text-blue-300" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeRemaining(link.expiresAt)}
                </span>
                <span className="text-green-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Share Button Component
  const ShareButton = ({ fileItem }) => {
    return (
      <button
        onClick={() => generateShareableUrl(fileItem)}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:scale-105"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Server className="w-10 h-10" />
            Device Folder Manager with Blob URL Sharing
          </h1>
          <p className="text-purple-200">
            Access, edit, and serve files with direct blob URL sharing across
            all routes
          </p>
        </div>

        {/* Database Status */}
        {!dbInitialized && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-300" />
              <span className="text-yellow-200">Initializing database...</span>
            </div>
          </div>
        )}

        {/* Active Share Links Panel */}
        <ActiveShareLinksPanel />

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
                    File Server:{" "}
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
                      ? "Files are being served across all routes with blob URL sharing"
                      : "Select a folder to start the file server"}
                  </p>
                </div>
              </div>

              {serverStatus === "online" && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-purple-200">
                    <Users className="w-4 h-4" />
                    <span>
                      {activeTabs} active tab{activeTabs !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-purple-200">
                    <Link className="w-4 h-4" />
                    <span>{activeShareLinks.length} active shares</span>
                  </div>
                </div>
              )}
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
                  <li>• BroadcastChannel API (for multi-tab sync)</li>
                  <li>• IndexedDB (for persistent storage)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Folder Selection */}
        {isSupported && !folderHandle && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-6 border border-white/20 text-center">
            <Folder className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              Start File Server from Device Folder
            </h2>
            <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
              Select a folder on your device to create a persistent file server.
              Generate direct blob URLs for immediate file sharing across all
              routes.
            </p>
            <button
              onClick={selectDeviceFolder}
              disabled={loading || !dbInitialized}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 mx-auto transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <Zap className="w-6 h-6" />
              {loading ? "Starting Server..." : "Start File Server"}
            </button>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="w-5 h-5 text-green-400" />
                  <h4 className="text-white font-bold">Direct Blob URLs</h4>
                </div>
                <p className="text-sm text-purple-200">
                  Generate direct blob: URLs for immediate file access
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <h4 className="text-white font-bold">Session Persistence</h4>
                </div>
                <p className="text-sm text-purple-200">
                  Folder access persists between browser sessions
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-white font-bold">24-Hour Shares</h4>
                </div>
                <p className="text-sm text-purple-200">
                  Generate shareable URLs valid for 24 hours
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
                      {activeShareLinks.length} Active Shares
                    </span>
                    <span className="text-blue-300 flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Blob URL Generation
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
                <HardDrive className="w-6 h-6" />
                Server Files ({allFiles.length})
              </h2>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-purple-200">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Direct Blob URLs</span>
                </div>
                <div className="flex items-center gap-2 text-purple-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span>24-Hour Share Links</span>
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
                <File className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60 text-lg">
                  No files found in server folder
                </p>
                <p className="text-white/40 text-sm">
                  Upload files to generate shareable blob URLs
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
                            <span className="text-green-300 flex items-center gap-1 text-xs">
                              <Link className="w-3 h-3" />
                              Share Generated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {fileItem.fileType === "video" ? (
                        <>
                          <button
                            onClick={() => playVideo(fileItem)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:scale-105"
                          >
                            <Play className="w-4 h-4" />
                            Play
                          </button>
                          <ShareButton fileItem={fileItem} />
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
                          <ShareButton fileItem={fileItem} />
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
                    Generate Share URL
                  </button>
                </div>
                <div className="flex gap-6 text-sm text-purple-200">
                  <span>Size: {formatSize(currentVideo.size)}</span>
                  <span>Modified: {formatDate(currentVideo.lastModified)}</span>
                  <span className="font-mono text-purple-300">
                    Current Blob URL: {currentVideo.url.substring(0, 30)}...
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
                      Files will be added to the server with blob URL generation
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Link className="w-5 h-5 text-purple-300 flex-shrink-0" />
                  <div>
                    <p className="text-purple-200 text-sm font-semibold mb-1">
                      Blob URL Generation
                    </p>
                    <p className="text-purple-300 text-sm">
                      Uploaded files can generate direct blob: URLs for
                      immediate access and 24-hour shareable links.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
