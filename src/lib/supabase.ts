import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('YOUR_PROJECT') && !anonKey.includes('YOUR_PUBLIC'),
)

export const supabase = isSupabaseConfigured ? createClient(url!, anonKey!) : null

export function isAllowedEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  return normalized.endsWith('@ukbonn.de') || normalized.endsWith('@uni-bonn.de')
}
