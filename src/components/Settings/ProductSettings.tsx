"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function ProductSettings({ data, onChange, onSave, saving }: ProductSettingsProps) {
  const [formData, setFormData] = useState(data || { status: true });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const addSortOption = () => {
    const newOption = { label: "New Option", label_bn: "নতুন অপশন", value: "new" };
    handleChange('sort_options', [...(formData.sort_options || []), newOption]);
  };

  const updateSortOption = (index: number, field: string, value: any) => {
    const updated = [...(formData.sort_options || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('sort_options', updated);
  };

  const removeSortOption = (index: number) => {
    const updated = (formData.sort_options || []).filter((_: any, i: number) => i !== index);
    handleChange('sort_options', updated);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Settings</CardTitle>
        <Button onClick={onSave} disabled={saving} className="gap-2 btn-bw-primary">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.status}
            onCheckedChange={(checked) => handleChange('status', checked)}
          />
          <Label>Enable Product Section</Label>
        </div>

        {formData.status && (
          <>
            <div className="grid grid-cols-2 gap-6">
              {/* Layout Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Layout Settings</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Section Title (English)</Label>
                  <Input
                    id="title"
                    value={formData.title || "Products"}
                    onChange={(e) => handleChange('title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title_bn">Section Title (Bengali)</Label>
                  <Input
                    id="title_bn"
                    value={formData.title_bn || "পণ্য"}
                    onChange={(e) => handleChange('title_bn', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="layout">Default Layout</Label>
                  <Select
                    value={formData.layout || "grid"}
                    onValueChange={(value) => handleChange('layout', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid View</SelectItem>
                      <SelectItem value="list">List View</SelectItem>
                      <SelectItem value="compact">Compact View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="columns">Default Columns</Label>
                  <Select
                    value={formData.columns?.toString() || "4"}
                    onValueChange={(value) => handleChange('columns', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                      <SelectItem value="5">5 Columns</SelectItem>
                      <SelectItem value="6">6 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="products_per_page">Products Per Page</Label>
                  <Input
                    id="products_per_page"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.products_per_page || 12}
                    onChange={(e) => handleChange('products_per_page', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.show_pagination || false}
                    onCheckedChange={(checked) => handleChange('show_pagination', checked)}
                  />
                  <Label>Show Pagination</Label>
                </div>
              </div>

              {/* Filter Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Filter Settings</h3>
                
                <div className="space-y-2">
                  <Label>Available Filters</Label>
                  <div className="space-y-2">
                    {['category', 'price_range', 'brand', 'color', 'size', 'rating'].map((filter) => (
                      <div key={filter} className="flex items-center gap-2">
                        <Switch
                          checked={(formData.filter_options || []).includes(filter)}
                          onCheckedChange={(checked) => {
                            const current = formData.filter_options || [];
                            const updated = checked 
                              ? [...current, filter]
                              : current.filter((f: string) => f !== filter);
                            handleChange('filter_options', updated);
                          }}
                        />
                        <Label className="capitalize">{filter.replace('_', ' ')}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Price Ranges</Label>
                  <div className="space-y-2">
                    {(formData.price_ranges || []).map((range: any, index: number) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={range.min || 0}
                          onChange={(e) => {
                            const updated = [...(formData.price_ranges || [])];
                            updated[index] = { ...range, min: parseInt(e.target.value) };
                            handleChange('price_ranges', updated);
                          }}
                          placeholder="Min"
                          className="w-24"
                        />
                        <span>-</span>
                        <Input
                          value={range.max || ''}
                          onChange={(e) => {
                            const updated = [...(formData.price_ranges || [])];
                            updated[index] = { ...range, max: e.target.value ? parseInt(e.target.value) : null };
                            handleChange('price_ranges', updated);
                          }}
                          placeholder="Max"
                          className="w-24"
                        />
                        <Input
                          value={range.label || ''}
                          onChange={(e) => {
                            const updated = [...(formData.price_ranges || [])];
                            updated[index] = { ...range, label: e.target.value };
                            handleChange('price_ranges', updated);
                          }}
                          placeholder="Label"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const updated = (formData.price_ranges || []).filter((_: any, i: number) => i !== index);
                            handleChange('price_ranges', updated);
                          }}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newRange = { min: 0, max: null, label: "" };
                        handleChange('price_ranges', [...(formData.price_ranges || []), newRange]);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Price Range
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Sort Options</h3>
              <div className="space-y-2">
                {(formData.sort_options || []).map((option: any, index: number) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={option.label || ''}
                      onChange={(e) => updateSortOption(index, 'label', e.target.value)}
                      placeholder="Label (English)"
                      className="flex-1"
                    />
                    <Input
                      value={option.label_bn || ''}
                      onChange={(e) => updateSortOption(index, 'label_bn', e.target.value)}
                      placeholder="বাংলা লেবেল"
                      className="flex-1"
                    />
                    <Input
                      value={option.value || ''}
                      onChange={(e) => updateSortOption(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="w-32"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSortOption(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={addSortOption} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Sort Option
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}