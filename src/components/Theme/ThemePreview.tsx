// src/components/theme/ThemePreview.tsx
import  { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  RefreshCw,
  Eye,
  Download,
  Share2,
  Code,
} from "lucide-react";

interface ThemePreviewProps {
  theme: any;
}

export default function ThemePreview({ theme }: ThemePreviewProps) {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );
  const [showGrid, setShowGrid] = useState(false);
  const [loading, setLoading] = useState(false);

  const deviceDimensions = {
    mobile: { width: "375px", height: "667px" },
    tablet: { width: "768px", height: "1024px" },
    desktop: { width: "100%", height: "100%" },
  };

  const previewUrl = `${window.location.origin}/preview/${theme.slug}?preview=true`;

  const handleRefresh = () => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
    toast.success("Preview refreshed");
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(previewUrl);
    toast.success("Preview URL copied to clipboard");
  };

  const renderDevicePreview = () => {
    const dimensions = deviceDimensions[device];

    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant={device === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={device === "tablet" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={device === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="show-grid"
                checked={showGrid}
                onCheckedChange={setShowGrid}
              />
              <Label htmlFor="show-grid">Show Grid</Label>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        <div
          className={`relative border-4 border-gray-800 rounded-lg mx-auto bg-white overflow-auto ${
            device === "desktop" ? "w-full" : ""
          } ${showGrid ? "bg-grid-pattern" : ""}`}
          style={{
            width: dimensions.width,
            height: device === "desktop" ? "600px" : dimensions.height,
            maxHeight: "600px",
          }}
        >
          {/* Mock header */}
          <div className="sticky top-0 bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded"></div>
                <span className="font-semibold">Site Logo</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-4">
                  <span className="text-sm">Home</span>
                  <span className="text-sm">About</span>
                  <span className="text-sm">Services</span>
                  <span className="text-sm">Contact</span>
                </div>
                <Button size="sm">Get Started</Button>
              </div>
            </div>
          </div>

          {/* Mock hero section */}
          <div className="p-8 text-center bg-gradient-to-r from-primary/10 to-secondary/10">
            <h1 className="text-4xl font-bold mb-4">Welcome to Our Website</h1>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              This is a preview of how your theme will look. The actual content
              will be replaced with your own.
            </p>
            <div className="flex gap-3 justify-center">
              <Button>Primary Action</Button>
              <Button variant="outline">Secondary Action</Button>
            </div>
          </div>

          {/* Mock content sections */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg mb-4 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Feature {i}</h3>
                    <p className="text-sm text-gray-600">
                      This is a sample feature card that demonstrates your
                      theme's styling.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mock call to action */}
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-gray-600 mb-6">
                This section shows how call-to-action elements will appear with
                your theme.
              </p>
              <Button size="lg">Start Free Trial</Button>
            </div>
          </div>

          {/* Mock footer */}
          <div className="bg-gray-900 text-white p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>About Us</div>
                  <div>Careers</div>
                  <div>Press</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>Documentation</div>
                  <div>Blog</div>
                  <div>Support</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>Privacy Policy</div>
                  <div>Terms of Service</div>
                  <div>Cookie Policy</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Stay Updated</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Subscribe to our newsletter for the latest updates.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 rounded text-gray-900"
                  />
                  <Button size="sm">Subscribe</Button>
                </div>
              </div>
            </div>
            <Separator className="my-6 bg-gray-700" />
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
              <div>© 2024 Your Company. All rights reserved.</div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <span>Twitter</span>
                <span>LinkedIn</span>
                <span>GitHub</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -top-2 -right-2">
          <Badge variant="secondary" className="px-2 py-1 text-xs">
            {device === "mobile"
              ? "375px"
              : device === "tablet"
                ? "768px"
                : "Desktop"}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Theme Preview</h2>
          <p className="text-gray-600">
            Preview how your theme will look on different devices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleCopyUrl}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Preview
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(previewUrl, "_blank")}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Open Fullscreen
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Theme
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>{renderDevicePreview()}</CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600">Theme Name</Label>
                <div className="font-medium">{theme.name}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Status</Label>
                <Badge
                  variant={
                    theme.status === "published"
                      ? "default"
                      : theme.status === "draft"
                        ? "outline"
                        : "secondary"
                  }
                >
                  {theme.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Last Updated</Label>
                <div className="font-medium">
                  {new Date(theme.updated_at).toLocaleDateString()}
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-sm text-gray-600 mb-2">
                  Preview URL
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={previewUrl}
                    className="flex-1 px-3 py-2 border rounded text-sm truncate"
                  />
                  <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm">Sample Content</Label>
                <Select defaultValue="default">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Content</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="portfolio">Portfolio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-labels" className="text-sm">
                  Show Element Labels
                </Label>
                <Switch id="show-labels" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-outlines" className="text-sm">
                  Show Section Outlines
                </Label>
                <Switch id="show-outlines" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Code Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" size="sm">
                View Compiled CSS
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
