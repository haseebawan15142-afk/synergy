"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteDocById, listOrdered, updateDocById } from "@/lib/admin/crud";
import { COLLECTIONS, type ContactMessage } from "@/lib/firebase/collections";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  AdminPageHeader,
  Card,
  EmptyState,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  inputClass,
} from "@/components/admin/ui";

const csv = (rows: Record<string, unknown>[], name: string) => {
  const cols = Object.keys(rows[0] || {});
  const text = [
    cols.join(","),
    ...rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? "")).join(",")),
  ].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
};

function isReplied(item: ContactMessage) {
  return item.replied === true || item.replyStatus === "replied";
}

export function MessagesManager() {
  const { user } = useAdminAuth();
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await listOrdered<ContactMessage>(COLLECTIONS.messages, "createdAt"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((x) =>
        `${x.name} ${x.email} ${x.message}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  const status = async (item: ContactMessage, value: ContactMessage["status"]) => {
    if (!item.id) return;
    try {
      await updateDocById(COLLECTIONS.messages, item.id, { status: value });
      setItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, status: value } : m)),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const remove = async () => {
    if (!deleting?.id) return;
    const id = deleting.id;
    try {
      await deleteDocById(COLLECTIONS.messages, id);
      setItems((prev) => prev.filter((m) => m.id !== id));
      if (replyingId === id) {
        setReplyingId(null);
        setReplyText("");
      }
      setDeleting(null);
      toast.success("Message deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const sendReply = async (item: ContactMessage) => {
    if (!item.id || !user) return;
    const text = replyText.trim();
    if (!text) {
      toast.error("Write a reply before sending");
      return;
    }
    setSendingReply(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: item.id, replyText: text }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to send reply");
      }
      setItems((prev) =>
        prev.map((m) =>
          m.id === item.id
            ? {
                ...m,
                replied: true,
                replyStatus: "replied",
                status: m.status === "unread" ? "read" : m.status,
              }
            : m,
        ),
      );
      setReplyText("");
      setReplyingId(null);
      toast.success("Reply sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) return <AdminPageSkeleton />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Messages"
        description="Review incoming contact requests."
        actions={
          <SecondaryButton onClick={() => csv(items as Record<string, unknown>[], "messages.csv")}>
            Export CSV
          </SecondaryButton>
        }
      />

      <Card className="p-3">
        <input
          className={inputClass}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages…"
        />
      </Card>

      {!filtered.length ? (
        <EmptyState title="No messages" description="Contact form submissions will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const open = replyingId === item.id;
            return (
              <Card key={item.id} className="space-y-4 py-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="max-w-2xl">
                    <p className="font-medium">
                      {item.name}{" "}
                      <span className="font-normal text-zinc-500">({item.email})</span>
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{item.message}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge status={item.status} />
                      {isReplied(item) ? <StatusBadge status="replied" /> : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.status !== "read" ? (
                      <SecondaryButton onClick={() => void status(item, "read")}>
                        Mark read
                      </SecondaryButton>
                    ) : null}
                    {item.status === "read" ? (
                      <SecondaryButton onClick={() => void status(item, "unread")}>
                        Mark unread
                      </SecondaryButton>
                    ) : null}
                    {item.status !== "archived" ? (
                      <SecondaryButton onClick={() => void status(item, "archived")}>
                        Archive
                      </SecondaryButton>
                    ) : null}
                    <SecondaryButton
                      onClick={() => {
                        setReplyingId(open ? null : item.id || null);
                        setReplyText("");
                      }}
                    >
                      {open ? "Cancel reply" : "Reply"}
                    </SecondaryButton>
                    <SecondaryButton className="text-red-600" onClick={() => setDeleting(item)}>
                      Delete
                    </SecondaryButton>
                  </div>
                </div>

                {open ? (
                  <div className="space-y-3 border-t border-border pt-4">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-ink-secondary">
                        Reply to {item.email}
                      </span>
                      <textarea
                        rows={4}
                        className={inputClass}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply…"
                        disabled={sendingReply}
                      />
                    </label>
                    <PrimaryButton
                      type="button"
                      disabled={sendingReply || !replyText.trim()}
                      onClick={() => void sendReply(item)}
                    >
                      {sendingReply ? "Sending…" : "Send Reply"}
                    </PrimaryButton>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete message?"
        description="Are you sure you want to permanently delete this message?"
        confirmLabel="Delete"
        danger
        onConfirm={() => void remove()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
