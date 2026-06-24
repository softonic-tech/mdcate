import Link from "next/link";

export default function NotFound() {
  return (
    <div className="utility-page">
      <span className="utility-page__code">404</span>
      <h2 className="utility-page__title">Page Not Found</h2>
      <p className="utility-page__text">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="utility-page__actions">
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
        <Link href="/dashboard" className="btn-ghost">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
