// src/components/theme/CSSEditor.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Save,
  Code,
  Eye,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../ui/input";

interface CSSEditorProps {
  css: Record<string, any>;
  onSave: (css: Record<string, any>) => Promise<void> | void;
}

export default function CSSEditor({ css, onSave }: CSSEditorProps) {
  const [localCss, setLocalCss] = useState<Record<string, any>>(css);
  const [saving, setSaving] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState("global");
  const [customClasses, setCustomClasses] = useState<
    Array<{ selector: string; styles: string }>
  >([]);
  const [newClass, setNewClass] = useState({ selector: "", styles: "" });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize with default structure
  useEffect(() => {
    const defaultCss = {
      global: {
        ":root": {
          "--radius": "0.5rem",
        },
        "*": {
          margin: "0",
          padding: "0",
          "box-sizing": "border-box",
        },
        body: {
          "font-family": "system-ui, sans-serif",
          "line-height": "1.5",
        },
      },
      components: {},
      utilities: {},
      custom: {},
    };

    setLocalCss((prev) => ({
      ...defaultCss,
      ...prev,
    }));

    // Parse existing custom classes
    if (css.custom) {
      const classes = Object.entries(css.custom).map(([selector, styles]) => ({
        selector,
        styles:
          typeof styles === "string" ? styles : JSON.stringify(styles, null, 2),
      }));
      setCustomClasses(classes);
    }
  }, [css]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate CSS
      if (validationError) {
        toast.error(`CSS Error: ${validationError}`);
        return;
      }

      // Convert custom classes to object
      const customCssObj: Record<string, any> = {};
      customClasses.forEach((cls) => {
        try {
          // Try to parse as JSON, otherwise treat as string
          customCssObj[cls.selector] = JSON.parse(cls.styles);
        } catch {
          // If not valid JSON, assume it's CSS string
          customCssObj[cls.selector] = cls.styles;
        }
      });

      const finalCss = {
        ...localCss,
        custom: customCssObj,
      };

      await onSave(finalCss);
      toast.success("CSS saved successfully");
    } catch (error) {
      toast.error("Failed to save CSS");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all CSS changes?")) {
      setLocalCss(css);
      setCustomClasses([]);
      setNewClass({ selector: "", styles: "" });
      toast.success("CSS reset to original");
    }
  };

  const addCustomClass = () => {
    if (!newClass.selector || !newClass.styles) {
      toast.error("Please provide both selector and CSS");
      return;
    }

    // Validate CSS
    try {
      // Try to parse as JSON for validation
      if (newClass.styles.trim().startsWith("{")) {
        JSON.parse(newClass.styles);
      }
    } catch (error) {
      setValidationError("Invalid CSS/JSON format");
      return;
    }

    setCustomClasses([...customClasses, newClass]);
    setNewClass({ selector: "", styles: "" });
    setValidationError(null);
    toast.success("Custom class added");
  };

  const removeCustomClass = (index: number) => {
    const newClasses = [...customClasses];
    newClasses.splice(index, 1);
    setCustomClasses(newClasses);
    toast.success("Custom class removed");
  };

  //   const updateCssSection = (
  //     section: keyof typeof localCss,
  //     selector: string,
  //     property: string,
  //     value: string,
  //   ) => {
  //     setLocalCss((prev) => {
  //       const newCss = { ...prev };
  //       if (!newCss[section]) newCss[section] = {};
  //       if (!newCss[section][selector]) newCss[section][selector] = {};
  //       newCss[section][selector][property] = value;
  //       return newCss;
  //     });
  //   };

  const renderGlobalCssEditor = () => (
    <div className="space-y-4">
      <div>
        <Label>Global CSS Variables</Label>
        <Textarea
          value={JSON.stringify(localCss.global || {}, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setLocalCss((prev) => ({ ...prev, global: parsed }));
              setValidationError(null);
            } catch (error) {
              setValidationError("Invalid JSON format");
            }
          }}
          rows={8}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderCustomClassesEditor = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Add Custom CSS Class</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Input
              placeholder=".my-class or #my-id"
              value={newClass.selector}
              onChange={(e) =>
                setNewClass({ ...newClass, selector: e.target.value })
              }
            />
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="{ color: red; font-size: 16px; }"
              value={newClass.styles}
              onChange={(e) =>
                setNewClass({ ...newClass, styles: e.target.value })
              }
              rows={3}
              className="flex-1 font-mono text-sm"
            />
            <Button onClick={addCustomClass}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <hr />

      <div className="space-y-3">
        <Label>Custom Classes</Label>
        {customClasses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No custom classes added yet
          </div>
        ) : (
          <div className="space-y-3">
            {customClasses.map((cls, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <code className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
                      {cls.selector}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomClass(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                    {cls.styles}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCssPreview = () => (
    <Card>
      <CardHeader>
        <CardTitle>CSS Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto">
            {Object.entries(localCss).map(([section, rules]) => (
              <div key={section}>
                <span className="text-blue-400">/* {section} */</span>
                {Object.entries(rules as Record<string, any>).map(
                  ([selector, properties]) => (
                    <div key={selector} className="ml-4">
                      <span className="text-yellow-300">{selector}</span> {"{"}
                      {Object.entries(properties as Record<string, any>).map(
                        ([prop, value]) => (
                          <div key={prop} className="ml-4">
                            <span className="text-green-400">{prop}</span>:{" "}
                            <span className="text-yellow-200">
                              {value as string}
                            </span>
                            ;
                          </div>
                        ),
                      )}
                      {"}"}
                    </div>
                  ),
                )}
              </div>
            ))}
            {customClasses.map((cls, index) => (
              <div key={index} className="mt-2">
                <span className="text-yellow-300">{cls.selector}</span> {"{"}
                <div className="ml-4">
                  {cls.styles
                    .split(";")
                    .filter((s) => s.trim())
                    .map((style, i) => (
                      <div key={i}>
                        <span className="text-green-400">
                          {style.split(":")[0]?.trim()}
                        </span>
                        :
                        <span className="text-yellow-200">
                          {style.split(":").slice(1).join(":").trim()}
                        </span>
                        ;
                      </div>
                    ))}
                </div>
                {"}"}
              </div>
            ))}
          </pre>
        </div>
      </CardContent>
    </Card>
  );

  const renderQuickTemplates = () => {
    const templates = [
      {
        name: "Dark Mode",
        css: {
          dark: {
            "background-color": "#1a1a1a",
            color: "#ffffff",
          },
        },
      },
      {
        name: "Mobile Optimization",
        css: {
          "@media (max-width: 768px)": {
            body: {
              "font-size": "14px",
            },
          },
        },
      },
      {
        name: "Print Styles",
        css: {
          "@media print": {
            body: {
              background: "white",
            },
          },
        },
      },
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {templates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-3"
                onClick={() => {
                  setLocalCss((prev) => ({
                    ...prev,
                    ...template.css,
                  }));
                  toast.success(`Applied ${template.name} template`);
                }}
              >
                <div className="text-left">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Click to apply
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div
      className={`space-y-6 ${fullScreen ? "fixed inset-0 bg-white z-50 p-4 overflow-auto" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Custom CSS Editor</h2>
          <p className="text-gray-600">
            Add custom CSS styles and overrides for your theme
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setFullScreen(!fullScreen)}>
            {fullScreen ? (
              <Minimize2 className="h-4 w-4 mr-2" />
            ) : (
              <Maximize2 className="h-4 w-4 mr-2" />
            )}
            {fullScreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className={`h-4 w-4 mr-2 ${saving ? "animate-spin" : ""}`} />
            {saving ? "Saving..." : "Save CSS"}
          </Button>
        </div>
      </div>

      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <X className="h-5 w-5" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="global">
                <Code className="h-4 w-4 mr-2" />
                Global CSS
              </TabsTrigger>
              <TabsTrigger value="custom">
                <Plus className="h-4 w-4 mr-2" />
                Custom Classes
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="global" className="space-y-4">
              {renderGlobalCssEditor()}
            </TabsContent>
            <TabsContent value="custom" className="space-y-4">
              {renderCustomClassesEditor()}
            </TabsContent>
            <TabsContent value="preview" className="space-y-4">
              {renderCssPreview()}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {renderQuickTemplates()}

          <Card>
            <CardHeader>
              <CardTitle>CSS Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Use CSS Variables:</h4>
                <code className="block bg-gray-100 p-2 rounded text-xs">
                  :root {"{ --primary-color: #3b82f6; }"}
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Media Queries:</h4>
                <code className="block bg-gray-100 p-2 rounded text-xs">
                  @media (max-width: 768px) {"{ ... }"}
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Pseudo-classes:</h4>
                <code className="block bg-gray-100 p-2 rounded text-xs">
                  .btn:hover {"{ opacity: 0.9; }"}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
