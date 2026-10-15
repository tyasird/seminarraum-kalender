import { CalendarDays, Clock3, Trash2, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Copy } from '../i18n'
import type { Booking, BookingDraft, Language } from '../types'
import { dateKeyFromIso, END_HOUR, formatLongDate, formatTime, hourFromIso } from '../lib/date'

type Props = {
  text: Copy
  language: Language
  draft: BookingDraft | null
  booking: Booking | null
  canEdit: boolean
  onClose: () => void
  onSave: (draft: BookingDraft) => Promise<void>
  onDelete: () => Promise<void>
}

export function BookingDrawer({ text, language, draft, booking, canEdit, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<BookingDraft | null>(draft)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (booking) {
      setForm({
        title: booking.title,
        note: booking.note,
        date: dateKeyFromIso(booking.start),
        startHour: hourFromIso(booking.start),
        endHour: hourFromIso(booking.end),
      })
    } else {
      setForm(draft)
    }
  }, [booking, draft])

  if (!form) return null
  const editable = !booking || canEdit
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <aside className="booking-drawer" aria-label={booking ? text.details : text.create}>
      <div className="drawer-heading">
        <h2>{booking ? (canEdit ? text.edit : text.details) : text.create}</h2>
        <button className="icon-button" onClick={onClose} aria-label={text.close}><X size={24} /></button>
      </div>
      <div className="drawer-summary">
        <div><CalendarDays size={20} /><span>{formatLongDate(form.date, language)}</span></div>
        <div><Clock3 size={20} /><span>{String(form.startHour).padStart(2, '0')}:00 – {String(form.endHour).padStart(2, '0')}:00 ({form.endHour - form.startHour} Std.)</span></div>
        {booking ? <div><UserRound size={20} /><span>{text.owner}: {booking.ownerName}</span></div> : null}
      </div>
      <form className="booking-form" onSubmit={submit}>
        <label htmlFor="booking-title">{text.bookingTitle} <span>*</span></label>
        <input
          id="booking-title"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          placeholder={text.titlePlaceholder}
          maxLength={80}
          disabled={!editable}
          required
        />
        {editable ? (
          <div className="time-selects">
            <div>
              <label htmlFor="start-time">{language === 'de' ? 'Beginn' : 'Start'}</label>
              <select id="start-time" value={form.startHour} onChange={(event) => {
                const startHour = Number(event.target.value)
                setForm({ ...form, startHour, endHour: Math.max(startHour + 1, form.endHour) })
              }}>
                {Array.from({ length: END_HOUR - 8 }, (_, index) => 8 + index).map((hour) => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="end-time">{language === 'de' ? 'Ende' : 'End'}</label>
              <select id="end-time" value={form.endHour} onChange={(event) => setForm({ ...form, endHour: Number(event.target.value) })}>
                {Array.from({ length: END_HOUR - form.startHour }, (_, index) => form.startHour + index + 1).map((hour) => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00</option>)}
              </select>
            </div>
          </div>
        ) : null}
        <label htmlFor="booking-note">{text.note}</label>
        <textarea
          id="booking-note"
          value={form.note}
          onChange={(event) => setForm({ ...form, note: event.target.value })}
          placeholder={text.notePlaceholder}
          maxLength={500}
          disabled={!editable}
        />
        <div className="character-count">{form.note.length}/500</div>
        {editable ? <button className="primary-button" type="submit" disabled={saving}>{booking ? text.save : text.reserve}</button> : null}
        <button className="secondary-button" type="button" onClick={onClose}>{editable ? text.cancel : text.close}</button>
        {booking && canEdit ? (
          <button className="danger-button" type="button" onClick={onDelete}><Trash2 size={17} /> {text.delete}</button>
        ) : null}
      </form>
    </aside>
  )
}
