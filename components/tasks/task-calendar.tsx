"use client"

import * as React from "react"
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Moon,
    Sun
} from "lucide-react"
import {
    format,
    addMonths,
    subMonths,
    subDays,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    parseISO,
    isWithinInterval,
    startOfDay,
    differenceInCalendarDays,
    isBefore,
    isAfter,
    max,
    min
} from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TaskCalendarProps {
    tasks: any[]
    onViewTask: (task: any) => void
    initialTheme?: "light" | "dark"
    viewMode?: "month" | "week" | "day"
}

export function TaskCalendar({ tasks, onViewTask, initialTheme = "light", viewMode = "month" }: TaskCalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState<Date | null>(null)
    const [theme, setTheme] = React.useState<"light" | "dark">(initialTheme)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setCurrentMonth(new Date())
        setMounted(true)
    }, [])

    const handlePrev = () => {
        if (!currentMonth) return
        if (viewMode === "month") setCurrentMonth(subMonths(currentMonth, 1))
        else if (viewMode === "week") setCurrentMonth(subDays(currentMonth, 7))
        else setCurrentMonth(subDays(currentMonth, 1))
    }
    const handleNext = () => {
        if (viewMode === "month") setCurrentMonth(addMonths(currentMonth, 1))
        else if (viewMode === "week") setCurrentMonth(addDays(currentMonth, 7))
        else setCurrentMonth(addDays(currentMonth, 1))
    }
    const handleToday = () => setCurrentMonth(new Date())
    const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light")

    const monthStart = startOfMonth(currentMonth!)
    const monthEnd = endOfMonth(currentMonth!)
    
    let startDate: Date;
    let endDate: Date;

    if (viewMode === "month") {
        startDate = startOfWeek(monthStart)
        endDate = endOfWeek(monthEnd)
    } else if (viewMode === "week") {
        startDate = startOfWeek(currentMonth!)
        endDate = endOfWeek(currentMonth!)
    } else { // day
        startDate = startOfDay(currentMonth!)
        endDate = startOfDay(currentMonth!)
    }

    const calendarDays = eachDayOfInterval({
        start: startDate!,
        end: endDate!,
    })

    // Group days into weeks
    const weeks = React.useMemo(() => {
        const result = []
        for (let i = 0; i < calendarDays.length; i += 7) {
            result.push(calendarDays.slice(i, i + 7))
        }
        return result
    }, [calendarDays])

    // Theme-based colors
    const colors = {
        bg: theme === "dark" ? "bg-[#191919]" : "bg-white",
        text: theme === "dark" ? "text-white" : "text-[#37352f]",
        textMuted: theme === "dark" ? "text-white/40" : "text-[#37352f]/40",
        border: theme === "dark" ? "border-[#2c2c2c]" : "border-[#e9e9e7]",
        gridBg: theme === "dark" ? "bg-[#1f1f1f]" : "bg-[#f7f7f5]",
        cellBg: theme === "dark" ? "bg-[#191919]" : "bg-white",
        cellBgMuted: theme === "dark" ? "bg-[#1f1f1f]" : "bg-[#f7f7f5]/50",
        rowBg: theme === "dark" ? "bg-white/5" : "bg-[#f1f1ef]",
        rowHover: theme === "dark" ? "hover:bg-white/10" : "hover:bg-[#e9e9e7]",
    }

    // Process tasks to calculate slot indices (month-wide for alignment)
    const taskSpans = React.useMemo(() => {
        const processed = tasks.map(task => {
            try {
                const start = startOfDay(parseISO(task.createdAt || new Date().toISOString()))
                const isCompleted = task.status === "completed"
                const today = startOfDay(new Date())
                const dueDate = task.dueDate ? startOfDay(parseISO(task.dueDate)) : null

                let end;
                if (isCompleted) {
                    end = task.completedAt
                        ? startOfDay(parseISO(task.completedAt))
                        : (isAfter(today, start) ? today : addDays(start, 1))
                } else {
                    end = isAfter(today, start) ? today : addDays(start, 1)
                }

                // Determine Urgency
                let urgency: "overdue" | "due-soon" | "active" | "completed" = "active"
                if (isCompleted) {
                    urgency = "completed"
                } else if (dueDate && isBefore(dueDate, today)) {
                    urgency = "overdue"
                } else if (dueDate && differenceInCalendarDays(dueDate, today) <= 3) {
                    urgency = "due-soon"
                }

                return {
                    ...task,
                    spanStart: start,
                    spanEnd: end,
                    isCompleted,
                    urgency
                }
            } catch (e) {
                return null
            }
        }).filter(Boolean) as any[]

        // Slot allocation across the entire view period
        const slots: any[][] = []
        const numDays = calendarDays.length
        for (let i = 0; i < numDays; i++) slots[i] = []

        const taskResults = processed.map(task => {
            let slotIndex = 0
            let foundSlot = false

            while (!foundSlot) {
                let isSlotFree = true
                for (let dayIdx = 0; dayIdx < numDays; dayIdx++) {
                    const day = calendarDays[dayIdx]
                    if (isWithinInterval(day, { start: task.spanStart, end: task.spanEnd })) {
                        if (slots[dayIdx][slotIndex]) {
                            isSlotFree = false
                            break
                        }
                    }
                }

                if (isSlotFree) {
                    for (let dayIdx = 0; dayIdx < numDays; dayIdx++) {
                        const day = calendarDays[dayIdx]
                        if (isWithinInterval(day, { start: task.spanStart, end: task.spanEnd })) {
                            slots[dayIdx][slotIndex] = task.id
                        }
                    }
                    foundSlot = true
                } else {
                    slotIndex++
                }
            }

            return { ...task, slotIndex }
        })

        return taskResults
    }, [tasks, calendarDays])


    if (!mounted || !currentMonth) {
        return (
            <div className={cn(colors.bg, "rounded-xl border h-[600px] flex items-center justify-center", colors.border)}>
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        )
    }

    return (
        <div className={cn(colors.bg, colors.text, "rounded-xl border shadow-xl overflow-hidden font-sans select-none transition-colors duration-300", colors.border)}>
            {/* Notion Header */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-[17px] font-semibold tracking-tight">
                        {viewMode === "month" && format(currentMonth, "MMMM yyyy")}
                        {viewMode === "week" && `Week of ${format(startDate, "MMM d, yyyy")}`}
                        {viewMode === "day" && format(currentMonth, "EEEE, MMM d, yyyy")}
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className={cn("h-8 w-8 rounded-md transition-colors", theme === "dark" ? "hover:bg-white/10" : "hover:bg-[#f1f1ef]")}
                    >
                        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-[#37352f]" />}
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className={cn("text-[14px] h-8 px-3 rounded-md font-medium transition-colors", theme === "dark" ? "text-white/70 hover:bg-white/10" : "text-[#37352f]/70 hover:bg-[#f1f1ef]")}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Manage in Calendar
                    </Button>
                    <div className={cn("flex items-center ml-2 border-l pl-2 gap-1", colors.border)}>
                        <Button variant="ghost" size="icon" onClick={handlePrev} className={cn("h-7 w-7 rounded-md", theme === "dark" ? "text-white/70 hover:bg-white/10" : "text-[#37352f]/70 hover:bg-[#f1f1ef]")}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleToday} className={cn("text-[14px] h-7 px-3 rounded-md font-medium", theme === "dark" ? "text-white/70 hover:bg-white/10" : "text-[#37352f]/70 hover:bg-[#f1f1ef]")}>
                            Today
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNext} className={cn("h-7 w-7 rounded-md", theme === "dark" ? "text-white/70 hover:bg-white/10" : "text-[#37352f]/70 hover:bg-[#f1f1ef]")}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Weekdays Header */}
            <div className={cn("grid grid-cols-7 border-t border-b overflow-hidden", colors.border)}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className={cn("py-2 text-center text-[11px] font-medium uppercase tracking-[0.05em]", colors.textMuted)}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid (Weeks) */}
            <div className="flex flex-col">
                {weeks.map((week, weekIndex) => {
                    const weekStart = week[0]
                    const weekEnd = week[6]

                    // Filter tasks that overlap this week
                    const weekTasks = taskSpans.filter(task =>
                        isWithinInterval(task.spanStart, { start: weekStart, end: weekEnd }) ||
                        isWithinInterval(task.spanEnd, { start: weekStart, end: weekEnd }) ||
                        (isBefore(task.spanStart, weekStart) && isAfter(task.spanEnd, weekEnd))
                    )

                    const maxSlotInWeek = weekTasks.length > 0 ? Math.max(...weekTasks.map(t => t.slotIndex)) : -1
                    const weekHeight = Math.max(140, 50 + (maxSlotInWeek + 1) * 24 + 10)

                    return (
                        <div
                            key={weekIndex}
                            className={cn("relative border-b last:border-b-0 transition-all duration-300", colors.border)}
                            style={{ minHeight: weekHeight }}
                        >
                            {/* Day Grid Layer */}
                            <div className="grid grid-cols-7 gap-px absolute inset-0">
                                {week.map((day, idx) => {
                                    const isToday = isSameDay(day, new Date())
                                    const isCurrentMonth = isSameMonth(day, monthStart)
                                    const isLastInWeek = idx === 6

                                    return (
                                        <div
                                            key={day.toString()}
                                            className={cn(
                                                "h-full pt-2 px-2 pb-1 transition-colors relative z-0",
                                                isCurrentMonth ? colors.cellBg : colors.cellBgMuted,
                                                !isLastInWeek && "border-r",
                                                colors.border
                                            )}
                                        >
                                            <div className="flex justify-center mb-2 relative z-20">
                                                <span className={cn(
                                                    "text-[13px] font-medium h-7 w-7 flex items-center justify-center rounded-full",
                                                    isToday ? "bg-[#eb5757] text-white" : (isCurrentMonth ? (theme === "dark" ? "text-white/70" : "text-[#37352f]/70") : colors.textMuted)
                                                )}>
                                                    {format(day, "d")}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Task Overlay Layer */}
                            <div className="relative pointer-events-none pt-10 pb-4">
                                {weekTasks.map((task) => {

                                    const startDay = isBefore(task.spanStart, weekStart) ? weekStart : task.spanStart
                                    const endDay = isAfter(task.spanEnd, weekEnd) ? weekEnd : task.spanEnd

                                    const startCol = differenceInCalendarDays(startDay, weekStart)
                                    const endCol = differenceInCalendarDays(endDay, weekStart)
                                    const colSpan = endCol - startCol + 1

                                    return (
                                        <div
                                            key={task.id}
                                            className="absolute pointer-events-auto flex items-center px-1"
                                            style={{
                                                top: task.slotIndex * 24 + 40,
                                                left: `${(startCol / 7) * 100}%`,
                                                width: `${(colSpan / 7) * 100}%`,
                                                height: 18
                                            }}
                                        >
                                            <TooltipProvider>
                                                <Tooltip delayDuration={300}>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onViewTask(task)
                                                            }}
                                                            className={cn(
                                                                "w-full h-full flex items-center px-2 rounded-[4px] text-[10.5px] font-normal truncate cursor-pointer transition-colors border-l-2",
                                                                theme === "dark" ? "hover:bg-white/10" : "hover:bg-[#e9e9e7]",
                                                                task.urgency === "overdue" ? "border-l-[#eb5757] bg-[#eb5757]/10" :
                                                                    task.urgency === "due-soon" ? "border-l-[#f2994a] bg-[#f2994a]/10" :
                                                                        task.urgency === "completed" ? "border-l-[#27ae60] bg-[#27ae60]/10" :
                                                                            "border-l-[#2eaadc] bg-[#2eaadc]/5"
                                                            )}
                                                        >
                                                            {isSameDay(task.spanStart, startDay) && (
                                                                <span className="truncate">{task.title}</span>
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent
                                                        className={cn(
                                                            "p-4 shadow-2xl rounded-lg w-64 border-none transition-colors",
                                                            theme === "dark" ? "bg-[#2c2c2c] text-white" : "bg-white text-[#37352f] border border-[#e9e9e7] shadow-sm"
                                                        )}
                                                    >
                                                        <div className="space-y-3 pointer-events-none">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-[14px]">{task.title}</h3>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn(
                                                                    "h-2 w-2 rounded-full",
                                                                    task.isCompleted ? "bg-[#27ae60]" :
                                                                        task.urgency === 'overdue' ? "bg-[#eb5757]" :
                                                                            task.urgency === 'due-soon' ? "bg-[#f2994a]" : "bg-[#2eaadc]"
                                                                )} />
                                                                <span className={cn("text-[12px] font-bold capitalize", theme === "dark" ? "text-white/80" : "text-[#37352f]/80")}>
                                                                    {task.status.replace('-', ' ')}
                                                                </span>
                                                                {task.assigned_to && (
                                                                    <>
                                                                        <span className="text-muted-foreground/40 mx-1">•</span>
                                                                        <span className={cn("text-[12px] font-medium truncate italic", theme === "dark" ? "text-white/60" : "text-[#37352f]/60")}>
                                                                            {task.assigned_to.name}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <p className={cn("text-[11px] leading-relaxed line-clamp-2 italic", theme === "dark" ? "text-white/40" : "text-[#37352f]/40")}>
                                                                Click bar to view full details
                                                            </p>
                                                            <p className={cn("text-[12px] leading-relaxed line-clamp-3", theme === "dark" ? "text-white/50" : "text-[#37352f]/50")}>
                                                                {task.description || "No additional details provided."}
                                                            </p>
                                                            <div className={cn("border-t pt-2 space-y-1 text-[11px] font-medium", theme === "dark" ? "border-[#3f3f3f]" : "border-[#e9e9e7]")}>
                                                                <div className="flex items-center justify-between">
                                                                    <span className={theme === "dark" ? "text-white/40" : "text-[#37352f]/40"}>Deadline</span>
                                                                    <span className={theme === "dark" ? "text-white/60" : "text-[#37352f]/60"}>
                                                                        {task.dueDate ? format(parseISO(task.dueDate), "MMM d, yyyy") : "No deadline"}
                                                                    </span>
                                                                </div>
                                                                {task.urgency === "overdue" && (
                                                                    <div className="flex items-center justify-between text-[#eb5757]">
                                                                        <span>Status</span>
                                                                        <span>Overdue by {differenceInCalendarDays(startOfDay(new Date()), startOfDay(parseISO(task.dueDate)))} days</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
