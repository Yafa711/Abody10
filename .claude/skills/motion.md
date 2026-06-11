# Motion Animation Library (Framer Motion)

## Overview
Motion (package: `motion`, formerly `framer-motion`) is the standard React animation library.
Install: `npm install motion` or `npm install framer-motion`

## Performance Rules (CRITICAL)
- ONLY animate transform and opacity — never width/height/padding/margin
- Use LazyMotion + domAnimation for small bundle (4.6KB vs 34KB)
- Wrap app root with MotionConfig reducedMotion="user" for accessibility
- Remove ALL Tailwind transition-* classes — conflicts with Motion

## Screen Transitions
initial={{ opacity: 0, y: 24 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -24 }}
transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}

## Stagger Lists
staggerChildren: 0.07, delayChildren: 0.1
item: hidden={{ opacity: 0, scale: 0.92 }} show={{ opacity: 1, scale: 1 }}

## Cards
whileHover={{ y: -8, scale: 1.02 }}
whileTap={{ scale: 0.96 }}
transition={{ type: "spring", stiffness: 400, damping: 30 }}

## Buttons
whileHover={{ scale: 1.04 }}
whileTap={{ scale: 0.93, opacity: 0.85 }}

## Bottom Sheet
initial={{ y: "100%" }} animate={{ y: 0 }}
transition={{ type: "spring", stiffness: 350, damping: 40 }}

## Shared Element
layoutId="activeTab" — for tab indicators and dot sliders

## Drag Slider
drag="x", dragConstraints, dragElastic: 0.1, dragMomentum: true

## Shake (invalid input)
animate={{ x: [0, -10, 10, -10, 10, 0] }}

## Path Drawing (timeline)
initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
delay: index * 0.2

## Spring Standard
{ type: "spring", stiffness: 300, damping: 25 }
