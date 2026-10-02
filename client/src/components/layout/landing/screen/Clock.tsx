import { useEffect, useState } from "react";

export default function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const h24 = now.getHours();
  const h12 = h24 % 12 || 12;
  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${h12}:${String(
    now.getMinutes()
  ).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'}`;
}
