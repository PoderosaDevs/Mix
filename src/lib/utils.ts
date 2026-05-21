import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatCurrency = (value: string) => {
  const numbers = value.replace(/\D/g, "");

  const amount = Number(numbers) / 100;

  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};