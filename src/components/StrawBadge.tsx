import Image from "next/image";

/**
 * Who owns OfficeYak.
 *
 * OfficeYak is a product; Straw Holdings Pvt. Ltd. is the registered company
 * behind it, and the one a consultancy is actually contracting with when it
 * hands over its students' passports. The terms and the privacy policy now
 * say so in words. This says it in the place people actually look.
 *
 * Two files rather than one CSS filter. The wordmark is pure black and the
 * spiral is yellow and orange, so inverting the whole image to survive the
 * Night Navy footer would turn the brand colours blue. The light variant has
 * only the near-black pixels recoloured, leaving the spiral exactly as drawn.
 */
export function StrawBadge({
  onDark = false,
  className = "",
}: {
  /** True when it sits on the Night Navy footer rather than on paper. */
  onDark?: boolean;
  className?: string;
}) {
  return (
    <a
      href="https://strawholdings.com"
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <span className={`text-[13px] ${onDark ? "text-[#8A899E]" : "text-muted"}`}>
        A company of
      </span>
      <Image
        src={onDark ? "/straw-holdings-light.png" : "/straw-holdings.png"}
        alt="Straw Holdings"
        width={1589}
        height={394}
        className="h-[22px] w-auto"
        /* Small, in a footer, and the same on every page: worth having in the
           first paint rather than flickering in after it. */
        priority={false}
      />
    </a>
  );
}
