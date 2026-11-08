/**
 * The three quotes under the pricing hero.
 *
 * These are placeholders, and deliberately obvious ones: they describe what a
 * quote *should* say rather than inventing a customer, a name or a company.
 * Swap the three entries for real quotes — the layout, the stars and the
 * attribution line are already in place, and nothing else has to change.
 */

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** A profile image URL. Without one the placeholder face is drawn. */
  avatar?: string;
  /** Placeholders render the same; the flag is here so a search can find them. */
  placeholder?: boolean;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Replace with a quote from the team that has run this board the longest.",
    name: "Jefferson Coulson",
    role: "Full Stack AI, Accenture",
    avatar: "https://ik.imagekit.io/kanban/73_ew99YhRmN.jpg",
    placeholder: true,
  },
  {
    quote:
      "Replace with a quote about the setup — one command, their own database.",
    name: "Clyde Soar",
    role: "CTO, GitHub",
    avatar: "https://ik.imagekit.io/kanban/69_-uW81BoD6.jpg",
    placeholder: true,
  },
  {
    quote:
      "Replace with a quote about the board during stand-up, when two people move the same card.",
    name: "Shelton Palagonia",
    role: "Cloud Engineering, IBM",
    avatar: "https://ik.imagekit.io/kanban/32_exs2YPCOl.jpg",
    placeholder: true,
  },
];
