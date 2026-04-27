import type { ReactNode } from "react"
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string
  change?: number
  icon: LucideIcon
  helperText?: string
  className?: string
  valueClassName?: string
  accent?: "brand" | "emerald" | "blue" | "amber" | "violet" | "rose" | "slate"
  meta?: ReactNode
}

const accentStyles = {
  brand: {
    icon: "bg-[var(--myotd-red-soft)] text-[var(--myotd-red)] border-[var(--myotd-red-border)]",
    border: "from-[var(--myotd-red-border)] via-[var(--myotd-red-soft)] to-transparent",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    border: "from-emerald-500/40 via-emerald-500/10 to-transparent",
  },
  blue: {
    icon: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    border: "from-sky-500/40 via-sky-500/10 to-transparent",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    border: "from-amber-500/40 via-amber-500/10 to-transparent",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    border: "from-violet-500/40 via-violet-500/10 to-transparent",
  },
  rose: {
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    border: "from-rose-500/40 via-rose-500/10 to-transparent",
  },
  slate: {
    icon: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    border: "from-slate-500/40 via-slate-500/10 to-transparent",
  },
} as const

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  helperText,
  className,
  valueClassName,
  accent = "slate",
  meta,
}: StatsCardProps) {
  const isPositive = (change ?? 0) >= 0
  const accentStyle = accentStyles[accent]

  return (
    <Card className={cn("relative overflow-hidden border-border/60 bg-card/95 shadow-sm", className)}>
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r", accentStyle.border)} />
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 px-4 pb-2 pt-4">
        <div className="space-y-1">
          <CardTitle className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {title}
          </CardTitle>
          {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl border border-border/40",
            accentStyle.icon
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4">
        <div className={cn("text-2xl font-semibold tracking-tight", valueClassName)}>{value}</div>
        {typeof change === "number" ? (
          <div className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {change}%
            </span>
            <span className="text-muted-foreground">vs período anterior</span>
          </div>
        ) : null}
        {meta}
      </CardContent>
    </Card>
  )
}
