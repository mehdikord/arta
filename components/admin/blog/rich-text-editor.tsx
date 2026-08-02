"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Trash2,
  UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { legacyContentToHtml } from "@/lib/blog-content-format";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function ToolbarButton({
  active,
  label,
  ...props
}: React.ComponentProps<typeof Button> & {
  active?: boolean;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "ghost"}
      size="icon"
      className="size-8 shrink-0"
      title={label}
      aria-label={label}
      {...props}
    />
  );
}

export function RichTextEditor({
  value,
  onChange,
  disabled,
  placeholder = "محتوا را بنویسید؛ تصویر، جدول، لینک و انواع قالب‌بندی در دسترس است…",
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { loading: "lazy" },
      }),
      TableKit.configure({ table: { resizable: true } }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "right",
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: legacyContentToHtml(value),
    editorProps: {
      attributes: {
        class: "rich-text-editor__content",
        dir: "rtl",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.isEmpty ? "" : currentEditor.getHTML());
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive("bold") ?? false,
      italic: currentEditor?.isActive("italic") ?? false,
      underline: currentEditor?.isActive("underline") ?? false,
      strike: currentEditor?.isActive("strike") ?? false,
      heading2: currentEditor?.isActive("heading", { level: 2 }) ?? false,
      heading3: currentEditor?.isActive("heading", { level: 3 }) ?? false,
      bulletList: currentEditor?.isActive("bulletList") ?? false,
      orderedList: currentEditor?.isActive("orderedList") ?? false,
      blockquote: currentEditor?.isActive("blockquote") ?? false,
      link: currentEditor?.isActive("link") ?? false,
      table: currentEditor?.isActive("table") ?? false,
      canUndo: currentEditor?.can().undo() ?? false,
      canRedo: currentEditor?.can().redo() ?? false,
    }),
  });

  async function uploadImage(file: File) {
    if (!editor) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        toast.error(data.error ?? "خطا در آپلود تصویر");
        return;
      }

      editor
        .chain()
        .focus()
        .setImage({ src: data.url, alt: file.name })
        .run();
      toast.success("تصویر داخل محتوا قرار گرفت");
    } catch {
      toast.error("خطا در آپلود تصویر");
    } finally {
      setUploading(false);
    }
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) await uploadImage(file);
    event.target.value = "";
  }

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(
      "آدرس لینک را وارد کنید:",
      previousUrl ?? "https://",
    );
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }

  if (!editor || !state) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-lg border bg-white">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rich-text-editor overflow-hidden rounded-lg border bg-white shadow-xs",
        editor.isFocused && "border-ring ring-3 ring-ring/20",
        disabled && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
        <ToolbarButton
          label="واگرد"
          disabled={!state.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 />
        </ToolbarButton>
        <ToolbarButton
          label="از نو"
          disabled={!state.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 />
        </ToolbarButton>
        <span className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton
          label="تیتر سطح ۲"
          active={state.heading2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 />
        </ToolbarButton>
        <ToolbarButton
          label="تیتر سطح ۳"
          active={state.heading3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 />
        </ToolbarButton>
        <ToolbarButton
          label="پررنگ"
          active={state.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          label="مورب"
          active={state.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          label="زیرخط"
          active={state.underline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </ToolbarButton>
        <ToolbarButton
          label="خط‌خورده"
          active={state.strike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough />
        </ToolbarButton>
        <span className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton
          label="فهرست نشانه‌دار"
          active={state.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          label="فهرست شماره‌دار"
          active={state.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </ToolbarButton>
        <ToolbarButton
          label="نقل‌قول"
          active={state.blockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote />
        </ToolbarButton>
        <ToolbarButton
          label="خط جداکننده"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus />
        </ToolbarButton>
        <span className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton
          label="راست‌چین"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight />
        </ToolbarButton>
        <ToolbarButton
          label="وسط‌چین"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter />
        </ToolbarButton>
        <ToolbarButton
          label="چپ‌چین"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft />
        </ToolbarButton>
        <ToolbarButton
          label="تراز دوطرفه"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify />
        </ToolbarButton>
        <span className="mx-1 h-6 w-px bg-border" />
        <ToolbarButton label="افزودن لینک" active={state.link} onClick={setLink}>
          <Link2 />
        </ToolbarButton>
        <ToolbarButton
          label="حذف لینک"
          disabled={!state.link}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Unlink />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleImageChange}
        />
        <ToolbarButton
          label="آپلود تصویر"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        </ToolbarButton>
        <ToolbarButton
          label="افزودن جدول"
          active={state.table}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <Table2 />
        </ToolbarButton>
        <ToolbarButton
          label="حذف جدول"
          disabled={!state.table}
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          <Trash2 />
        </ToolbarButton>
        {state.table && (
          <>
            <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().addRowAfter().run()}>
              سطر +
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteRow().run()}>
              سطر −
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().addColumnAfter().run()}>
              ستون +
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteColumn().run()}>
              ستون −
            </Button>
          </>
        )}
      </div>
      <EditorContent editor={editor} />
      <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        برای جابه‌جایی بین سلول‌های جدول از Tab و Shift+Tab استفاده کنید.
      </div>
    </div>
  );
}
