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
              otpCodeFieldInput:
                "border border-border/80 bg-secondary/40 text-foreground font-semibold text-xl text-center focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all rounded-lg shadow-inner",
              otpCodeFieldInputs: "gap-2 justify-center py-2",
              identityPreviewText: "text-foreground font-medium",
              identityPreviewEditButton: "text-primary hover:underline font-medium text-xs",
              formResendCodeLink: "text-primary hover:underline font-semibold text-sm cursor-pointer",
            }
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
