// src/components/theme/ThemeList.tsx
import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  Star,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface ThemeListProps {
  themes: any[];
  loading: boolean;
  onSelectTheme: (theme: any) => void;
  onSetActive: (themeId: string) => Promise<void>;
  onSetDefault: (themeId: string) => Promise<void>;
  onDeleteTheme: (themeId: string) => Promise<void>;
  onExportTheme: (themeId: string) => Promise<void>;
  onImportTheme: (file: File) => Promise<void>;
  onEditTheme: (theme: any) => void;
}

export default function ThemeList({
  themes,
  loading,
  onSelectTheme,
  onSetActive,
  onSetDefault,
  onDeleteTheme,
  onExportTheme,
  onImportTheme,
  onEditTheme,
}: ThemeListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportTheme(file);
      // Reset file input
      event.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <Eye className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          No themes found
        </h3>
        <p className="mt-2 text-gray-500">
          Get started by creating your first theme
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Import Button */}
      <div className="flex justify-end">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json"
          className="hidden"
        />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Import Theme
        </Button>
      </div>

      {/* Themes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={`overflow-hidden transition-all hover:shadow-lg ${
              theme.is_active ? "ring-2 ring-primary" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {theme.name}
                    {theme.is_active && (
                      <Badge variant="default" className="bg-primary">
                        Active
                      </Badge>
                    )}
                    {theme.is_default && (
                      <Badge
                        variant="outline"
                        className="border-yellow-400 text-yellow-700"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">/{theme.slug}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditTheme(theme)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSelectTheme(theme)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    {!theme.is_active && (
                      <DropdownMenuItem onClick={() => onSetActive(theme.id)}>
                        <Zap className="mr-2 h-4 w-4" />
                        Set as Active
                      </DropdownMenuItem>
                    )}
                    {!theme.is_default && (
                      <DropdownMenuItem onClick={() => onSetDefault(theme.id)}>
                        <Star className="mr-2 h-4 w-4" />
                        Set as Default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onExportTheme(theme.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        // Duplicate functionality would go here
                        alert("Duplicate functionality coming soon");
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteTheme(theme.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {theme.description || "No description"}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge
                  variant="outline"
                  className={getStatusColor(theme.status)}
                >
                  {theme.status}
                </Badge>
                {theme.is_default && (
                  <Badge
                    variant="outline"
                    className="border-yellow-400 text-yellow-700"
                  >
                    Default
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  <span>Updated: {formatDate(theme.updated_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditTheme(theme)}
                  >
                    Edit Theme
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
