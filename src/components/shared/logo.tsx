import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Logo =  ({ size = "md", className }: LogoProps) => {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };
    return (
           <>
      <span
        className={cn(
          "dancing-script font-bold tracking-tight select-none  bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-foreground dark:to-foreground/40",
          sizes[size],
          className,
        )}
      >
        CampusNav
      </span>
    </>
)
}