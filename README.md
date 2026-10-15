# Seminarraum Kalender

Minimalistisches, zweisprachiges Reservierungssystem für den Seminarraum des Instituts für Humangenetik. Die Oberfläche orientiert sich an der blau-weißen Gestaltung der Institutswebsite.

## Live

- App: https://tyasird.github.io/seminarraum-kalender/
- Quellcode: https://github.com/tyasird/seminarraum-kalender

Die öffentliche Version läuft aktuell im Demo-Modus. Reservierungen werden dabei nur im jeweiligen Browser gespeichert; für den gemeinsamen Institutsbetrieb muss Supabase verbunden werden.

## Lokal starten

```bash
npm install
npm run dev
```

Ohne Umgebungsvariablen startet die App in einem lokalen Demo-Modus. Reservierungen werden dann ausschließlich im Browser (`localStorage`) gespeichert.

## Kostenlos veröffentlichen

1. Ein neues Supabase-Projekt im kostenlosen Tarif anlegen.
2. `supabase/schema.sql` im Supabase SQL Editor ausführen.
3. Unter **Authentication → URL Configuration** die lokale URL und später die Vercel-Domain als Redirect-URL eintragen.
4. Unter **Authentication → Providers → Email** Magic-Link-Anmeldung aktivieren.
5. Dieses Projekt in ein privates GitHub-Repository pushen.
6. Das Repository in Vercel importieren und dort die Variablen aus `.env.example` setzen:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy auslösen und die fertige Vercel-URL auch bei Supabase als Redirect-URL ergänzen.

Wichtig: Nur der öffentliche `anon`-Schlüssel gehört in Vercel. Ein Supabase `service_role`-Schlüssel darf niemals im Frontend oder Repository stehen.

## Sicherheitsmodell

- Die Datenbank akzeptiert nur angemeldete Benutzer mit `@ukbonn.de` oder `@uni-bonn.de`.
- Jeder Benutzer darf nur eigene Reservierungen ändern oder löschen.
- Eine PostgreSQL-Exclusion-Constraint verhindert zeitliche Überschneidungen auch bei gleichzeitigen Anfragen.
- Reservierungen sind auf Montag–Freitag, 08:00–18:00 und volle Stunden begrenzt.

## Befehle

```bash
npm run typecheck
npm run build
npm run preview
```
