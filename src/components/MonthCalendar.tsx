import type { Booking } from '../types'
import type { Copy } from '../i18n'
import { addDays, dateKeyFromIso, formatLongDate, formatTime, startOfMonth, toDateKey } from '../lib/date'

type Props = {
  month: Date
  bookings: Booking[]
  text: Copy
  language: 'de' | 'en'
  activeView: 'calendar' | 'mine'
  currentUserId: string
  selectedDate: string
  onDateSelect: (date: string) => void
  onSlotSelect: (date: string, hour: number) => void
  onBookingSelect: (booking: Booking) => void
}

export function MonthCalendar({ month, bookings, text, language, activeView, currentUserId, selectedDate, onDateSelect, onSlotSelect, onBookingSelect }: Props) {
  const shown = activeView === 'mine' ? bookings.filter((booking) => booking.ownerId === currentUserId) : bookings
  const monthStart = startOfMonth(month)
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const firstWeekStart = new Date(monthStart)
  const weekday = monthStart.getDay()
  firstWeekStart.setDate(monthStart.getDate() - (weekday === 0 ? 6 : weekday - 1))
  const calendarDays = Math.ceil((Math.floor((monthEnd.getTime() - firstWeekStart.getTime()) / 86_400_000) + 1) / 7) * 7
  const cells = Array.from({ length: calendarDays }, (_, index) => addDays(firstWeekStart, index)).filter((date) => date.getDay() >= 1 && date.getDay() <= 5)
  const selectedBookings = shown
    .filter((booking) => dateKeyFromIso(booking.start) === selectedDate)
    .sort((a, b) => a.start.localeCompare(b.start))

  return (
    <div className="month-view">
      <div className="month-weekdays" aria-hidden="true">
        {text.weekdays.map((day) => <span key={day}>{day.slice(0, 2)}</span>)}
      </div>
      <div className="month-grid">
        {cells.map((date) => {
          const key = toDateKey(date)
          const count = shown.filter((booking) => dateKeyFromIso(booking.start) === key).length
          const outside = date.getMonth() !== month.getMonth()
          const selected = key === selectedDate
          return (
            <button
              type="button"
              key={key}
              className={`month-day ${outside ? 'outside' : ''} ${selected ? 'selected' : ''}`}
              onClick={() => onDateSelect(key)}
              aria-pressed={selected}
              aria-label={`${formatLongDate(key, language)}${count ? `, ${count}` : ''}`}
            >
              <span>{date.getDate()}</span>
              {count > 0 ? <small><i /> {count}</small> : <small className="month-free">—</small>}
            </button>
          )
        })}
      </div>
      <section className="day-agenda" aria-label={formatLongDate(selectedDate, language)}>
        <div className="agenda-heading">
          <h2>{formatLongDate(selectedDate, language)}</h2>
          <button type="button" onClick={() => onSlotSelect(selectedDate, 9)}>{text.create}</button>
        </div>
        {selectedBookings.length ? selectedBookings.map((booking) => (
          <button className="agenda-booking" key={booking.id} onClick={() => onBookingSelect(booking)}>
            <span>{formatTime(booking.start)} – {formatTime(booking.end)}</span>
            <div><strong>{booking.title}</strong><small>{booking.ownerName}</small></div>
          </button>
        )) : (
          <button className="agenda-empty" onClick={() => onSlotSelect(selectedDate, 9)}>
            <span>{text.noBookings}</span><strong>{text.reserveThisDay}</strong>
          </button>
        )}
      </section>
    </div>
  )
}
