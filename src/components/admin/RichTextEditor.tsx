"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { SecondaryButton } from "@/components/admin/ui";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: placeholder || "Write content…" }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[220px] px-3 py-2 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-600">
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900">
        <SecondaryButton type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </SecondaryButton>
        <SecondaryButton
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </SecondaryButton>
        <SecondaryButton
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          List
        </SecondaryButton>
        <SecondaryButton
          type="button"
          onClick={() => {
            const url = window.prompt("Link URL");
            if (!url) return;
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        >
          Link
        </SecondaryButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
