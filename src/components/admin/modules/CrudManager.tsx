"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createDoc,
  deleteDocById,
  listOrdered,
  logActivity,
  updateDocById,
} from "@/lib/admin/crud";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MediaUrlField } from "@/components/admin/MediaPicker";
import {
  AdminPageHeader,
  Card,
  EmptyState,
  Field,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  inputClass,
} from "@/components/admin/ui";

export type CrudRecord = { id?: string; [key: string]: unknown };
export type CrudField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "checkbox" | "media" | "date" | "list";
  options?: string[];
  folder?: string;
  required?: boolean;
};

const toLabel = (value: unknown) =>
  Array.isArray(value) ? value.join(", ") : value === undefined || value === null ? "" : String(value);

/** One item per line in the admin textarea → trimmed string[]. */
export function parseListField(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function listFieldText(value: unknown) {
  if (Array.isArray(value)) return value.map(String).join("\n");
  return value === undefined || value === null ? "" : String(value);
}

export function CrudManager<T extends CrudRecord>({
  title,
  description,
  collection,
  fields,
  empty,
  initial,
  orderField = "sortOrder",
  renderRow,
  normalize,
}: {
  title: string;
  description: string;
  collection: string;
  fields: CrudField[];
  empty: string;
  initial: T;
  orderField?: string;
  renderRow?: (item: T) => ReactNode;
  normalize?: (form: T) => T;
}) {
  const { user, profile } = useAdminAuth();
  const [items, setItems] = useState<T[]>([]);
  const [form, setForm] = useState<T | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<T | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await listOrdered<T>(collection, orderField));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to load ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, [collection, orderField]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(needle));
  }, [items, query]);

  const update = (key: string, value: unknown) => setForm((previous) => previous ? { ...previous, [key]: value } : previous);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const data = normalize ? normalize(form) : form;
      const existingId = typeof data.id === "string" ? data.id : undefined;
      const payload = { ...data } as CrudRecord;
      delete payload.id;

      for (const field of fields) {
        if (field.type === "list") {
          payload[field.key] = parseListField(payload[field.key]);
        }
      }

      // Auto-fill slug from title/name when empty
      if (!payload.slug && (payload.title || payload.name)) {
        const { slugify } = await import("@/lib/admin/crud");
        payload.slug = slugify(String(payload.title || payload.name));
      }

      const preferredId =
        typeof payload.slug === "string" && payload.slug
          ? payload.slug
          : typeof payload.name === "string" && payload.name
            ? (await import("@/lib/admin/crud")).slugify(String(payload.name))
            : undefined;

      const savedId = existingId
        ? (await updateDocById(collection, existingId, payload), existingId)
        : await createDoc(collection, payload, preferredId);

      await logActivity({
        type: `${collection}.${existingId ? "update" : "create"}`,
        message: `${existingId ? "Updated" : "Created"} ${title.replace(/s$/, "")}`,
        actorEmail: profile?.email || user?.email || "",
        actorUid: user?.uid || "",
        entity: collection,
        entityId: savedId,
      });
      toast.success("Saved");
      setForm(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting?.id) return;
    try {
      await deleteDocById(collection, deleting.id);
      await logActivity({
        type: `${collection}.delete`,
        message: `Deleted ${title.slice(0, -1)}`,
        actorEmail: profile?.email || user?.email || "",
        actorUid: user?.uid || "",
        entity: collection,
        entityId: deleting.id,
      });
      toast.success("Deleted");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  if (loading) return <AdminPageSkeleton />;
  return (
    <div className="space-y-6">
      <AdminPageHeader title={title} description={description} actions={<PrimaryButton onClick={() => setForm({ ...initial })}>Add {title.slice(0, -1)}</PrimaryButton>} />
      <Card className="p-3">
        <input className={inputClass} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${title.toLowerCase()}…`} aria-label={`Search ${title.toLowerCase()}`} />
      </Card>
      {form ? (
        <Card>
          <form onSubmit={save} className="space-y-4">
            <div className="flex items-center justify-between"><h2 className="font-semibold">{form.id ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}</h2><SecondaryButton type="button" onClick={() => setForm(null)}>Cancel</SecondaryButton></div>
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  className={field.type === "textarea" || field.type === "list" ? "md:col-span-2" : undefined}
                >
                  {field.type === "media" ? (
                    <MediaUrlField
                      label={field.label}
                      value={toLabel(form[field.key])}
                      folder={field.folder}
                      onChange={(value) => update(field.key, value)}
                    />
                  ) : field.type === "list" ? (
                    <textarea
                      className={inputClass}
                      rows={4}
                      value={listFieldText(form[field.key])}
                      onChange={(event) => update(field.key, event.target.value)}
                      required={field.required}
                      placeholder="One item per line"
                    />
                  ) : field.type === "textarea" ? (
                    <textarea
                      className={inputClass}
                      rows={4}
                      value={toLabel(form[field.key])}
                      onChange={(event) => update(field.key, event.target.value)}
                      required={field.required}
                    />
                  ) : field.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={Boolean(form[field.key])}
                      onChange={(event) => update(field.key, event.target.checked)}
                    />
                  ) : field.type === "select" ? (
                    <select
                      className={inputClass}
                      value={toLabel(form[field.key])}
                      onChange={(event) => update(field.key, event.target.value)}
                    >
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      className={inputClass}
                      value={toLabel(form[field.key])}
                      onChange={(event) =>
                        update(
                          field.key,
                          field.type === "number" ? Number(event.target.value) : event.target.value,
                        )
                      }
                      required={field.required}
                    />
                  )}
                </Field>
              ))}
            </div>
            <PrimaryButton disabled={saving} type="submit">{saving ? "Saving…" : "Save"}</PrimaryButton>
          </form>
        </Card>
      ) : null}
      {filtered.length === 0 ? <EmptyState title={empty} description="Create an item to get started." /> : (
        <div className="space-y-3">{filtered.map((item) => <Card key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="min-w-0">{renderRow ? renderRow(item) : <><p className="font-medium">{toLabel(item.title || item.name || item.question || item.email)}</p><p className="truncate text-sm text-zinc-500">{fields.slice(1, 3).map((field) => toLabel(item[field.key])).filter(Boolean).join(" · ")}</p></>}
            {typeof item.status === "string" ? <div className="mt-1"><StatusBadge status={item.status} /></div> : null}</div>
          <div className="flex gap-2"><SecondaryButton onClick={() => setForm({ ...item })}>Edit</SecondaryButton><SecondaryButton className="text-red-600" onClick={() => setDeleting(item)}>Delete</SecondaryButton></div>
        </Card>)}</div>
      )}
      <ConfirmDialog open={Boolean(deleting)} title={`Delete ${title.slice(0, -1)}?`} description="This cannot be undone." confirmLabel="Delete" danger onConfirm={() => void remove()} onCancel={() => setDeleting(null)} />
    </div>
  );
}
