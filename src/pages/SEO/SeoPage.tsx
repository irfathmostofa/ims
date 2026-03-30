"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Pen,
  Trash2,
  Plus,
  Link2,
  Tag,
  Globe,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  X,
  Map,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";

// Types
interface SeoMeta {
  id?: number;
  entity_type: "product" | "category" | "page" | "brand" | "static";
  entity_id: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  schema_json?: any;
  is_index?: boolean;
  is_follow?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SeoMetaWithDisplay extends SeoMeta {
  entity_display: string;
}

interface SeoRedirect {
  id?: number;
  old_url: string;
  new_url: string;
  redirect_type: number;
  created_at?: string;
}

interface SeoKeyword {
  id?: number;
  entity_type?: "product" | "category" | "page" | "brand" | "static";
  entity_id?: number;
  keyword: string;
}

interface SeoKeywordWithDisplay extends SeoKeyword {
  entity_display: string;
}

interface SeoSitemap {
  id?: number;
  url: string;
  priority?: number;
  change_freq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  last_modified?: string;
}

interface Product {
  id: number;
  name: string;
  slug?: string;
}

interface Category {
  id: number;
  name: string;
  slug?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginationData<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const STATIC_PAGES = [
  { id: 1, name: "Home", slug: "/", type: "static" },
  { id: 2, name: "About Us", slug: "/about", type: "static" },
  { id: 3, name: "Contact Us", slug: "/contact", type: "static" },
  { id: 4, name: "Terms & Conditions", slug: "/terms", type: "static" },
  { id: 5, name: "Privacy Policy", slug: "/privacy", type: "static" },
  { id: 6, name: "FAQ", slug: "/faq", type: "static" },
  { id: 7, name: "Shipping Policy", slug: "/shipping", type: "static" },
  { id: 8, name: "Return Policy", slug: "/returns", type: "static" },
  { id: 9, name: "Blog", slug: "/blog", type: "static" },
  { id: 10, name: "Shop", slug: "/shop", type: "static" },
];

const SERVER_URL = import.meta.env.VITE_SERVER;

type TabType = "meta" | "redirect" | "keyword" | "sitemap";

const TAB_CONFIG = {
  meta: {
    icon: Globe,
    label: "Meta Tags",
    description: "Manage page metadata, Open Graph, and Twitter cards",
    color: "blue",
  },
  redirect: {
    icon: Link2,
    label: "Redirects",
    description: "Setup URL redirects and maintain link equity",
    color: "purple",
  },
  keyword: {
    icon: Tag,
    label: "Keywords",
    description: "Organize SEO keywords for your content",
    color: "green",
  },
  sitemap: {
    icon: Map,
    label: "Sitemap",
    description: "Configure sitemap entries and crawl priorities",
    color: "orange",
  },
} as const;

// Type guards
const isSeoMeta = (item: any): item is SeoMetaWithDisplay => {
  return item && "entity_type" in item && "meta_title" in item;
};

const isSeoRedirect = (item: any): item is SeoRedirect => {
  return item && "old_url" in item && "new_url" in item;
};

const isSeoKeyword = (item: any): item is SeoKeywordWithDisplay => {
  return item && "keyword" in item;
};

const isSeoSitemap = (item: any): item is SeoSitemap => {
  return item && "url" in item;
};

export default function SeoPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("meta");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<
    Partial<SeoMeta | SeoRedirect | SeoKeyword | SeoSitemap>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const rowsPerPage = 10;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [metaData, setMetaData] = useState<SeoMeta[]>([]);
  const [redirectData, setRedirectData] = useState<SeoRedirect[]>([]);
  const [keywordData, setKeywordData] = useState<SeoKeyword[]>([]);
  const [sitemapData, setSitemapData] = useState<SeoSitemap[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab, updateTrigger]);

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setError(null);
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient<ApiResponse<{ data: Product[] }>>(
        `${SERVER_URL}/product/get-all-products`,
        {
          method: "POST",
          data: { page: 1, limit: 100 },
          tokenType: "jwt",
        },
      );
      setProducts(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient<ApiResponse<Category[]>>(
        `${SERVER_URL}/product/get-product-cat`,
        {
          method: "GET",
          tokenType: "jwt",
        },
      );
      setCategories(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case "meta":
          await fetchMetaData();
          break;
        case "redirect":
          await fetchRedirectData();
          break;
        case "keyword":
          await fetchKeywordData();
          break;
        case "sitemap":
          await fetchSitemapData();
          break;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch data";
      setError(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetaData = async () => {
    const response = await apiClient<ApiResponse<PaginationData<SeoMeta>>>(
      `${SERVER_URL}/seo/meta?page=1&limit=1000`,
      {
        method: "GET",
        tokenType: "jwt",
      },
    );
    const data = response?.data?.data;
    setMetaData(Array.isArray(data) ? data : []);
  };

  const fetchRedirectData = async () => {
    const response = await apiClient<ApiResponse<PaginationData<SeoRedirect>>>(
      `${SERVER_URL}/seo/redirect?page=1&limit=1000`,
      {
        method: "GET",
        tokenType: "jwt",
      },
    );
    const data = response?.data?.data;
    setRedirectData(Array.isArray(data) ? data : []);
  };

  const fetchKeywordData = async () => {
    const response = await apiClient<ApiResponse<PaginationData<SeoKeyword>>>(
      `${SERVER_URL}/seo/keyword?page=1&limit=1000`,
      {
        method: "GET",
        tokenType: "jwt",
      },
    );
    const data = response?.data?.data;
    setKeywordData(Array.isArray(data) ? data : []);
  };

  const fetchSitemapData = async () => {
    const response = await apiClient<ApiResponse<PaginationData<SeoSitemap>>>(
      `${SERVER_URL}/seo/sitemap?page=1&limit=1000`,
      {
        method: "GET",
        tokenType: "jwt",
      },
    );
    const data = response?.data?.data;
    setSitemapData(Array.isArray(data) ? data : []);
  };

  const validateForm = (): boolean => {
    switch (activeTab) {
      case "meta": {
        const metaForm = form as Partial<SeoMeta>;
        if (!metaForm.entity_type || !metaForm.entity_id) {
          setError("Entity type and ID are required");
          return false;
        }
        break;
      }
      case "redirect": {
        const redirectForm = form as Partial<SeoRedirect>;
        if (!redirectForm.old_url || !redirectForm.new_url) {
          setError("Old URL and New URL are required");
          return false;
        }
        break;
      }
      case "keyword": {
        const keywordForm = form as Partial<SeoKeyword>;
        if (!keywordForm.keyword) {
          setError("Keyword is required");
          return false;
        }
        break;
      }
      case "sitemap": {
        const sitemapForm = form as Partial<SeoSitemap>;
        if (!sitemapForm.url) {
          setError("URL is required");
          return false;
        }
        break;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      switch (activeTab) {
        case "meta": {
          const metaForm = form as Partial<SeoMeta>;
          const endpoint = metaForm.id
            ? `${SERVER_URL}/seo/update-meta/${metaForm.id}`
            : `${SERVER_URL}/seo/meta`;

          await apiClient<ApiResponse>(endpoint, {
            method: "POST",
            data: metaForm,
            tokenType: "jwt",
          });
          break;
        }

        case "redirect": {
          const redirectForm = form as Partial<SeoRedirect>;
          const endpoint = redirectForm.id
            ? `${SERVER_URL}/seo/update-redirect/${redirectForm.id}`
            : `${SERVER_URL}/seo/redirect`;

          await apiClient<ApiResponse>(endpoint, {
            method: "POST",
            data: redirectForm,
            tokenType: "jwt",
          });
          break;
        }

        case "keyword": {
          const keywordForm = form as Partial<SeoKeyword>;
          const endpoint = keywordForm.id
            ? `${SERVER_URL}/seo/update-keyword/${keywordForm.id}`
            : `${SERVER_URL}/seo/keyword`;

          await apiClient<ApiResponse>(endpoint, {
            method: "POST",
            data: keywordForm,
            tokenType: "jwt",
          });
          break;
        }

        case "sitemap": {
          const sitemapForm = form as Partial<SeoSitemap>;
          const endpoint = sitemapForm.id
            ? `${SERVER_URL}/seo/update-sitemap/${sitemapForm.id}`
            : `${SERVER_URL}/seo/sitemap`;

          await apiClient<ApiResponse>(endpoint, {
            method: "POST",
            data: sitemapForm,
            tokenType: "jwt",
          });
          break;
        }
      }

      setForm({});
      setOpen(false);
      setUpdateTrigger((prev) => prev + 1);
      toast.success(
        "id" in form && form.id
          ? "Updated successfully!"
          : "Created successfully!",
      );
    } catch (error: any) {
      const message = error?.message || "Failed to save";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row: any) => {
    setForm(row);
    setError(null);
    setOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (!confirm(`Are you sure you want to delete this item?`)) return;

    try {
      setLoading(true);
      setError(null);

      switch (activeTab) {
        case "meta":
          await apiClient(`${SERVER_URL}/seo/delete-meta/${row.id}`, {
            method: "POST",
            tokenType: "jwt",
          });
          break;
        case "redirect":
          await apiClient(`${SERVER_URL}/seo/delete-redirect/${row.id}`, {
            method: "POST",
            tokenType: "jwt",
          });
          break;
        case "keyword":
          await apiClient(`${SERVER_URL}/seo/delete-keyword/${row.id}`, {
            method: "POST",
            tokenType: "jwt",
          });
          break;
        case "sitemap":
          await apiClient(`${SERVER_URL}/seo/delete-sitemap/${row.id}`, {
            method: "POST",
            tokenType: "jwt",
          });
          break;
      }

      setUpdateTrigger((prev) => prev + 1);
      toast.success("Deleted successfully!");
    } catch (error: any) {
      const message = error?.message || "Failed to delete";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = useCallback((text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const getEntityName = (type: string, id: number): string => {
    if (type === "product") {
      const product = products.find((p) => p.id === id);
      return product?.name || `Product #${id}`;
    }
    if (type === "category") {
      const category = categories.find((c) => c.id === id);
      return category?.name || `Category #${id}`;
    }
    if (type === "static") {
      const page = STATIC_PAGES.find((p) => p.id === id);
      return page?.name || `Static Page #${id}`;
    }
    return `${type} #${id}`;
  };

  const getCurrentData = useMemo(() => {
    try {
      switch (activeTab) {
        case "meta":
          return (metaData || []).map(
            (item): SeoMetaWithDisplay => ({
              ...item,
              entity_display:
                item.entity_type && item.entity_id
                  ? getEntityName(item.entity_type, item.entity_id)
                  : "N/A",
            }),
          );

        case "redirect":
          return redirectData || [];

        case "keyword":
          return (keywordData || []).map(
            (item): SeoKeywordWithDisplay => ({
              ...item,
              entity_display:
                item.entity_type && item.entity_id
                  ? getEntityName(item.entity_type, item.entity_id)
                  : "Global",
            }),
          );

        case "sitemap":
          return sitemapData || [];

        default:
          return [];
      }
    } catch (error) {
      console.error("Error in getCurrentData:", error);
      return [];
    }
  }, [activeTab, metaData, redirectData, keywordData, sitemapData]);

  const getFilteredData = useMemo(() => {
    if (!searchTerm) return getCurrentData;

    const searchLower = searchTerm.toLowerCase();
    return getCurrentData.filter((item) => {
      if (isSeoMeta(item)) {
        return (
          item.meta_title?.toLowerCase().includes(searchLower) ||
          item.entity_display?.toLowerCase().includes(searchLower)
        );
      }
      if (isSeoRedirect(item)) {
        return (
          item.old_url?.toLowerCase().includes(searchLower) ||
          item.new_url?.toLowerCase().includes(searchLower)
        );
      }
      if (isSeoKeyword(item)) {
        return (
          item.keyword?.toLowerCase().includes(searchLower) ||
          item.entity_display?.toLowerCase().includes(searchLower)
        );
      }
      if (isSeoSitemap(item)) {
        return item.url?.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [searchTerm, getCurrentData]);

  const getPaginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return getFilteredData.slice(startIndex, endIndex);
  }, [getFilteredData, currentPage]);

  const getTotalPages = useMemo(() => {
    return Math.ceil(getFilteredData.length / rowsPerPage);
  }, [getFilteredData]);

  const renderMetaForm = () => {
    const metaForm = form as Partial<SeoMeta>;
    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Entity Type <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={metaForm.entity_type || ""}
            onChange={(e) =>
              setForm({ ...metaForm, entity_type: e.target.value as any })
            }
          >
            <option value="">Select an entity type...</option>
            <option value="product">Product</option>
            <option value="category">Category</option>
            <option value="static">Static Page</option>
            <option value="brand">Brand</option>
            <option value="page">Custom Page</option>
          </select>
        </div>

        {metaForm.entity_type === "product" && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Select Product <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={metaForm.entity_id || ""}
              onChange={(e) =>
                setForm({ ...metaForm, entity_id: Number(e.target.value) })
              }
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {metaForm.entity_type === "category" && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Select Category <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={metaForm.entity_id || ""}
              onChange={(e) =>
                setForm({ ...metaForm, entity_id: Number(e.target.value) })
              }
            >
              <option value="">Choose a category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {metaForm.entity_type === "static" && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Select Page <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={metaForm.entity_id || ""}
              onChange={(e) =>
                setForm({ ...metaForm, entity_id: Number(e.target.value) })
              }
            >
              <option value="">Choose a page...</option>
              {STATIC_PAGES.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="border-t pt-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Globe size={16} /> Page Metadata
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Meta Title
            </label>
            <input
              type="text"
              placeholder="Compelling page title (50-60 chars)"
              maxLength={60}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={metaForm.meta_title || ""}
              onChange={(e) =>
                setForm({ ...metaForm, meta_title: e.target.value })
              }
            />
            <p className="text-xs text-slate-500">
              {metaForm.meta_title?.length || 0}/60 characters
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Meta Description
            </label>
            <textarea
              placeholder="Engaging description (150-160 chars)"
              maxLength={160}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              rows={3}
              value={metaForm.meta_description || ""}
              onChange={(e) =>
                setForm({ ...metaForm, meta_description: e.target.value })
              }
            />
            <p className="text-xs text-slate-500">
              {metaForm.meta_description?.length || 0}/160 characters
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Canonical URL
            </label>
            <input
              type="text"
              placeholder="https://example.com/page"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={metaForm.canonical_url || ""}
              onChange={(e) =>
                setForm({ ...metaForm, canonical_url: e.target.value })
              }
            />
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">
            Robot Settings
          </h3>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={metaForm.is_index !== false}
                onChange={(e) =>
                  setForm({ ...metaForm, is_index: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-slate-700">Allow Indexing</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={metaForm.is_follow !== false}
                onChange={(e) =>
                  setForm({ ...metaForm, is_follow: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-slate-700">Follow Links</span>
            </label>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">
            Open Graph (Social Media)
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              OG Title
            </label>
            <input
              type="text"
              placeholder="Title for sharing"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={metaForm.og_title || ""}
              onChange={(e) =>
                setForm({ ...metaForm, og_title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              OG Description
            </label>
            <textarea
              placeholder="Description for sharing"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              rows={2}
              value={metaForm.og_description || ""}
              onChange={(e) =>
                setForm({ ...metaForm, og_description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              OG Image URL
            </label>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={metaForm.og_image || ""}
              onChange={(e) =>
                setForm({ ...metaForm, og_image: e.target.value })
              }
            />
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Twitter Card</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Twitter Title
            </label>
            <input
              type="text"
              placeholder="Title for Twitter"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={metaForm.twitter_title || ""}
              onChange={(e) =>
                setForm({ ...metaForm, twitter_title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Twitter Description
            </label>
            <textarea
              placeholder="Description for Twitter"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              rows={2}
              value={metaForm.twitter_description || ""}
              onChange={(e) =>
                setForm({ ...metaForm, twitter_description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Twitter Image URL
            </label>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={metaForm.twitter_image || ""}
              onChange={(e) =>
                setForm({ ...metaForm, twitter_image: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    );
  };

  const renderRedirectForm = () => {
    const redirectForm = form as Partial<SeoRedirect>;
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Old URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="/old-product-name"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={redirectForm.old_url || ""}
            onChange={(e) =>
              setForm({ ...redirectForm, old_url: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            New URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="/new-product-name"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={redirectForm.new_url || ""}
            onChange={(e) =>
              setForm({ ...redirectForm, new_url: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Redirect Type
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={redirectForm.redirect_type || 301}
            onChange={(e) =>
              setForm({
                ...redirectForm,
                redirect_type: Number(e.target.value),
              })
            }
          >
            <option value={301}>301 - Permanent</option>
            <option value={302}>302 - Temporary</option>
          </select>
          <p className="text-xs text-slate-500">
            Use 301 for permanent redirects, 302 for temporary
          </p>
        </div>
      </div>
    );
  };

  const renderKeywordForm = () => {
    const keywordForm = form as Partial<SeoKeyword>;
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Keyword <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter your SEO keyword"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={keywordForm.keyword || ""}
            onChange={(e) =>
              setForm({ ...keywordForm, keyword: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Link to Entity (Optional)
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={keywordForm.entity_type || ""}
            onChange={(e) =>
              setForm({ ...keywordForm, entity_type: e.target.value as any })
            }
          >
            <option value="">Global keyword (not linked)</option>
            <option value="product">Product</option>
            <option value="category">Category</option>
            <option value="static">Static Page</option>
          </select>
        </div>

        {keywordForm.entity_type === "product" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Select Product
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={keywordForm.entity_id || ""}
              onChange={(e) =>
                setForm({ ...keywordForm, entity_id: Number(e.target.value) })
              }
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {keywordForm.entity_type === "category" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Select Category
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={keywordForm.entity_id || ""}
              onChange={(e) =>
                setForm({ ...keywordForm, entity_id: Number(e.target.value) })
              }
            >
              <option value="">Choose a category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {keywordForm.entity_type === "static" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Select Page
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={keywordForm.entity_id || ""}
              onChange={(e) =>
                setForm({ ...keywordForm, entity_id: Number(e.target.value) })
              }
            >
              <option value="">Choose a page...</option>
              {STATIC_PAGES.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  const renderSitemapForm = () => {
    const sitemapForm = form as Partial<SeoSitemap>;
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="/products/category-name"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={sitemapForm.url || ""}
            onChange={(e) => setForm({ ...sitemapForm, url: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Priority (0.0 - 1.0)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            placeholder="0.5"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={sitemapForm.priority || 0.5}
            onChange={(e) =>
              setForm({
                ...sitemapForm,
                priority: parseFloat(e.target.value),
              })
            }
          />
          <p className="text-xs text-slate-500">
            Higher values (0.8-1.0) for important pages, lower (0.0-0.3) for
            less important
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Change Frequency
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={sitemapForm.change_freq || ""}
            onChange={(e) =>
              setForm({ ...sitemapForm, change_freq: e.target.value as any })
            }
          >
            <option value="">Select frequency...</option>
            <option value="always">Always</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="never">Never</option>
          </select>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    switch (activeTab) {
      case "meta":
        return renderMetaForm();
      case "redirect":
        return renderRedirectForm();
      case "keyword":
        return renderKeywordForm();
      case "sitemap":
        return renderSitemapForm();
      default:
        return null;
    }
  };

  const renderTable = () => {
    const currentConfig = TAB_CONFIG[activeTab];
    const data = getPaginatedData;

    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-slate-100 rounded-full p-4 mb-4">
            <currentConfig.icon size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-600 text-center">
            {searchTerm
              ? "No matching items found"
              : `No ${currentConfig.label.toLowerCase()} yet`}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              className="mt-4"
            >
              <Plus size={16} className="mr-2" />
              Add your first {currentConfig.label.toLowerCase()}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {activeTab === "meta" && (
                <>
                  <th className="w-1/4 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="w-2/4 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Meta Title
                  </th>
                  <th className="w-1/6 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Indexed
                  </th>
                  <th className="w-1/12 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </>
              )}
              {activeTab === "redirect" && (
                <>
                  <th className="w-2/5 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    From
                  </th>
                  <th className="w-2/5 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    To
                  </th>
                  <th className="w-1/6 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="w-1/12 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </>
              )}
              {activeTab === "keyword" && (
                <>
                  <th className="w-1/3 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="w-1/2 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Linked To
                  </th>
                  <th className="w-1/12 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </>
              )}
              {activeTab === "sitemap" && (
                <>
                  <th className="w-2/5 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="w-1/4 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="w-1/4 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="w-1/12 px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                {activeTab === "meta" && isSeoMeta(item) && (
                  <>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {item.entity_type}
                        </span>
                        <span className="text-slate-600">
                          {item.entity_display}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">
                      {item.meta_title || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.is_index
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {item.is_index ? (
                          <>
                            <Eye size={14} /> Index
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} /> Noindex
                          </>
                        )}
                      </span>
                    </td>
                  </>
                )}

                {activeTab === "redirect" && isSeoRedirect(item) && (
                  <>
                    <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{item.old_url}</span>
                        <button
                          onClick={() =>
                            copyToClipboard(item.old_url, item.id!)
                          }
                          className="p-1 hover:bg-slate-200 rounded transition text-slate-400 hover:text-slate-600 flex-shrink-0"
                        >
                          {copied === item.id ? (
                            <CheckCircle size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-mono truncate">
                      {item.new_url}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.redirect_type === 301
                            ? "bg-blue-50 text-blue-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {item.redirect_type} -{" "}
                        {item.redirect_type === 301 ? "Permanent" : "Temporary"}
                      </span>
                    </td>
                  </>
                )}

                {activeTab === "keyword" && isSeoKeyword(item) && (
                  <>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700">
                        <Tag size={14} className="text-purple-600" />
                        {item.keyword}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.entity_display}
                    </td>
                  </>
                )}

                {activeTab === "sitemap" && isSeoSitemap(item) && (
                  <>
                    <td className="px-6 py-4 text-sm font-mono text-slate-700 truncate">
                      {item.url}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                            style={{
                              width: `${(item.priority || 0.5) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700 w-8">
                          {(item.priority || 0.5).toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {item.change_freq || "N/A"}
                      </span>
                    </td>
                  </>
                )}

                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                      title="Edit"
                    >
                      <Pen size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const currentConfig = TAB_CONFIG[activeTab];
  const Icon = currentConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-full mx-auto px-6 py-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                SEO Management
              </h1>
              <p className="text-slate-600 mt-1">
                Optimize your site for search engines with comprehensive SEO
                tools
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all">
                  <Plus size={18} />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle className="text-xl font-bold text-slate-900">
                    {"id" in form && form.id ? "Edit " : "Create New "}
                    {currentConfig.label}
                  </DialogTitle>
                </DialogHeader>

                {error && (
                  <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mt-4 flex-shrink-0">
                    <AlertCircle
                      size={20}
                      className="text-red-600 flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-red-800 font-medium">
                        {error}
                      </p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto mt-4 -mx-6 px-6">
                  {renderForm()}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setError(null);
                      setForm({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : "id" in form && form.id ? (
                      <>
                        <Pen size={16} className="mr-2" />
                        Update
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="mr-2" />
                        Create
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-6 py-2">
        {/* Tab Navigation */}
        <div className="mb-2">
          <div className="flex gap-2 bg-white rounded-xl shadow-sm p-1 border border-slate-200 w-full">
            {(["meta", "redirect", "keyword", "sitemap"] as TabType[]).map(
              (tab) => {
                const config = TAB_CONFIG[tab];
                const TabIcon = config.icon;
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-blue-50 text-blue-700 shadow-sm font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <TabIcon size={18} />
                    <span className="text-sm font-medium hidden sm:inline">
                      {config.label}
                    </span>
                  </button>
                );
              },
            )}
          </div>

          <p className="text-sm text-slate-600 mt-3">
            {currentConfig.description}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search across all items..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-700">
            <Icon size={16} />
            <span>
              {getFilteredData.length} {currentConfig.label.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-blue-600 mb-4" />
              <p className="text-slate-600">
                Loading {currentConfig.label.toLowerCase()}...
              </p>
            </div>
          ) : (
            renderTable()
          )}
        </div>

        {/* Pagination */}
        {getTotalPages > 1 && !loading && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600 order-2 sm:order-1">
              Showing{" "}
              <span className="font-semibold">
                {getFilteredData.length === 0
                  ? 0
                  : (currentPage - 1) * rowsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(currentPage * rowsPerPage, getFilteredData.length)}
              </span>{" "}
              of <span className="font-semibold">{getFilteredData.length}</span>{" "}
              entries
            </div>
            <div className="flex gap-3 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </Button>
              <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-700">
                Page{" "}
                <span className="font-semibold text-blue-600">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-blue-600">
                  {getTotalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, getTotalPages))
                }
                disabled={currentPage === getTotalPages}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
