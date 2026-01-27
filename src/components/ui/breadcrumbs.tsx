"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/* TOKENS: COLORS.primary, COLORS.neutral */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      <Link
        href="/"
        className={cn("flex items-center gap-1 transition-colors", COLORS.neutral.text.secondary, `hover:${COLORS.primary.text}`)}
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className={cn("w-4 h-4", COLORS.neutral.text.light)} />
          {item.href ? (
            <Link
              href={item.href}
              className={cn("transition-colors", COLORS.neutral.text.secondary, `hover:${COLORS.primary.text}`)}
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn("font-medium", COLORS.neutral.text.primary)}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
