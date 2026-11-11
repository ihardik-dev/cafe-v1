# Cafe Frontend: Agent Context

> Save this file as `frontend/AGENT_CONTEXT.md`. Every phase prompt in `PHASE_PROMPTS.md` starts by telling the agent to read it, so it is the single source of truth for what to build and how.

---

## 0. Fill these in before starting

All of these live in one file, `src/config/site.ts`. Components must import from it and never hardcode them.

| Item | Value |
|---|---|
| Brand name | `[YOUR CAFE NAME]` |
| Hero quote | Life is short. Enjoy your coffee. |
| Address | `[STREET, AREA, CITY, PIN]` |
| Opening hours (IST) | `[e.g. Mon–Sun, 8:00 AM – 11:00 PM]` |
| Phone / email | `[PHONE]` / `[EMAIL]` |
| Google Maps link | `[URL]` |
| Social links | `[INSTAGRAM, etc.]` |

If a value is still a placeholder, the UI should render it as-is and the agent should list it in its end-of-phase summary.

---

## 1. Mandatory skills

The agent **must** use both skill sets. Install them in the project before Phase 0 (the CLI is interactive, so run these yourself):

```bash
# Apple HIG design reviewer
npx skills add dickwu/apple-design-skill

# GSAP official skills (installs the repo; we need gsap-scrolltrigger, gsap-core, gsap-timeline, gsap-react)
npx skills add https://github.com/greensock/gsap-skills
```

### How to use them
**Apple design skill (`apple-design`)**
- Before writing any UI in a phase, load its `SKILL.md` and the relevant `references/hig/*.md` pages (for example `accessibility`, `layout`, `typography`, `color`, `dark-mode`, `materials`, `motion`, `buttons`, `toolbars`, `tab-bars`, `sheets`, `alerts`, `text-fields`, `onboarding`, `writing`, `lists-and-tables`, depending on the phase).
- The skill targets native and cross-platform apps, so **translate HIG rules to the web** (see section 8). Do not copy native-only patterns literally.
- At the end of each phase, run the skill in review mode on that phase's screens (accessibility audit first, then dark mode and navigation where relevant), and fix every blocking finding before finishing.
- Use its improvement mode in Phase 0 to produce the design tokens, so the site has a point of view and does not look like generic generated UI.

**GSAP skills (`gsap-scrolltrigger`, `gsap-core`, `gsap-timeline`, `gsap-react`)**
- Use them for every scroll animation: pinning, scrub, timelines, and cleanup.
- In React, use the `useGSAP` hook pattern from `gsap-react` so every ScrollTrigger is killed on unmount.
- Register plugins once, in a single `src/lib/gsap.ts` module.
- Wrap all motion in `gsap.matchMedia()` so `prefers-reduced-motion: reduce` gets a static, non-pinned layout.

If either skill is not available in the session, **stop and tell the user** instead of continuing without it.

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite + TypeScript (strict) |
| Styling | Tailwind CSS with design tokens as CSS variables |
| Routing | React Router v6 |
| Server state | TanStack Query |
| Client state | Zustand (`persist` for auth and cart) |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Animation | GSAP + ScrollTrigger (loaded only on pages that need it) |
| Dates | `date-fns` + `date-fns-tz` (Asia/Kolkata) |
| Tests | Vitest + React Testing Library + MSW, Playwright smoke tests |

---

## 3. Site map and navigation

| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/menu` | All products, grouped by category | Public |
| `/menu/:id` | Product detail | Public |
| `/cart` | Cart | Public |
| `/login`, `/register` | Auth | Guests only |
| `/checkout` | Review and place demo order | Customer |
| `/orders`, `/orders/:id` | Order history and detail | Customer |
| `/reservations`, `/reservations/new` | My reservations, book a table | Customer |
| `/profile` | Profile | Customer |
| `/admin`, `/admin/categories`, `/admin/menu-items` | Admin panel | Admin only |
| `*` | Not found | Public |

### Navbar contents
- **Left:** logo mark + brand name (links to `/`).
- **Center links:** Home, Menu, About (`/#about`, scrolls to the vibe story), Reservations, Contact (`/#visit`, scrolls to the address block in the footer).
- **Right:** cart icon with item-count badge, **Order Now** primary button (goes to `/menu`), and either **Log in** or an account menu (My Orders, My Reservations, Profile, Log out). An **Admin** item appears in the account menu only for admins.
- **Mobile:** brand, cart icon, and a menu button that opens a full-height sheet with the same links.
- **Behavior:** transparent over the hero, switching to a translucent material with a hairline border after scrolling. The material is allowed on the navigation layer only, never on content. Include a skip-to-content link, visible focus rings, and the active-link state.
- **Footer:** brand, address, hours, phone, quick links, social links, and a small "demo ordering, no real payment" note.

---

## 4. Home page specification

The Home page is a vertical story with four parts.

### 4.1 Hero (first screen)
- Full-viewport. The background is the **first frame of the scroll video** (the roasted-beans close-up), shown as the poster until the video is ready.
- Content, in this order: **brand name** (large display type), the quote **"Life is short. Enjoy your coffee."**, an **Order Now** button (to `/menu`), and the **address** directly below the button.
- A subtle "Scroll" cue at the bottom.
- A gradient scrim guarantees text contrast of at least 4.5:1 over the video.

### 4.2 Scroll story (pinned section)
- When the user starts scrolling, the section **pins** and the hero text fades and lifts away.
- Scrolling then **scrubs the video**: `video.currentTime = progress × duration`, forward and backward.
- Information cards appear **alongside the video** as it plays, alternating left and right on desktop and sliding up at the bottom on mobile.
- Pin length is about `+=600%` on desktop and about `+=450%` on mobile.
- Do not use glass or blur on these cards. Use a solid surface with enough contrast, because they are content.

Suggested timeline, by scroll progress `p` through the pinned section:

| `p` range | Video moment (10s clip) | On screen |
|---|---|---|
| 0.00 – 0.10 | Beans close-up | Hero text exits |
| 0.10 – 0.24 | Beans, cup begins sliding in | Card 1 |
| 0.24 – 0.38 | Cup enters | Card 2 |
| 0.38 – 0.52 | Coffee pour | Card 3 |
| 0.52 – 0.66 | Latte art forms, steam rises | Card 4 |
| 0.66 – 0.80 | Camera pulls back | Card 5 |
| 0.80 – 0.95 | Croissant and window light revealed | Card 6 |
| 0.95 – 1.00 | Final frame holds, then unpin | none |

### 4.3 The six "vibe" cards (content)
Short title plus one or two lines of copy each. The agent may polish the wording but should keep the tone warm and plain.

| # | Title | Seed idea |
|---|---|---|
| 1 | Classic | Timeless interiors, warm wood, and familiar flavours |
| 2 | Hygienic | Spotless counters, sanitised surfaces, and clean cups, always |
| 3 | Cozy and Warm | Soft lighting and comfortable seats that make you stay longer |
| 4 | Freshly Roasted | Beans roasted for a fragrant, full-bodied cup |
| 5 | Handcrafted | Every cup poured and finished by hand, latte art included |
| 6 | Made for Moments | A calm place for catch-ups, quiet work, and slow mornings |

The cafe owner must confirm that cards 2 and 4 are true statements before launch. Keep the copy in `src/data/vibes.ts` so it is easy to edit.

### 4.4 Featured products showcase (pinned section)
- Shows **only 5 featured products** (demo data; see below).
- Layout on desktop: **left** = product number (`01 / 05`), title, description, "View in menu" link. **Right** = the product image.
- On scroll, the section pins and each next product image **slides up over the previous one**, one by one, while the previous image scales down slightly and dims. The left text cross-fades and slides in step with it. Snap to each product.
- On mobile: image on top, text below, same sequence.
- After the last product, unpin and show a **"View all products"** button linking to `/menu`.
- **Demo data:** the user will place images in `public/products/`. The agent must look at each image, then write a fitting **title and short description** into `src/data/featuredProducts.ts`, marked with a `// DEMO DATA: replace later` comment. Do not invent prices for these.

### 4.5 Visit block
A closing section with address, hours, a "Get directions" link, and a **Reserve a table** button. This is the `/#visit` anchor.

---

## 5. Menu page specification (`/menu`)
- Page title "Menu", then a **sticky category switcher** (segmented-control style chips) that scrolls to each category section.
- One section per **category**, with the category name as the section title, followed by a responsive grid of item cards: image, name, description, price in INR, availability, and an add-to-cart control (quantity 1 to 10).
- Data comes from `GET /categories` and `GET /menu`; group items by category in the client.
- Images: use an `imageUrl` field if the backend provides one. Otherwise map the item name to a file in `public/products/` by slug, and fall back to a neutral placeholder.
- `/menu/:id` shows one item in detail with a larger image and add-to-cart.
- Loading skeletons, empty state, and error state with retry.

---

## 6. Admin page specification (`/admin`)
- Visible and reachable only to admins (guard in the router, and enforced by the server).
- **Layout:** sidebar on desktop, compact top navigation on mobile.
- **Dashboard:** counts of categories, menu items, and unavailable items, plus quick links.
- **Categories:** list, create, rename, delete. If the server refuses to delete a non-empty category, show its message.
- **Menu items:** searchable and filterable table (including unavailable items), create and edit in a sheet form, an availability toggle, and delete with a confirmation alert whose destructive button names the action ("Delete Item").
- The backend currently has **no admin endpoints for orders or reservations**, so do not build those screens. If you think they are needed, list it as a backend gap in the summary.

---

## 7. Backend contract (summary of the root README)

- **Base URL:** `VITE_API_BASE_URL`, default `http://localhost:4000/api/v1`. Swagger: `http://localhost:4000/docs`. The Swagger spec and the backend source (`cafe-backend/src/modules/*`) are the truth for exact field names. **Read them before writing types.**
- **Success envelope:** `{ success: true, message, data }`, where arrays are wrapped, for example `data.items` or `data.categories`.
- **Error envelope:** `{ success: false, message, errors: [{ field, message }] }`.
- **Auth:** `Authorization: Bearer <jwt>`, valid for 7 days. Logout is client-side (delete the token), and `POST /auth/logout` just acknowledges it.

| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | Public |
| POST | `/auth/logout` | Authenticated |
| GET | `/users/me` | Authenticated |
| GET | `/categories`, `/menu` (`?categoryId=`), `/menu/:id` | Public |
| POST / GET | `/orders`, `/orders/:id` | Customer |
| POST | `/orders/:id/cancel` | Customer, within 60s of creation |
| POST / GET | `/reservations` (`?filter=upcoming\|previous\|cancelled`) | Customer |
| POST | `/reservations/:id/cancel` | Customer, at least 24h before the booking |
| POST / PATCH / DELETE | `/admin/categories`, `/admin/categories/:id` | Admin |
| GET / POST / PATCH / DELETE | `/admin/menu-items`, `/admin/menu-items/:id` | Admin |
| GET | `/health` | Public |

**Rules the UI must respect**
- There is **no server-side cart**. The cart lives in the frontend only.
- Checkout sends **only** `{ items: [{ menuItemId, quantity }] }`. Display the server's totals afterwards, never the client's estimate.
- Quantity is 1 to 10 per item. Orders are **demo orders**, with no real payment.
- Reservation date-times are sent as `YYYY-MM-DDTHH:mm` and interpreted as **Asia/Kolkata**, whatever the browser's timezone. Guests are 1 to 6, and the time must be in the future.
- Currency is **INR**.

---

## 8. Design rules (Apple HIG translated to the web)

- **Accessibility is blocking.** Text contrast at least 4.5:1 (3:1 for large text), interactive targets at least 44 by 44 CSS px, visible focus indicators, full keyboard access, and correct labels and roles.
- **Scalable type.** Use `rem` units, support browser zoom to 200% with no loss of content, and avoid fixed heights on text containers.
- **System-first typography** with one optional display face for the brand. Define type roles (display, title, headline, body, caption) as tokens.
- **Light and dark mode** both supported from `prefers-color-scheme`, with colors as CSS variables.
- **Respect user settings:** `prefers-reduced-motion` (no pinning or scrubbing; static layout), `prefers-reduced-transparency` and `prefers-contrast` (solid surfaces).
- **Safe areas:** use `env(safe-area-inset-*)` and `viewport-fit=cover`.
- **Materials (blur) only on the navigation layer**, such as the navbar and sheets. Never on content cards or text blocks.
- **Familiar patterns:** sheets for forms and detail on mobile, alerts only for confirmations of destructive actions, segmented controls for filters, and system-like toggles.
- **Writing:** buttons say what happens ("Place demo order", "Cancel order"), errors explain how to fix the problem, and empty states point to the next action.
- **Point of view:** warm espresso, cream, and caramel palette, with one signature visual element and a consistent motion language. Avoid the generic look of purple gradients, glass cards everywhere, and stock hero layouts.
- **Motion:** purposeful and short, with an easing curve defined once as a token. Nothing essential may depend on motion.

---

## 9. Engineering rules

- TypeScript strict, no `any` without a comment. ESLint and Prettier clean.
- Folder structure follows the frontend README: `api/`, `features/`, `components/`, `layouts/`, `routes/`, `lib/`, `data/`, `config/`, `hooks/`, `pages/`, `types/`.
- The API layer is plain TypeScript with no React in it. Components never call Axios directly.
- Never commit `.env`. Provide `.env.example`.
- Heavy libraries (GSAP) are loaded only where used, via route-level code splitting.
- Large media goes in `public/` with explicit `width` and `height` to avoid layout shift. Lazy-load below-the-fold images.
- Comment unusual choices, especially scroll math, IST date handling, and any assumption about the backend.

---

## 10. Phase workflow and definition of done

For every phase, the agent must:
1. Read this file and the root `README.md`.
2. Load the Apple design skill and (for animation phases) the GSAP skills, as in section 1.
3. Build only what the phase asks for, against the **real backend** whenever the phase touches data.
4. Run `npm run lint`, `npm run build`, and `npm run test`, and fix failures.
5. Run the Apple design skill review on the phase's screens and fix all blocking findings.
6. Test at 360 px, 768 px, and 1280 px widths, in light and dark mode, and with reduced motion on.
7. Finish with a short summary: what was built, what was verified, remaining placeholders, assumptions made, and any backend gaps. Then **stop** and wait for the next phase.