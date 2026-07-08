import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const fontSans = IBM_Plex_Sans_Arabic({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "نظام إدارة المكتب",
    template: "%s | نظام إدارة المكتب",
  },
  description: "نظام متكامل لإدارة شؤون المكتب والموظفين",
  keywords: ["إدارة", "مكتب", "موظفين", "حضور", "office management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${fontSans.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSessionProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
            <Toaster richColors position="top-center" />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
