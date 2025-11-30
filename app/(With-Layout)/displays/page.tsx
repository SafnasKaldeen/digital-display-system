"use client";

import { useState, useEffect } from "react";
import { DisplaysPageCard } from "@/components/displays/display-page-card";
import { Button } from "@/components/ui/button";
import { Plus, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDisplays, deleteDisplay } from "@/app/actions/displays";
import { useRouter } from "next/navigation";
import { CreateDisplayDialog } from "@/components/displays/create-display-dialog";

interface Display {
  id: string;
  name: string;
  template_type: string;
  config: any;
  created_at: string;
  updated_at: string;
}

export default function DisplaysPage() {
  const router = useRouter();
  const [displays, setDisplays] = useState<Display[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterTemplate, setFilterTemplate] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadDisplays = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getDisplays();

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

  useEffect(() => {
    loadDisplays();
  }, []);

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

  const handleAddDisplay = (newDisplay: Display) => {
    setDisplays([newDisplay, ...displays]);
  };

  // Map template_type to templateType for filtering
  const getTemplateType = (template_type: string) => {
    const mapping: Record<string, string> = {
      masjid: "masjid",
      hospital: "hospital",
      corporate: "corporate",
      restaurant: "restaurant",
      retail: "retail",
    };
    return mapping[template_type] || template_type;
  };

  const filteredDisplays = displays.filter((display) => {
    const matchesSearch = display.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || filterStatus === "active"; // All displays are active by default
    const matchesTemplate =
      filterTemplate === "all" ||
      getTemplateType(display.template_type) === filterTemplate;
    return matchesSearch && matchesStatus && matchesTemplate;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 sm:p-8 min-h-screen bg-gray-950">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading displays...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 min-h-screen bg-gray-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            All Displays
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Manage all your digital signage screens
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
            className="bg-pink-300 text-gray-900 hover:bg-pink-400 w-full sm:w-auto"
          >
            <Plus size={18} className="mr-2" />
            Add New Display
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search displays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filterStatus}
            onValueChange={(value: any) => setFilterStatus(value)}
          >
            <SelectTrigger className="w-[140px] bg-gray-900 border-gray-800 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all" className="text-white">
                All Status
              </SelectItem>
              <SelectItem value="active" className="text-white">
                Active
              </SelectItem>
              <SelectItem value="inactive" className="text-white">
                Inactive
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterTemplate} onValueChange={setFilterTemplate}>
            <SelectTrigger className="w-[140px] bg-gray-900 border-gray-800 text-white">
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all" className="text-white">
                All Templates
              </SelectItem>
              <SelectItem value="masjid" className="text-white">
                Masjid
              </SelectItem>
              <SelectItem value="hospital" className="text-white">
                Hospital
              </SelectItem>
              <SelectItem value="restaurant" className="text-white">
                Restaurant
              </SelectItem>
              <SelectItem value="retail" className="text-white">
                Retail
              </SelectItem>
              <SelectItem value="corporate" className="text-white">
                Corporate
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-400 text-sm">
        Showing {filteredDisplays.length} of {displays.length} displays
      </p>

      {/* Displays Grid */}
      {filteredDisplays.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDisplays.map((display) => {
            const templateType = getTemplateType(display.template_type);

            // Get thumbnail based on template type
            const thumbnails: Record<string, string> = {
              masjid:
                "https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?w=400",
              hospital:
                "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400",
              restaurant:
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
              retail:
                "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
              corporate:
                "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
            };

            return (
              <DisplaysPageCard
                key={display.id}
                id={display.id}
                name={display.name}
                templateType={templateType}
                displayUrl={`/displays/${display.id}/live`}
                status="active"
                location={`${display.name} - ${
                  templateType.charAt(0).toUpperCase() + templateType.slice(1)
                } Template`}
                resolution="1920x1080"
                lastActive="Just now"
                thumbnail={thumbnails[templateType] || thumbnails.masjid}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPreview={handlePreview}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Search size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {displays.length === 0 ? "No displays yet" : "No displays found"}
          </h3>
          <p className="text-gray-400 mb-6">
            {displays.length === 0
              ? "Create your first display to get started"
              : "Try adjusting your search or filters"}
          </p>
          {displays.length === 0 ? (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-pink-300 text-gray-900 hover:bg-pink-400"
            >
              <Plus size={18} className="mr-2" />
              Create Display
            </Button>
          ) : (
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setFilterTemplate("all");
              }}
              variant="outline"
              className="bg-gray-900 border-gray-800 text-white hover:bg-gray-800"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Create Display Dialog */}
      <CreateDisplayDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleAddDisplay}
      />
    </div>
  );
}
