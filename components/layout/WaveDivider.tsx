import { cn } from "@/lib/utils";

interface WaveDividerProps {
  color?: "primary" | "secondary";
  flip?: boolean;
}

export function WaveDivider({
  color = "primary",
  flip = false,
}: WaveDividerProps) {
  return (
    <div
      className={cn(
        "relative -mt-12 block leading-none md:-mt-18",
        color === "primary" ? "text-primary" : "text-secondary/40",
        flip && "-scale-x-100",
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="h-16 w-full md:h-24"
      >
        <path
          fill="currentColor"
          d="M0,64 C240,120 480,0 720,64 C960,128 1200,32 1440,64 L1440,120 L0,120 Z"
        />
      </svg>
    </div>
  );
}
