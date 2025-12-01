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
import { useRouter } from "next/navigation";
import { CreateDisplayDialog } from "@/components/displays/create-display-dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Display {
  id: string;
  name: string;
  template_type: string;
  config: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  status: "active" | "disabled";
  user?: {
    business_name: string;
    email: string;
  };
}

interface Client {
  id: string;
  email: string;
  business_name: string;
}

export default function DisplaysPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [displays, setDisplays] = useState<Display[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTemplate, setFilterTemplate] = useState<string>("all");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [displayToDelete, setDisplayToDelete] = useState<string | null>(null);

  // Fetch authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUserId(data.user.id);
          setUserRole(data.user.role);

          // Only admins can access this page
          if (data.user.role !== "admin") {
            router.push("/dashboard");
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  // Load clients (for admin)
  const loadClients = async () => {
    try {
      const response = await fetch("/api/admin/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  // Load all displays (admin sees all)
  const loadDisplays = async () => {
    if (!userId || !userRole) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/displays");

      if (response.ok) {
        const data = await response.json();
        setDisplays(data.displays || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load displays",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error loading displays:", err);
      toast({
        title: "Error",
        description: "An error occurred while loading displays",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && userRole === "admin") {
      loadDisplays();
      loadClients();
    }
  }, [userId, userRole]);

  const handleEdit = (id: string) => {
    router.push(`/displays/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/displays/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDisplays(displays.filter((d) => d.id !== id));
        toast({
          title: "Success",
          description: "Display deleted successfully",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to delete display",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error deleting display:", err);
      toast({
        title: "Error",
        description: "An error occurred while deleting the display",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDisplayToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDisplayToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handlePowerToggle = async (
    id: string,
    newStatus: "active" | "disabled"
  ) => {
    try {
      const response = await fetch(`/api/admin/displays/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setDisplays(
          displays.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
        );
        toast({
          title: "Success",
          description: data.message || `Display ${newStatus}`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update display status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating status",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (id: string) => {
    router.push(`/displays/${id}/live`);
  };

  const handleAddDisplay = (newDisplay: Display) => {
    setDisplays([newDisplay, ...displays]);
  };

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
    const matchesSearch =
      display.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      display.user?.business_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || display.status === filterStatus;

    const matchesTemplate =
      filterTemplate === "all" ||
      getTemplateType(display.template_type) === filterTemplate;

    const matchesClient =
      filterClient === "all" || display.user_id === filterClient;

    return matchesSearch && matchesStatus && matchesTemplate && matchesClient;
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
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            All Displays
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Manage all digital signage screens across all clients
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
            placeholder="Search displays or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
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
              <SelectItem value="disabled" className="text-white">
                Disabled
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

          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-[140px] bg-gray-900 border-gray-800 text-white">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all" className="text-white">
                All Clients
              </SelectItem>
              {clients.map((client) => (
                <SelectItem
                  key={client.id}
                  value={client.id}
                  className="text-white"
                >
                  {client.business_name}
                </SelectItem>
              ))}
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
                status={display.status}
                location={`${
                  display.user?.business_name || "Unknown Client"
                } - ${
                  templateType.charAt(0).toUpperCase() + templateType.slice(1)
                } Template`}
                resolution="1920x1080"
                lastActive="Just now"
                thumbnail={thumbnails[templateType] || thumbnails.masjid}
                onEdit={handleEdit}
                onDelete={openDeleteDialog}
                onPreview={handlePreview}
                onPowerToggle={handlePowerToggle}
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
                setFilterClient("all");
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
        userId={userId}
        clients={clients}
        isAdmin={true}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Are you sure you want to delete this display?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the
              display and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => displayToDelete && handleDelete(displayToDelete)}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
