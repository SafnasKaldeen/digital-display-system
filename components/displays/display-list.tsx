"use client";

import { useState, useEffect } from "react";
import { DisplayCard } from "../dashboard/display-card";
import { CreateDisplayDialog } from "./create-display-dialog";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { getDisplays, deleteDisplay } from "@/app/actions/displays";
import { useRouter } from "next/navigation";

type Display = {
  id: string;
  name: string;
  template_type: string;
  config: any;
  created_at: string;
  updated_at: string;
};

export function DisplayList() {
  const [displays, setDisplays] = useState<Display[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const loadDisplays = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { data, error } = await getDisplays(userId);

      if (error) {
        console.error("Failed to load displays:", error);
      } else {
        setDisplays(data || []);
      }
    } catch (err) {
      console.error("Error loading displays:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUserId(data.user.id);
        } else {
          console.error("Failed to fetch user");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  // Load displays when userId is available
  useEffect(() => {
    if (userId) {
      loadDisplays();
    }
  }, [userId]);

  const handleAddDisplay = async (newDisplay: Display) => {
    setDisplays([newDisplay, ...displays]);
  };

  const handleEdit = (id: string) => {
    router.push(`/displays/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this display?")) {
      return;
    }

    try {
      const { error } = await deleteDisplay(id);

      if (error) {
        console.error("Failed to delete display:", error);
        alert("Failed to delete display. Please try again.");
      } else {
        setDisplays(displays.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Error deleting display:", err);
      alert("An error occurred while deleting the display.");
    }
  };

  const handlePreview = (id: string) => {
    router.push(`/displays/${id}/live`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-400 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading displays...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Displays</h2>
          <p className="text-gray-400 text-sm mt-1">
            Create and manage your display screens
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadDisplays}
            variant="outline"
            size="icon"
            className="border-gray-700 hover:bg-gray-800 text-gray-400"
            title="Refresh displays"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 sm:px-6 sm:py-3 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Create Display</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {displays.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <p className="text-gray-400 text-lg font-semibold mb-2">
            No displays yet
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Create your first display to get started
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Display
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displays.map((display) => (
            <DisplayCard
              key={display.id}
              id={display.id}
              name={display.config?.name || display.name || "Untitled Display"}
              templateType={display.template_type}
              displayUrl={`${
                typeof window !== "undefined" ? window.location.origin : ""
              }/displays/${display.id}/live`}
              status="active"
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={handlePreview}
            />
          ))}
        </div>
      )}

      {/* Pass userId to CreateDisplayDialog */}
      <CreateDisplayDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleAddDisplay}
        userId={userId} // ADD THIS PROP
      />
    </div>
  );
}
