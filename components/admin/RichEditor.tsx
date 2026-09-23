"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Loader2,
  Pilcrow,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/ui";
import { errorMessage } from "./ui";
import { useCloudinaryUpload, type Folder } from "./upload";

/*
 * The small Tiptap editor from §17: headings, bold, italic, lists, links,
 * blockquote, image — nothing more. Output is HTML, stored as-is and rendered
 * by <Rich> on the public site, so nothing is parsed at request time (§18.6).
 */

export type RichEditorProps = {
  value: string;
  onChange: (html: string) => void;
  folder: Folder;
  label?: string;
};

export default function RichEditor({ value, onChange, folder, label = "Body" }: RichEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        underline: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["mailto", "tel"],
        },
      }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "rich max-w-none! min-h-[420px] px-5 py-5 outline-none md:px-8",
        "aria-label": label,
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  if (!editor) return <div className="min-h-[480px] rounded-card border border-cord-line bg-paper-raise" />;
  return (
    <div className="overflow-hidden rounded-card border border-cord-line bg-paper-raise focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
      <Toolbar editor={editor} folder={folder} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, folder }: { editor: Editor; folder: Folder }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      paragraph: e.isActive("paragraph"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      href: (e.getAttributes("link").href as string | undefined) ?? "",
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const [panel, setPanel] = useState<"link" | "image" | null>(null);
  const [href, setHref] = useState("");
  const [image, setImage] = useState<{ url: string; alt: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const upload = useCloudinaryUpload(folder);
  const chain = () => editor.chain().focus();

  function openLink() {
    setHref(state.href);
    setPanel(panel === "link" ? null : "link");
  }

  function applyLink() {
    const url = href.trim();
    if (!url) chain().extendMarkRange("link").unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: url }).run();
    setPanel(null);
  }

  async function pickImage(file: File) {
    setUploading(true);
    try {
      const res = await upload(file);
      setImage({ url: res.url.replace("/upload/", "/upload/f_auto,q_auto:good,c_limit,w_1360/"), alt: "" });
      setPanel("image");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  function insertImage() {
    if (!image?.alt.trim()) return;
    chain().setImage({ src: image.url, alt: image.alt.trim() }).run();
    setImage(null);
    setPanel(null);
  }

  return (
    <div className="sticky top-0 z-10 border-b border-cord-line bg-paper-raise/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5" role="toolbar" aria-label="Formatting">
        <Tool label="Paragraph" active={state.paragraph} onClick={() => chain().setParagraph().run()}>
          <Pilcrow />
        </Tool>
        <Tool label="Heading" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
          <Heading2 />
        </Tool>
        <Tool label="Subheading" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
          <Heading3 />
        </Tool>
        <Divider />
        <Tool label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()}>
          <Bold />
        </Tool>
        <Tool label="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()}>
          <Italic />
        </Tool>
        <Divider />
        <Tool label="Bulleted list" active={state.bullet} onClick={() => chain().toggleBulletList().run()}>
          <List />
        </Tool>
        <Tool label="Numbered list" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrdered />
        </Tool>
        <Tool label="Quote" active={state.quote} onClick={() => chain().toggleBlockquote().run()}>
          <Quote />
        </Tool>
        <Divider />
        <Tool label="Link" active={state.link || panel === "link"} onClick={openLink}>
          <Link2 />
        </Tool>
        {state.link && (
          <Tool label="Remove link" onClick={() => chain().extendMarkRange("link").unsetLink().run()}>
            <Link2Off />
          </Tool>
        )}
        <Tool label="Insert image" disabled={uploading} onClick={() => fileInput.current?.click()}>
          {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        </Tool>
        <Divider />
        <Tool label="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 />
        </Tool>
        <Tool label="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 />
        </Tool>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void pickImage(f);
            e.target.value = "";
          }}
        />
      </div>

      {panel === "link" && (
        <form
          className="flex flex-wrap items-center gap-2 border-t border-cord-line p-2"
          onSubmit={(e) => {
            e.preventDefault();
            applyLink();
          }}
        >
          <Input
            autoFocus
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="https://… or mailto:…"
            className="min-h-9 max-w-md flex-1"
            aria-label="Link address"
          />
          <Button type="submit" size="sm">
            {href.trim() ? "Apply link" : "Remove link"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setPanel(null)}>
            Cancel
          </Button>
        </form>
      )}

      {panel === "image" && image && (
        <form
          className="flex flex-wrap items-center gap-3 border-t border-cord-line p-2"
          onSubmit={(e) => {
            e.preventDefault();
            insertImage();
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url.replace("w_1360", "w_160")} alt="" className="h-12 w-16 rounded-chip object-cover" />
          <Input
            autoFocus
            value={image.alt}
            onChange={(e) => setImage({ ...image, alt: e.target.value })}
            placeholder="Alt text (required): describe the image"
            className="min-h-9 max-w-md flex-1"
            aria-label="Alt text"
          />
          <Button type="submit" size="sm" disabled={!image.alt.trim()}>
            Insert image
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setImage(null);
              setPanel(null);
            }}
          >
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "grid size-9 place-items-center rounded-chip text-ink-muted transition-colors hover:bg-cord-soft hover:text-ink disabled:opacity-40 [&_svg]:size-4.5",
        active && "bg-cord-soft text-cord",
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-6 w-px bg-cord-line" aria-hidden="true" />;
