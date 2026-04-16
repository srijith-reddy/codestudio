import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDay(n: number) {
  return `Day ${n.toString().padStart(2, "0")}`;
}

export function pct(n: number, total: number) {
  if (total === 0) return 0;
  return Math.min(100, Math.round((n / total) * 100));
}

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: number, b: number) {
  return Math.floor((b - a) / 86_400_000);
}

export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
