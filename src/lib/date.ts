import type { Copy } from '../i18n'

export const START_HOUR = 8
export const END_HOUR = 18

export function startOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const offset = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + offset)
  result.setHours(0, 0, 0, 0)
  return result
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7)
}

export function startOfMonth(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), 1)
  result.setHours(0, 0, 0, 0)
  return result
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1)
  result.setHours(0, 0, 0, 0)
  return result
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromDateAndHour(dateKey: string, hour: number): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day, hour, 0, 0, 0).toISOString()
}

export function hourFromIso(value: string): number {
  return new Date(value).getHours()
}

export function dateKeyFromIso(value: string): string {
  return toDateKey(new Date(value))
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function formatWeekRange(weekStart: Date, language: 'de' | 'en'): string {
  const end = addDays(weekStart, 4)
  const locale = language === 'de' ? 'de-DE' : 'en-GB'
  const left = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(weekStart)
  const right = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(end)
  return `${left} – ${right}`
}

export function formatLongDate(dateKey: string, language: 'de' | 'en'): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export function formatDayHeader(date: Date, index: number, text: Copy): { weekday: string; date: string } {
  return {
    weekday: text.weekdays[index],
    date: `${date.getDate()}. ${text.months[date.getMonth()]}`,
  }
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b)
}
