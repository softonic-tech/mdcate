"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "@/styles/auth.module.css";
import { resetPasswordApi } from "@/api/auth.api";

const schema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

function ResetPasswordForm() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    if (!token) {
      return toast.error("Reset token is missing. Check your email link.");
    }

    try {
      setLoading(true);
      setSuccess("");
      await resetPasswordApi(token, data.password);
      setSuccess("Password reset successfully! You can now log in.");
      toast.success("Password reset! Redirecting to login...");
    } catch (err) {
      toast.error(err?.message || "Failed to reset password.");
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
          <h2 className={styles.heading}>Reset Password</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.passwordBox}>
              <input
                type={showPass ? "text" : "password"}
                className={styles.input}
                placeholder="New Password"
                {...register("password")}
              />
              <span className={styles.eye} onClick={() => setShowPass(!showPass)}>
                {showPass ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
              </span>
            </div>
            {errors.password && <p className={styles.error}>{errors.password.message}</p>}

            <div className={styles.passwordBox}>
              <input
                type={showConfirmPass ? "text" : "password"}
                className={styles.input}
                placeholder="Confirm Password"
                {...register("confirmPassword")}
              />
              <span className={styles.eye} onClick={() => setShowConfirmPass(!showConfirmPass)}>
                {showConfirmPass ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
              </span>
            </div>
            {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword.message}</p>}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
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

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.left}>
              <h2 className={styles.heading}>Reset Password</h2>
              <p style={{ color: "#CBD5E1", textAlign: "center" }}>Loading...</p>
            </div>
            <div className={styles.right}>
              <img src="/right-side.jpg" alt="medprep.study" className={styles.rightImage} />
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
