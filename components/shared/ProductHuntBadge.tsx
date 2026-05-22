const PH_URL =
  "https://www.producthunt.com/products/pancake-6?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-pancake-6";
const PH_IMG =
  "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1152111&theme=light&t=1779321887351";
const PH_ALT =
  "Pancake - OpenClaw in Slack that makes your company autonomous | Product Hunt";

type ProductHuntBadgeProps = {
  className?: string;
  width?: number;
  height?: number;
};

export function ProductHuntBadge({
  className,
  width = 250,
  height = 54,
}: ProductHuntBadgeProps) {
  return (
    <a
      href={PH_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`product-hunt-badge inline-flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${className ?? ""}`}
      aria-label="Find Pancake on Product Hunt"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- external badge served by Product Hunt CDN */}
      <img
        alt={PH_ALT}
        width={width}
        height={height}
        src={PH_IMG}
        className="product-hunt-badge__img"
        style={{ width, height }}
        decoding="async"
        loading="lazy"
      />
    </a>
  );
}
