import type { DayConfig } from "@/types";

const CAMP_START = import.meta.env.VITE_CAMP_START_DATE ?? "2024-07-01";

function addDays(base: string, n: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

export const DEFAULT_DAYS: DayConfig[] = [
  {
    id: "day-1",
    dayNumber: 1,
    theme: "Spark — The Beginning",
    verse:
      "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    verseRef: "Jeremiah 29:11",
    challenge:
      "Introduce yourself to someone you don't know yet. Ask them one question about their life.",
    unlockDate: addDays(CAMP_START, 0),
  },
  {
    id: "day-2",
    dayNumber: 2,
    theme: "Fuel — Community",
    verse:
      "As iron sharpens iron, so one person sharpens another.",
    verseRef: "Proverbs 27:17",
    challenge:
      "Help a teammate with something they're struggling with today. No task too small.",
    unlockDate: addDays(CAMP_START, 1),
  },
  {
    id: "day-3",
    dayNumber: 3,
    theme: "Glow — Gratitude",
    verse:
      "Give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
    verseRef: "1 Thessalonians 5:18",
    challenge:
      "Write down three things you're grateful for and share one with your team.",
    unlockDate: addDays(CAMP_START, 2),
  },
  {
    id: "day-4",
    dayNumber: 4,
    theme: "Heat — Courage",
    verse:
      "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    verseRef: "Joshua 1:9",
    challenge:
      "Do one thing today that makes you a little uncomfortable. Speak up, step forward, or try something new.",
    unlockDate: addDays(CAMP_START, 3),
  },
  {
    id: "day-5",
    dayNumber: 5,
    theme: "Blaze — Purpose",
    verse:
      "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
    verseRef: "Colossians 3:23",
    challenge:
      "Give your absolute best effort in one activity today — not to compete, but to honour the gift you have.",
    unlockDate: addDays(CAMP_START, 4),
  },
  {
    id: "day-6",
    dayNumber: 6,
    theme: "Wildfire — Generosity",
    verse:
      "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.",
    verseRef: "2 Corinthians 9:7",
    challenge:
      "Give something away today — your time, a compliment, your dessert. Make it spontaneous.",
    unlockDate: addDays(CAMP_START, 5),
  },
  {
    id: "day-7",
    dayNumber: 7,
    theme: "Eternal Flame — Legacy",
    verse:
      "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.",
    verseRef: "Matthew 5:16",
    challenge:
      "Write a letter to your future self about what this week taught you. You'll open it in one year.",
    unlockDate: addDays(CAMP_START, 6),
  },
];
