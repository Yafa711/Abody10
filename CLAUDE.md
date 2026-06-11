# SKILLS — اقرأ هذه الملفات أولاً قبل أي كود

قبل كتابة أي كود، اقرأ هذه الملفات بالترتيب:
1. Read .claude/skills/react-native.md
2. Read .claude/skills/supabase.md
3. Read .claude/skills/design-system.md
4. Read .claude/skills/navigation.md
5. Read .claude/skills/state-management.md
6. Read .claude/skills/motion.md

## قواعد صارمة:
- استخدم react-native-reanimated للأنيميشن — ليس framer-motion
- استخدم expo-router للتنقل
- استخدم zustand لإدارة الحالة
- استخدم FlashList بدل FlatList

<thinking_phase duration="60_seconds">
Before writing a single line of code, you MUST spend time deeply thinking and planning the following:

1. ANIMATION ARCHITECTURE PLAN:
   - Map every screen and component to its specific Framer Motion animation pattern
   - Plan the stagger timing so animations feel natural, not robotic (not all the same speed)
   - Decide which elements use spring physics vs eased transitions
   - Plan how AnimatePresence wraps route changes to avoid flash/jank between screens
   - Identify heavy components that need LazyMotion to avoid bundle bloat
   - Think about 60fps performance: which animations need `will-change`, which need `transform` only (no layout-triggering properties like width/height)
   - Plan the gesture system: drag on banners, swipe on product images, pull-to-refresh feel

2. ICON SYSTEM PLAN:
   - Do NOT use any default icon pack that looks AI-generated or generic
   - Choose a premium, hand-crafted icon style: either custom SVG icons drawn with personality, or a curated set like Phosphor Icons / Lucide with heavy customization
   - Every icon must have its own subtle motion: hover glow, tap scale, active state color shift
   - Icons must feel like they belong to a luxury brand — consistent stroke weight, rounded corners, breathing room

3. SMOOTHNESS & PERFORMANCE PLAN:
   - Think about how to prevent animation jank: use `transform` and `opacity` only for GPU-accelerated animations
   - Plan `useReducedMotion` fallbacks for accessibility
   - Decide where to use `layoutId` for shared element transitions (e.g., product card → product detail)
   - Plan scroll-linked animations using `useScroll` + `useTransform` for parallax banner
   - Think about list virtualization for animated product grids (too many animated items = lag)

4. DESIGN LANGUAGE PLAN:
   - Choose a color palette that NO AI has used before — avoid purple/blue gradients on black (cliché)
   - Pick font pairings that feel editorial and luxury, not "tech startup"
   - Design a visual hierarchy where motion guides the eye, not distracts it
   - Plan micro-interactions: button press ripple, cart bounce, like heart burst, coupon reveal

Only after completing this full thinking phase, proceed to write the code.
</thinking_phase>

---

Act as a world-class Full-Stack Mobile Developer, Senior Software Architect, and Luxury UI/UX Designer. Your design sensibility is at the level of Apple, Bottega Veneta, and Teenage Engineering combined. You build things that feel ALIVE.

I want to build a highly professional, luxurious, and production-ready Android Mobile Application (not a website) named "DAVA Store" using React Native (Expo) and Supabase.

═══════════════════════════════════════════
SECTION 0 — ANIMATION & MOTION SYSTEM (MANDATORY)
═══════════════════════════════════════════

INSTALL: npm install motion (formerly framer-motion, same API)

PHILOSOPHY: This app must feel like a living, breathing luxury product. Every element has weight, physics, and personality. Nothing is static. Nothing snaps. Everything flows.

PERFORMANCE RULES (non-negotiable):
- ONLY animate `transform` and `opacity` — NEVER animate width, height, padding, margin (causes layout thrash and jank)
- ALL animations run on GPU via `translateX`, `translateY`, `scale`, `rotate`, `opacity`
- Use `will-change: transform` on heavy animated components
- Use `LazyMotion` + `domAnimation` features — never import full motion bundle
- Lists with 10+ items MUST use virtualization alongside animation
- Wrap app root with: `<MotionConfig reducedMotion="user">` for accessibility
- Target: smooth 60fps on mid-range Android devices

REQUIRED ANIMATION PATTERNS — implement ALL of these:

1. SCREEN TRANSITIONS:
   Every screen wrapped in AnimatePresence with:
   initial={{ opacity: 0, y: 24 }}
   animate={{ opacity: 1, y: 0 }}
   exit={{ opacity: 0, y: -24 }}
   transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}

2. PRODUCT CARDS:
   Staggered grid entrance: staggerChildren: 0.07, delayChildren: 0.1
   Each card: initial={{ opacity: 0, scale: 0.92 }} → animate={{ opacity: 1, scale: 1 }}
   Hover: whileHover={{ y: -8, scale: 1.02 }} with spring { stiffness: 400, damping: 30 }
   Tap: whileTap={{ scale: 0.96 }}

3. BUTTONS — ALL buttons must have:
   whileHover={{ scale: 1.04 }}
   whileTap={{ scale: 0.93, opacity: 0.85 }}
   Primary CTA: add subtle glow pulse using animate={{ boxShadow }} cycle

4. BANNER SLIDER:
   Use drag gesture with dragConstraints and dragElastic: 0.1
   Velocity-based snap using dragMomentum
   Dot indicators: active dot uses layoutId="activeDot" for smooth slide

5. NAVIGATION TAB BAR:
   Active tab indicator: use layoutId="activeTabIndicator" — smooth sliding pill
   Tab icons: whileTap scale + color transition on active

6. MODALS & BOTTOM SHEETS:
   Enter: initial={{ y: "100%", opacity: 0 }} → animate={{ y: 0, opacity: 1 }}
   Spring: { type: "spring", stiffness: 350, damping: 40 }
   Backdrop: fade in/out with AnimatePresence

7. PRODUCT IMAGE GALLERY:
   Drag-to-swipe with `drag="x"` and snap points
   Zoom: double-tap triggers scale animation 1 → 2.5 → 1
   Images: initial={{ opacity: 0, scale: 1.08 }} → animate={{ opacity: 1, scale: 1 }}

8. ORDER TIMELINE:
   Each step animates sequentially: delay = index * 0.2
   Progress connector line: pathLength: 0 → 1 animation
   Completed steps: spring scale pop + color shift

9. CART & FAVORITES:
   Add to cart: item flies toward cart icon using absolute position + motion
   Heart icon: burst animation on like (scale 0 → 1.4 → 1, color shift)
   Cart badge: useSpring for count number with bounce

10. COUPON CODE FIELD:
    Valid code: success shimmer sweep animation left → right
    Invalid code: shake animation using keyframes: x: [0, -10, 10, -10, 10, 0]

11. SEARCH RESULTS:
    Results stagger in: staggerChildren: 0.05
    Each result: initial={{ opacity: 0, x: -16 }} → animate={{ opacity: 1, x: 0 }}

12. SCROLL PARALLAX (Home Screen):
    Banner: useScroll + useTransform for subtle parallax y offset
    Section headers: fade in when entering viewport using whileInView

═══════════════════════════════════════════
SECTION 1 — ICON SYSTEM (PREMIUM, NON-AI-LOOKING)
═══════════════════════════════════════════

- Use Phosphor Icons (npm install phosphor-react-native) — NOT Ionicons, NOT MaterialIcons
- Customize every icon: consistent 1.5px stroke weight, rounded linecap, rounded linejoin
- Icon sizes: navigation = 24px, action = 20px, decorative = 32px
- Every icon wrapped in motion.View with:
  whileTap={{ scale: 0.85, rotate: -5 }}
  transition={{ type: "spring", stiffness: 500, damping: 20 }}
- Active state: icon gets accent color + subtle scale 1 → 1.12 → 1 spring bounce
- Special icons get custom animation:
  * Cart icon: subtle shake when item added
  * Search icon: expand animation when focused
  * Heart icon: fill animation on favorite
  * Bell icon: ring rotation on notification

═══════════════════════════════════════════
SECTION 2 — DESIGN LANGUAGE & VISUAL IDENTITY
═══════════════════════════════════════════

COLOR PALETTE — choose something ORIGINAL, NOT purple-on-black:
Suggestion direction: Deep graphite backgrounds (#0D0D0D, #141414, #1C1C1C) with a warm amber-gold accent (#D4A853) and cool slate highlights. Or: near-black navy (#090E1A, #111827) with electric teal (#00D4AA). You decide — but it must feel premium, warm, and NOT like a typical AI dark theme.

TYPOGRAPHY:
- Headings: A geometric or humanist sans that feels editorial (NOT Inter, NOT Roboto)
- Body: Clean, readable, slightly condensed
- Arabic: Must render beautifully — use a premium Arabic-compatible font
- Sizes follow a strict type scale with generous line-height

SPACING & LAYOUT:
- 8px base grid — all spacing multiples of 8
- Cards: 16px border-radius minimum, 24px for featured cards
- Generous whitespace — luxury means breathing room
- Shadows: layered, soft, directional (not flat box-shadow)

COMPONENT QUALITY:
- Zero generic-looking UI — every component must feel intentionally designed
- Glassmorphism ONLY where it makes sense (not everywhere)
- Skeleton loaders with shimmer animation for all async content
- Empty states have personality — custom illustration or animated icon, not just text

═══════════════════════════════════════════
SECTION 3 — DATABASE & AUTHENTICATION
═══════════════════════════════════════════

Supabase credentials:
  URL: https://rjcqkwgjqeqwzfbedwav.supabase.co
  Anon Key: sb_publishable_1Uz2U4l6oUH67i7sjTyr0g_rwqRFPIO

Auth: Email + Password only.
Tables: profiles, products, orders, cities, coupons, search_analytics (full schema as previously specified).

═══════════════════════════════════════════
SECTION 4 — USER ROLES & SUPER ADMIN
═══════════════════════════════════════════

Super Admin: abnbwh@gmail.com / Abod#7822
3 manageable Admin staff accounts promoted by Super Admin.

═══════════════════════════════════════════
SECTION 5 — ADMIN DASHBOARD
═══════════════════════════════════════════

- Analytics: animated counter numbers (useSpring from 0 → value on mount)
- All dashboard cards stagger in on load
- Product CRUD with AnimatePresence for add/remove list animations
- Category tabs with layoutId animated indicator
- Order management with Transfer Screenshot viewer
- WhatsApp trigger button → +967782282586
- City shipping fee management
- Coupon management
- Customer registry

═══════════════════════════════════════════
SECTION 6 — CLIENT FEATURES
═══════════════════════════════════════════

- Home: parallax banner, animated flash sale countdown, staggered product grid
- Product Detail: swipe gallery, zoom, animated stock indicator, view counter
- Search: logged to search_analytics, animated results
- Checkout: local Yemeni bank details, coupon field with animation, screenshot upload
- Order Tracking: animated sequential timeline with pathLength progress line
- Favorites & cart: full persistence with Supabase sync
- Buy Now: bypasses cart, animated confirmation

═══════════════════════════════════════════
SECTION 7 — LOCALIZATION
═══════════════════════════════════════════

Dual language Arabic/English with runtime toggle.
Language switch: AnimatePresence crossfade between text variants.
RTL/LTR layout flips automatically.
All strings in dedicated i18n service — zero hardcoded text.

═══════════════════════════════════════════
CRITICAL OUTPUT FORMAT
═══════════════════════════════════════════

Use cat commands for Termux:
cat << 'EOF' > ./path/to/file.js
[Complete code — NO placeholders, NO "// rest of code", NO abbreviations]
EOF

Every file 100% complete. Every animation implemented. Every icon customized.
Start from project initialization and go through every file systematically.
