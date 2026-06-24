"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthForm from "@/components/AuthForm";
import { loginApi } from "@/api/auth.api";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const notice = sessionStorage.getItem("auth_notice");
    if (notice) {
      toast.error(notice);
      sessionStorage.removeItem("auth_notice");
    }
  }, []);

  const handleLogin = async (data) => {
    try {
      // Backend returns: { success, token, data: { id, username, email, role, ... } }
      const response = await loginApi(data);

      // login() saves token to localStorage + sets user in context
      login(response);

      toast.success("Logged in successfully!");
      router.push("/dashboard");

    } catch (err) {
      toast.error(err?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <AuthForm
      mode="login"
      title="LOGIN"
      showUsername={false}
      submitText="Login"
      footerText="Don't have an account? Sign up"
      footerAction={() => router.push("/auth/signup")}
      onSubmit={handleLogin}
    />
  );
}
