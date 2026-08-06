"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { BlogDoc } from "@/lib/admin/types";
import { createDoc, deleteDocById, estimateReadingTime, listOrdered, logActivity, slugify, updateDocById } from "@/lib/admin/crud";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MediaUrlField } from "@/components/admin/MediaPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AdminPageHeader, Card, EmptyState, Field, PrimaryButton, SecondaryButton, StatusBadge, inputClass } from "@/components/admin/ui";

const empty: BlogDoc = { title: "", slug: "", excerpt: "", bodyHtml: "", category: "", tags: [], author: "", status: "draft", featured: false };
export function BlogsManager() {
  const { user, profile } = useAdminAuth(); const [items, setItems] = useState<BlogDoc[]>([]); const [form, setForm] = useState<BlogDoc | null>(null);
  const [query, setQuery] = useState(""); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [deleting, setDeleting] = useState<BlogDoc | null>(null);
  const load = async () => { setLoading(true); try { setItems(await listOrdered<BlogDoc>(COLLECTIONS.blogs, "updatedAt")); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load blogs"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => items.filter((item) => `${item.title} ${item.category} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  const change = <K extends keyof BlogDoc>(key: K, value: BlogDoc[K]) => setForm((previous) => previous ? { ...previous, [key]: value } : previous);
  async function save(event: FormEvent) { event.preventDefault(); if (!form) return; setSaving(true); try {
    const publishedAt =
      form.status === "published"
        ? form.publishedAt || new Date().toISOString()
        : form.publishedAt || null;
    const data = {
      ...form,
      slug: form.slug || slugify(form.title),
      tags: form.tags || [],
      readingTime: estimateReadingTime(form.bodyHtml || ""),
      publishedAt,
    };
    const existingId = data.id;
    delete data.id;
    const savedId = existingId
      ? (await updateDocById(COLLECTIONS.blogs, existingId, data), existingId)
      : await createDoc(COLLECTIONS.blogs, data);
    await logActivity({
      type: `blogs.${existingId ? "update" : "create"}`,
      message: `${existingId ? "Updated" : "Created"} blog: ${data.title}`,
      actorEmail: profile?.email || user?.email || "",
      actorUid: user?.uid || "",
      entity: COLLECTIONS.blogs,
      entityId: savedId,
    });
    toast.success("Blog saved"); setForm(null); await load();
  } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); } finally { setSaving(false); } }
  async function remove() { if (!deleting?.id) return; try { await deleteDocById(COLLECTIONS.blogs, deleting.id); toast.success("Blog deleted"); setDeleting(null); await load(); } catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); } }
  if (loading) return <AdminPageSkeleton />;
  return <div className="space-y-6"><AdminPageHeader title="Blogs" description="Create, schedule, and optimize editorial content." actions={<PrimaryButton onClick={() => setForm({ ...empty })}>Add blog</PrimaryButton>} />
    <Card className="p-3"><input className={inputClass} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search blogs…" /></Card>
    {form && <Card><form onSubmit={save} className="space-y-4"><div className="flex justify-between"><h2 className="font-semibold">{form.id ? "Edit blog" : "New blog"}</h2><SecondaryButton type="button" onClick={() => setForm(null)}>Cancel</SecondaryButton></div><div className="grid gap-4 md:grid-cols-2">
      <Field label="Title"><input required className={inputClass} value={form.title} onChange={(e) => { change("title", e.target.value); if (!form.id) change("slug", slugify(e.target.value)); }} /></Field><Field label="Slug"><input required className={inputClass} value={form.slug} onChange={(e) => change("slug", slugify(e.target.value))} /></Field>
      <Field label="Excerpt" className="md:col-span-2"><textarea required rows={3} className={inputClass} value={form.excerpt} onChange={(e) => change("excerpt", e.target.value)} /></Field>
      <div className="md:col-span-2"><Field label="Body"><RichTextEditor value={form.bodyHtml} onChange={(value) => change("bodyHtml", value)} /></Field></div>
      <Field label="Category"><input className={inputClass} value={form.category} onChange={(e) => change("category", e.target.value)} /></Field><Field label="Tags (comma-separated)"><input className={inputClass} value={form.tags.join(", ")} onChange={(e) => change("tags", e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))} /></Field>
      <MediaUrlField label="Featured image" folder="blogs" value={form.featuredImageUrl} onChange={(value) => change("featuredImageUrl", value)} /><Field label="Author"><input className={inputClass} value={form.author} onChange={(e) => change("author", e.target.value)} /></Field>
      <Field label="Status"><select className={inputClass} value={form.status} onChange={(e) => change("status", e.target.value as BlogDoc["status"])}>{["draft","published","scheduled","archived"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Scheduled at"><input type="datetime-local" className={inputClass} value={form.scheduledAt || ""} onChange={(e) => change("scheduledAt", e.target.value || null)} /></Field>
      <Field label="SEO title"><input className={inputClass} value={form.seoTitle || ""} onChange={(e) => change("seoTitle", e.target.value)} /></Field><Field label="Related service slug"><input className={inputClass} value={form.relatedServiceSlug || ""} onChange={(e) => change("relatedServiceSlug", e.target.value)} /></Field>
      <Field label="SEO description" className="md:col-span-2"><textarea rows={2} className={inputClass} value={form.seoDescription || ""} onChange={(e) => change("seoDescription", e.target.value)} /></Field><Field label="Featured"><input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => change("featured", e.target.checked)} /></Field>
    </div><PrimaryButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save blog"}</PrimaryButton></form></Card>}
    {!filtered.length ? <EmptyState title="No blogs found" description="Create your first article." /> : <div className="space-y-3">{filtered.map((item) => <Card key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-medium">{item.title}</p><p className="text-sm text-zinc-500">{item.category} · {item.readingTime || estimateReadingTime(item.bodyHtml)} min read</p><StatusBadge status={item.status} /></div><div className="flex gap-2"><SecondaryButton onClick={() => setForm({ ...item })}>Edit</SecondaryButton><SecondaryButton onClick={() => setForm({ ...item, id: undefined, title: `${item.title} (Copy)`, slug: `${item.slug}-copy`, status: "draft" })}>Duplicate</SecondaryButton><SecondaryButton className="text-red-600" onClick={() => setDeleting(item)}>Delete</SecondaryButton></div></Card>)}</div>}
    <ConfirmDialog open={Boolean(deleting)} title="Delete blog?" description="This cannot be undone." confirmLabel="Delete" danger onConfirm={() => void remove()} onCancel={() => setDeleting(null)} /></div>;
}
