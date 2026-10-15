import { useState } from 'react'
import { ArrowRight, CalendarDays, Check, Globe2 } from 'lucide-react'
import type { Copy } from '../i18n'
import type { Language } from '../types'
import { isAllowedEmail, isSupabaseConfigured, supabase } from '../lib/supabase'

type Props = {
  language: Language
  text: Copy
  onLanguageChange: (language: Language) => void
  onDemo: () => void
}

export function AuthScreen({ language, text, onLanguageChange, onDemo }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error' | 'invalid'>('idle')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isAllowedEmail(email)) {
      setStatus('invalid')
      return
    }
    if (!supabase) return
    setStatus('loading')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setStatus(error ? 'error' : 'sent')
  }

  return (
    <main className="auth-shell">
      <header className="auth-header">
        <div className="wordmark" aria-label="Universitätsklinikum Bonn, Institut für Humangenetik">
          <span className="ukb-mark">ukb</span>
          <span className="wordmark-divider" />
          <span className="institute-name">Institut für Humangenetik</span>
        </div>
        <button className="language-button" onClick={() => onLanguageChange(language === 'de' ? 'en' : 'de')}>
          <Globe2 size={17} /> {language === 'de' ? 'EN' : 'DE'}
        </button>
      </header>
      <section className="auth-body">
        <div className="auth-intro">
          <div className="auth-icon"><CalendarDays size={31} /></div>
          <h1>{text.loginTitle}</h1>
          <p>{text.loginBody}</p>
          <ul>
            <li><Check size={18} /> {language === 'de' ? 'Freie Zeiten auf einen Blick' : 'See availability at a glance'}</li>
            <li><Check size={18} /> {language === 'de' ? 'Direkte, konfliktfreie Reservierung' : 'Instant, conflict-free booking'}</li>
            <li><Check size={18} /> {language === 'de' ? 'Sicher mit Ihrer Institutsadresse' : 'Secure with your institute address'}</li>
          </ul>
        </div>
        <div className="auth-panel">
          <h2>{language === 'de' ? 'Anmelden' : 'Sign in'}</h2>
          {isSupabaseConfigured ? (
            <form onSubmit={submit}>
              <label htmlFor="email">{text.email}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setStatus('idle') }}
                placeholder={text.emailPlaceholder}
                autoComplete="email"
                required
              />
              {status === 'invalid' ? <p className="form-message error">{text.invalidDomain}</p> : null}
              {status === 'error' ? <p className="form-message error">{text.loginError}</p> : null}
              {status === 'sent' ? <p className="form-message success">{text.linkSent}</p> : null}
              <button className="primary-button" type="submit" disabled={status === 'loading' || status === 'sent'}>
                {text.sendLink} <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <>
              <p className="demo-explainer">{language === 'de' ? 'Die Oberfläche läuft lokal im Demo-Modus. Supabase kann später ohne Designänderung verbunden werden.' : 'The interface is running locally in demo mode. Supabase can be connected later without changing the design.'}</p>
              <button className="primary-button" onClick={onDemo}>{text.demoOpen} <ArrowRight size={18} /></button>
            </>
          )}
          <p className="privacy-note">{language === 'de' ? 'Zugelassen: @ukbonn.de und @uni-bonn.de' : 'Allowed: @ukbonn.de and @uni-bonn.de'}</p>
        </div>
      </section>
    </main>
  )
}
