import type { Booking } from '../types'
import type { Copy } from '../i18n'
import { addDays, dateKeyFromIso, END_HOUR, formatDayHeader, formatTime, hourFromIso, isSameDay, START_HOUR, toDateKey } from '../lib/date'

type Props = {
  weekStart: Date
  bookings: Booking[]
  text: Copy
  activeView: 'calendar' | 'mine'
  currentUserId: string
  selectedSlot: { date: string; hour: number } | null
  selectedDate: string
  onDateSelect: (date: string) => void
  onSlotSelect: (date: string, hour: number) => void
  onBookingSelect: (booking: Booking) => void
}

export function WeekCalendar({ weekStart, bookings, text, activeView, currentUserId, selectedSlot, selectedDate, onDateSelect, onSlotSelect, onBookingSelect }: Props) {
  const days = Array.from({ length: 5 }, (_, index) => addDays(weekStart, index))
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index)
  const shown = activeView === 'mine' ? bookings.filter((booking) => booking.ownerId === currentUserId) : bookings

  return (
    <div className="week-view">
      <div className="mobile-day-picker" aria-label="Weekdays">
        {days.map((day, index) => {
          const key = toDateKey(day)
          return <button key={key} className={selectedDate === key ? 'active' : ''} onClick={() => onDateSelect(key)}><span>{text.weekdays[index].slice(0, 2)}</span><strong>{day.getDate()}</strong></button>
        })}
      </div>
      <div className="calendar-scroll">
      <div className="calendar-grid" style={{ '--day-count': 5 } as React.CSSProperties}>
        <div className="calendar-corner" />
        {days.map((day, index) => {
          const header = formatDayHeader(day, index, text)
          const today = isSameDay(day, new Date())
          return (
            <div className={`day-header ${today ? 'today' : ''}`} key={day.toISOString()}>
              <strong>{header.weekday}</strong>
              <span>{header.date}</span>
            </div>
          )
        })}
        <div className="time-axis">
          {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => (
            <span key={index} style={{ top: `${index * 64}px` }}>{String(START_HOUR + index).padStart(2, '0')}:00</span>
          ))}
        </div>
        {days.map((day) => {
          const date = toDateKey(day)
          const today = isSameDay(day, new Date())
          const dayBookings = shown.filter((booking) => dateKeyFromIso(booking.start) === date)
          return (
            <div className={`day-column ${today ? 'today' : ''} ${selectedDate === date ? 'mobile-selected' : ''}`} key={date}>
              {hours.map((hour) => {
                const selected = selectedSlot?.date === date && selectedSlot.hour === hour
                return (
                  <button
                    key={hour}
                    className={`time-slot ${selected ? 'selected' : ''}`}
                    style={{ top: `${(hour - START_HOUR) * 64}px` }}
                    onClick={() => onSlotSelect(date, hour)}
                    aria-label={`${date} ${hour}:00`}
                  />
                )
              })}
              {dayBookings.map((booking) => {
                const start = hourFromIso(booking.start)
                const end = hourFromIso(booking.end)
                const owner = booking.ownerId === currentUserId
                return (
                  <button
                    key={booking.id}
                    className={`booking-block ${owner ? 'own' : ''}`}
                    style={{
                      top: `${(start - START_HOUR) * 64 + 4}px`,
                      height: `${Math.max(56, (end - start) * 64 - 8)}px`,
                    }}
                    onClick={(event) => { event.stopPropagation(); onBookingSelect(booking) }}
                  >
                    <span>{formatTime(booking.start)} – {formatTime(booking.end)}</span>
                    <strong>{booking.title}</strong>
                    <small>{booking.ownerName}</small>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}
