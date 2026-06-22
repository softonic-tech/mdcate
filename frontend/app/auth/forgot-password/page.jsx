"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "@/styles/auth.module.css";
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
    <div className={styles.container}>
      <div className={styles.videoBg}>
        <video autoPlay muted loop playsInline poster="/images/hero-poster.jpg" className={styles.video}>
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className={styles.videoOverlay} />
      </div>

      <div className={styles.particles}>
        <div className={`${styles.particle} ${styles.particle1}`} />
        <div className={`${styles.particle} ${styles.particle2}`} />
        <div className={`${styles.particle} ${styles.particle3}`} />
        <div className={`${styles.particle} ${styles.particle4}`} />
      </div>

      <Link href="/" className={styles.backToHome}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 10H5m0 0l4-4m-4 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Home
      </Link>

      <div className={styles.card}>
        <div className={styles.left}>
          <h2 className={styles.heading}>Forgot Password</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              className={styles.input}
              placeholder="Enter your email"
              type="email"
              {...register("email")}
            />
            {errors.email && <p className={styles.error}>{errors.email.message}</p>}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {success && <p className={styles.success}>{success}</p>}

          <p className={styles.link}>
            <Link href="/auth/login">← Back to Login</Link>
          </p>
        </div>

        <div className={styles.right}>
          <img src="/right-side.jpg" alt="medprep.study" className={styles.rightImage} />
        </div>
      </div>
    </div>
  );
}
