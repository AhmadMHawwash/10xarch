import "@/styles/globals.css";
import "reactflow/dist/style.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";

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
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <Toaster />
          <main className="flex min-h-screen">{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
