import {
  CalendarDays,
  KanbanSquare,
  Move,
  RectangleHorizontal,
  Tag,
  Users,
} from "lucide-react";

interface FeatureIconProps {
  name: "board" | "move" | "card" | "tag" | "calendar" | "users";
}

const featureIcons = {
  board: KanbanSquare,
  move: Move,
  card: RectangleHorizontal,
  tag: Tag,
  calendar: CalendarDays,
  users: Users,
} as const;

export default function FeatureIcon({ name }: FeatureIconProps) {
  const Icon = featureIcons[name];

  return <Icon aria-hidden="true" size={17} strokeWidth={1.5} />;
}
