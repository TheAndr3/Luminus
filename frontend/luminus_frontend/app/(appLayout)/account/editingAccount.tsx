"use client";

import { BaseInput } from "@/components/inputs/BaseInput";
import { PasswordInput } from "@/components/inputs/PasswordInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState, useCallback } from "react";
import { User, Lock, X } from "lucide-react";
import { ErroMessageDialog } from "../classroom/components/erroMessageDialog";
import { updateProfile } from "@/services/profileService";

interface EditingAccountProps {
  open: boolean;
  onCancel: () => void;
  user: {
    id: number;
    username: string;
    password: string;
  };
  onUpdateSuccess?: () => void;
}

export default function EditingAccount({
  open,
  onCancel,
  user,
  onUpdateSuccess,
}: EditingAccountProps) {
  const [save, setSave] = useState(false);
  const [usernameAccount, setUsernameAccount] = useState("");
  const [passwordAccount, setPasswordAccount] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [missingDialog, setMissingDialog] = useState(false);
  const [messageErro, setMessageErro] = useState("");
  const [messageButton, setMessageButton] = useState("Salvar Alterações");

  const title = "Editar Perfil";

  useEffect(() => {
    if (open) {
      setUsernameAccount(user.username || "");
      setPasswordAccount("");
      setConfirmPassword("");
      setPasswordError(null);
      setConfirmPasswordError(null);
    }
  }, [open, user]);

  // Check if passwords match
  useEffect(() => {
    if (passwordAccount && confirmPassword && passwordAccount !== confirmPassword) {
      setConfirmPasswordError("As senhas não coincidem.");
    } else {
      setConfirmPasswordError(null);
    }
  }, [passwordAccount, confirmPassword]);

  const handleClick = async () => {
    setSave(true);
    setMessageButton("Salvando...");

    if (!usernameAccount) {
      setMessageErro("Por favor, preencha o campo de nome de usuário.");
      setMissingDialog(true);
      setSave(false);
      setMessageButton("Salvar Alterações");
      return;
    }
    if (passwordError) {
      setMessageErro(passwordError);
      setMissingDialog(true);
      setSave(false);
      setMessageButton("Salvar Alterações");
      return;
    }
    if (confirmPasswordError) {
      setMessageErro(confirmPasswordError);
      setMissingDialog(true);
      setSave(false);
      setMessageButton("Salvar Alterações");
      return;
    }

    try {
      const updateData: { name: string; password?: string } = {
        name: usernameAccount,
        ...(passwordAccount && { password: passwordAccount }),
      };
      await updateProfile(user.id, updateData);
      onCancel();
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (err: any) {
      setMessageErro(
        err.message || "Impossível salvar os dados editados. Por favor, tente novamente!"
      );
      setMissingDialog(true);
    } finally {
      setSave(false);
      setMessageButton("Salvar Alterações");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogOverlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
      <DialogContent className="max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200">
        <DialogTitle className="sr-only">Editar Perfil</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">Atualize suas informações pessoais</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome Completo
            </label>
            <BaseInput
              className="w-full h-12 text-gray-900 font-medium bg-gray-50 border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all duration-200"
              placeholder="Digite seu nome completo"
              value={usernameAccount}
              onChange={(e) => setUsernameAccount(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Nova Senha (opcional)
            </label>
            <PasswordInput
              value={passwordAccount}
              onChange={e => setPasswordAccount(e.target.value)}
              onErrorChange={setPasswordError}
              placeholder="Deixe em branco para manter a senha atual"
              minLength={8}
              required={false}
              isInvalid={!!passwordError}
              attemptedSubmit={save}
              name="new-password"
              id="new-password"
            />
            {passwordError && (
              <p className="text-xs text-red-600 mt-1">{passwordError}</p>
            )}
            <p className="text-xs text-gray-500">
              Deixe o campo de senha em branco se não quiser alterá-la
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirmar Nova Senha
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Digite novamente a nova senha"
              minLength={8}
              required={!!passwordAccount}
              isInvalid={!!confirmPasswordError}
              attemptedSubmit={save}
              name="confirm-password"
              id="confirm-password"
              externalError={confirmPasswordError}
            />
            {confirmPasswordError && (
              <p className="text-xs text-red-600 mt-1">{confirmPasswordError}</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-8 py-3 border-gray-300 text-gray-700 bg-gray-300 hover:bg-gray-400 rounded-full font-medium shadow-md border transition-all duration-200 hover:shadow-lg cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleClick}
            disabled={save}
            className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-medium shadow-md border border-gray-700 transition-all duration-200 hover:shadow-lg flex items-center gap-2 cursor-pointer"
          >
            {messageButton}
          </Button>
        </div>

        {/* Error Dialog */}
        <ErroMessageDialog
          open={missingDialog}
          onConfirm={() => setMissingDialog(false)}
          description={messageErro}
        />
      </DialogContent>
    </Dialog>
  );
}
