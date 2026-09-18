'use client';
import { HolidaysCalendar } from "@/features/holiday-calendar/components/holidays-calendar";
import { useAuthStore } from "@/stores/auth.store";

export default function HolidaysCalendarPage() { 
    const isAdmin = useAuthStore(
        (state) => state.user?.role === "ADMIN",
    );
    return <HolidaysCalendar admin={isAdmin}/>; 
}