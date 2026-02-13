"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "../ui/switch";

interface LocalSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function LocalSettings({
  data,
  onChange,
  onSave,
  saving,
}: LocalSettingsProps) {
  const [formData, setFormData] = useState(data || {});

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

  const addHoliday = () => {
    const newHoliday = {
      date: new Date().toISOString().split("T")[0],
      name: "New Holiday",
      name_bn: "নতুন ছুটির দিন",
    };
    handleChange("holidays", [...(formData.holidays || []), newHoliday]);
  };

  const updateHoliday = (index: number, field: string, value: any) => {
    const updated = [...(formData.holidays || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("holidays", updated);
  };

  const removeHoliday = (index: number) => {
    const updated = (formData.holidays || []).filter(
      (_: any, i: number) => i !== index,
    );
    handleChange("holidays", updated);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Local Settings (Bangladesh)</CardTitle>
        <Button onClick={onSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Divisions */}
        <Card className="p-4">
          <h3 className="font-medium mb-4">Divisions</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "ঢাকা",
              "চট্টগ্রাম",
              "রাজশাহী",
              "খুলনা",
              "বরিশাল",
              "সিলেট",
              "রংপুর",
              "ময়মনসিংহ",
            ].map((division) => (
              <div
                key={division}
                className="flex items-center gap-2 p-2 border rounded"
              >
                <Switch
                  checked={(formData.divisions || []).includes(division)}
                  onCheckedChange={(checked) => {
                    const current = formData.divisions || [];
                    const updated = checked
                      ? [...current, division]
                      : current.filter((d: string) => d !== division);
                    handleChange("divisions", updated);
                  }}
                />
                <span>{division}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Districts */}
        <Card className="p-4">
          <h3 className="font-medium mb-4">Districts</h3>
          <div className="space-y-4">
            {Object.entries(formData.districts || {}).map(
              ([division, districts]: [string, any]) => (
                <div key={division} className="border rounded p-4">
                  <h4 className="font-medium mb-2">{division}</h4>
                  <div className="flex flex-wrap gap-2">
                    {(districts || []).map((district: string, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-100 px-3 py-1 rounded flex items-center gap-2"
                      >
                        <span>{district}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => {
                            const updated = { ...formData.districts };
                            updated[division] = districts.filter(
                              (_: string, i: number) => i !== idx,
                            );
                            handleChange("districts", updated);
                          }}
                        >
                          <Trash className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="New district"
                      className="w-48"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const input = e.target as HTMLInputElement;
                          if (input.value) {
                            const updated = { ...formData.districts };
                            updated[division] = [
                              ...(districts || []),
                              input.value,
                            ];
                            handleChange("districts", updated);
                            input.value = "";
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </Card>

        {/* Holidays */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Public Holidays</h3>
            <Button onClick={addHoliday} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" /> Add Holiday
            </Button>
          </div>

          <div className="space-y-4">
            {(formData.holidays || []).map((holiday: any, index: number) => (
              <div
                key={index}
                className="flex gap-2 items-center border-b pb-2"
              >
                <Input
                  type="date"
                  value={holiday.date || ""}
                  onChange={(e) => updateHoliday(index, "date", e.target.value)}
                  className="w-40"
                />
                <Input
                  value={holiday.name || ""}
                  onChange={(e) => updateHoliday(index, "name", e.target.value)}
                  placeholder="Name (English)"
                  className="flex-1"
                />
                <Input
                  value={holiday.name_bn || ""}
                  onChange={(e) =>
                    updateHoliday(index, "name_bn", e.target.value)
                  }
                  placeholder="বাংলা নাম"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHoliday(index)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Eid Dates */}
        <Card className="p-4">
          <h3 className="font-medium mb-4">Eid Dates</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eid_fitr">Eid-ul-Fitr 2024</Label>
              <Input
                id="eid_fitr"
                type="date"
                value={formData.eid_dates?.eid_ul_fitr_2024 || ""}
                onChange={(e) => {
                  handleChange("eid_dates", {
                    ...(formData.eid_dates || {}),
                    eid_ul_fitr_2024: e.target.value,
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eid_adha">Eid-ul-Adha 2024</Label>
              <Input
                id="eid_adha"
                type="date"
                value={formData.eid_dates?.eid_ul_adha_2024 || ""}
                onChange={(e) => {
                  handleChange("eid_dates", {
                    ...(formData.eid_dates || {}),
                    eid_ul_adha_2024: e.target.value,
                  });
                }}
              />
            </div>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
}
