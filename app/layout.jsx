import Script from "next/script";
import "./globals.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { SidebarProvider } from "../components/SidebarContext";

export const metadata = {
  title: "NextTube – YouTube Clone",
  description: "NextTube – YouTube Clone built with Next.js",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport = {
  themeColor: "#ff0000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Apply saved theme before first paint — avoids light-flash for dark users */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("yt-theme");if(t==="dark"){document.documentElement.dataset.theme="dark";}else{document.documentElement.dataset.theme="light";}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.cdnfonts.com/css/google-sans"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
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
