"use client";

import { MediaUrlField } from "@/components/admin/MediaPicker";
import { IconSelect } from "@/components/admin/IconSelect";
import { NavLinkIcon } from "@/components/layout/NavLinkIcon";
import { isNavIconKey, type NavIconKey } from "@/lib/content/nav-icons";
import { SecondaryButton } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

type NavIconFieldProps = {
  /** Uploaded / library image URL (wins over Lucide preset on the site). */
  iconUrl?: string | null;
  /** Lucide preset key used when no upload is set. */
  icon?: string | null;
  onIconUrlChange: (url: string) => void;
  onIconChange: (key: string) => void;
  folder?: string;
  className?: string;
  /** Compact layout for dense mega-menu rows */
  compact?: boolean;
};

/**
 * Easy admin control for mega-menu icons: preview + device upload / Media Library,
 * with optional Lucide preset when no custom image is set.
 */
export function NavIconField({
  iconUrl,
  icon,
  onIconUrlChange,
  onIconChange,
  folder = "icons",
  className,
  compact,
}: NavIconFieldProps) {
  const url = String(iconUrl || "").trim();
  const preset = isNavIconKey(icon) ? (icon as NavIconKey) : undefined;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-8 w-8 object-contain" />
          ) : preset ? (
            <NavLinkIcon href="#" label="" icon={preset} size={22} className="text-zinc-800 dark:text-zinc-100" />
          ) : (
            <span className="text-[10px] font-medium text-zinc-400">Auto</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            {url ? "Custom uploaded icon" : preset ? "Preset icon" : "Default (auto)"}
          </p>
          <p className="text-xs text-zinc-500">
            Upload any image (PNG, JPG, GIF, WebP, SVG, ICO…). Rasters auto-convert to WebP;
            SVG stays SVG. Custom image overrides the preset.
          </p>
        </div>
        {url || preset ? (
          <SecondaryButton
            type="button"
            className="shrink-0 text-xs"
            onClick={() => {
              onIconUrlChange("");
              onIconChange("");
            }}
          >
            Clear
          </SecondaryButton>
        ) : null}
      </div>

      <MediaUrlField
        label={compact ? "Upload icon image" : "Upload icon (PNG / SVG / JPG → WebP)"}
        value={url}
        folder={folder}
        onChange={onIconUrlChange}
      />

      <div>
        <p className="mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Or pick a preset (used only if no upload)
        </p>
        <IconSelect
          value={preset || ""}
          onChange={onIconChange}
          allowEmpty
          emptyLabel="Default (auto)"
        />
      </div>
    </div>
  );
}
