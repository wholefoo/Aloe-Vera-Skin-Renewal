# Design Guidelines: L'Bri Aloe-First Skincare Sales Page

## Design Approach
**Reference-Based Approach**: Drawing inspiration from clean beauty brands like Glossier (minimal aesthetics), The Ordinary (education-first approach), and Herbivore Botanicals (botanical freshness).

## Brand Aesthetic: "Fresh & Botanical"
**Visual Identity**: Crisp, water-drop fresh, and naturally uplifting
**Color Palette**:
- Base: Clean whites and off-whites (#FFFFFF, #FAFAFA)
- Primary: Refreshing cucumber greens (#4A9B7F, #8FBC8F, #E8F5E9 for backgrounds)
- Accents: Soft oranges (#FFB347, #FFDAB9) and pinks (#FFE4E1, #FFB6C1)
- Text: Deep charcoal (#2C3E50) for readability

## Typography System
**Font Families**: 
- Headers: Playfair Display (elegant, botanical)
- Body: Inter (clean, highly readable)

**Hierarchy**:
- H1 Hero: 3.5rem desktop / 2.5rem mobile, medium weight
- H2 Sections: 2.5rem desktop / 2rem mobile, semibold
- H3 Subsections: 1.75rem, medium
- Body: 1.125rem, line-height 1.7
- Small text: 0.875rem for disclaimers

## Layout System
**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24
**Container**: max-w-7xl with px-6 padding
**Section Padding**: py-16 mobile, py-24 desktop

## Page Structure & Components

### 1. Hero Section (80vh)
**Layout**: Full-width with split design
- Left 50%: Content (headline, subheadline, CTA)
- Right 50%: Large hero image of aloe plant with water droplets
**Image**: Fresh aloe vera plant closeup, dewy leaves, bright natural lighting, professional product photography style
**CTA Button**: "Shop the Catalog" - cucumber green with white text, generous padding (px-8 py-4), backdrop-blur effect if overlaying image

### 2. "What is Aloe-First Skincare?" Definition Block
**Design**: Full-width colored section with soft cucumber green background (#E8F5E9)
**Layout**: Centered content, max-w-4xl
**Visual**: Large decorative quotation mark in accent orange, definition text in deep charcoal
**Emphasis**: Key phrases ("pharmaceutical-grade Aloe Vera") in semibold

### 3. The Aloe Difference - Comparison Table
**Design**: Clean, modern table with alternating row backgrounds
**Header Row**: Cucumber green background with white text
**Columns**: Three columns - Feature | L'Bri | Department Store Brands
**L'Bri Column**: Soft green highlight background
**Icons**: Checkmarks (✓) for L'Bri, X marks for competitors in accent colors
**Typography**: Slightly larger text for emphasis on "Fresh Aloe Vera Gel" vs "Water (Aqua)"

### 4. Product Highlights Section
**Layout**: Three-column grid (single column mobile)
**Cards**: 
- White background with subtle shadow
- Product image placeholder at top (square format, botanical photography)
- Product name in H3
- Bullet points with small botanical icons (leaf, droplet)
- Soft accent border-left in cucumber green
**Spacing**: gap-8 between cards

### 5. "Read the Label" Challenge Section
**Design**: Bold callout section with soft orange/pink gradient background
**Layout**: Centered content with large heading
**Visual Element**: Illustrated or photographed product label showing "Aqua" as first ingredient with red circle/highlight
**Typography**: Mix of large display text and readable body copy
**CTA**: Secondary button encouraging label comparison

### 6. FAQ Accordion
**Design**: Clean accordion with cucumber green accents
**Interaction**: Smooth expand/collapse with rotating chevron icons
**Styling**: 
- Question: Semibold, clickable row with hover state (light green background)
- Answer: Padded content area with botanical-toned background
**Icons**: Plus/minus icons in cucumber green

### 7. Footer
**Design**: Multi-column layout (4 columns desktop, stacked mobile)
**Sections**: 
- About L'Bri with small brand description
- Quick links to catalog sections
- Contact information with icons
- Newsletter signup with inline form (email input + green button)
**Background**: Soft off-white (#FAFAFA)
**Social Icons**: Cucumber green, circular style

## Images Strategy
**Hero Image**: YES - Large, professional aloe plant with water droplets
**Product Cards**: Three high-quality product photography images (bottles/jars on white or botanical backgrounds)
**Label Challenge**: Mockup of generic skincare label highlighting "Aqua"
**Decorative**: Subtle botanical pattern overlays in section backgrounds (very low opacity)

## Component Specifications

**Buttons**:
- Primary: Cucumber green background, white text, rounded corners (rounded-lg), shadow on hover
- Secondary: White background, cucumber green border and text
- All buttons: backdrop-blur when on images, generous padding

**Cards**: 
- White background
- Subtle shadow (shadow-md)
- Rounded corners (rounded-xl)
- Hover: Slight lift effect (transform scale)

**Tables**:
- Full width with responsive horizontal scroll on mobile
- Border-collapse with subtle borders
- Alternating row colors for readability

**Forms** (Newsletter):
- Inline email input with green submit button
- Rounded inputs matching overall aesthetic
- Focus states with cucumber green accent

## Accessibility & Performance
- High contrast text (WCAG AA minimum)
- Semantic HTML structure
- Touch-friendly targets (min 44px)
- Optimize for mobile-first loading
- Lazy load product images below fold

## Animation Guidelines
**Use Sparingly**:
- Smooth scroll to sections (scroll-behavior: smooth)
- FAQ accordion expand/collapse
- Button hover states (subtle scale/shadow)
- Card hover lift effect
**Avoid**: Distracting auto-play animations, excessive transitions