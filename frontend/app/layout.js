import "./globals.css";
import ClientLayout from "./ClientLayout";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ overflowX: "hidden" }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
