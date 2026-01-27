"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { COLORS, BORDERS } from "@/lib/design-tokens";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Shield,
  Key,
  LogOut,
  Trash2,
  Save,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, refreshProfile, signOut } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullName, setFullName] = useState("");

  // Inicializar fullName quando profile carregar
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [profile, user]);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    console.log('[SETTINGS] handleUpdateProfile START - userId:', user?.id, 'fullName:', fullName);
    setIsUpdatingProfile(true);
    setProfileMessage("");

    try {
      // 1. Atualizar user_metadata no Auth
      console.log('[SETTINGS] supabase.auth.updateUser BEFORE - data:', { full_name: fullName });
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      console.log('[SETTINGS] supabase.auth.updateUser AFTER - error:', authError);

      if (authError) throw authError;

      // 2. Atualizar tabela bible_profiles
      console.log('[SETTINGS] bible_profiles UPDATE BEFORE - userId:', user.id, 'fullName:', fullName);
      const { error: profileError } = await supabase
        .from("bible_profiles")
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      console.log('[SETTINGS] bible_profiles UPDATE AFTER - error:', profileError);

      if (profileError) throw profileError;

      // 3. Atualizar estado local do profile
      console.log('[SETTINGS] refreshProfile BEFORE');
      await refreshProfile();
      console.log('[SETTINGS] refreshProfile AFTER');

      setProfileMessage("Perfil atualizado com sucesso!");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (error) {
      console.error('[SETTINGS] ERRO DETALHADO:', error);
      console.error('[SETTINGS] Error type:', error instanceof Error ? 'Error' : typeof error);
      console.error('[SETTINGS] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[SETTINGS] Error stack:', error instanceof Error ? error.stack : 'N/A');
      setProfileMessage(
        error instanceof Error ? error.message : "Erro ao atualizar perfil"
      );
    } finally {
      console.log('[SETTINGS] finally - setIsUpdatingProfile(false)');
      setIsUpdatingProfile(false);
    }
  };

  const handleResetPassword = async () => {
    setIsResettingPassword(true);
    setPasswordMessage("");

    try {
      if (!user?.email) throw new Error("Email não encontrado");

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) throw error;

      setPasswordMessage(
        "Email de redefinição enviado! Verifique sua caixa de entrada."
      );
    } catch (error) {
      setPasswordMessage(
        error instanceof Error
          ? error.message
          : "Erro ao enviar email de redefinição"
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "EXCLUIR") return;

    setIsDeletingAccount(true);

    try {
      console.log("Deleting account...");
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const userRole = profile?.role === "admin" ? "Admin" : "Free";

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto w-full">
          {/* TOKENS: COLORS.neutral */}
          <div className="mb-8">
            <h1 className={cn("text-3xl font-bold", COLORS.neutral.text.primary)}>Configurações</h1>
            <p className={cn("mt-2", COLORS.neutral.text.secondary)}>
              Gerencie suas preferências e informações da conta
            </p>
          </div>

          <section className={cn("bg-white rounded-lg p-6 mb-6", BORDERS.gray)}>
            {/* TOKENS: COLORS.primary, COLORS.neutral, BORDERS */}
            <div className="flex items-center gap-3 mb-6">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", COLORS.primary.light)}>
                <User className={cn("w-5 h-5", COLORS.primary.text)} />
              </div>
              <div>
                <h2 className={cn("text-xl font-semibold", COLORS.neutral.text.primary)}>
                  Meu Perfil
                </h2>
                <p className={cn("text-sm", COLORS.neutral.text.muted)}>
                  Informações básicas da sua conta
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className={cn("block text-sm font-medium mb-1", COLORS.neutral.text.primary)}
                >
                  Nome Completo
                </label>
                <div className="flex gap-2">
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className={cn(COLORS.primary.default, `hover:${COLORS.primary.dark}`)}
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
                {profileMessage && (
                  <div
                    className={cn("flex items-center gap-2 mt-2 p-2 rounded-md",
                      profileMessage.includes("sucesso")
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    )}
                  >
                    {profileMessage.includes("sucesso") && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <p className="text-sm">{profileMessage}</p>
                  </div>
                )}
              </div>

              <div>
                <label className={cn("block text-sm font-medium mb-1", COLORS.neutral.text.primary)}>
                  E-mail
                </label>
                <div className={cn("flex items-center gap-2 px-3 py-2 rounded-md", "bg-gray-50", BORDERS.gray)}>
                  <Mail className={cn("w-4 h-4", COLORS.neutral.text.muted)} />
                  <span className={COLORS.neutral.text.secondary}>{user?.email}</span>
                </div>
              </div>

              <div>
                <label className={cn("block text-sm font-medium mb-1", COLORS.neutral.text.primary)}>
                  Plano
                </label>
                <div className="flex items-center gap-2">
                  <Shield className={cn("w-4 h-4", COLORS.neutral.text.muted)} />
                  <Badge
                    variant={userRole === "Admin" ? "default" : "secondary"}
                  >
                    {userRole}
                  </Badge>
                </div>
              </div>
            </form>
          </section>

          <section className={cn("bg-white rounded-lg p-6 mb-6", BORDERS.gray)}>
            {/* TOKENS: COLORS.neutral, BORDERS */}
            <h2 className={cn("text-xl font-semibold mb-4", COLORS.neutral.text.primary)}>
              Ações da Conta
            </h2>

            <div className="space-y-3">
              <div className={cn("flex items-center justify-between p-4 rounded-lg", BORDERS.gray)}>
                <div className="flex items-center gap-3">
                  <Key className={cn("w-5 h-5", COLORS.neutral.text.muted)} />
                  <div>
                    <p className={cn("font-medium", COLORS.neutral.text.primary)}>
                      Redefinir Senha
                    </p>
                    <p className={cn("text-sm", COLORS.neutral.text.muted)}>
                      Enviar email para redefinição de senha
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  variant="outline"
                >
                  {isResettingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Enviar Email"
                  )}
                </Button>
              </div>
              {passwordMessage && (
                <p
                  className={cn("text-sm",
                    passwordMessage.includes("enviado")
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {passwordMessage}
                </p>
              )}

              <div className={cn("flex items-center justify-between p-4 rounded-lg", BORDERS.gray)}>
                <div className="flex items-center gap-3">
                  <LogOut className={cn("w-5 h-5", COLORS.neutral.text.muted)} />
                  <div>
                    <p className={cn("font-medium", COLORS.neutral.text.primary)}>Sair</p>
                    <p className={cn("text-sm", COLORS.neutral.text.muted)}>
                      Encerrar sua sessão atual
                    </p>
                  </div>
                </div>
                <Button onClick={handleSignOut} variant="outline">
                  Sair
                </Button>
              </div>
            </div>
          </section>

          <section className="bg-red-50 rounded-lg border border-red-200 p-6">
            {/* TOKENS: COLORS.danger */}
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className={cn("w-5 h-5", COLORS.danger.text)} />
              <h2 className="text-xl font-semibold text-red-900">
                Zona de Perigo
              </h2>
            </div>

            <p className="text-sm text-red-700 mb-4">
              Esta ação é irreversível. Todos os seus estudos, tags e conexões
              serão permanentemente excluídos.
            </p>

            <Button
              onClick={() => setShowDeleteModal(true)}
              className={cn("text-white", COLORS.danger.default, `hover:${COLORS.danger.dark}`)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Minha Conta
            </Button>
          </section>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          {/* TOKENS: COLORS.danger, COLORS.neutral */}
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", COLORS.danger.light)}>
                <AlertTriangle className={cn("w-6 h-6", COLORS.danger.text)} />
              </div>
              <div>
                <h3 className={cn("text-lg font-semibold", COLORS.neutral.text.primary)}>
                  Confirmar Exclusão
                </h3>
                <p className={cn("text-sm", COLORS.neutral.text.muted)}>Esta ação é irreversível</p>
              </div>
            </div>

            <p className={cn("mb-4", COLORS.neutral.text.secondary)}>
              Para confirmar a exclusão da sua conta, digite{" "}
              <span className={cn("font-mono font-bold", COLORS.danger.text)}>EXCLUIR</span>{" "}
              abaixo:
            </p>

            <Input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Digite EXCLUIR"
              className="mb-4"
            />

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                variant="outline"
                className="flex-1"
                disabled={isDeletingAccount}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "EXCLUIR" || isDeletingAccount}
                className={cn("flex-1 text-white disabled:opacity-50 disabled:cursor-not-allowed", COLORS.danger.default, `hover:${COLORS.danger.dark}`)}
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Conta
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
