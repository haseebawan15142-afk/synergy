"use client";

import { NAV_ICON_OPTIONS, isNavIconKey, type NavIconKey } from "@/lib/content/nav-icons";
import { NavLinkIcon } from "@/components/layout/NavLinkIcon";
import { inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

type IconSelectProps = {
  value?: string | null;
  onChange: (value: string) => void;
  /** When true, empty option = auto heuristic on the public site */
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  id?: string;
};

export function IconSelect({
  value,
  onChange,
  allowEmpty = true,
  emptyLabel = "Default (auto)",
  className,
  id,
}: IconSelectProps) {
  const key = isNavIconKey(value) ? (value as NavIconKey) : undefined;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
        {key ? (
          <NavLinkIcon href="#" label="" icon={key} size={18} />
        ) : (
          <span className="text-[10px] font-medium text-zinc-400">Auto</span>
        )}
      </span>
      <select
        id={id}
        className={inputClass}
        value={key || ""}
        onChange={(event) => onChange(event.target.value)}
      >
        {allowEmpty ? <option value="">{emptyLabel}</option> : null}
        {NAV_ICON_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
