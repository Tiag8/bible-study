"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-2">
              Gerencie suas preferências e informações da conta
            </p>
          </div>

          <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Meu Perfil
                </h2>
                <p className="text-sm text-gray-500">
                  Informações básicas da sua conta
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="bg-blue-600 hover:bg-blue-700"
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
                    className={`flex items-center gap-2 mt-2 p-2 rounded-md ${
                      profileMessage.includes("sucesso")
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {profileMessage.includes("sucesso") && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <p className="text-sm">{profileMessage}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{user?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plano
                </label>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <Badge
                    variant={userRole === "Admin" ? "default" : "secondary"}
                  >
                    {userRole}
                  </Badge>
                </div>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ações da Conta
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Redefinir Senha
                    </p>
                    <p className="text-sm text-gray-500">
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
                  className={
                    passwordMessage.includes("enviado")
                      ? "text-sm text-green-600"
                      : "text-sm text-red-600"
                  }
                >
                  {passwordMessage}
                </p>
              )}

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Sair</p>
                    <p className="text-sm text-gray-500">
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
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
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
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Minha Conta
            </Button>
          </section>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Exclusão
                </h3>
                <p className="text-sm text-gray-500">Esta ação é irreversível</p>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              Para confirmar a exclusão da sua conta, digite{" "}
              <span className="font-mono font-bold text-red-600">EXCLUIR</span>{" "}
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
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
