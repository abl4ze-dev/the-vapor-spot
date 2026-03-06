import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import "./calendar-theme.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-4 pointer-events-auto glass-card calendar-themed",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between items-center px-2 pt-1 pb-2 gap-2",
        caption_label: "hidden",
        caption_dropdowns: "flex items-center gap-2 flex-1 justify-center",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-muted/50 border-border p-0 opacity-70 hover:opacity-100 hover:bg-primary/20 hover:border-primary/50 transition-all duration-200",
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-10 font-medium text-[0.75rem] uppercase tracking-wide",
        row: "flex w-full mt-2",
        cell: cn(
          "relative h-10 w-10 text-center text-sm p-0",
          "focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-primary/15 [&:has([aria-selected])]:rounded-lg",
          "[&:has([aria-selected].day-outside)]:bg-primary/10",
          "[&:has([aria-selected].day-range-end)]:rounded-r-lg",
          "first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal transition-all duration-200",
          "hover:bg-primary/20 hover:text-primary",
          "aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
          "hover:from-primary hover:to-primary/70 hover:text-primary-foreground",
          "focus:from-primary focus:to-primary/80 focus:text-primary-foreground",
          "shadow-lg shadow-primary/25 rounded-lg"
        ),
        day_today: cn(
          "bg-muted/60 text-foreground font-semibold",
          "ring-1 ring-primary/30 rounded-lg"
        ),
        day_outside: cn(
          "day-outside text-muted-foreground/50 opacity-50",
          "aria-selected:bg-primary/10 aria-selected:text-muted-foreground aria-selected:opacity-40"
        ),
        day_disabled: "text-muted-foreground/30 opacity-30 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-primary/15 aria-selected:text-foreground",
        day_hidden: "invisible",
        dropdown: "rdp-dropdown",
        dropdown_month: "rdp-dropdown_month",
        dropdown_year: "rdp-dropdown_year",
        dropdown_icon: "rdp-dropdown_icon",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
