import { ChevronLeft, ChevronRight, Info, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { BookingDrawer } from './components/BookingDrawer'
import { Header } from './components/Header'
import { WeekCalendar } from './components/WeekCalendar'
import { copy } from './i18n'
import { createBooking, deleteBooking, listBookings, updateBooking } from './lib/bookings'
import { addDays, addWeeks, fromDateAndHour, startOfWeek } from './lib/date'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import type { Booking, BookingDraft, Language, User } from './types'

const DEMO_USER: User = { id: 'demo-user', email: 'miriam.schneider@ukbonn.de', name: 'Miriam Schneider' }

function App() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('seminarraum-language') as Language) || 'de')
  const [user, setUser] = useState<User | null>(() => (!isSupabaseConfigured && localStorage.getItem('seminarraum-demo') === 'true' ? DEMO_USER : null))
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [activeView, setActiveView] = useState<'calendar' | 'mine'>('calendar')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const text = copy[language]

  useEffect(() => {
    localStorage.setItem('seminarraum-language', language)
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      const authUser = data.session?.user
      setUser(authUser ? {
        id: authUser.id,
        email: authUser.email ?? '',
        name: (authUser.user_metadata.full_name as string | undefined) ?? authUser.email?.split('@')[0].replace('.', ' ') ?? 'User',
      } : null)
      setAuthReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user
      setUser(authUser ? {
        id: authUser.id,
        email: authUser.email ?? '',
        name: (authUser.user_metadata.full_name as string | undefined) ?? authUser.email?.split('@')[0].replace('.', ' ') ?? 'User',
      } : null)
      setAuthReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const load = useCallback(async () => {
    if (!user) return
    const rangeStart = weekStart.toISOString()
    const rangeEnd = addDays(weekStart, 7).toISOString()
    try {
      setBookings(await listBookings(rangeStart, rangeEnd))
      setError(null)
    } catch {
      setError(language === 'de' ? 'Reservierungen konnten nicht geladen werden.' : 'Bookings could not be loaded.')
    }
  }, [language, user, weekStart])

  useEffect(() => { void load() }, [load])

  const visibleBookings = useMemo(() => bookings.filter((booking) => {
    const start = new Date(booking.start)
    return start >= weekStart && start < addDays(weekStart, 5)
  }), [bookings, weekStart])

  if (!authReady) return <div className="loading-screen" />
  if (!user) {
    return <AuthScreen language={language} text={text} onLanguageChange={setLanguage} onDemo={() => {
      localStorage.setItem('seminarraum-demo', 'true')
      setUser(DEMO_USER)
    }} />
  }

  const closeDrawer = () => { setSelectedSlot(null); setSelectedBooking(null); setError(null) }
  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 3500)
  }
  const overlaps = (draft: BookingDraft, ignoredId?: string) => {
    const start = new Date(fromDateAndHour(draft.date, draft.startHour)).getTime()
    const end = new Date(fromDateAndHour(draft.date, draft.endHour)).getTime()
    return bookings.some((booking) => booking.id !== ignoredId && new Date(booking.start).getTime() < end && new Date(booking.end).getTime() > start)
  }
  const save = async (draft: BookingDraft) => {
    if (!draft.title.trim()) { setError(text.titleRequired); return }
    if (overlaps(draft, selectedBooking?.id)) { setError(text.conflict); return }
    const booking: Booking = {
      id: selectedBooking?.id ?? crypto.randomUUID(),
      title: draft.title.trim(),
      note: draft.note.trim(),
      ownerId: user.id,
      ownerName: user.name,
      start: fromDateAndHour(draft.date, draft.startHour),
      end: fromDateAndHour(draft.date, draft.endHour),
    }
    try {
      if (selectedBooking) await updateBooking(booking)
      else await createBooking(booking)
      await load()
      closeDrawer()
      showNotice(selectedBooking ? text.successUpdated : text.successCreated)
    } catch {
      setError(text.conflict)
    }
  }
  const remove = async () => {
    if (!selectedBooking) return
    await deleteBooking(selectedBooking.id)
    await load()
    closeDrawer()
    showNotice(text.successDeleted)
  }
  const draft = selectedSlot ? { title: '', note: '', date: selectedSlot.date, startHour: selectedSlot.hour, endHour: selectedSlot.hour + 1 } : null

  return (
    <div className="app-shell">
      <Header
        language={language}
        text={text}
        user={user}
        activeView={activeView}
        demo={!isSupabaseConfigured}
        onLanguageChange={setLanguage}
        onViewChange={(view) => { setActiveView(view); closeDrawer() }}
        onSignOut={() => {
          if (supabase) void supabase.auth.signOut()
          localStorage.removeItem('seminarraum-demo')
          setUser(null)
        }}
      />
      <main className={`app-main ${selectedSlot || selectedBooking ? 'drawer-open' : ''}`}>
        <section className="calendar-section">
          <div className="page-title-row">
            <div><h1>{text.title}</h1><p>{text.room}</p></div>
            <button className="new-booking-button" onClick={() => {
              const now = new Date()
              const hour = Math.min(17, Math.max(8, now.getHours()))
              setSelectedSlot({ date: weekStart.toISOString().slice(0, 10), hour })
              setSelectedBooking(null)
            }}><Plus size={18} /> {text.create}</button>
          </div>
          <div className="calendar-toolbar">
            <button className="square-button" onClick={() => setWeekStart((value) => addWeeks(value, -1))} aria-label={text.previousWeek}><ChevronLeft size={20} /></button>
            <button className="today-button" onClick={() => setWeekStart(startOfWeek(new Date()))}>{text.today}</button>
            <button className="square-button" onClick={() => setWeekStart((value) => addWeeks(value, 1))} aria-label={text.nextWeek}><ChevronRight size={20} /></button>
            <strong>{new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short' }).format(weekStart)} – {new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(addDays(weekStart, 4))}</strong>
          </div>
          {activeView === 'mine' && visibleBookings.every((booking) => booking.ownerId !== user.id) ? (
            <div className="empty-state"><Info size={21} /><span>{text.noMine}</span><button onClick={() => setActiveView('calendar')}>{text.backToAll}</button></div>
          ) : null}
          <WeekCalendar
            weekStart={weekStart}
            bookings={visibleBookings}
            text={text}
            activeView={activeView}
            currentUserId={user.id}
            selectedSlot={selectedSlot}
            onSlotSelect={(date, hour) => { setSelectedSlot({ date, hour }); setSelectedBooking(null); setError(null) }}
            onBookingSelect={(booking) => { setSelectedBooking(booking); setSelectedSlot(null); setError(null) }}
          />
        </section>
        {selectedSlot || selectedBooking ? (
          <>
            <button className="drawer-backdrop" onClick={closeDrawer} aria-label={text.close} />
            <BookingDrawer
              text={text}
              language={language}
              draft={draft}
              booking={selectedBooking}
              canEdit={selectedBooking?.ownerId === user.id}
              onClose={closeDrawer}
              onSave={save}
              onDelete={remove}
            />
          </>
        ) : null}
      </main>
      {notice ? <div className="toast success">{notice}</div> : null}
      {error ? <div className="toast error" role="alert">{error}<button onClick={() => setError(null)}>×</button></div> : null}
    </div>
  )
}

export default App
