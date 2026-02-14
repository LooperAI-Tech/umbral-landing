"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LogOut, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Configuración
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Administra tu cuenta y preferencias
        </p>
      </div>

      {/* User Info */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Tu Cuenta</h2>

        {!isLoaded ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-48" />
          </div>
        ) : user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-skyblue/20 flex items-center justify-center">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-brand-skyblue" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {user.fullName || user.firstName || "Usuario"}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>
                  {user.primaryEmailAddress?.emailAddress || "Sin correo"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>
                  Miembro desde{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("es-LA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Logout */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Sesión</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Cierra tu sesión actual en todos los dispositivos.
        </p>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
