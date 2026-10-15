import {
  BikeIcon,
  ChefHatIcon,
  CircleCheckIcon,
  ClockIcon,
  PackageCheckIcon,
  type LucideIcon,
} from "lucide-react"
import { ORDER_STATUSES, type OrderStatus } from "@/lib/api/types"

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; description: string; icon: LucideIcon }
> = {
  PENDING: {
    label: "Rendelés leadva",
    description: "Várakozás az étterem visszaigazolására.",
    icon: ClockIcon,
  },
  CONFIRMED: {
    label: "Visszaigazolva",
    description: "Az étterem elfogadta a rendelésed.",
    icon: CircleCheckIcon,
  },
  PREPARING: {
    label: "Készül",
    description: "Az étel készítése folyamatban.",
    icon: ChefHatIcon,
  },
  DELIVERING: {
    label: "Úton",
    description: "A futár viszi a rendelésed.",
    icon: BikeIcon,
  },
  DELIVERED: {
    label: "Kiszállítva",
    description: "Jó étvágyat!",
    icon: PackageCheckIcon,
  },
}

export function statusIndex(status: OrderStatus): number {
  return ORDER_STATUSES.indexOf(status)
}
