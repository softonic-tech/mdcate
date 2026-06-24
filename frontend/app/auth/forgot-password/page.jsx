"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { forgotPasswordApi } from "@/api/auth.api";

const schema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email address"),
});

export default function ForgotPassword() {
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setSuccess("");
      await forgotPasswordApi(data.email);
      setSuccess("Password reset link has been sent to your email");
      toast.success("Reset link sent! Check your email.");
    } catch (err) {
      toast.error(err?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-video-bg">
        <video autoPlay muted loop playsInline poster="/images/hero-poster.jpg" className="auth-video">
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="auth-video-overlay" />
      </div>

      <div className="auth-particles">
        <div className="auth-particle auth-particle--1" />
        <div className="auth-particle auth-particle--2" />
        <div className="auth-particle auth-particle--3" />
        <div className="auth-particle auth-particle--4" />
      </div>

      <Link href="/" className="auth-back-home">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 10H5m0 0l4-4m-4 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Home
      </Link>

      <div className="auth-theme-toggle">
        <ThemeToggle className="theme-toggle--navbar" size={18} />
      </div>

      <div className="auth-card">
        <div className="auth-card__left">
          <h2 className="auth-heading">Forgot Password</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              className="auth-input"
              placeholder="Enter your email"
              type="email"
              {...register("email")}
            />
            {errors.email && <p className="auth-error">{errors.email.message}</p>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {success && <p className="auth-success">{success}</p>}

          <p className="auth-link">
            <Link href="/auth/login">← Back to Login</Link>
          </p>
        </div>

        <div className="auth-card__right">
          <img src="/right-side.jpg" alt="medprep.study" className="auth-card__image" />
        </div>
      </div>
    </div>
  );
}
