"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, X } from "lucide-react";
import { createDisplay } from "@/app/actions/displays";

interface CreateDisplayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (display: any) => void;
  userId: string | null; // ADD THIS
}

export function CreateDisplayDialog({
  isOpen,
  onClose,
  onSuccess,
  userId, // ADD THIS
}: CreateDisplayDialogProps) {
  const [step, setStep] = useState<"details" | "template">("details");
  const [formData, setFormData] = useState({
    displayName: "",
    templateType: "corporate",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const templates = [
    {
      id: "masjid",
      name: "Masjid",
      description: "Prayer times, announcements, Hijri calendar",
      icon: "🕌",
    },
    {
      id: "hospital",
      name: "Hospital",
      description: "Doctor schedules, departments, emergency info",
      icon: "🏥",
    },
    {
      id: "corporate",
      name: "Corporate",
      description: "Meeting rooms, announcements, KPIs",
      icon: "🏢",
    },
  ];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, displayName: e.target.value }));
  };

  const handleTemplateSelect = (templateId: string) => {
    setFormData((prev) => ({ ...prev, templateType: templateId }));
  };

  const handleCreate = async () => {
    // ADD THIS CHECK
    if (!userId) {
      setError("User not authenticated. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Pass userId to createDisplay
      const { data: newDisplay, error: createError } = await createDisplay(
        {
          name: formData.displayName,
          template_type: formData.templateType,
        },
        userId // ADD THIS
      );

      if (createError) {
        setError(createError);
        return;
      }

      // Success - notify parent and reset
      onSuccess(newDisplay);
      onClose();
      setFormData({ displayName: "", templateType: "corporate" });
      setStep("details");
    } catch (err) {
      console.error("Error creating display:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-slate-900 border-slate-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-50">
              Create New Display
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="flex gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {step === "details" ? (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-200">
                  Display Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Main Hall Display"
                  value={formData.displayName}
                  onChange={handleNameChange}
                  disabled={isLoading}
                  className="mt-2 bg-slate-800 border-slate-700 text-slate-50"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 border-slate-700 text-slate-400 bg-transparent hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep("template")}
                  disabled={!formData.displayName || isLoading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-400 mb-4">
                  Select a template to customize:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.templateType === template.id
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-slate-700 bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <span className="text-3xl mb-2 block">
                        {template.icon}
                      </span>
                      <h3 className="font-semibold text-slate-50">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("details")}
                  disabled={isLoading}
                  className="flex-1 border-slate-700 text-slate-400 bg-transparent hover:bg-slate-800"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isLoading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isLoading ? "Creating..." : "Create Display"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
