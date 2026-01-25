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
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
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

      {user && (
        <div className="p-3 border-t border-gray-100 space-y-2">
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                  {firstLetter}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Olá, {firstName}
                  </p>
                  {profile?.role && (
                    <Badge 
                      variant={profile.role === 'admin' ? 'default' : 'secondary'}
                      className={cn(
                        "text-xs mt-1",
                        profile.role === 'admin' ? 'bg-blue-600' : 'bg-gray-400'
                      )}
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
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm"
                title={`${firstName} (${profile?.role || 'free'})`}
              >
                {firstLetter}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg w-full",
              "text-red-600 hover:bg-red-50 transition-colors",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      )}

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