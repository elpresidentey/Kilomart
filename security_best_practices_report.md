# Farmers Market Security Audit Report

## Executive Summary

The app has solid baseline protections in key areas (safe redirect handling in auth screens, Supabase RLS policies for order visibility/updates, and no dangerous DOM XSS sinks in active React pages).  
However, there are critical trust-boundary issues in checkout/order creation logic that allow client-controlled pricing and quantity data to be written directly as orders and payments.

## Critical Findings

### SEC-001 - Client-trusted order pricing and totals
- **Severity:** Critical
- **Location:** `src/pages/Checkout.tsx`
- **Evidence:** Order insert uses client-side values for `price_per_kg`, `subtotal`, `delivery_fee`, and `total_amount`.
- **Impact:** A malicious client can tamper with price/total before submission, creating underpriced/fraudulent orders.
- **Fix:** Move order creation to a secure server-side path (Supabase RPC/Edge Function) that:
  - loads listing price by `listing_id`,
  - calculates totals server-side,
  - validates buyer ownership and listing status/stock.

### SEC-002 - Client can submit arbitrary seller/listing pairing
- **Severity:** Critical
- **Location:** `src/pages/Checkout.tsx`
- **Evidence:** Checkout writes `seller_id` and `listing_id` from cart item payload.
- **Impact:** A tampered request can mismatch seller/listing references or route payment records incorrectly.
- **Fix:** Derive `seller_id` server-side from `listing_id` in DB, never from client payload.

## High Findings

### SEC-003 - No server-authoritative stock enforcement at purchase time
- **Severity:** High
- **Location:** `src/pages/Checkout.tsx`, general order flow
- **Evidence:** No stock decrement/validation transaction is performed when placing orders.
- **Impact:** Race conditions and overselling can occur under concurrent purchases.
- **Fix:** Use single transactional server-side operation to:
  - lock listing row / validate available quantity,
  - decrement stock,
  - create order and payment atomically.

## Medium Findings

### SEC-004 - No visible CSP/header policy in app config
- **Severity:** Medium
- **Location:** `index.html` (no CSP meta), no visible server/edge header config in repo
- **Impact:** Reduced defense-in-depth against XSS/clickjacking/mixed content risks.
- **Fix:** Add CSP and core security headers at hosting layer (preferred) or constrained meta CSP in HTML.

## Low Findings

### SEC-005 - PostCSS warning due to `@import` order
- **Severity:** Low
- **Location:** `src/index.css`
- **Evidence:** Build warns `@import must precede all other statements`.
- **Impact:** Styling build fragility and inconsistent CSS processing behavior.
- **Fix:** Move Google font `@import` above Tailwind directives, or load font in `index.html`.

### SEC-006 - Unused Vite template entry files still present
- **Severity:** Low
- **Location:** `src/main.ts`, `src/counter.ts`
- **Impact:** Confusing dead code surface; may mislead audits and maintenance.
- **Fix:** Remove unused template files if not part of product.

## Positive Security Notes

- Safe redirect normalization exists in `src/pages/Login.tsx` and `src/pages/Signup.tsx` (`safeRedirectPath`).
- `target="_blank"` usage in active app code includes `rel="noopener noreferrer"` (good tabnabbing defense).
- Supabase `orders` RLS policies in `supabase/schema.sql` appropriately restrict seller visibility and status updates by `seller_id`.

