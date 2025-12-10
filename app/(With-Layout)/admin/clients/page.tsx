"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  RefreshCw,
  Mail,
  Building2,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Clock,
  X,
  MoreVertical,
  Calendar,
  Shield,
  Key,
  Copy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
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

interface Client {
  id: string;
  email: string;
  business_name: string;
  business_type: string;
  status: "approved" | "pending" | "rejected";
  role: string;
  created_at: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBusinessType, setFilterBusinessType] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.user.role !== "admin") {
            router.push("/dashboard");
            return;
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking admin:", error);
        router.push("/login");
      }
    };

    checkAdmin();
  }, [router]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error loading clients:", err);
      toast({
        title: "Error",
        description: "An error occurred while loading clients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || `Client status updated to ${newStatus}`,
        });
        loadClients();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update client status",
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

  const handleDeleteClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setClients(clients.filter((c) => c.id !== clientId));
        toast({
          title: "Success",
          description: "Client deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete client",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting client",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const openDeleteDialog = (clientId: string) => {
    setClientToDelete(clientId);
    setDeleteDialogOpen(true);
  };

  const getBusinessTypeColor = (type: string) => {
    const colors = {
      masjid: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      hospital: "bg-red-500/20 text-red-400 border-red-500/30",
      corporate: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      restaurant: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      retail: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getBusinessTypeIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      masjid: <span className="text-lg">🕌</span>,
      hospital: <span className="text-lg">🏥</span>,
      corporate: <Building2 className="w-4 h-4" />,
      restaurant: <span className="text-lg">🍽️</span>,
      retail: <span className="text-lg">🏪</span>,
      other: <span className="text-lg">📋</span>,
    };
    return icons[type] || icons.other;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    const icons = {
      approved: <Check className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      rejected: <X className="w-3 h-3" />,
    };

    return (
      <Badge
        variant="outline"
        className={`flex items-center gap-1 px-3 py-1 rounded-full ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.business_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || client.status === filterStatus;
    const matchesBusinessType =
      filterBusinessType === "all" ||
      client.business_type === filterBusinessType;
    return matchesSearch && matchesStatus && matchesBusinessType;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 sm:p-8 min-h-screen bg-gray-950">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading clients...</p>
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
            Client Management
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Manage client accounts and credentials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadClients}
            variant="outline"
            size="icon"
            className="border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white"
            title="Refresh clients"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 w-full sm:w-auto shadow-lg"
          >
            <Plus size={18} className="mr-2" />
            Add New Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Clients</p>
              <p className="text-3xl font-bold text-white mt-1">
                {clients.length}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Approved</p>
              <p className="text-3xl font-bold text-white mt-1">
                {clients.filter((c) => c.status === "approved").length}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-full">
              <Check className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-amber-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-3xl font-bold text-white mt-1">
                {clients.filter((c) => c.status === "pending").length}
              </p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-full">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-red-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Rejected</p>
              <p className="text-3xl font-bold text-white mt-1">
                {clients.filter((c) => c.status === "rejected").length}
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-full">
              <X className="w-6 h-6 text-red-400" />
            </div>
          </div>
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
            placeholder="Search by email or business name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500/30"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] bg-gray-900 border-gray-800 text-white focus:ring-2 focus:ring-pink-500/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all" className="text-white focus:bg-gray-800">
                All Status
              </SelectItem>
              <SelectItem
                value="approved"
                className="text-green-400 focus:bg-gray-800"
              >
                Approved
              </SelectItem>
              <SelectItem
                value="pending"
                className="text-amber-400 focus:bg-gray-800"
              >
                Pending
              </SelectItem>
              <SelectItem
                value="rejected"
                className="text-red-400 focus:bg-gray-800"
              >
                Rejected
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterBusinessType}
            onValueChange={setFilterBusinessType}
          >
            <SelectTrigger className="w-[140px] bg-gray-900 border-gray-800 text-white focus:ring-2 focus:ring-pink-500/30">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all" className="text-white focus:bg-gray-800">
                All Types
              </SelectItem>
              <SelectItem
                value="masjid"
                className="text-blue-400 focus:bg-gray-800"
              >
                Masjid
              </SelectItem>
              <SelectItem
                value="hospital"
                className="text-red-400 focus:bg-gray-800"
              >
                Hospital
              </SelectItem>
              <SelectItem
                value="corporate"
                className="text-purple-400 focus:bg-gray-800"
              >
                Corporate
              </SelectItem>
              <SelectItem
                value="restaurant"
                className="text-amber-400 focus:bg-gray-800"
              >
                Restaurant
              </SelectItem>
              <SelectItem
                value="retail"
                className="text-emerald-400 focus:bg-gray-800"
              >
                Retail
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Showing{" "}
          <span className="font-semibold text-white">
            {filteredClients.length}
          </span>{" "}
          of <span className="font-semibold text-white">{clients.length}</span>{" "}
          clients
        </p>
        {searchQuery ||
        filterStatus !== "all" ||
        filterBusinessType !== "all" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("all");
              setFilterBusinessType("all");
            }}
            className="text-gray-400 hover:text-white text-xs"
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <Card
            key={client.id}
            className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/5 overflow-hidden group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    {getBusinessTypeIcon(client.business_type)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg truncate">
                      {client.business_name}
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-sm truncate">
                      <Mail className="w-3 h-3 inline mr-1" />
                      {client.email}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(client.status)}
              </div>
            </CardHeader>

            <Separator className="bg-gray-800" />

            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={`${getBusinessTypeColor(
                    client.business_type
                  )} capitalize`}
                >
                  {client.business_type}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-gray-400 border-gray-700"
                >
                  {client.role}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-400">Created:</span>
                  <span className="text-gray-300 ml-auto">
                    {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-400">Status:</span>
                  <span className="text-gray-300 ml-auto capitalize">
                    {client.status}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1">
                  {client.status === "pending" && (
                    <>
                      <Button
                        onClick={() =>
                          handleStatusChange(client.id, "approved")
                        }
                        size="sm"
                        className="h-8 px-3 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30"
                        title="Approve"
                      >
                        <UserCheck className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() =>
                          handleStatusChange(client.id, "rejected")
                        }
                        size="sm"
                        className="h-8 px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                        title="Reject"
                      >
                        <UserX className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                  {client.status === "approved" && (
                    <Button
                      onClick={() => handleStatusChange(client.id, "rejected")}
                      size="sm"
                      className="h-8 px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                      title="Reject"
                    >
                      <UserX className="w-3 h-3" />
                      Reject
                    </Button>
                  )}
                  {client.status === "rejected" && (
                    <Button
                      onClick={() => handleStatusChange(client.id, "approved")}
                      size="sm"
                      className="h-8 px-3 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30"
                      title="Approve"
                    >
                      <UserCheck className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                  )}
                </div>
                <Button
                  onClick={() => openDeleteDialog(client.id)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-300 hover:bg-red-900/20"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-800 rounded-xl bg-gradient-to-br from-gray-900/50 to-black/50">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Building2 size={48} className="text-gray-600" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">
            {clients.length === 0 ? "No clients yet" : "No clients found"}
          </h3>
          <p className="text-gray-400 mb-8 max-w-md">
            {clients.length === 0
              ? "Get started by creating your first client account"
              : "Try adjusting your search or filters to find what you're looking for"}
          </p>
          {clients.length > 0 ? (
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setFilterBusinessType("all");
              }}
              variant="outline"
              className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:text-white"
            >
              Clear Filters
            </Button>
          ) : (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 font-semibold gap-2"
            >
              <Plus className="w-5 h-5" />
              Create First Client
            </Button>
          )}
        </div>
      )}

      {/* Create Client Dialog */}
      <CreateClientDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={loadClients}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-black border border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Client
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the
              client account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                clientToDelete && handleDeleteClient(clientToDelete)
              }
              className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Create Client Dialog Component
function CreateClientDialog({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    businessType: "corporate",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData((prev) => ({ ...prev, password }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to create client",
          variant: "destructive",
        });
        return;
      }

      // Show generated credentials
      setGeneratedCredentials({
        email: formData.email,
        password: formData.password,
      });

      toast({
        title: "Success",
        description: "Client created successfully!",
      });

      // Reset form after showing credentials
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 5000);
    } catch (err) {
      console.error("Error creating client:", err);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: "",
      password: "",
      businessName: "",
      businessType: "corporate",
    });
    setGeneratedCredentials(null);
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black border border-gray-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white text-2xl">
            {generatedCredentials ? "Client Created!" : "Create New Client"}
          </CardTitle>
          <CardDescription>
            {generatedCredentials
              ? "Share these credentials with the client"
              : "Fill in the client details below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedCredentials ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Key className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 text-sm font-medium">
                    Client account created successfully!
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={generatedCredentials.email}
                        readOnly
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <Button
                        onClick={() =>
                          copyToClipboard(generatedCredentials.email)
                        }
                        size="sm"
                        variant="outline"
                        className="border-gray-700 text-gray-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Password</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={generatedCredentials.password}
                        readOnly
                        type="password"
                        className="bg-gray-800 border-gray-700 text-white font-mono"
                      />
                      <Button
                        onClick={() =>
                          copyToClipboard(generatedCredentials.password)
                        }
                        size="sm"
                        variant="outline"
                        className="border-gray-700 text-gray-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-amber-400 text-xs">
                  <span>⚠️</span>
                  <p>Save these credentials now! They won't be shown again.</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-200">
                  Business Name
                </label>
                <Input
                  type="text"
                  name="businessName"
                  placeholder="Client Business Name"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="mt-2 bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-pink-500/30"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-200">
                  Business Type
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-pink-500/30"
                  required
                >
                  <option value="corporate">Corporate</option>
                  <option value="masjid">Masjid</option>
                  <option value="hospital">Hospital</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="retail">Retail</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-200">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-pink-500/30"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-200">
                  Password
                </label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-700 text-white pr-10 focus:ring-2 focus:ring-pink-500/30"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    onClick={generatePassword}
                    variant="outline"
                    className="border-gray-700 text-gray-400 hover:text-white"
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 border-gray-700 text-gray-400 hover:text-white"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Client"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        {generatedCredentials && (
          <CardFooter>
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
            >
              Done
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
