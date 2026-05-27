import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <SignUp
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
            card: "bg-card/95 border border-border/60 shadow-2xl shadow-black/20 backdrop-blur-xl",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton:
              "border-border/60 bg-secondary/30 hover:bg-accent/60 text-foreground transition-all",
            formFieldLabel: "text-muted-foreground font-medium text-xs",
            formFieldInput:
              "border-border/60 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all",
            footerActionLink: "text-primary hover:underline",
            otpCodeFieldInput:
              "border border-border/80 bg-secondary/40 text-foreground font-semibold text-xl text-center focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all rounded-lg shadow-inner",
            otpCodeFieldInputs: "gap-2 justify-center py-2",
            identityPreviewText: "text-foreground font-medium",
            identityPreviewEditButton: "text-primary hover:underline font-medium text-xs",
            formResendCodeLink: "text-primary hover:underline font-semibold text-sm cursor-pointer",
          },
        }}
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}

