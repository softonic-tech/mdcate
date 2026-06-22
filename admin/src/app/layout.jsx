import "./globals.css";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata = {
  title: "medprep.study Admin",
  description: "Admin panel for medprep.study",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
