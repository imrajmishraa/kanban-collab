import {
  Calendar01Icon,
  NineSquareIcon,
  Move,
  RectangleHorizontal,
  Tag,
  Users,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface FeatureIconProps {
  name: "board" | "move" | "card" | "tag" | "calendar" | "users";
}

const featureIcons = {
  board: NineSquareIcon,
  move: Move,
  card: RectangleHorizontal,
  tag: Tag,
  calendar: Calendar01Icon,
  users: Users,
} as const;

export default function FeatureIcon({ name }: FeatureIconProps) {
  const Icon = featureIcons[name];

  return (
    <HugeiconsIcon icon={Icon} size={17}>
      <span aria-hidden="true" />
    </HugeiconsIcon>
  );
}
