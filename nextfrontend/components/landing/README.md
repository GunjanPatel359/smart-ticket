# Neuro Desk Landing Page Components

This directory contains all the interactive and animated components for the Neuro Desk landing page.

## Components

### 1. FloatingCube.tsx
- **Technology**: Pure Three.js (no React wrappers)
- **Features**: 
  - 3D animated sphere with custom vertex distortion
  - Auto-rotating animation
  - Mouse interaction for rotation control
  - Metallic material with dynamic lighting
  - Responsive canvas sizing
  - Optimized cleanup and memory management

### 2. AnimatedStats.tsx
- **Technology**: Framer Motion, React CountUp
- **Features**:
  - Animated number counting on scroll into view
  - Smooth fade-in animations
  - Viewport detection for performance
  - Customizable stats with prefixes/suffixes

### 3. InteractiveChart.tsx
- **Technology**: Recharts, Framer Motion
- **Features**:
  - Three chart types: Area Chart, Pie Chart, Bar Chart
  - Interactive tab switching
  - Smooth transitions between charts
  - Real-time data visualization
  - Responsive design

### 4. TicketSimulator.tsx
- **Technology**: Framer Motion, React Hooks
- **Features**:
  - Live ticket creation simulation
  - AI assignment animation (1 second delay)
  - Resolution animation (3 seconds total)
  - Priority-based color coding
  - Start/Stop controls
  - Animated ticket cards with status indicators

### 5. ParticleBackground.tsx
- **Technology**: HTML5 Canvas, Vanilla JavaScript
- **Features**:
  - 50 animated particles
  - Dynamic particle connections
  - Bounce physics
  - Responsive to window resize
  - Low opacity for subtle effect

## Technologies Used

- **Three.js**: Pure 3D graphics rendering (no React wrappers)
- **GSAP**: Professional-grade animation library with ScrollTrigger
- **Framer Motion**: React animation library
- **React CountUp**: Animated number counting
- **Recharts**: Composable charting library
- **HTML5 Canvas**: Native canvas rendering
- **Next.js Dynamic Imports**: Code splitting for performance

## Performance Optimizations

1. **Dynamic Imports**: All heavy components are lazy-loaded
2. **SSR Disabled**: 3D and canvas components render client-side only
3. **Viewport Detection**: Animations trigger only when in view
4. **RequestAnimationFrame**: Smooth 60fps animations
5. **Memoization**: Prevents unnecessary re-renders

## Usage

```tsx
import dynamic from "next/dynamic"

const FloatingCube = dynamic(() => import("@/components/landing/FloatingCube"), { ssr: false })
const AnimatedStats = dynamic(() => import("@/components/landing/AnimatedStats"), { ssr: false })

// Use in your component
<FloatingCube />
<AnimatedStats />
```

## Customization

Each component accepts props for customization:

```tsx
// AnimatedStats
<StatCard 
  end={99.9} 
  label="Uptime" 
  suffix="%" 
  decimals={1} 
  color="text-white" 
/>

// InteractiveChart - modify data arrays
const ticketData = [...]
const priorityData = [...]
const skillData = [...]
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (WebGL required for 3D)
- Mobile: Optimized for touch interactions

## Future Enhancements

- [ ] Add more chart types
- [ ] Implement real-time data fetching
- [ ] Add sound effects for interactions
- [ ] Create more 3D models
- [ ] Add VR/AR support
- [ ] Implement gesture controls
