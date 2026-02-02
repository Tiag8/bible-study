"use client";

import { cn } from "@/lib/utils";
import {
  Home,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PARCHMENT } from "@/lib/design-tokens";

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
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuário';
  const firstLetter = firstName.charAt(0).toUpperCase();

  return (
    <aside
      className={cn(
        "bg-ivory border-r flex flex-col transition-all duration-300",
        PARCHMENT.border.default,
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("h-16 flex items-center justify-between px-4 border-b", PARCHMENT.border.default)}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className={cn("w-6 h-6", PARCHMENT.accent.text)} />
            <span className={cn("font-lora font-bold", PARCHMENT.text.heading)}>Bible Graph</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <BookOpen className={cn("w-6 h-6", PARCHMENT.accent.text)} />
          </Link>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg min-h-[44px]",
              PARCHMENT.text.secondary,
              "hover:bg-cream transition-colors",
              collapsed && "justify-center"
            )}
            aria-label={item.label}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium text-sm">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {user && (
        <div className={cn("p-3 border-t space-y-2", PARCHMENT.border.default)}>
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber text-white flex items-center justify-center font-semibold text-sm">
                  {firstLetter}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", PARCHMENT.text.heading)}>
                    Olá, {firstName}
                  </p>
                  {profile?.role && (
                    <Badge
                      variant={profile.role === 'admin' ? 'default' : 'secondary'}
                      className="text-xs mt-1"
                    >
                      {profile.role === 'admin' ? 'Admin' : 'Free'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="flex justify-center mb-2">
              <div
                className="w-8 h-8 rounded-full bg-amber text-white flex items-center justify-center font-semibold text-sm"
                title={`${firstName} (${profile?.role || 'free'})`}
              >
                {firstLetter}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-2 px-3 py-3 rounded-lg w-full transition-colors min-h-[44px]",
              "text-[#8B5E3C] hover:bg-[#FEF0E7]",
              collapsed && "justify-center"
            )}
            aria-label="Sair da conta"
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      )}

      <div className={cn("p-3 border-t", PARCHMENT.border.default)}>
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-2 px-3 py-3 rounded-lg w-full transition-colors min-h-[44px]",
            PARCHMENT.text.muted, "hover:bg-cream",
            collapsed && "justify-center"
          )}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
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
