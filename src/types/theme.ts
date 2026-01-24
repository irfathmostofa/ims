// src/types/theme.ts
export interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: "draft" | "published" | "archived";
  is_active: boolean;
  is_default: boolean;
  global_css?: Record<string, any>;
  global_settings?: Record<string, any>;
  published_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_update?: string;
}

export interface ComponentType {
  id: string;
  name: string;
  display_name: string;
  category?: string;
  icon?: string;
  max_instances?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComponentVariant {
  id: string;
  component_type_id: string;
  variant_name: string;
  display_name: string;
  description?: string;
  thumbnail_url?: string;
  component_path: string;
  config_schema?: Record<string, any>;
  default_config?: Record<string, any>;
  css_template?: string;
  version?: string;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface ThemeSection {
  id: string;
  theme_id: string;
  component_variant_id: string;
  name: string;
  section_key: string;
  order_index: number;
  position: "HEADER" | "HERO" | "CONTENT" | "FOOTER";
  is_visible: boolean;
  config_data?: Record<string, any>;
  css_overrides?: Record<string, any>;
  content?: Record<string, any>;
  responsive_config?: Record<string, any>;
  animation_settings?: Record<string, any>;
  seo_settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_update?: string;
}
