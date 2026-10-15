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
    label: "Order placed",
    description: "Waiting for the restaurant to confirm.",
    icon: ClockIcon,
  },
  CONFIRMED: {
    label: "Confirmed",
    description: "The restaurant accepted your order.",
    icon: CircleCheckIcon,
  },
  PREPARING: {
    label: "Preparing",
    description: "Your food is being prepared.",
    icon: ChefHatIcon,
  },
  DELIVERING: {
    label: "On the way",
    description: "A courier is bringing your order.",
    icon: BikeIcon,
  },
  DELIVERED: {
    label: "Delivered",
    description: "Enjoy your meal!",
    icon: PackageCheckIcon,
  },
}

export function statusIndex(status: OrderStatus): number {
  return ORDER_STATUSES.indexOf(status)
}
