import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DevCollab",
    template: "%s | DevCollab",
  },
  description: "Collaborative SaaS dashboard for development teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans min-h-screen antialiased">
        <ClerkProvider
          afterSignOutUrl="/"
          appearance={{
            variables: {
              colorPrimary: "#6e6aed",
              colorText: "#ececee",
              colorBackground: "#121214",
              colorInputBackground: "#18181b",
              colorInputText: "#ececee",
              colorTextSecondary: "#8b8b93",
            },
            elements: {
              card: "bg-[#121214] border border-[#27272a]",
              socialButtonsBlockButton: "bg-[#18181b] border border-[#27272a] text-[#ececee]",
              formButtonPrimary: "bg-[#6e6aed] hover:bg-[#5b57d6] text-white",
              footerActionText: "text-[#8b8b93]",
              footerActionLink: "text-[#6e6aed] hover:text-[#5b57d6]",
              dividerText: "text-[#8b8b93]",
              dividerLine: "bg-[#27272a]",
            }
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
