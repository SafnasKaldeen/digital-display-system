"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Users,
  Monitor,
  HardDrive,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Settings,
  ChevronDown,
} from "lucide-react";

// Mock data for clients
const mockClients = [
  {
    id: "1",
    businessName: "Masjid Al-Noor",
    email: "admin@masjidalnoor.com",
    businessType: "Masjid",
    totalDisplays: 5,
    activeDisplays: 4,
    mediaFiles: 45,
    storageUsed: 2.3, // GB
    plan: "Premium",
    status: "active",
    joinedDate: "2024-01-15",
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    businessName: "City General Hospital",
    email: "it@cityhospital.com",
    businessType: "Hospital",
    totalDisplays: 12,
    activeDisplays: 11,
    mediaFiles: 156,
    storageUsed: 8.7,
    plan: "Enterprise",
    status: "active",
    joinedDate: "2023-11-20",
    lastActive: "1 hour ago",
  },
  {
    id: "3",
    businessName: "TechCorp Solutions",
    email: "admin@techcorp.com",
    businessType: "Corporate",
    totalDisplays: 8,
    activeDisplays: 7,
    mediaFiles: 89,
    storageUsed: 4.5,
    plan: "Business",
    status: "active",
    joinedDate: "2024-02-10",
    lastActive: "30 mins ago",
  },
  {
    id: "4",
    businessName: "Green Valley Mosque",
    email: "contact@greenvalley.org",
    businessType: "Masjid",
    totalDisplays: 3,
    activeDisplays: 2,
    mediaFiles: 23,
    storageUsed: 1.2,
    plan: "Starter",
    status: "inactive",
    joinedDate: "2024-03-05",
    lastActive: "2 days ago",
  },
  {
    id: "5",
    businessName: "Metro Health Center",
    email: "admin@metrohealth.com",
    businessType: "Hospital",
    totalDisplays: 6,
    activeDisplays: 6,
    mediaFiles: 78,
    storageUsed: 3.8,
    plan: "Business",
    status: "active",
    joinedDate: "2023-12-08",
    lastActive: "5 hours ago",
  },
  {
    id: "6",
    businessName: "Downtown Islamic Center",
    email: "info@downtownic.org",
    businessType: "Masjid",
    totalDisplays: 4,
    activeDisplays: 4,
    mediaFiles: 34,
    storageUsed: 1.8,
    plan: "Premium",
    status: "active",
    joinedDate: "2024-01-28",
    lastActive: "1 hour ago",
  },
];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");

  // Calculate overview stats
  const totalClients = mockClients.length;
  const activeClients = mockClients.filter((c) => c.status === "active").length;
  const totalDisplays = mockClients.reduce(
    (sum, c) => sum + c.totalDisplays,
    0
  );
  const totalActiveDisplays = mockClients.reduce(
    (sum, c) => sum + c.activeDisplays,
    0
  );
  const totalMediaFiles = mockClients.reduce((sum, c) => sum + c.mediaFiles, 0);
  const totalStorage = mockClients.reduce((sum, c) => sum + c.storageUsed, 0);

  // Filter clients
  const filteredClients = mockClients.filter((client) => {
    const matchesSearch =
      client.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || client.status === filterStatus;
    const matchesPlan = filterPlan === "all" || client.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const StatCard = ({ icon: Icon, label, value, subtext, color, bgColor }) => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:bg-slate-900/70 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-slate-50">{value}</p>
          {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case "Enterprise":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Premium":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Business":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Starter":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusBadge = (status) => {
    return status === "active"
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-50">
                Admin Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Monitor and manage all clients and displays
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-50 mb-4">
            Platform Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              icon={Users}
              label="Total Clients"
              value={totalClients}
              subtext={`${activeClients} active`}
              color="text-blue-400"
              bgColor="bg-blue-500/10"
            />
            <StatCard
              icon={Monitor}
              label="Total Displays"
              value={totalDisplays}
              subtext={`${totalActiveDisplays} active`}
              color="text-green-400"
              bgColor="bg-green-500/10"
            />
            <StatCard
              icon={BarChart3}
              label="Media Files"
              value={totalMediaFiles}
              subtext="Across all clients"
              color="text-purple-400"
              bgColor="bg-purple-500/10"
            />
            <StatCard
              icon={HardDrive}
              label="Storage Used"
              value={`${totalStorage.toFixed(1)} GB`}
              subtext="Total storage"
              color="text-orange-400"
              bgColor="bg-orange-500/10"
            />
            <StatCard
              icon={TrendingUp}
              label="Growth Rate"
              value="+12%"
              subtext="This month"
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
            />
            <StatCard
              icon={AlertCircle}
              label="Issues"
              value="3"
              subtext="Needs attention"
              color="text-red-400"
              bgColor="bg-red-500/10"
            />
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search clients by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Plans</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Premium">Premium</option>
                <option value="Business">Business</option>
                <option value="Starter">Starter</option>
              </select>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors inline-flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/70 border-b border-slate-800">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Client
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Business Type
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Plan
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Displays
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Media Files
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Storage
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    Last Active
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-50">
                          {client.businessName}
                        </p>
                        <p className="text-sm text-slate-400">{client.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300">
                        {client.businessType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getPlanBadgeColor(
                          client.plan
                        )}`}
                      >
                        {client.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">
                        <span className="font-semibold">
                          {client.totalDisplays}
                        </span>
                        <span className="text-slate-500 text-sm ml-1">
                          ({client.activeDisplays} active)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 font-medium">
                        {client.mediaFiles}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 font-medium">
                        {client.storageUsed.toFixed(1)} GB
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusBadge(
                          client.status
                        )}`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400 text-sm">
                        {client.lastActive}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-300"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-300"
                          title="Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">
                No clients found matching your filters.
              </p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          Showing {filteredClients.length} of {totalClients} clients
        </div>
      </main>
    </div>
  );
}
