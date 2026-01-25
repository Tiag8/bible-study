"use client";

import { cn } from "@/lib/utils";
import {
  Home,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: Home, label: "Início", href: "/" },
  { icon: Network, label: "Grafo", href: "/grafo" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-900">Bible Graph</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700",
              "hover:bg-gray-100 transition-colors",
              collapsed && "justify-center"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium text-sm">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Toggle Button */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg w-full",
            "text-gray-500 hover:bg-gray-100 transition-colors",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
