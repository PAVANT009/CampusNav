import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row sm:gap-6",
        month: "space-y-4",
        caption: "relative flex items-center justify-center",
        caption_label: "text-sm font-semibold tracking-wide text-foreground",
        nav: "absolute inset-y-0 flex w-full items-center justify-between px-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost", size: "icon-xs" }),
          "h-7 w-7 rounded-md border border-border/60 bg-background/60 text-muted-foreground",
          "hover:bg-accent hover:text-accent-foreground backdrop-blur"
        ),
        nav_button_previous: "left-1",
        nav_button_next: "right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "w-9 text-[0.7rem] font-semibold uppercase text-muted-foreground",
        row: "mt-1 flex w-full",
        cell: "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost", size: "icon-xs" }),
          "h-9 w-9 rounded-md font-medium text-foreground/90 hover:bg-accent hover:text-accent-foreground"
        ),
        day_selected:
          "bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary hover:text-primary-foreground",
        day_today: "ring-2 ring-primary/40",
        day_outside: "text-muted-foreground/50 opacity-50",
        day_disabled: "text-muted-foreground/40 opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }
