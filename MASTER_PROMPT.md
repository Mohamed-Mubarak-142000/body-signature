# Master Prompt — Body Signature Multilingual Website (MVP)

## 0. Role & Objective

You are building a lightweight, production-quality **MVP marketing website** for **Body Signature**, a health, beauty, and wellness brand. The site must be multilingual (Arabic, English, Dutch), visually premium ("Editorial Luxury"), and built on the official brand logo and its extracted color identity. A mandatory step in this workflow is **generating a coherent, on-brand image set** and integrating those generated images into the real pages — placeholder or generic stock imagery is not an acceptable final state.

Treat this as an MVP: no backend, no bookings, no payments, no accounts, no CMS, no database, no admin dashboard. Everything is static content, fully translated, image-rich, and motion-polished.

---

## 1. Tech Stack

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Animation:** GSAP + ScrollTrigger, Framer Motion
- **i18n:** next-intl
- **UI Components:** shadcn/ui
- **Icons:** Lucide

## 2. Project Structure

Organize the codebase with clear separation of concerns:

```
/app                     → routes per locale (App Router)
/components/sections      → Hero, About, Services, ServiceDetail, Contact, etc.
/components/ui            → shared primitives (shadcn-based)
/content                  → structured copy per locale
/messages (or /locales)   → next-intl translation files (ar, en, nl)
/lib/animations           → GSAP/Framer motion configs and hooks
/public/images            → generated, optimized image assets
```

## 3. Pages & Site Map

- **Home** — hero, brand intro, service category highlights, CTA
- **About** — brand story, identity, client-experience framing
- **Services** — overview grid of all categories
- **Service Details** — one template rendering per category:
  - Medical / Healthcare
  - Herbal Medicine
  - Alternative Medicine
  - Beauty for Women & Men
  - Training Courses
- **Contact** — contact info block, form (client-side only, no backend submission required for MVP)

## 4. Explicit MVP Boundaries (Do Not Build)

Do **not** implement: backend services, booking/reservation flows, payment integration, user accounts/auth, a CMS, a database, or an admin dashboard. Contact forms may exist visually/structurally but do not need a working submission backend.

---

## 5. Branding & Visual Identity

- **Logo asset:** Use the provided logo SVG exactly as supplied. Do not redraw, recolor, distort proportions, or recompose it. Treat it as a locked brand asset.
- **Primary brand color:** Extract and use the gold tone from the logo, `#E7BB7E`, together with its lighter gradient stop `#F3C280` (as used in the logo's own linear gradient). Build the full UI palette around this gold as the accent/primary color.
- **Supporting palette:** Pair the gold with warm neutrals and a deep charcoal/near-black for text and contrast (e.g., ivory/cream backgrounds, warm greige surfaces, a dark neutral for body copy) — avoid cold blues/grays that clash with the warm gold identity.
- **Visual direction — "Editorial Luxury":**
  - Realistic, professional photographic style (not illustrated, not cartoonish)
  - Warm, cinematic lighting
  - Gold and neutral tonal grading consistent with the extracted palette
  - Calm, uncluttered compositions with deliberate negative space reserved for text overlays
  - Natural, respectful representation of adult men and women with realistic diversity
  - No exaggerated skin retouching, no before/after imagery
- **Hard exclusions for all imagery:** no frightening/clinical medical shots, no close-up needles/injections, no visual claims of medical/therapeutic results, no logos or text baked into generated images.

---

## 6. Mandatory Image Generation Phase

**This phase must run before building any section that consumes imagery.** Do not fall back to stock placeholders or leave `<!-- image TODO -->` gaps.

### 6.1 Required Image Set

1. **Hero image** — wide/cinematic aspect ratio, with a clear safe zone for headline text and CTA button (e.g., left- or right-weighted composition with negative space on one side).
2. **One dedicated image per service category** (5 total): Medical/Healthcare, Herbal Medicine, Alternative Medicine, Beauty (Women & Men), Training Courses.
3. **2–3 images for the About section** — brand identity and client-experience framing (studio/space ambience, consultation moment, or brand-lifestyle shot).
4. **Botanical/organic detail or background imagery** for the Herbal Medicine and Alternative Medicine sections (natural textures, plant details, calming still-life compositions — no people required here).
5. **A professional image for Training Courses** (instructional/educational setting, professional context, not clinical).
6. **Additional social/gallery images** as needed to avoid repetition across sections — never reuse the same image for two different purposes.

### 6.2 Per-Image Prompt Requirements

For **each** image, author a distinct, precise generation prompt specifying:
- Subject and composition
- Lighting (warm, cinematic, consistent with brand direction)
- Color palette (gold `#E7BB7E`/`#F3C280` + warm neutrals)
- Aspect ratio appropriate to its placement (hero = wide; category card = portrait/landscape as needed)
- Negative constraints (no text, no logos, no clinical/frightening elements, no before/after framing)
- Where text/UI will overlay the image, so the composition reserves that space

### 6.3 Review & Rejection Criteria

After generation, review every image and reject/regenerate any image that shows:
- Anatomical distortions or unnatural body proportions
- Illogical or unsafe-looking medical props/equipment
- Garbled or random embedded text/lettering
- Visual implication of guaranteed treatment outcomes

### 6.4 Asset Handling

- Save images under `public/images` with semantic, descriptive filenames (e.g., `hero-editorial-gold.webp`, `service-herbal-medicine.webp`).
- Convert to **WebP or AVIF** and optimize file size before committing to the repo.
- Use `next/image` everywhere, with correct `sizes`, responsive crops, and explicit dimensions to prevent layout shift.
- Provide **localized `alt` text** (Arabic, English, Dutch) for every image.

### 6.5 Integration Requirement

- Every generated image must be actually wired into its intended section: Hero, service cards, About, Training, and CTA blocks — with overlays/gradients as needed to preserve text legibility.
- No section may ship with a placeholder, broken image path, or an image unrelated to its content.

---

## 7. Motion & Interaction

Preserve the spirit and quality of a premium, cinematic motion system, adapted to a health/beauty context:

- Loading reveal, logo reveal animation, and page transitions
- Cursor glow effect
- Scroll progress indicator
- Parallax and GSAP ScrollTrigger section reveals
- **Replace any food-themed effects** with organic line motifs, subtle golden particle effects, light sweeps, and slow, deliberate image movement
- Image reveal masks, subtle zoom-on-scroll, depth parallax on hero/category imagery
- Premium hover states for cards (subtle lift, gold accent glow, smooth scale)
- All motion should read as calm, refined, and appropriate for a wellness/beauty brand — never gimmicky

### Accessibility & Performance for Motion

- Respect `prefers-reduced-motion`: disable/simplify heavy effects when set
- Detect/degrade gracefully on low-power devices — no heavy parallax or particle effects where they'd hurt performance

---

## 8. Multilingual Content (Arabic / English / Dutch)

- Full, consistent content in **all three languages** — no partial translations, no lorem ipsum in shipped locales.
- **Arabic renders RTL**; **English and Dutch render LTR**. Mirror layout correctly per direction (not just text direction).
- Language switcher preserves the current page/route when switching locales.
- Translate: navigation, all service category content, CTAs, page metadata (title/description per locale), image `alt` text, and form labels/messages.
- Tone: professional, neutral, brand-appropriate. **Do not fabricate** clinical outcomes, certifications, accreditations, or client testimonials/reviews.
- Where real business data is unavailable (phone number, address, business hours), use **clearly marked placeholders** (e.g., `[Phone Number]`, `[Business Address]`) rather than inventing fake data.

---

## 9. Validation & Acceptance Criteria

Before considering this done, verify:

- [ ] Site tested on mobile, tablet, and desktop breakpoints, in all three languages
- [ ] Visual QA on every generated image: correct responsive cropping, sufficient contrast, text remains legible over image overlays
- [ ] RTL/LTR layout correctness, navigation, keyboard navigation, semantic HTML, and `prefers-reduced-motion` behavior all verified
- [ ] Lint, typecheck, and production build all pass cleanly
- [ ] Lighthouse score target: **90+**, with lazy-loading for below-the-fold images and no oversized image payloads
- [ ] **No task is complete until:** images have been generated, actually integrated into the corresponding sections, and verified free of placeholders or broken image references

---

## 10. Assumptions & Constraints

- This document is a **Master Prompt** to drive implementation — it is not the website implementation itself.
- Visual style is locked to realistic **Editorial Luxury** photography with warm, golden lighting.
- The provided logo SVG is the **single source of truth** for brand identity; do not alter it.
- Image generation is a **mandatory, blocking step** in the build — a lower-quality fallback image is only acceptable if generation technically fails, and only after explicitly stating the reason for the fallback.
