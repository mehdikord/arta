"use client";

import { useRouter } from "next/navigation";
import { useUserSession } from "@/components/auth/user-session-provider";
import {
  loginUserAction,
  registerUserAction,
  logoutUserAction,
  updateProfileAction,
  changePasswordAction,
  createPurchaseAction,
  cancelAppointmentAction,
} from "@/lib/actions/auth";
import type { LoginInput } from "@/lib/validations/auth";

export function useAuth() {
  const { user, isAuthenticated } = useUserSession();
  const router = useRouter();

  async function login(mobile: string, password: string) {
    const result = await loginUserAction({ mobile, password } as LoginInput);
    if (!result.success) return false;
    router.refresh();
    return true;
  }

  async function register(name: string, mobile: string, password: string) {
    const result = await registerUserAction({ name, mobile, password });
    if (!result.success) return false;
    router.refresh();
    return true;
  }

  async function logout() {
    await logoutUserAction();
    router.refresh();
    router.push("/");
  }

  async function updateProfile(name: string) {
    const result = await updateProfileAction(name);
    if (!result.success) return;
    router.refresh();
  }

  async function changePassword(
    currentPassword: string,
    newPassword: string,
  ) {
    const result = await changePasswordAction({
      currentPassword,
      newPassword,
      confirmPassword: newPassword,
    });
    return result.success;
  }

  async function addPurchase(productId: string) {
    const result = await createPurchaseAction(productId);
    if (!result.success) return false;
    router.refresh();
    return true;
  }

  async function cancelAppointment(id: string) {
    const result = await cancelAppointmentAction(id);
    if (!result.success) return false;
    router.refresh();
    return true;
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    addPurchase,
    cancelAppointment,
  };
}
