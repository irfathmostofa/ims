"use client";

import { Input } from "@/components/ui/input";
import { Globe, FileText } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  RotateCcw,
  Image as ImageIcon,
} from "lucide-react";

// Editor styles
const editorStyles = `
  .editor-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  
  .editor-image:hover {
    opacity: 0.8;
  }
  
  .tiptap-editor img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
  }
`;

// ─── TipTap Editor Toolbar Component ───────────────────────────────────────
function EditorToolbar({
  editor,
  onAddImage,
}: {
  editor: any;
  onAddImage: () => void;
}) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-xl flex-wrap">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive("bold")
            ? "bg-gray-900 text-white"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive("italic")
            ? "bg-gray-900 text-white"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive("bulletList")
            ? "bg-gray-900 text-white"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive("orderedList")
            ? "bg-gray-900 text-white"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive("blockquote")
            ? "bg-gray-900 text-white"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Quote"
      >
        <span className="text-sm font-bold">"</span>
      </button>
      <button
        onClick={onAddImage}
        className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
        title="Insert Image"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().clearNodes().run()}
        className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
        title="Clear Formatting"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ProductBasicInfoProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

export default function ProductBasicInfo({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: ProductBasicInfoProps) {
  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const productSlug = name ? generateSlug(name) : "";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
    ],
    content: description,
    onUpdate: ({ editor }) => {
      onDescriptionChange(editor.getHTML());
    },
  });

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <>
      <style>{editorStyles}</style>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        {/* Section Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Product Information
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Name and description shown to customers
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Product Name
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <Input
              placeholder="e.g. Premium Cotton T-Shirt"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="h-11 rounded-xl border-gray-200 focus:border-gray-400 text-base"
            />
            {productSlug && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                /product/
                <span className="text-gray-600 font-mono">{productSlug}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <EditorToolbar editor={editor} onAddImage={addImage} />
              <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none tiptap-editor bg-white"
                style={{
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {description.replace(/<[^>]*>/g, "").length} characters
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
