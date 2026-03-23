# Pearl Hub PRO — Complete Launch Guide

## What is complete ✅

### Frontend (React + TypeScript)
- Authentication: real Supabase auth (signup, login, password reset, session persistence)
- Role-based access: customer, owner, broker, stay_provider, vehicle_provider, event_provider, sme, admin
- All listing pages: Properties, Stays, Vehicles, Events — reading from Supabase via React Query
- Admin dashboard: listing moderation, user reports, analytics
- Provider dashboard: listing management, predictive revenue chart, pricing advisor, availability calendar
- Customer dashboard: bookings from Supabase, wallet, AI concierge, Pearl Points
- Checkout: writes real booking rows to Supabase bookings table
- Wallet: writes wallet_transactions to Supabase
- Reviews: gated to verified (completed) bookings via RLS
- Image uploads: Supabase Storage with MIME + size validation
- Multilingual chat: BookingChat with auto-translation (Claude API), voice input/output
- Availability calendar: Supabase Realtime live updates
- Trip Bundle cart: multi-vertical checkout with 5% discount
- Pearl Points: loyalty programme with auto-award trigger
- Pricing Advisor: dynamic pricing suggestions with Sri Lanka seasonal intelligence
- AI Property Valuation: comparable-based market estimates + Claude insight
- Full-text search: unified across all verticals with non-English query translation
- i18n: 9 languages (EN, SI, TA, DE, FR, RU, ZH, AR, JA)
- Security: CSP headers, input validation (Zod), image validation, no secrets in repo
- PWA: service worker, offline support, installable

### Database (15 migrations)
- profiles, user_roles, service_rates, stays_listings, vehicles_listings, events_listings
- properties_listings, social_listings, wallet_transactions
- bookings, earnings, seat_holds, reviews (verified-only RLS)
- user_reports, admin_actions, request_logs, admin actions log
- booking_messages (multilingual realtime chat)
- blocked_dates (provider availability management)
- pearl_points with auto-award trigger
- referrals/affiliate system
- damage deposit columns on bookings
- exchange_rates table
- search_all_listings() RPC + pg_trgm indexes

## What still needs doing before public launch ⚠️

### Critical (must have before taking real money)
1. **Real payment gateway** — PayHere or Stripe integration via Supabase Edge Function
2. **CBSL compliance** — if wallet holds real LKR, need Payment Service Provider license
3. **SLTDA registration** — Tourism Act compliance for listing platform
4. **Privacy Policy & Terms** — drafted by a Sri Lankan lawyer
5. **WhatsApp Business API** — Dialog or Hutch BSP account for booking notifications

### Important (launch month)
6. **iCal Edge Function** — `supabase/functions/ical-export/` to serve provider calendar feeds
7. **Damage deposit Edge Function** — auto-release cron job
8. **Pearl Points award cron** — runs `auto_release_deposits()` daily
9. **Email templates** — booking confirmation, payment receipt, review request (Supabase SMTP)
10. **Admin first user** — manually set first admin via Supabase SQL editor

### Nice to have (month 2)
11. **Stripe Connect** — provider payout automation
12. **Google Analytics 4** — conversion tracking
13. **Hotjar** — user session recording
14. **Sentry** — error monitoring
