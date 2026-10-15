import { CalendarDays, ChevronDown, Globe2, LogOut } from 'lucide-react'
import type { Copy } from '../i18n'
import type { Language, User } from '../types'

type Props = {
  language: Language
  text: Copy
  user: User
  activeView: 'calendar' | 'mine'
  demo: boolean
  onLanguageChange: (language: Language) => void
  onViewChange: (view: 'calendar' | 'mine') => void
  onSignOut: () => void
}

export function Header({ language, text, user, activeView, demo, onLanguageChange, onViewChange, onSignOut }: Props) {
  const initials = user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  return (
    <>
      <header className="site-header">
        <div className="wordmark">
          <span className="ukb-mark">ukb</span>
          <span className="wordmark-divider" />
          <span className="institute-name">Institut für Humangenetik</span>
        </div>
        <div className="account-area">
          <button className="language-button" onClick={() => onLanguageChange(language === 'de' ? 'en' : 'de')} aria-label="Change language">
            <Globe2 size={16} /> <strong>{language.toUpperCase()}</strong><span>/</span>{language === 'de' ? 'EN' : 'DE'}
          </button>
          <div className="avatar">{initials}</div>
          <div className="account-copy"><span>{text.signedInAs}</span><strong>{user.name}</strong></div>
          <ChevronDown className="account-chevron" size={17} />
          <button className="icon-button signout-button" onClick={onSignOut} title={text.signOut}><LogOut size={18} /></button>
        </div>
      </header>
      <nav className="primary-nav" aria-label="Main navigation">
        <button className={activeView === 'calendar' ? 'active' : ''} onClick={() => onViewChange('calendar')}>
          <CalendarDays size={17} /> {text.calendar}
        </button>
        <button className={activeView === 'mine' ? 'active' : ''} onClick={() => onViewChange('mine')}>{text.mine}</button>
        <span className="nav-room">{text.room}</span>
      </nav>
      {demo ? <div className="demo-bar">{text.demo}</div> : null}
    </>
  )
}
