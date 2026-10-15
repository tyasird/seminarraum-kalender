import type { Booking } from '../types'
import { addDays, fromDateAndHour, startOfWeek, toDateKey } from './date'
import { supabase } from './supabase'

const STORAGE_KEY = 'seminarraum-bookings-v1'

function seedBookings(): Booking[] {
  const monday = startOfWeek(new Date())
  const names = ['Dr. Anna Weber', 'Miriam Schneider', 'Dr. Felix Wagner', 'Prof. Dr. Martin Zenker']
  const items = [
    [0, 9, 10, 'AG-Meeting', names[0]],
    [0, 11, 12, 'Journal Club', 'Prof. Dr. Thomas Braun'],
    [1, 10, 12, 'Doktorandenseminar', names[1]],
    [1, 13, 14, 'Arbeitsgruppe Epigenetik', 'Dr. Julia Neumann'],
    [2, 9, 10, 'Lab-Meeting', 'PD Dr. Michael Krüger'],
    [3, 11, 12, 'Methoden-Workshop', 'Dr. Elena Rossi'],
    [3, 15, 16, 'Team-Meeting', names[1]],
    [4, 10, 11, 'AG Klinische Genetik', names[3]],
  ] as const

  return items.map(([day, start, end, title, ownerName], index) => {
    const date = toDateKey(addDays(monday, day))
    return {
      id: `seed-${index}`,
      title,
      note: '',
      ownerId: ownerName === names[1] ? 'demo-user' : `seed-owner-${index}`,
      ownerName,
      start: fromDateAndHour(date, start),
      end: fromDateAndHour(date, end),
    }
  })
}

function loadLocal(): Booking[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seeded = seedBookings()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    return seeded
  }
  try {
    return JSON.parse(raw) as Booking[]
  } catch {
    return seedBookings()
  }
}

function saveLocal(bookings: Booking[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}

type BookingRow = {
  id: string
  title: string
  note: string | null
  owner_id: string
  owner_name: string
  starts_at: string
  ends_at: string
}

function fromRow(row: BookingRow): Booking {
  return {
    id: row.id,
    title: row.title,
    note: row.note ?? '',
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    start: row.starts_at,
    end: row.ends_at,
  }
}

export async function listBookings(rangeStart: string, rangeEnd: string): Promise<Booking[]> {
  if (!supabase) return loadLocal()
  const { data, error } = await supabase
    .from('bookings')
    .select('id,title,note,owner_id,owner_name,starts_at,ends_at')
    .lt('starts_at', rangeEnd)
    .gt('ends_at', rangeStart)
    .order('starts_at')
  if (error) throw error
  return (data as BookingRow[]).map(fromRow)
}

export async function createBooking(booking: Booking): Promise<Booking> {
  if (!supabase) {
    const bookings = loadLocal()
    saveLocal([...bookings, booking])
    return booking
  }
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      title: booking.title,
      note: booking.note || null,
      owner_id: booking.ownerId,
      owner_name: booking.ownerName,
      starts_at: booking.start,
      ends_at: booking.end,
    })
    .select('id,title,note,owner_id,owner_name,starts_at,ends_at')
    .single()
  if (error) throw error
  return fromRow(data as BookingRow)
}

export async function updateBooking(booking: Booking): Promise<Booking> {
  if (!supabase) {
    const bookings = loadLocal().map((item) => (item.id === booking.id ? booking : item))
    saveLocal(bookings)
    return booking
  }
  const { data, error } = await supabase
    .from('bookings')
    .update({
      title: booking.title,
      note: booking.note || null,
      starts_at: booking.start,
      ends_at: booking.end,
    })
    .eq('id', booking.id)
    .select('id,title,note,owner_id,owner_name,starts_at,ends_at')
    .single()
  if (error) throw error
  return fromRow(data as BookingRow)
}

export async function deleteBooking(id: string): Promise<void> {
  if (!supabase) {
    saveLocal(loadLocal().filter((item) => item.id !== id))
    return
  }
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) throw error
}
