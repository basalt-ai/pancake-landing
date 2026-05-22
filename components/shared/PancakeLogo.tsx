import Image from "next/image";

type PancakeLogoProps = {
  className?: string;
  variant?: "default" | "inverted";
  "aria-hidden"?: boolean;
};

/**
 * The mark is sized slightly taller than the wordmark box so the circle
 * breaks above the cap-line of "P" (and a touch past the "Panca" baseline).
 * `items-center` keeps the mark visually balanced on the wordmark's axis.
 *
 * `variant="inverted"` paints the wordmark in `currentColor` by using the
 * PNG's alpha channel as a CSS mask — set the color via a `text-*` class.
 */
export function PancakeLogo({
  className,
  variant = "default",
  ...props
}: PancakeLogoProps) {
  if (variant === "inverted") {
    return (
      <span
        role="img"
        aria-label="Pancake"
        className={`inline-block bg-current ${className ?? "h-8 sm:h-9"}`}
        style={{
          aspectRatio: "739 / 291",
          maskImage: "url(/pancake-wordmark.png)",
          WebkitMaskImage: "url(/pancake-wordmark.png)",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "left center",
          WebkitMaskPosition: "left center",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
        {...props}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center ${className ?? ""}`}
      {...props}
    >
      <Image
        src="/pancake-wordmark.png"
        alt=""
        width={739}
        height={291}
        quality={100}
        priority
        className="h-8 w-auto object-contain object-left sm:h-9"
      />
    </div>
  );
}
