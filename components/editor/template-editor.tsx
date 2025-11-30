"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Save,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import MasjidEditorPanel from "./masjid-editor";
import { HospitalEditor } from "./hospital-editor";
import { CorporateEditor } from "./corporate-editor";
import { LivePreview } from "@/components/editor/live-review";

interface TemplateEditorProps {
  displayId: string;
  displayName?: string;
  templateType: "masjid" | "hospital" | "corporate" | "restaurant" | "retail";
  initialConfig?: any;
}

export function TemplateEditor({
  displayId,
  displayName = "Untitled Display",
  templateType,
  initialConfig = {
    colors: {
      text: "#FFFFFF",
      primary: "#3b82f6",
      secondary: "#10b981",
    },
    font: "Inter, sans-serif",
    backgroundType: "solid",
    backgroundColor: "#000000",
  },
}: TemplateEditorProps) {
  const [config, setConfig] = useState(initialConfig);
  const [originalConfig, setOriginalConfig] = useState(initialConfig);
  const [showPreview, setShowPreview] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (newConfig: any) => {
    setConfig(newConfig);
    setHasChanges(JSON.stringify(newConfig) !== JSON.stringify(originalConfig));
  };

  const handleSaveSuccess = (success: boolean) => {
    if (success) {
      // Update original config after successful save
      setOriginalConfig(config);
      setHasChanges(false);

      setMessage({
        type: "success",
        text: "Configuration saved successfully!",
      });
    } else {
      setMessage({
        type: "error",
        text: "Failed to save configuration. Please try again.",
      });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenLive = () => {
    // Open the live page that fetches from database
    const liveUrl = `${window.location.origin}/displays/${displayId}/live`;
    console.log("Opening live display:", liveUrl); // Debug log
    window.open(liveUrl, "_blank");

    setMessage({
      type: "success",
      text: "Live display opened in new tab!",
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCopyLiveUrl = async () => {
    const liveUrl = `${window.location.origin}/displays/${displayId}/live`;

    try {
      await navigator.clipboard.writeText(liveUrl);
      setMessage({
        type: "success",
        text: "Live URL copied to clipboard!",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to copy URL to clipboard.",
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset all changes? This cannot be undone."
      )
    ) {
      setConfig(originalConfig);
      setHasChanges(false);
      setMessage({
        type: "success",
        text: "Configuration reset to original values",
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const renderEditor = () => {
    switch (templateType) {
      case "masjid":
        return (
          <div>
            {/* <div>{config.masjidName}</div> */}
            <MasjidEditorPanel
              displayId={displayId}
              displayName={config.masjidName || displayName} // ✅ Use config value first
              templateType={templateType}
              config={config}
              onConfigChange={handleConfigChange}
            />
          </div>
        );
      case "hospital":
        return (
          <HospitalEditor config={config} onConfigChange={handleConfigChange} />
        );
      case "corporate":
        return (
          <CorporateEditor
            config={config}
            onConfigChange={handleConfigChange}
          />
        );
      default:
        return (
          <div className="text-gray-400">
            Template editor not available for {templateType}
          </div>
        );
    }
  };

  // Component for the action bar
  const ActionBar = () => (
    <Card className="bg-gray-900 border-gray-800 shadow-2xl rounded-none border-x-0 border-b-0 flex-shrink-0">
      <div className="px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Side - Status */}
          <div className="flex items-center gap-4 text-sm">
            {hasChanges ? (
              <div className="flex items-center gap-2 text-orange-400">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                <span>Unsaved changes</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>All changes saved</span>
              </div>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {hasChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white flex-1 sm:flex-none"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLiveUrl}
              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white flex-1 sm:flex-none"
            >
              <Save className="w-4 h-4 mr-2" />
              Copy Live URL
            </Button>

            <Button
              onClick={handleOpenLive}
              className="bg-pink-300 hover:bg-pink-400 text-gray-900 flex-1 sm:flex-none"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Live Display
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden px-6 pt-6">
        {/* Success/Error Message */}
        {message && (
          <div
            className={`rounded-2xl p-4 flex items-center gap-3 mb-6 flex-shrink-0 ${
              message.type === "success"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {message.type === "success" && (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Main Content Grid */}
        <div
          className={`grid gap-6 flex-1 overflow-hidden ${
            showPreview ? "lg:grid-cols-2" : ""
          }`}
        >
          {/* Editor Panel */}
          <div className="flex flex-col h-full overflow-hidden">
            <Card className="bg-gray-900 border-gray-800 flex flex-col h-full">
              {/* Editor Header */}
              <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 rounded-t-lg flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Configuration Editor
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    {showPreview ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide Preview
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show Preview
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                {renderEditor()}
              </div>
            </Card>
          </div>

          {/* Preview Panel with Save Button */}
          {showPreview && (
            <div className="flex flex-col h-full overflow-hidden">
              <Card className="bg-gray-900 border-gray-800 flex flex-col h-full">
                {/* Preview Header */}
                <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 rounded-t-lg flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Live Preview
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span>Preview Mode</span>
                    </div>
                  </div>
                </div>

                {/* Preview Content with Save Button */}
                <div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                  <LivePreview
                    displayData={{
                      id: displayId,
                      name: displayName,
                      templateType: templateType,
                      config: config,
                    }}
                    onSave={handleSaveSuccess}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Changes in preview update in real-time. Click Save to apply
                    to live display.
                  </p>
                </div>

                {/* Action Bar */}
                <ActionBar />
              </Card>
            </div>
          )}
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1f2937;
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }

          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #4b5563 #1f2937;
          }
        `}</style>
      </div>
    </div>
  );
}
