import "@/styles/globals.css";
import "reactflow/dist/style.css";

import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCReactProvider } from "@/trpc/react";
import { dark } from "@clerk/themes";
import { ClerkProvider } from "@/lib/clerk/client";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
import { type Metadata } from "next";
import { buildCspPolicy, securityHeaders } from "@/lib/csp";

export const metadata: Metadata = {
  title: "10×arch",
  description:
    "10×arch is a system design playground for creating, visualizing, and documenting system architecture designs with drag-and-drop tools and AI feedback.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  // Security headers using our centralized configuration
  other: {
    // Content Security Policy
    "Content-Security-Policy": buildCspPolicy(),
    // Other security headers
    ...securityHeaders
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorBackground: "rgb(31 41 55)",
            },
          }}
        >
          <TRPCReactProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <TooltipProvider>
                <Analytics />
                <Toaster />
                <Navbar />
                <main className="h-[92svh] md:h-[93vh]">{children}</main>
              </TooltipProvider>
            </ThemeProvider>
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
