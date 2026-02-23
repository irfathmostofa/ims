"use client";

import { useState, useEffect } from "react";
import {
  Pen,
  Trash,
  Plus,
  Link,
  Tags,
  Map,
  Globe,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

// Static pages for e-commerce site
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
  { id: 11, name: "Cart", slug: "/cart", type: "static" },
  { id: 12, name: "Checkout", slug: "/checkout", type: "static" },
  { id: 13, name: "My Account", slug: "/account", type: "static" },
  { id: 14, name: "Wishlist", slug: "/wishlist", type: "static" },
  { id: 15, name: "Compare", slug: "/compare", type: "static" },
  { id: 16, name: "New Arrivals", slug: "/new-arrivals", type: "static" },
  { id: 17, name: "Best Sellers", slug: "/best-sellers", type: "static" },
  { id: 18, name: "Sale", slug: "/sale", type: "static" },
  { id: 19, name: "Brands", slug: "/brands", type: "static" },
  { id: 20, name: "Gift Cards", slug: "/gift-cards", type: "static" },
];

const SERVER_URL = import.meta.env.VITE_SERVER;

export default function SeoPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "meta" | "redirect" | "keyword" | "sitemap"
  >("meta");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<
    Partial<SeoMeta | SeoRedirect | SeoKeyword | SeoSitemap>
  >({});
  const [update, setUpdate] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Data states - initialize as empty arrays
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [metaData, setMetaData] = useState<SeoMeta[]>([]);
  const [redirectData, setRedirectData] = useState<SeoRedirect[]>([]);
  const [keywordData, setKeywordData] = useState<SeoKeyword[]>([]);
  const [sitemapData, setSitemapData] = useState<SeoSitemap[]>([]);

  // Fetch products and categories on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab, update]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
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
      setCategories(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
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
      toast.error("Failed to fetch data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetaData = async () => {
    try {
      const response = await apiClient(`${SERVER_URL}/seo/meta`, {
        method: "GET",
        tokenType: "jwt",
      });
      // Ensure we always set an array
      setMetaData(Array.isArray(response?.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch meta data:", error);
      setMetaData([]); // Set empty array on error
      throw error;
    }
  };

  const fetchRedirectData = async () => {
    try {
      const response = await apiClient(`${SERVER_URL}/seo/redirect`, {
        method: "GET",
        tokenType: "jwt",
      });
      setRedirectData(
        Array.isArray(response?.data.data) ? response.data.data : [],
      );
    } catch (error) {
      console.error("Failed to fetch redirect data:", error);
      setRedirectData([]);
      throw error;
    }
  };

  const fetchKeywordData = async () => {
    try {
      const response = await apiClient(`${SERVER_URL}/seo/keyword`, {
        method: "GET",
        tokenType: "jwt",
      });
      setKeywordData(
        Array.isArray(response?.data.data) ? response.data.data : [],
      );
    } catch (error) {
      console.error("Failed to fetch keyword data:", error);
      setKeywordData([]);
      throw error;
    }
  };

  const fetchSitemapData = async () => {
    try {
      const response = await apiClient(`${SERVER_URL}/seo/sitemap`, {
        method: "GET",
        tokenType: "jwt",
      });
      setSitemapData(
        Array.isArray(response?.data.data) ? response.data.data : [],
      );
    } catch (error) {
      console.error("Failed to fetch sitemap data:", error);
      setSitemapData([]);
      throw error;
    }
  };

  // Save (create/update)
  const handleSave = async () => {
    try {
      setLoading(true);

      switch (activeTab) {
        case "meta": {
          const metaForm = form as Partial<SeoMeta>;
          if (!metaForm.entity_type || !metaForm.entity_id) {
            toast.error("Entity type and ID are required");
            return;
          }

          if (metaForm.id) {
            await apiClient<ApiResponse>(
              `${SERVER_URL}/seo/meta/${metaForm.id}`,
              {
                method: "PUT",
                data: metaForm,
                tokenType: "jwt",
              },
            );
          } else {
            await apiClient<ApiResponse>(`${SERVER_URL}/seo/meta`, {
              method: "POST",
              data: metaForm,
              tokenType: "jwt",
            });
          }
          break;
        }

        case "redirect": {
          const redirectForm = form as Partial<SeoRedirect>;
          if (!redirectForm.old_url || !redirectForm.new_url) {
            toast.error("Old URL and New URL are required");
            return;
          }

          if (redirectForm.id) {
            await apiClient<ApiResponse>(
              `${SERVER_URL}/seo/redirect/${redirectForm.id}`,
              {
                method: "PUT",
                data: redirectForm,
                tokenType: "jwt",
              },
            );
          } else {
            await apiClient<ApiResponse>(`${SERVER_URL}/seo/redirect`, {
              method: "POST",
              data: redirectForm,
              tokenType: "jwt",
            });
          }
          break;
        }

        case "keyword": {
          const keywordForm = form as Partial<SeoKeyword>;
          if (!keywordForm.keyword) {
            toast.error("Keyword is required");
            return;
          }

          if (keywordForm.id) {
            await apiClient<ApiResponse>(
              `${SERVER_URL}/seo/keyword/${keywordForm.id}`,
              {
                method: "PUT",
                data: keywordForm,
                tokenType: "jwt",
              },
            );
          } else {
            await apiClient<ApiResponse>(`${SERVER_URL}/seo/keyword`, {
              method: "POST",
              data: keywordForm,
              tokenType: "jwt",
            });
          }
          break;
        }

        case "sitemap": {
          const sitemapForm = form as Partial<SeoSitemap>;
          if (!sitemapForm.url) {
            toast.error("URL is required");
            return;
          }

          if (sitemapForm.id) {
            await apiClient<ApiResponse>(
              `${SERVER_URL}/seo/sitemap/${sitemapForm.id}`,
              {
                method: "PUT",
                data: sitemapForm,
                tokenType: "jwt",
              },
            );
          } else {
            await apiClient<ApiResponse>(`${SERVER_URL}/seo/sitemap`, {
              method: "POST",
              data: sitemapForm,
              tokenType: "jwt",
            });
          }
          break;
        }
      }

      setForm({});
      setOpen(false);
      setUpdate((prev) => prev + 1);
      toast.success("Saved successfully");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (row: any) => {
    setForm(row);
    setOpen(true);
  };

  // Delete
  const handleDelete = async (row: any) => {
    if (!confirm(`Delete this item?`)) return;

    try {
      setLoading(true);

      switch (activeTab) {
        case "meta":
          await apiClient(`${SERVER_URL}/seo/meta/${row.id}`, {
            method: "DELETE",
            tokenType: "jwt",
          });
          break;
        case "redirect":
          await apiClient(`${SERVER_URL}/seo/redirect/${row.id}`, {
            method: "DELETE",
            tokenType: "jwt",
          });
          break;
        case "keyword":
          await apiClient(`${SERVER_URL}/seo/keyword/${row.id}`, {
            method: "DELETE",
            tokenType: "jwt",
          });
          break;
        case "sitemap":
          await apiClient(`${SERVER_URL}/seo/sitemap/${row.id}`, {
            method: "DELETE",
            tokenType: "jwt",
          });
          break;
      }

      setUpdate((prev) => prev + 1);
      toast.success("Deleted successfully");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  // Render form based on active tab
  const renderForm = () => {
    switch (activeTab) {
      case "meta": {
        const metaForm = form as Partial<SeoMeta>;
        return (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
            <select
              className="border px-3 py-2 rounded w-full"
              value={metaForm.entity_type || ""}
              onChange={(e) =>
                setForm({ ...metaForm, entity_type: e.target.value as any })
              }
            >
              <option value="">--Select Entity Type--</option>
              <option value="product">Product</option>
              <option value="category">Category</option>
              <option value="static">Static Page</option>
              <option value="brand">Brand</option>
              <option value="page">Custom Page</option>
            </select>

            {metaForm.entity_type === "product" && (
              <select
                className="border px-3 py-2 rounded w-full"
                value={metaForm.entity_id || ""}
                onChange={(e) =>
                  setForm({ ...metaForm, entity_id: Number(e.target.value) })
                }
              >
                <option value="">--Select Product--</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.slug ? `(${product.slug})` : ""}
                  </option>
                ))}
              </select>
            )}

            {metaForm.entity_type === "category" && (
              <select
                className="border px-3 py-2 rounded w-full"
                value={metaForm.entity_id || ""}
                onChange={(e) =>
                  setForm({ ...metaForm, entity_id: Number(e.target.value) })
                }
              >
                <option value="">--Select Category--</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} {category.slug ? `(${category.slug})` : ""}
                  </option>
                ))}
              </select>
            )}

            {metaForm.entity_type === "static" && (
              <select
                className="border px-3 py-2 rounded w-full"
                value={metaForm.entity_id || ""}
                onChange={(e) =>
                  setForm({ ...metaForm, entity_id: Number(e.target.value) })
                }
              >
                <option value="">--Select Static Page--</option>
                {STATIC_PAGES.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name} {page.slug}
                  </option>
                ))}
              </select>
            )}

            {metaForm.entity_type === "brand" && (
              <input
                type="number"
                placeholder="Brand ID"
                className="border px-3 py-2 rounded w-full"
                value={metaForm.entity_id || ""}
                onChange={(e) =>
                  setForm({ ...metaForm, entity_id: Number(e.target.value) })
                }
              />
            )}

            {metaForm.entity_type === "page" && (
              <input
                type="number"
                placeholder="Page ID"
                className="border px-3 py-2 rounded w-full"
                value={metaForm.entity_id || ""}
                onChange={(e) =>
                  setForm({ ...metaForm, entity_id: Number(e.target.value) })
                }
              />
            )}

            <input
              type="text"
              placeholder="Meta Title"
              className="border px-3 py-2 rounded w-full"
              value={metaForm.meta_title || ""}
              onChange={(e) =>
                setForm({ ...metaForm, meta_title: e.target.value })
              }
            />

            <textarea
              placeholder="Meta Description"
              className="border px-3 py-2 rounded w-full"
              rows={3}
              value={metaForm.meta_description || ""}
              onChange={(e) =>
                setForm({ ...metaForm, meta_description: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Meta Keywords (comma separated)"
              className="border px-3 py-2 rounded w-full"
              value={metaForm.meta_keywords || ""}
              onChange={(e) =>
                setForm({ ...metaForm, meta_keywords: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Canonical URL"
              className="border px-3 py-2 rounded w-full"
              value={metaForm.canonical_url || ""}
              onChange={(e) =>
                setForm({ ...metaForm, canonical_url: e.target.value })
              }
            />

            <h3 className="font-semibold mt-2">Open Graph</h3>
            <input
              type="text"
              placeholder="OG Title"
              className="border px-3 py-2 rounded w-full"
              value={metaForm.og_title || ""}
              onChange={(e) =>
                setForm({ ...metaForm, og_title: e.target.value })
              }
            />

            <textarea
              placeholder="OG Description"
              className="border px-3 py-2 rounded w-full"
              rows={2}
              value={metaForm.og_description || ""}
              onChange={(e) =>
                setForm({ ...metaForm, og_description: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="OG Image URL"
              className="border px-3 py-2 rounded w-full"
              value={metaForm.og_image || ""}
              onChange={(e) =>
                setForm({ ...metaForm, og_image: e.target.value })
              }
            />

            <h3 className="font-semibold mt-2">Twitter Card</h3>
            <input
              type="text"
              placeholder="Twitter Title"
              className="border px-3 py-2 rounded w-full"
              value={metaForm.twitter_title || ""}
              onChange={(e) =>
                setForm({ ...metaForm, twitter_title: e.target.value })
              }
            />

            <textarea
              placeholder="Twitter Description"
              className="border px-3 py-2 rounded w-full"
              rows={2}
              value={metaForm.twitter_description || ""}
              onChange={(e) =>
                setForm({ ...metaForm, twitter_description: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Twitter Image URL"
              className="border px-3 py-2 rounded w-full"
              value={metaForm.twitter_image || ""}
              onChange={(e) =>
                setForm({ ...metaForm, twitter_image: e.target.value })
              }
            />

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={metaForm.is_index !== false}
                  onChange={(e) =>
                    setForm({ ...metaForm, is_index: e.target.checked })
                  }
                />
                Index
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={metaForm.is_follow !== false}
                  onChange={(e) =>
                    setForm({ ...metaForm, is_follow: e.target.checked })
                  }
                />
                Follow
              </label>
            </div>
          </div>
        );
      }

      case "redirect": {
        const redirectForm = form as Partial<SeoRedirect>;
        return (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Old URL (e.g., /old-product)"
              className="border px-3 py-2 rounded w-full"
              value={redirectForm.old_url || ""}
              onChange={(e) =>
                setForm({ ...redirectForm, old_url: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="New URL (e.g., /new-product)"
              className="border px-3 py-2 rounded w-full"
              value={redirectForm.new_url || ""}
              onChange={(e) =>
                setForm({ ...redirectForm, new_url: e.target.value })
              }
            />
            <select
              className="border px-3 py-2 rounded w-full"
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
          </div>
        );
      }

      case "keyword": {
        const keywordForm = form as Partial<SeoKeyword>;
        return (
          <div className="space-y-3">
            <select
              className="border px-3 py-2 rounded w-full"
              value={keywordForm.entity_type || ""}
              onChange={(e) =>
                setForm({ ...keywordForm, entity_type: e.target.value as any })
              }
            >
              <option value="">--Optional: Link to Entity--</option>
              <option value="product">Product</option>
              <option value="category">Category</option>
              <option value="static">Static Page</option>
              <option value="brand">Brand</option>
              <option value="page">Custom Page</option>
            </select>

            {keywordForm.entity_type === "product" && (
              <select
                className="border px-3 py-2 rounded w-full"
                value={keywordForm.entity_id || ""}
                onChange={(e) =>
                  setForm({ ...keywordForm, entity_id: Number(e.target.value) })
                }
              >
                <option value="">--Select Product--</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            )}

            {keywordForm.entity_type === "category" && (
              <select
                className="border px-3 py-2 rounded w-full"
                value={keywordForm.entity_id || ""}
                onChange={(e) =>
                  setForm({ ...keywordForm, entity_id: Number(e.target.value) })
                }
              >
                <option value="">--Select Category--</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}

            {keywordForm.entity_type === "static" && (
              <select
                className="border px-3 py-2 rounded w-full"
                value={keywordForm.entity_id || ""}
                onChange={(e) =>
                  setForm({ ...keywordForm, entity_id: Number(e.target.value) })
                }
              >
                <option value="">--Select Static Page--</option>
                {STATIC_PAGES.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            )}

            {keywordForm.entity_type === "brand" && (
              <input
                type="number"
                placeholder="Brand ID"
                className="border px-3 py-2 rounded w-full"
                value={keywordForm.entity_id || ""}
                onChange={(e) =>
                  setForm({ ...keywordForm, entity_id: Number(e.target.value) })
                }
              />
            )}

            {keywordForm.entity_type === "page" && (
              <input
                type="number"
                placeholder="Page ID"
                className="border px-3 py-2 rounded w-full"
                value={keywordForm.entity_id || ""}
                onChange={(e) =>
                  setForm({ ...keywordForm, entity_id: Number(e.target.value) })
                }
              />
            )}

            <input
              type="text"
              placeholder="Keyword"
              className="border px-3 py-2 rounded w-full"
              value={keywordForm.keyword || ""}
              onChange={(e) =>
                setForm({ ...keywordForm, keyword: e.target.value })
              }
            />
          </div>
        );
      }

      case "sitemap": {
        const sitemapForm = form as Partial<SeoSitemap>;
        return (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="URL (e.g., /products/category)"
              className="border px-3 py-2 rounded w-full"
              value={sitemapForm.url || ""}
              onChange={(e) => setForm({ ...sitemapForm, url: e.target.value })}
            />
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              placeholder="Priority (0.0 - 1.0)"
              className="border px-3 py-2 rounded w-full"
              value={sitemapForm.priority || 0.5}
              onChange={(e) =>
                setForm({
                  ...sitemapForm,
                  priority: parseFloat(e.target.value),
                })
              }
            />
            <select
              className="border px-3 py-2 rounded w-full"
              value={sitemapForm.change_freq || ""}
              onChange={(e) =>
                setForm({ ...sitemapForm, change_freq: e.target.value as any })
              }
            >
              <option value="">--Change Frequency--</option>
              <option value="always">Always</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="never">Never</option>
            </select>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Get entity name for display
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

  // Get current data based on active tab with proper array checking
  const getCurrentData = (): any[] => {
    try {
      switch (activeTab) {
        case "meta":
          // Ensure metaData is an array before mapping
          if (!Array.isArray(metaData)) {
            console.warn("metaData is not an array:", metaData);
            return [];
          }
          return metaData.map((item) => ({
            ...item,
            entity_display:
              item.entity_type && item.entity_id
                ? getEntityName(item.entity_type, item.entity_id)
                : "N/A",
          }));

        case "redirect":
          return Array.isArray(redirectData) ? redirectData : [];

        case "keyword":
          if (!Array.isArray(keywordData)) {
            console.warn("keywordData is not an array:", keywordData);
            return [];
          }
          return keywordData.map((item) => ({
            ...item,
            entity_display:
              item.entity_type && item.entity_id
                ? getEntityName(item.entity_type, item.entity_id)
                : "Global",
          }));

        case "sitemap":
          return Array.isArray(sitemapData) ? sitemapData : [];

        default:
          return [];
      }
    } catch (error) {
      console.error("Error in getCurrentData:", error);
      return [];
    }
  };

  // Get paginated data
  const getPaginatedData = () => {
    const data = getCurrentData();
    if (!Array.isArray(data)) return [];
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Get total pages
  const getTotalPages = () => {
    const data = getCurrentData();
    if (!Array.isArray(data)) return 0;
    return Math.ceil(data.length / rowsPerPage);
  };

  // Get total items count
  const getTotalItems = () => {
    const data = getCurrentData();
    return Array.isArray(data) ? data.length : 0;
  };

  // Get table headers based on active tab
  const getTableHeaders = (): string[] => {
    switch (activeTab) {
      case "meta":
        return [
          "ID",
          "Entity Type",
          "Entity",
          "Meta Title",
          "Canonical URL",
          "Index",
          "Actions",
        ];
      case "redirect":
        return [
          "ID",
          "Old URL",
          "New URL",
          "Redirect Type",
          "Created At",
          "Actions",
        ];
      case "keyword":
        return ["ID", "Keyword", "Entity Type", "Entity", "Actions"];
      case "sitemap":
        return [
          "ID",
          "URL",
          "Priority",
          "Change Freq",
          "Last Modified",
          "Actions",
        ];
      default:
        return [];
    }
  };

  // Render table row based on active tab
  const renderTableRow = (item: any, index: number) => {
    if (!item) return null;

    switch (activeTab) {
      case "meta":
        return (
          <tr key={item.id || index} className="border-b hover:bg-gray-50">
            <td className="p-3">{item.id}</td>
            <td className="p-3 capitalize">{item.entity_type}</td>
            <td className="p-3">{item.entity_display}</td>
            <td className="p-3 max-w-[200px] truncate">{item.meta_title}</td>
            <td className="p-3 max-w-[150px] truncate">{item.canonical_url}</td>
            <td className="p-3">
              <span
                className={`px-2 py-1 rounded text-xs ${item.is_index ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {item.is_index ? "Index" : "Noindex"}
              </span>
            </td>
            <td className="p-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 hover:text-blue-600"
                >
                  <Pen size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1 hover:text-red-600"
                >
                  <Trash size={16} />
                </button>
              </div>
            </td>
          </tr>
        );

      case "redirect":
        return (
          <tr key={item.id || index} className="border-b hover:bg-gray-50">
            <td className="p-3">{item.id}</td>
            <td className="p-3 max-w-[200px] truncate">{item.old_url}</td>
            <td className="p-3 max-w-[200px] truncate">{item.new_url}</td>
            <td className="p-3">
              <span
                className={`px-2 py-1 rounded text-xs ${item.redirect_type === 301 ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}
              >
                {item.redirect_type}
              </span>
            </td>
            <td className="p-3">
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : "N/A"}
            </td>
            <td className="p-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 hover:text-blue-600"
                >
                  <Pen size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1 hover:text-red-600"
                >
                  <Trash size={16} />
                </button>
              </div>
            </td>
          </tr>
        );

      case "keyword":
        return (
          <tr key={item.id || index} className="border-b hover:bg-gray-50">
            <td className="p-3">{item.id}</td>
            <td className="p-3 font-medium">{item.keyword}</td>
            <td className="p-3 capitalize">{item.entity_type || "Global"}</td>
            <td className="p-3">{item.entity_display}</td>
            <td className="p-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 hover:text-blue-600"
                >
                  <Pen size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1 hover:text-red-600"
                >
                  <Trash size={16} />
                </button>
              </div>
            </td>
          </tr>
        );

      case "sitemap":
        return (
          <tr key={item.id || index} className="border-b hover:bg-gray-50">
            <td className="p-3">{item.id}</td>
            <td className="p-3 max-w-[200px] truncate">{item.url}</td>
            <td className="p-3">{item.priority}</td>
            <td className="p-3 capitalize">{item.change_freq || "N/A"}</td>
            <td className="p-3">
              {item.last_modified
                ? new Date(item.last_modified).toLocaleDateString()
                : "N/A"}
            </td>
            <td className="p-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 hover:text-blue-600"
                >
                  <Pen size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1 hover:text-red-600"
                >
                  <Trash size={16} />
                </button>
              </div>
            </td>
          </tr>
        );

      default:
        return null;
    }
  };

  // Get dialog title
  const getDialogTitle = (): string => {
    const titles = {
      meta: "SEO Meta",
      redirect: "Redirect",
      keyword: "Keyword",
      sitemap: "Sitemap",
    };
    const hasId = "id" in form && form.id;
    return `${hasId ? "Edit" : "Add"} ${titles[activeTab]}`;
  };

  // Get add button text
  const getAddButtonText = (): string => {
    switch (activeTab) {
      case "meta":
        return "Add Meta";
      case "redirect":
        return "Add Redirect";
      case "keyword":
        return "Add Keyword";
      case "sitemap":
        return "Add Sitemap";
      default:
        return "Add";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SEO Management</h1>

        {/* Add Button */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={18} /> {getAddButtonText()}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-amber-50">
            <DialogHeader>
              <DialogTitle>{getDialogTitle()}</DialogTitle>
            </DialogHeader>
            {renderForm()}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "id" in form && form.id
                    ? "Update"
                    : "Add"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="meta" className="flex items-center gap-2">
            <Globe size={16} /> Meta
          </TabsTrigger>
          <TabsTrigger value="redirect" className="flex items-center gap-2">
            <Link size={16} /> Redirects
          </TabsTrigger>
          <TabsTrigger value="keyword" className="flex items-center gap-2">
            <Tags size={16} /> Keywords
          </TabsTrigger>
          <TabsTrigger value="sitemap" className="flex items-center gap-2">
            <Map size={16} /> Sitemap
          </TabsTrigger>
        </TabsList>

        {/* Search Bar */}
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-sm text-gray-500">
            Total: {getTotalItems()} items
          </span>
        </div>

        {/* Table */}
        <TabsContent value={activeTab} className="mt-0">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  {getTableHeaders().map((header, index) => (
                    <th
                      key={index}
                      className="text-left p-3 font-semibold text-sm"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={getTableHeaders().length}
                      className="text-center p-8"
                    >
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : getPaginatedData().length === 0 ? (
                  <tr>
                    <td
                      colSpan={getTableHeaders().length}
                      className="text-center p-8 text-gray-500"
                    >
                      No data found
                    </td>
                  </tr>
                ) : (
                  getPaginatedData().map((item, index) =>
                    renderTableRow(item, index),
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {getTotalPages() > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                {Math.min(currentPage * rowsPerPage, getTotalItems())} of{" "}
                {getTotalItems()} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="px-4 py-2 text-sm">
                  Page {currentPage} of {getTotalPages()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, getTotalPages()),
                    )
                  }
                  disabled={currentPage === getTotalPages()}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
