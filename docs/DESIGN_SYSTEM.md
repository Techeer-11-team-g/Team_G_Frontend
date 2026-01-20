# DRESSENSE AI Agent Design System
## Award-Winning AI-First Fashion Experience

---

## 1. Core Philosophy

### The Agent is the Interface
- No traditional navigation
- Conversation drives everything
- UI appears contextually
- Every element serves the agent

### Design Principles
```
CONVERSATIONAL    →  Talk, don't tap
ANTICIPATORY      →  Agent predicts needs
FLUID             →  No hard transitions
TACTILE           →  Every touch has feedback
MINIMAL           →  Only show what matters now
```

---

## 2. UX Flow Architecture

### 2.1 The Single Canvas Concept

```
┌─────────────────────────────────────────┐
│                                         │
│              AGENT ZONE                 │
│         (Always accessible)             │
│                                         │
│    ┌─────────────────────────────┐     │
│    │                             │     │
│    │        AGENT ORB            │     │
│    │    (Central entity)         │     │
│    │                             │     │
│    └─────────────────────────────┘     │
│                                         │
│         CONTEXTUAL CONTENT              │
│    (Appears based on conversation)      │
│                                         │
│    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│    │     │ │     │ │     │ │     │    │
│    │ Card│ │ Card│ │ Card│ │ Card│    │
│    │     │ │     │ │     │ │     │    │
│    └─────┘ └─────┘ └─────┘ └─────┘    │
│                                         │
│           INPUT ZONE                    │
│    (Voice / Text / Image)               │
│                                         │
└─────────────────────────────────────────┘
```

### 2.2 State-Based Flow

```
USER JOURNEY:

[IDLE]
    │
    ├── Upload Image ──────────► [ANALYZING]
    │                                 │
    │                                 ▼
    ├── Text Input ────────────► [THINKING]
    │                                 │
    │                                 ▼
    └── Voice Input ───────────► [LISTENING]
                                      │
                                      ▼
                               [PRESENTING]
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ▼                         ▼                         ▼
      [VIRTUAL TRY-ON]         [REFINEMENT]              [PURCHASE]
            │                         │                         │
            └─────────────────────────┴─────────────────────────┘
                                      │
                                      ▼
                                  [IDLE]
```

### 2.3 Screen States (Not Pages)

| State | Agent Behavior | UI Elements |
|-------|----------------|-------------|
| `idle` | Gentle breathing, inviting | Input bar, suggestions |
| `listening` | Pulsing rings, attentive | Voice visualizer |
| `thinking` | Rotating particles | Loading shimmer |
| `searching` | Expanding ripples | Progress indicator |
| `presenting` | Confident glow | Product cards |
| `fitting` | Focused beam | Full-screen try-on |
| `purchasing` | Warm confirmation | Checkout flow |

---

## 3. Signature Interactions (10+)

### 3.1 The Breathing Orb
```typescript
// Agent's idle state - organic breathing animation
const breathingAnimation = {
  scale: [1, 1.02, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};
```
**Feel**: Living, waiting, conscious

### 3.2 Magnetic Pull Input
```typescript
// Input field pulls toward finger on approach
const magneticInput = {
  onPointerMove: (e) => {
    const rect = inputRef.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.1;
    const deltaY = (e.clientY - centerY) * 0.1;
    setOffset({ x: deltaX, y: deltaY });
  }
};
```
**Feel**: Responsive, eager to help

### 3.3 Image Absorption
```typescript
// When user uploads, image gets "absorbed" into orb
const absorptionSequence = async () => {
  await animate(image, {
    scale: [1, 0.8, 0.1],
    x: orbCenter.x,
    y: orbCenter.y,
    borderRadius: "50%"
  }, { duration: 0.8, ease: [0.32, 0, 0.67, 0] });

  await animate(orb, {
    scale: [1, 1.3, 1],
    filter: ["hue-rotate(0deg)", "hue-rotate(180deg)", "hue-rotate(0deg)"]
  }, { duration: 0.6 });
};
```
**Feel**: Magic, transformation, processing

### 3.4 Particle Explosion (Results)
```typescript
// Products emerge as particles then form into cards
const particleReveal = {
  initial: {
    scale: 0,
    x: orbPosition.x,
    y: orbPosition.y,
    rotate: Math.random() * 360
  },
  animate: {
    scale: 1,
    x: finalPosition.x,
    y: finalPosition.y,
    rotate: 0
  },
  transition: {
    type: "spring",
    damping: 15,
    stiffness: 100,
    delay: index * 0.08
  }
};
```
**Feel**: Generative, AI creating options

### 3.5 Card Hover Tilt (3D)
```typescript
// Cards tilt toward touch point
const cardTilt = (e: PointerEvent) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = ((y - centerY) / centerY) * -10;
  const rotateY = ((x - centerX) / centerX) * 10;

  return { rotateX, rotateY, scale: 1.02 };
};
```
**Feel**: Tactile, premium, interactive

### 3.6 Swipe-to-Dismiss with Momentum
```typescript
// Cards can be swiped away with physics
const swipeGesture = {
  drag: "x",
  dragConstraints: { left: 0, right: 0 },
  onDragEnd: (_, info) => {
    if (Math.abs(info.velocity.x) > 500 || Math.abs(info.offset.x) > 100) {
      animate(card, {
        x: info.velocity.x > 0 ? window.innerWidth : -window.innerWidth,
        opacity: 0,
        rotate: info.velocity.x > 0 ? 20 : -20
      });
      onDismiss();
    }
  }
};
```
**Feel**: Natural, Tinder-like, satisfying

### 3.7 Pull-to-Refresh Agent
```typescript
// Pulling down wakes the agent with stretch effect
const pullToRefresh = {
  onPan: (_, info) => {
    if (info.offset.y > 0 && scrollTop === 0) {
      const progress = Math.min(info.offset.y / 100, 1);
      setAgentStretch(1 + progress * 0.3);
      setAgentMessage(progress > 0.8 ? "Let go to start fresh" : "Pull down...");
    }
  },
  onPanEnd: (_, info) => {
    if (info.offset.y > 100) {
      triggerRefresh();
    }
  }
};
```
**Feel**: Playful, organic, responsive

### 3.8 Voice Ripples
```typescript
// Voice input creates audio-reactive ripples
const voiceRipple = {
  animate: {
    scale: [1, 1.5 + audioLevel * 2, 1],
    opacity: [0.6, 0.2, 0],
  },
  transition: {
    duration: 0.8,
    repeat: Infinity,
    ease: "easeOut"
  }
};
```
**Feel**: Audio-visual synesthesia, feedback

### 3.9 Morphing Try-On Transition
```typescript
// Product card morphs into full-screen try-on view
const morphTransition = async (cardRef, fullscreenRef) => {
  const cardRect = cardRef.getBoundingClientRect();

  // Clone and animate
  await animate(clone, {
    x: [cardRect.x, 0],
    y: [cardRect.y, 0],
    width: [cardRect.width, window.innerWidth],
    height: [cardRect.height, window.innerHeight],
    borderRadius: ["16px", "0px"]
  }, {
    duration: 0.5,
    ease: [0.32, 0, 0.67, 0]
  });
};
```
**Feel**: Seamless, connected, fluid

### 3.10 Haptic Feedback Patterns
```typescript
// Different haptic patterns for different actions
const haptics = {
  tap: () => navigator.vibrate?.(10),
  success: () => navigator.vibrate?.([10, 50, 10]),
  error: () => navigator.vibrate?.([50, 30, 50, 30, 50]),
  select: () => navigator.vibrate?.(5),
  purchase: () => navigator.vibrate?.([10, 30, 10, 30, 100])
};
```
**Feel**: Physical confirmation, premium device

### 3.11 Liquid Background
```typescript
// Background subtly reacts to agent state
const liquidBackground = {
  idle: "radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.1) 0%, transparent 50%)",
  thinking: "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.15) 0%, transparent 60%)",
  success: "radial-gradient(ellipse at 50% 30%, rgba(34,197,94,0.1) 0%, transparent 50%)",
  error: "radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.1) 0%, transparent 50%)"
};
```
**Feel**: Ambient, mood-responsive, immersive

### 3.12 Typewriter Agent Messages
```typescript
// Agent messages type out character by character
const typewriterEffect = async (message: string) => {
  for (let i = 0; i <= message.length; i++) {
    setDisplayedText(message.slice(0, i));
    await delay(30 + Math.random() * 20); // Variable speed
  }
};
```
**Feel**: Conversational, human-like, anticipation

### 3.13 Elastic Scroll Boundaries
```typescript
// Overscroll has rubber-band effect
const elasticScroll = {
  overscroll: "contain",
  onOverscroll: (delta) => {
    const elasticity = 0.3;
    setScrollOffset(delta * elasticity);
  },
  onOverscrollEnd: () => {
    animate(scrollOffset, 0, { type: "spring", damping: 20 });
  }
};
```
**Feel**: iOS-like, polished, premium

---

## 4. Motion System

### 4.1 Timing Functions

```typescript
export const easings = {
  // Primary - smooth and premium
  smooth: [0.4, 0, 0.2, 1],

  // Entrance - starts slow, ends fast
  enter: [0, 0, 0.2, 1],

  // Exit - starts fast, ends slow
  exit: [0.4, 0, 1, 1],

  // Bounce - playful overshoot
  bounce: [0.34, 1.56, 0.64, 1],

  // Elastic - spring-like
  elastic: {
    type: "spring",
    damping: 15,
    stiffness: 150
  },

  // Snappy - quick and responsive
  snappy: [0.16, 1, 0.3, 1]
};
```

### 4.2 Duration Scale

```typescript
export const durations = {
  instant: 0.1,    // Micro-interactions
  fast: 0.2,       // Button states
  normal: 0.3,     // Standard transitions
  slow: 0.5,       // Page transitions
  dramatic: 0.8,   // Hero animations
  stagger: 0.05    // List item delay
};
```

### 4.3 Animation Presets

```typescript
export const presets = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3, ease: easings.smooth }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: easings.bounce }
  },

  slideFromRight: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    transition: { duration: 0.4, ease: easings.smooth }
  },

  morphCard: {
    layoutId: true, // Framer Motion layout animation
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200
    }
  }
};
```

### 4.4 Stagger Patterns

```typescript
export const staggerPresets = {
  // Products appear from center outward
  radial: (index: number, total: number) => {
    const centerIndex = Math.floor(total / 2);
    return Math.abs(index - centerIndex) * 0.05;
  },

  // Top to bottom cascade
  cascade: (index: number) => index * 0.08,

  // Random organic appearance
  organic: () => Math.random() * 0.2,

  // Wave pattern
  wave: (index: number, columns: number) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return (row + col) * 0.05;
  }
};
```

---

## 5. Gesture System

### 5.1 Core Gestures

| Gesture | Action | Feedback |
|---------|--------|----------|
| Tap | Select/Activate | Scale 0.98 + haptic |
| Long Press | Quick actions menu | Scale 1.02 + ripple |
| Swipe Left | Dismiss/Remove | Card flies off + haptic |
| Swipe Right | Save/Like | Heart animation + haptic |
| Pull Down | Refresh/Reset agent | Agent stretches |
| Pinch | Zoom product image | Smooth scale |
| Two-finger swipe | Navigate back | Edge gesture |

### 5.2 Implementation

```typescript
// Unified gesture handler hook
export function useGestures(ref: RefObject<HTMLElement>) {
  const handlers = useGesture({
    onTap: ({ event }) => {
      haptics.tap();
      animateTap(event.target);
    },

    onLongPress: ({ event }) => {
      haptics.select();
      showQuickActions(event.target);
    },

    onDrag: ({ movement: [mx, my], velocity: [vx, vy], direction: [dx] }) => {
      // Swipe detection
      if (Math.abs(mx) > 50 && Math.abs(vx) > 0.5) {
        dx > 0 ? onSwipeRight() : onSwipeLeft();
      }
    },

    onPinch: ({ offset: [scale] }) => {
      setZoom(Math.max(1, Math.min(3, scale)));
    }
  }, {
    drag: { filterTaps: true, threshold: 10 },
    pinch: { scaleBounds: { min: 0.5, max: 3 } }
  });

  return handlers;
}
```

---

## 6. Agent Visual States

### 6.1 The Orb Design

```
IDLE STATE:
┌─────────────────────┐
│                     │
│    ╭─────────╮     │
│   ╱  ░░░░░░░  ╲    │  Soft gradient
│  │  ░░░░░░░░░  │   │  Gentle pulse
│   ╲  ░░░░░░░  ╱    │  Breathing scale
│    ╰─────────╯     │
│                     │
└─────────────────────┘

THINKING STATE:
┌─────────────────────┐
│    ·  ·  ·  ·      │
│  ·  ╭─────────╮ ·  │
│ ·  ╱  ▓▓▓▓▓▓▓  ╲ · │  Rotating particles
│    │  ▓▓▓▓▓▓▓▓▓  │  │  Faster pulse
│ ·  ╲  ▓▓▓▓▓▓▓  ╱ · │  Color shift
│  ·  ╰─────────╯ ·  │
│    ·  ·  ·  ·      │
└─────────────────────┘

PRESENTING STATE:
┌─────────────────────┐
│   ╲    │    ╱      │
│    ╲   │   ╱       │
│    ╭───┴───╮       │  Rays emanating
│   ╱  ███████  ╲    │  Confident glow
│  │  █████████  │   │  Steady state
│   ╲  ███████  ╱    │
│    ╰─────────╯     │
└─────────────────────┘
```

### 6.2 State Transitions

```typescript
export const orbStates = {
  idle: {
    scale: 1,
    background: "radial-gradient(circle, #8B5CF6 0%, #6366F1 50%, #4F46E5 100%)",
    boxShadow: "0 0 60px rgba(139, 92, 246, 0.3)",
    animation: "breathing 4s ease-in-out infinite"
  },

  listening: {
    scale: 1.1,
    background: "radial-gradient(circle, #06B6D4 0%, #0891B2 50%, #0E7490 100%)",
    boxShadow: "0 0 80px rgba(6, 182, 212, 0.4)",
    animation: "pulse 1s ease-in-out infinite"
  },

  thinking: {
    scale: 1,
    background: "conic-gradient(from 0deg, #8B5CF6, #EC4899, #F59E0B, #10B981, #8B5CF6)",
    boxShadow: "0 0 100px rgba(139, 92, 246, 0.5)",
    animation: "spin 2s linear infinite, pulse 0.5s ease-in-out infinite"
  },

  presenting: {
    scale: 1.05,
    background: "radial-gradient(circle, #10B981 0%, #059669 50%, #047857 100%)",
    boxShadow: "0 0 120px rgba(16, 185, 129, 0.4)",
    animation: "glow 2s ease-in-out infinite"
  },

  error: {
    scale: 0.95,
    background: "radial-gradient(circle, #EF4444 0%, #DC2626 50%, #B91C1C 100%)",
    boxShadow: "0 0 60px rgba(239, 68, 68, 0.4)",
    animation: "shake 0.5s ease-in-out"
  }
};
```

---

## 7. Unified Flow: Search → Fit → Buy

### 7.1 The Seamless Journey

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [1] DISCOVERY                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  User uploads image or describes style               │     │
│  │  Agent absorbs input and processes                   │     │
│  │  Products emerge from agent as particles             │     │
│  └──────────────────────────────────────────────────────┘     │
│                           │                                    │
│                           ▼                                    │
│  [2] EXPLORATION                                               │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  Product cards appear in feed                        │     │
│  │  Swipe, tap, explore                                 │     │
│  │  Agent suggests refinements                          │     │
│  └──────────────────────────────────────────────────────┘     │
│                           │                                    │
│              ┌────────────┴────────────┐                      │
│              ▼                         ▼                       │
│  [3A] VIRTUAL TRY-ON          [3B] REFINEMENT                 │
│  ┌─────────────────────┐     ┌─────────────────────┐         │
│  │  Card morphs full   │     │  "Show me darker"   │         │
│  │  AI fitting preview │     │  "More casual"      │         │
│  │  Adjust/rotate view │     │  New results appear │         │
│  └─────────────────────┘     └─────────────────────┘         │
│              │                         │                       │
│              └────────────┬────────────┘                      │
│                           ▼                                    │
│  [4] PURCHASE                                                  │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  "Add to cart" or "Buy now"                          │     │
│  │  Checkout slides up (not new page)                   │     │
│  │  Success celebration animation                        │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 7.2 Transition Choreography

```typescript
// Search to Results
const searchToResults = {
  sequence: [
    { target: "input", action: "fadeOut", duration: 0.2 },
    { target: "orb", action: "expand", duration: 0.4 },
    { target: "orb", action: "burst", duration: 0.3 },
    { target: "products", action: "staggerIn", duration: 0.5, stagger: 0.08 }
  ]
};

// Card to Try-On
const cardToTryOn = {
  sequence: [
    { target: "backdrop", action: "fadeIn", duration: 0.3 },
    { target: "card", action: "morph", duration: 0.5 },
    { target: "tryOnUI", action: "slideUp", duration: 0.3 }
  ]
};

// Try-On to Cart
const tryOnToCart = {
  sequence: [
    { target: "product", action: "shrinkToCart", duration: 0.4 },
    { target: "cartIcon", action: "bounce", duration: 0.3 },
    { target: "notification", action: "slideIn", duration: 0.2 }
  ]
};
```

---

## 8. Component Architecture

### 8.1 Core Components

```
src/
├── components/
│   ├── agent/
│   │   ├── AgentOrb.tsx           # Central AI entity
│   │   ├── AgentMessage.tsx       # Typewriter messages
│   │   ├── AgentParticles.tsx     # Ambient particles
│   │   ├── AgentRipples.tsx       # Voice/action ripples
│   │   └── AgentStateManager.tsx  # State machine
│   │
│   ├── input/
│   │   ├── MagneticInput.tsx      # Text input with pull
│   │   ├── ImageDropzone.tsx      # Drag & drop + camera
│   │   ├── VoiceButton.tsx        # Voice input trigger
│   │   └── QuickSuggestions.tsx   # Pill buttons
│   │
│   ├── product/
│   │   ├── ProductCard.tsx        # Swipeable card
│   │   ├── ProductGrid.tsx        # Masonry/grid layout
│   │   ├── ProductDetail.tsx      # Expanded view
│   │   └── ProductQuickActions.tsx # Long-press menu
│   │
│   ├── tryon/
│   │   ├── TryOnCanvas.tsx        # Full-screen try-on
│   │   ├── TryOnControls.tsx      # Adjust controls
│   │   └── TryOnTransition.tsx    # Morph animation
│   │
│   ├── commerce/
│   │   ├── CartSheet.tsx          # Bottom sheet cart
│   │   ├── CheckoutFlow.tsx       # Step-by-step checkout
│   │   └── PurchaseConfirmation.tsx # Success celebration
│   │
│   └── layout/
│       ├── Canvas.tsx             # Main canvas wrapper
│       ├── GestureProvider.tsx    # Global gesture handling
│       └── MotionProvider.tsx     # Animation context
│
├── hooks/
│   ├── useAgent.ts                # Agent state & actions
│   ├── useGestures.ts             # Gesture handling
│   ├── useMotion.ts               # Animation utilities
│   ├── useHaptics.ts              # Vibration feedback
│   └── useVoice.ts                # Voice input
│
├── motion/
│   ├── easings.ts                 # Timing functions
│   ├── presets.ts                 # Animation presets
│   ├── stagger.ts                 # Stagger utilities
│   └── orchestration.ts           # Sequence management
│
└── utils/
    ├── physics.ts                 # Spring/momentum calc
    └── gestures.ts                # Gesture detection
```

### 8.2 Component Specifications

#### AgentOrb
```typescript
interface AgentOrbProps {
  state: 'idle' | 'listening' | 'thinking' | 'searching' | 'presenting' | 'error';
  size: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  showParticles?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
}
```

#### ProductCard
```typescript
interface ProductCardProps {
  product: Product;
  layoutId?: string;  // For morphing
  onSelect: () => void;
  onTryOn: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onLongPress: () => void;
}
```

#### MagneticInput
```typescript
interface MagneticInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  magneticStrength?: number;  // 0-1
  showVoiceButton?: boolean;
  showImageButton?: boolean;
}
```

---

## 9. Implementation Strategy

### Phase 1: Foundation (Week 1)
```
□ Set up motion infrastructure
  - Framer Motion configuration
  - Easing/duration tokens
  - Animation presets

□ Build Agent core
  - AgentOrb with all states
  - State machine logic
  - Message typewriter

□ Input system
  - MagneticInput component
  - Image upload with absorption
  - Quick suggestions
```

### Phase 2: Product Experience (Week 2)
```
□ Product cards
  - Swipe gestures
  - 3D tilt effect
  - Long-press quick actions
  - Particle reveal animation

□ Feed layout
  - Staggered appearance
  - Scroll physics
  - Pull-to-refresh
```

### Phase 3: Try-On Integration (Week 3)
```
□ Morph transitions
  - Card to full-screen
  - Layout animations
  - Backdrop handling

□ Try-On UI
  - Controls overlay
  - Image manipulation
  - Share functionality
```

### Phase 4: Commerce Flow (Week 4)
```
□ Cart & Checkout
  - Bottom sheet cart
  - Checkout steps
  - Success celebration

□ Polish & Optimization
  - Performance tuning
  - Gesture refinement
  - Haptic patterns
```

---

## 10. Performance Considerations

### 10.1 Animation Performance

```typescript
// Use CSS properties that don't trigger layout
const performantProperties = [
  'transform',  // scale, translate, rotate
  'opacity',
  'filter',     // blur, brightness
];

// Avoid animating
const avoidAnimating = [
  'width', 'height',
  'margin', 'padding',
  'border-width',
  'font-size'
];

// Use will-change sparingly
const willChangeTargets = [
  '.agent-orb',       // Always animating
  '.product-card',    // Frequently swiped
  '.backdrop'         // Transitions
];
```

### 10.2 Optimization Techniques

```typescript
// 1. Use GPU acceleration
const gpuAccelerated = {
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden'
};

// 2. Debounce pointer events
const debouncedPointer = useMemo(
  () => debounce(handlePointerMove, 16),
  []
);

// 3. Use IntersectionObserver for off-screen cards
const { ref, inView } = useInView({
  threshold: 0,
  rootMargin: '100px'
});

// 4. Lazy load images
const imageSrc = inView ? product.image : placeholder;

// 5. Reduce motion for accessibility
const prefersReducedMotion = useReducedMotion();
```

---

## 11. Accessibility

```typescript
// Respect motion preferences
const motionConfig = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 0.3 };

// Screen reader announcements
<VisuallyHidden>
  <div role="status" aria-live="polite">
    {agentMessage}
  </div>
</VisuallyHidden>

// Focus management
useEffect(() => {
  if (state === 'presenting') {
    productGridRef.current?.focus();
  }
}, [state]);

// Keyboard navigation
<ProductCard
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter') onSelect();
    if (e.key === ' ') onTryOn();
  }}
/>
```

---

## Summary

This design system creates an AI-first experience where:

1. **The Agent IS the interface** - Users talk to it, not around it
2. **Everything is fluid** - No pages, just state transitions
3. **Touch feels magical** - Every interaction has physical feedback
4. **Motion tells the story** - Animations communicate AI thinking
5. **Commerce is invisible** - Buying happens naturally in the flow

The result: An award-worthy experience that feels like the future of fashion discovery.
