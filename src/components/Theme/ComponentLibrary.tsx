// src/components/theme/ComponentLibrary.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Code,
  Copy,
  Download,
  Package,
  LayoutGrid,
  List,
} from "lucide-react";
import { apiClient } from "@/hook/apiClient";

export default function ComponentLibrary() {
  const [componentTypes, setComponentTypes] = useState<any[]>([]);
  const [componentVariants, setComponentVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newComponentData, setNewComponentData] = useState({
    name: "",
    display_name: "",
    category: "",
    is_active: true,
    max_instances: 0,
  });

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const [typesRes, variantsRes] = await Promise.all([
        apiClient(`${import.meta.env.VITE_SERVER}/theme/component-types/list`, {
          method: "GET",
          tokenType: "jwt",
        }),
        apiClient(
          `${import.meta.env.VITE_SERVER}/theme/component-variants/list`,
          {
            method: "GET",
            tokenType: "jwt",
          },
        ),
      ]);

      setComponentTypes(typesRes.data || []);
      setComponentVariants(variantsRes.data || []);
    } catch (error: any) {
      console.error("Failed to fetch components:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleCreateComponentType = async () => {
    try {
      await apiClient(
        `${import.meta.env.VITE_SERVER}/theme/component-types/create`,
        {
          method: "POST",
          data: newComponentData,
          tokenType: "jwt",
        },
      );
      setDialogOpen(false);
      setNewComponentData({
        name: "",
        display_name: "",
        category: "",
        is_active: true,
        max_instances: 0,
      });
      fetchComponents();
    } catch (error: any) {
      console.error("Failed to create component type:", error);
    }
  };

  const filteredVariants = componentVariants.filter((variant) => {
    const matchesSearch =
      variant.variant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || variant.component_type?.name === selectedType;
    return matchesSearch && matchesType;
  });

  const uniqueCategories = [
    ...new Set(componentTypes.map((type) => type.category || "Uncategorized")),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Component Library {loading && "Loading"}
          </h2>
          <p className="text-gray-600">
            Manage component types and variants for your themes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Component Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Component Type</DialogTitle>
                <DialogDescription>
                  Define a new type of component for your theme sections
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name (internal)</Label>
                    <Input
                      value={newComponentData.name}
                      onChange={(e) =>
                        setNewComponentData({
                          ...newComponentData,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g., hero-section"
                    />
                  </div>
                  <div>
                    <Label>Display Name</Label>
                    <Input
                      value={newComponentData.display_name}
                      onChange={(e) =>
                        setNewComponentData({
                          ...newComponentData,
                          display_name: e.target.value,
                        })
                      }
                      placeholder="e.g., Hero Section"
                    />
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={newComponentData.category}
                    onChange={(e) =>
                      setNewComponentData({
                        ...newComponentData,
                        category: e.target.value,
                      })
                    }
                    placeholder="e.g., Layout"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newComponentData.is_active}
                      onCheckedChange={(checked) =>
                        setNewComponentData({
                          ...newComponentData,
                          is_active: checked,
                        })
                      }
                    />
                    <Label>Active</Label>
                  </div>
                  <div>
                    <Label>Max Instances</Label>
                    <Input
                      type="number"
                      value={newComponentData.max_instances}
                      onChange={(e) =>
                        setNewComponentData({
                          ...newComponentData,
                          max_instances: parseInt(e.target.value),
                        })
                      }
                      placeholder="0 for unlimited"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateComponentType}>
                    Create Component Type
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {componentTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="variants" className="space-y-6">
        <TabsList>
          <TabsTrigger value="variants">Component Variants</TabsTrigger>
          <TabsTrigger value="types">Component Types</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="variants" className="space-y-6">
          {viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVariants.map((variant) => (
                <Card key={variant.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {variant.variant_name}
                        </CardTitle>
                        <CardDescription>
                          {variant.component_type?.display_name}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={variant.is_active ? "default" : "outline"}
                      >
                        {variant.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {variant.description || "No description"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Package className="h-3 w-3" />
                      <span>v{variant.version || "1.0.0"}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex w-full items-center justify-between">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Code className="h-4 w-4 mr-2" />
                        Code
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVariants.map((variant) => (
                <Card key={variant.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <LayoutGrid className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {variant.variant_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {variant.component_type?.display_name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          v{variant.version || "1.0.0"}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="types">
          <div className="grid gap-4">
            {componentTypes.map((type) => (
              <Card key={type.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.display_name}</h3>
                        <p className="text-sm text-gray-600">{type.name}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline">
                            {type.category || "Uncategorized"}
                          </Badge>
                          <Badge
                            variant={type.is_active ? "default" : "outline"}
                          >
                            {type.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Max Instances: {type.max_instances || "Unlimited"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Variants:{" "}
                        {
                          componentVariants.filter(
                            (v) => v.component_type_id === type.id,
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uniqueCategories.map((category) => {
              const typeCount = componentTypes.filter(
                (t) => (t.category || "Uncategorized") === category,
              ).length;
              const variantCount = componentVariants.filter(
                (v) =>
                  (v.component_type?.category || "Uncategorized") === category,
              ).length;

              return (
                <Card key={category}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <Badge variant="secondary">{category}</Badge>
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{category}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{typeCount} component types</span>
                      <span>{variantCount} variants</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
