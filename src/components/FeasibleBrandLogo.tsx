import Image from "next/image";

export type FeasibleBrandLogoVariant =
  /** Color mark only (~1∶1); use on dashboards and compact chrome. */
  | "mark"
  /** Inverse mono mark (#fafafa strokes) — strong on dense dark headers/footers. */
  | "mark-mono-inverse"
  /** Raster from `public/logo.png` — best fidelity to source artwork when it matches the UI background. */
  | "png"
  /** Vector wordmark tuned for dark UIs (`public/brand/feasible-wordmark-dark.svg`). */
  | "wordmark-dark"
  /** Vector wordmark tuned for light surfaces (`public/brand/feasible-wordmark-light.svg`). */
  | "wordmark-light";

function imageSrc(variant: FeasibleBrandLogoVariant): string | null {
  switch (variant) {
    case "mark":
      return "/brand/feasible-mark.svg";
    case "mark-mono-inverse":
      return "/brand/feasible-mark-mono-inverse.svg";
    case "wordmark-dark":
      return "/brand/feasible-wordmark-dark.svg";
    case "wordmark-light":
      return "/brand/feasible-wordmark-light.svg";
    default:
      return null;
  }
}

export default function FeasibleBrandLogo(props: {
  variant: FeasibleBrandLogoVariant;
  className?: string;
  /** Tailwind sizing on the rendered asset (defaults to compact header scale). */
  heightClass?: string;
  priority?: boolean;
}) {
  const { variant, className, heightClass = "h-9", priority } = props;

  const alt = "Feasible Solutions Contracting Est.";
  const merged = `${heightClass} ${className ?? ""}`.trim();

  if (variant === "png") {
    return (
      <Image
        src="/logo.png"
        alt={alt}
        width={606}
        height={100}
        priority={priority}
        sizes="100vw"
        className={`w-auto ${merged}`}
      />
    );
  }

  const src = imageSrc(variant)!;
  const isWide = variant === "wordmark-dark" || variant === "wordmark-light";

  return (
    <Image
      src={src}
      alt={alt}
      width={isWide ? 640 : 96}
      height={isWide ? 112 : 96}
      priority={priority}
      sizes={isWide ? "(max-width: 768px) 100vw, 520px" : "48px"}
      className={isWide ? `w-auto max-w-[min(520px,calc(100vw-8rem))] ${merged}` : `w-auto ${merged}`}
    />
  );
}
