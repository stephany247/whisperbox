import Logo from "../ui/Logo";

export default function SplashScreen() {
  return (
    <div className="flex h-dvh items-center justify-center bg-background">
      <div className="text-center">
        <Logo />

        <div className="mt-6 flex justify-center gap-1">
          <span className="size-2 animate-bounce rounded-full bg-accent" />
          <span
            className="size-2 animate-bounce rounded-full bg-accent"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="size-2 animate-bounce rounded-full bg-accent"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>
    </div>
  );
}
