import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <SignUp
        appearance={{
          variables: { colorPrimary: "#6e6aed" },
          elements: {
            card: "bg-card/95 border border-border/60 shadow-2xl shadow-black/20 backdrop-blur-xl",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton:
              "border-border/60 bg-secondary/30 hover:bg-accent/60",
            formFieldInput:
              "border-border/60 bg-secondary/30 text-foreground placeholder:text-muted-foreground",
            footerActionLink: "text-primary hover:underline",
          },
        }}
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}

