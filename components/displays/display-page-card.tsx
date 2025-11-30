"use client";

import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Monitor,
  MapPin,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PowerButton } from "./PowerButton";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DisplaysPageCardProps {
  id: string;
  name: string;
  templateType: string;
  displayUrl: string;
  status: "active" | "inactive";
  location?: string;
  resolution?: string;
  lastActive?: string;
  thumbnail?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
  onPowerToggle?: (id: string, status: "active" | "inactive") => void;
}

const templateLabels: Record<string, string> = {
  masjid: "Masjid",
  hospital: "Hospital",
  restaurant: "Restaurant",
  retail: "Retail",
  corporate: "Corporate",
};

const templateGradients: Record<string, string> = {
  masjid: "from-green-500/20 to-emerald-500/20",
  hospital: "from-blue-500/20 to-cyan-500/20",
  restaurant: "from-orange-500/20 to-red-500/20",
  retail: "from-purple-500/20 to-pink-500/20",
  corporate: "from-gray-500/20 to-slate-500/20",
};

const BaseURL = process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000";

export function DisplaysPageCard({
  id,
  name,
  templateType,
  displayUrl,
  status,
  location,
  resolution = "1920x1080",
  lastActive = "2 mins ago",
  thumbnail,
  onEdit,
  onDelete,
  onPreview,
  onPowerToggle,
}: DisplaysPageCardProps) {
  const [copied, setCopied] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`${BaseURL}${displayUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePowerToggle = (newStatus: "on" | "off") => {
    const mappedStatus = newStatus === "on" ? "active" : "inactive";
    setCurrentStatus(mappedStatus);
    onPowerToggle?.(id, mappedStatus);
  };

  const gradient =
    templateGradients[templateType] || templateGradients.corporate;
  const templateLabel = templateLabels[templateType] || "Custom";

  return (
    <div
      className={`bg-gray-900 rounded-2xl overflow-hidden border transition-all duration-300 ${
        currentStatus === "active"
          ? "border-gray-800 hover:border-gray-700 hover:shadow-lg hover:shadow-pink-500/5"
          : "border-gray-800/50 opacity-60"
      }`}
    >
      {/* Thumbnail/Preview */}
      <div
        className={`relative h-40 bg-gradient-to-br ${gradient} ${
          currentStatus === "inactive" ? "grayscale" : ""
        }`}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className={`w-full h-full object-cover ${
              currentStatus === "inactive" ? "grayscale opacity-50" : ""
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Monitor
              size={48}
              className={`${
                currentStatus === "inactive" ? "text-gray-700" : "text-gray-600"
              }`}
            />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              currentStatus === "active"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-gray-800/80 text-gray-500 border border-gray-700"
            }`}
          >
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                currentStatus === "active"
                  ? "bg-green-400 animate-pulse"
                  : "bg-gray-600"
              }`}
            ></span>
            {currentStatus === "active" ? "Active" : "Disabled"}
          </span>
        </div>

        {/* Template Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-900/80 text-gray-300 border border-gray-700 backdrop-blur-sm">
            {templateLabel}
          </span>
        </div>

        {/* Power Button and Actions Menu */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <PowerButton
            initialStatus={status === "active" ? "on" : "off"}
            onChange={handlePowerToggle}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-gray-900/80 hover:bg-gray-800/80 text-white backdrop-blur-sm h-8 w-8"
              >
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-gray-900 border-gray-800"
              align="end"
            >
              <DropdownMenuItem
                onClick={() => onPreview(id)}
                className="text-white hover:bg-gray-800 cursor-pointer"
              >
                <Eye size={16} className="mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(id)}
                className="text-white hover:bg-gray-800 cursor-pointer"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Display Name */}
        <h3 className="text-lg font-semibold text-white mb-1 truncate">
          {name}
        </h3>

        {/* Location */}
        {location && (
          <div className="flex items-center text-gray-400 text-sm mb-4">
            <MapPin size={14} className="mr-1.5 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Info Grid */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center">
              <Monitor size={14} className="mr-1.5" />
              Resolution
            </span>
            <span className="text-gray-300 font-medium">{resolution}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center">
              <Clock size={14} className="mr-1.5" />
              Last Active
            </span>
            <span className="text-gray-300 font-medium">{lastActive}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(id)}
            disabled={currentStatus === "inactive"}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye size={14} className="mr-1.5" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(id)}
            className="bg-pink-300/10 border-pink-300/30 text-pink-300 hover:bg-pink-300/20 hover:border-pink-300/50"
          >
            <Edit size={14} className="mr-1.5" />
            Edit
          </Button>
        </div>

        {/* Delete Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(id)}
          className="w-full mt-2 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
        >
          <Trash2 size={14} className="mr-1.5" />
          Delete Display
        </Button>

        {/* Display URL (collapsed) */}
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Display URL</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded flex-1 truncate">
              {BaseURL}
              {displayUrl}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyUrl}
              className="text-gray-400 hover:text-white h-7 px-2"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
