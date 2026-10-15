export type Language = 'de' | 'en'

export type User = {
  id: string
  email: string
  name: string
}

export type Booking = {
  id: string
  title: string
  note: string
  ownerId: string
  ownerName: string
  start: string
  end: string
}

export type BookingDraft = {
  title: string
  note: string
  date: string
  startHour: number
  endHour: number
}
