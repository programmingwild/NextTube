import Script from "next/script";
import "./globals.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { SidebarProvider } from "../components/SidebarContext";

export const metadata = {
  title: "YourTubeNext",
  description: "YourTube clone on Next.js",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport = {
  themeColor: "#ff0000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="grain">
        {/* Load once globally so window.Razorpay is ready before any click */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
        <SidebarProvider>
          <div className="app">
            <Header />
            <div className="mainContent">
              <Sidebar />
              <div className="content">{children}</div>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
