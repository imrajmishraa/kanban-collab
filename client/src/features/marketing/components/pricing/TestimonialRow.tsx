import {
  PersonAvatar,
  TESTIMONIALS,
  type Testimonial,
} from "@/features/marketing";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";

/** One star, solid — the reference draws them filled, not outlined. */
function Star() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <HugeiconsIcon
        icon={StarIcon}
        size={18}
        strokeWidth={1.8}
        className="text-(--warning)"
      />
    </svg>
  );
}

/**
 * The proof row under the hero: three quotes, an avatar each, five stars and an
 * attribution line.
 *
 * It is a grid of three equal columns on desktop and one column on phones, and
 * every part of it is centred so the row reads as one band rather than three
 * cards. The avatars are the placeholder face the product uses before someone
 * uploads a photo — a real photo drops straight into the same circle.
 */
interface TestimonialRowProps {
  items?: Testimonial[];
  /** Two reads as a pair in a closing band; three as a proof row under a hero. */
  columns?: 2 | 3;
}

export default function TestimonialRow({
  items = TESTIMONIALS,
  columns = 3,
}: TestimonialRowProps) {
  return (
    <ul
      className={[
        "mx-auto grid max-w-5xl grid-cols-1 gap-12 md:gap-8 lg:gap-12",
        columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3",
      ].join(" ")}
    >
      {items.map((testimonial) => (
        <li
          key={testimonial.quote}
          className="flex h-full flex-col items-center text-center"
        >
          <PersonAvatar
            src={testimonial.avatar}
            className="size-19 [&_svg]:size-8"
          />

          <p className="mx-auto mt-6 max-w-[320px] text-[17px] font-medium leading-[1.4] tracking-[-0.2px] text-(--text-primary) md:text-[18px]">
            {testimonial.quote}
          </p>

          <div
            className="mt-auto flex items-center justify-center gap-1 pt-5 text-(--warning)"
            role="img"
            aria-label="Five out of five"
          >
            <Star />
            <Star />
            <Star />
            <Star />
            <Star />
          </div>

          <p className="mt-3 text-[15px] tracking-[-0.1px] text-(--text-muted) md:text-[16px]">
            {testimonial.name}, {testimonial.role}
          </p>
        </li>
      ))}
    </ul>
  );
}
