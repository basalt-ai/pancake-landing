const PH_URL =
  "https://www.producthunt.com/products/pancake-6?embed=true&utm_source=badge-top-post-badge&utm_medium=badge&utm_campaign=badge-pancake-6";
const PH_IMG =
  "https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=1152111&theme=light&period=daily&t=1780077997444";
const PH_ALT =
  "Pancake - OpenClaw in Slack that makes your company autonomous | Product Hunt";

type ProductHuntBadgeProps = {
  width?: number;
  height?: number;
};

export function ProductHuntBadge({
  width = 250,
  height = 54,
}: ProductHuntBadgeProps) {
  return (
    /* Hidden below md (review 2026-07-06): at 375w the fixed badge spans
       two thirds of the viewport and floats over section content. */
    <a
      href={PH_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="product-hunt-badge fixed bottom-4 right-4 z-50 hidden shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:inline-flex"
      aria-label="Pancake, #1 Product of the Day on Product Hunt"
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
