import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tutor Agenti Intelligenti",
  description: "Chat tutor con foto — skill agenti-intelligenti-altair",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tutor AI",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} app-shell h-full overflow-hidden bg-zinc-950 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
