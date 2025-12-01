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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-400 bg-green-500/10";
      case "pending":
        return "text-yellow-400 bg-yellow-500/10";
      case "rejected":
        return "text-red-400 bg-red-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  const getBusinessTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      masjid: "🕌",
      hospital: "🏥",
      corporate: "🏢",
      restaurant: "🍽️",
      retail: "🏪",
      other: "📋",
    };
    return icons[type] || icons.other;
  };

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
            className="border-gray-700 hover:bg-gray-800 text-gray-400"
            title="Refresh clients"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-pink-300 text-gray-900 hover:bg-pink-400 w-full sm:w-auto"
          >
            <Plus size={18} className="mr-2" />
            Add New Client
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
            placeholder="Search by email or business name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] bg-gray-900 border-gray-800 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all" className="text-white">
                All Status
              </SelectItem>
              <SelectItem value="approved" className="text-white">
                Approved
              </SelectItem>
              <SelectItem value="pending" className="text-white">
                Pending
              </SelectItem>
              <SelectItem value="rejected" className="text-white">
                Rejected
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterBusinessType}
            onValueChange={setFilterBusinessType}
          >
            <SelectTrigger className="w-[140px] bg-gray-900 border-gray-800 text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all" className="text-white">
                All Types
              </SelectItem>
              <SelectItem value="masjid" className="text-white">
                Masjid
              </SelectItem>
              <SelectItem value="hospital" className="text-white">
                Hospital
              </SelectItem>
              <SelectItem value="corporate" className="text-white">
                Corporate
              </SelectItem>
              <SelectItem value="restaurant" className="text-white">
                Restaurant
              </SelectItem>
              <SelectItem value="retail" className="text-white">
                Retail
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-400 text-sm">
        Showing {filteredClients.length} of {clients.length} clients
      </p>

      {/* Clients Table/Grid */}
      {filteredClients.length > 0 ? (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Business Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-cyan-500/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {client.business_name}
                          </p>
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {getBusinessTypeIcon(client.business_type)}
                        </span>
                        <span className="text-gray-300 capitalize">
                          {client.business_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          client.status
                        )}`}
                      >
                        {client.status.charAt(0).toUpperCase() +
                          client.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {client.status === "pending" && (
                          <>
                            <Button
                              onClick={() =>
                                handleStatusChange(client.id, "approved")
                              }
                              size="sm"
                              className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() =>
                                handleStatusChange(client.id, "rejected")
                              }
                              size="sm"
                              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {client.status === "approved" && (
                          <Button
                            onClick={() =>
                              handleStatusChange(client.id, "rejected")
                            }
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-gray-400 hover:bg-gray-800"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        {client.status === "rejected" && (
                          <Button
                            onClick={() =>
                              handleStatusChange(client.id, "approved")
                            }
                            size="sm"
                            className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          onClick={() => openDeleteDialog(client.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Search size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {clients.length === 0 ? "No clients yet" : "No clients found"}
          </h3>
          <p className="text-gray-400 mb-6">
            {clients.length === 0
              ? "Create your first client account to get started"
              : "Try adjusting your search or filters"}
          </p>
          {clients.length === 0 ? (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-pink-300 text-gray-900 hover:bg-pink-400"
            >
              <Plus size={18} className="mr-2" />
              Add Client
            </Button>
          ) : (
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setFilterBusinessType("all");
              }}
              variant="outline"
              className="bg-gray-900 border-gray-800 text-white hover:bg-gray-800"
            >
              Clear Filters
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
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Are you sure you want to delete this client?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the
              client account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                clientToDelete && handleDeleteClient(clientToDelete)
              }
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {generatedCredentials ? "Client Created!" : "Create New Client"}
          </h2>

          {generatedCredentials ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-sm font-medium mb-4">
                  Client account created successfully! Share these credentials:
                </p>
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
                        className="border-gray-700"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Password</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={generatedCredentials.password}
                        readOnly
                        className="bg-gray-800 border-gray-700 text-white font-mono"
                      />
                      <Button
                        onClick={() =>
                          copyToClipboard(generatedCredentials.password)
                        }
                        size="sm"
                        variant="outline"
                        className="border-gray-700"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-yellow-400 text-xs mt-4">
                  ⚠️ Save these credentials now! They won't be shown again.
                </p>
              </div>
              <Button
                onClick={handleClose}
                className="w-full bg-pink-300 text-gray-900 hover:bg-pink-400"
              >
                Done
              </Button>
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
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
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
                  className="w-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
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
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
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
                      className="bg-gray-800 border-gray-700 text-white pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                    className="border-gray-700 text-gray-400"
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
                  className="flex-1 border-gray-700 text-gray-400"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-pink-300 text-gray-900 hover:bg-pink-400"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Client"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
