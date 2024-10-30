import "@/styles/globals.css";
import "reactflow/dist/style.css";

import Navbar from "@/components/Navbar"; // Add this import
import { ThemeProvider } from "@/components/ThemeProvider"; // Add this import
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCReactProvider } from "@/trpc/react";
import { dark } from "@clerk/themes";

import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import { Hotjar } from "@/components/Hotjar";

export const metadata = {
  title: "ArchPlayground",
  description:
    "ArchPlayground is system design playground for learning and practicing system design concepts interactively following industry grade challenges.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <Hotjar />
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
                <Toaster />
                <Navbar />
                <main className="h-[92vh]">{children}</main>
              </TooltipProvider>
            </ThemeProvider>
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
