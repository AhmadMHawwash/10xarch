import "@/styles/globals.css";
import "reactflow/dist/style.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar"; // Add this import
import { ThemeProvider } from "@/components/ThemeProvider"; // Add this import

export const metadata = {
  title: "System Design Playground",
  description:
    "A system design playground for learning and practicing system design concepts.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <TRPCReactProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>
              <Toaster />
              <Navbar />
              <main className="h-[92vh]">
                {children}
              </main>
            </TooltipProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
