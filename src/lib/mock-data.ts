import {
  CalendarDays,
  HeartPulse,
  Mail,
  Moon,
  PawPrint,
  Sparkles,
  Utensils,
  Waves
} from "lucide-react";

export const pet = {
  name: "Momo",
  owner: "Sarah",
  email: "sarah@pawmemo.com",
  birthday: "2020-05-14",
  avatar:
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80"
};

export const memories = [
  {
    id: "sun-nap",
    title: "Long nap in the sun",
    body: "Momo took a long nap in the sun today.",
    time: "Today, 10:30 AM",
    tag: "Cute moment",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
    icon: PawPrint
  },
  {
    id: "ate-less",
    title: "Ate less this morning",
    body: "Ate a bit less this morning, but perked up after a short walk.",
    time: "Today, 8:15 AM",
    tag: "Care Signal",
    image: null,
    icon: Utensils
  },
  {
    id: "storm",
    title: "Storm cuddles",
    body: "A quiet evening storm rolled in. Momo rested his head on my lap until the thunder stopped.",
    time: "Oct 9, 10:15 PM",
    tag: "Cuddles",
    image: null,
    icon: Moon
  },
  {
    id: "park",
    title: "Park energy",
    body: "Momo had boundless energy at the park and chased leaves through the grass.",
    time: "Oct 12, 3:45 PM",
    tag: "Walk",
    image:
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80",
    icon: Waves
  }
];

export const mosaicDays = Array.from({ length: 31 }, (_, index) => {
  const day = index + 1;
  const imageDays: Record<number, string> = {
    2: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=500&q=80",
    4: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=500&q=80",
    8: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=500&q=80",
    12: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=500&q=80",
    15: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80",
    22: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=500&q=80",
    30: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=80"
  };

  return {
    day,
    image: imageDays[day] ?? null,
    signal: [4, 7, 15, 20].includes(day)
  };
});

export const reports = [
  {
    title: "Weekly Paw Letter",
    description: "A warm AI-assisted recap from recent saved memories.",
    href: "/app/reports/weekly",
    icon: Mail
  },
  {
    title: "Vet-ready Summary",
    description: "A neutral note organizer for care-related conversations.",
    href: "/app/reports/vet-summary",
    icon: HeartPulse
  }
];

export const careSignals = [
  {
    title: "Appetite",
    body: "Stable throughout the month. Eating normal portions twice a day.",
    icon: Utensils
  },
  {
    title: "Vomiting",
    body: "2 events recorded in the morning before breakfast.",
    icon: HeartPulse
  },
  {
    title: "Medication",
    body: "Daily heart pill taken consistently every evening.",
    icon: CalendarDays
  }
];

export const letterSections = [
  {
    title: "Sweetest Moment",
    icon: Sparkles,
    body: "On Tuesday evening, Momo rested softly beside you while the room got quiet. It was one of those small moments that says a lot."
  },
  {
    title: "Little Changes",
    icon: HeartPulse,
    body: "Sleeping was up by about an hour this week, while playfulness looked slightly brighter over the weekend."
  }
];
