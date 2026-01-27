# Component Documentation
**Academic Personal Website Design System**

## Alert System

### Overview
The alert system provides four distinct callout box types for highlighting important information. All alerts share consistent styling with color-coded variants.

### Base Alert Class
```html
<div class="alert alert-[variant]">
    <p>Your content here</p>
</div>
```

---

### Alert Variants

#### 1. Info Alert (Green - Default)
**Purpose:** General information, highlights, interesting facts  
**Color:** Green (#4A9B67)

**Usage:**
```html
<div class="alert alert-info">
    <p>📚 Check out my <a href="#">latest research</a> on class discrimination.</p>
</div>
```

**When to use:**
- Highlighting important links or resources
- Drawing attention to special announcements
- General callouts that don't fit other categories

**Examples:**
- Authory profile link (publications.html)
- Research highlights
- General announcements

---

#### 2. Note Alert (Blue)
**Purpose:** Important notes, tips, helpful information  
**Color:** Blue (#0066cc)

**Usage:**
```html
<div class="alert alert-note">
    <p>💡 This feature requires JavaScript to be enabled.</p>
</div>
```

**When to use:**
- Technical requirements or prerequisites
- Helpful tips for users
- Important context or background information

**Examples:**
- Universities visited callout (collaboration.html)
- Technical notes about features
- User guidance

---

#### 3. Warning Alert (Amber)
**Purpose:** Cautions, prerequisites, things to be aware of  
**Color:** Amber/Yellow (#f59e0b)

**Usage:**
```html
<div class="alert alert-warning">
    <p>⚠️ This research is currently under review.</p>
</div>
```

**When to use:**
- Content that needs special attention
- Warnings about limitations
- Prerequisites for understanding
- Deprecated or outdated information

**Examples:**
- Works in progress
- Preliminary findings
- Limitations of studies

---

#### 4. Success Alert (Vibrant Green)
**Purpose:** Achievements, confirmations, positive outcomes  
**Color:** Vibrant Green (#67B084)

**Usage:**
```html
<div class="alert alert-success">
    <p>✅ Paper accepted at Nature Human Behavior!</p>
</div>
```

**When to use:**
- Academic achievements
- Publication acceptances
- Awards and recognition
- Completed milestones

**Examples:**
- Erdős number display (collaboration.html)
- Awards and honors
- Publication milestones

---

### Alert Features

**Styling:**
- Padding: 1.5rem
- Border radius: 8px
- Left border: 4px solid (colored)
- Full border: 1px solid (subtle)
- Gradient background
- Smooth hover transitions

**Hover Effects:**
- Background intensifies slightly
- Border color becomes more prominent
- Shadow increases for depth

**Typography:**
- Paragraphs inside alerts have proper spacing
- Links maintain site color scheme
- Can contain multiple paragraphs

---

### Multiple Paragraphs in Alerts

```html
<div class="alert alert-info">
    <p>First paragraph of information.</p>
    <p>Second paragraph with more details.</p>
</div>
```

**CSS handles spacing:**
- First paragraph: no top margin
- Last paragraph: no bottom margin
- Between paragraphs: 0.75rem spacing

---

## Card Components

### Base Card
**Usage:** General purpose card for content blocks

```html
<div class="card">
    <h3>Card Title</h3>
    <p>Card content goes here.</p>
</div>
```

**Styling:**
- Padding: 1.5rem
- Border: 1px solid
- Border-radius: 8px
- Shadow: Subtle depth
- Hover: Lifts with increased shadow

---

### Position Card
**Usage:** Displaying academic positions and affiliations

```html
<div class="card position-card">
    <span class="position-org">University Name</span>
    <span class="position-role">Position Title</span>
    <span class="position-dept">Department Name</span>
</div>
```

**Where:** index.html (hero section)

**Features:**
- Glass morphism effect
- Flexible column layout
- Hierarchical typography

---

### Writing Card
**Usage:** Media and public writing items

```html
<div class="writing-card">
    <div class="writing-header">
        <span class="writing-date">Jan 2026</span>
        <span class="writing-outlet">The Atlantic</span>
    </div>
    <h3 class="writing-title">
        <a href="#">Article Title</a>
    </h3>
    <p class="writing-excerpt">Brief excerpt...</p>
    <div class="writing-footer">
        <span class="writing-tag">Tag1</span>
        <span class="writing-tag">Tag2</span>
    </div>
</div>
```

**Where:** media.html

**Note:** Has 1.75rem padding (slightly more than standard card)

---

## Button and Link Components

### Navigation Links
```html
<a href="page.html" class="nav-link">Link Text</a>
<a href="cv.pdf" class="nav-link nav-cta">CV</a>
```

**Features:**
- Hover: Green background
- Active state: Green background
- CTA variant: Blue background → Green on hover

---

### Action Buttons

#### Primary Action
```html
<a href="#" class="action-btn action-primary">
    Primary Action
</a>
```

**Styling:**
- Green background
- White text
- Hover: Lighter green + lift

#### Secondary Action
```html
<a href="#" class="action-btn action-secondary">
    Secondary Action
</a>
```

**Styling:**
- White background
- Green border + text
- Hover: Green subtle background

---

### Contact Links
```html
<a href="mailto:email@domain.com" class="contact-link">
    <span class="contact-label">Email</span>
    <span class="contact-value">email@domain.com</span>
</a>
```

**Features:**
- Glass morphism background
- Hover: Lifts with arrow indicator
- Two-line layout (label + value)

---

## Special Components

### Erdős Number Display
```html
<div class="alert alert-success" style="max-width: 800px; margin: 2rem auto;">
    <h4 class="erdos-title">Erdős Number: 5</h4>
    <div class="erdos-chain">
        <span class="erdos-link">Person 1</span>
        <span class="erdos-arrow">»</span>
        <span class="erdos-link">Person 2</span>
        <span class="erdos-arrow">»</span>
        <span class="erdos-me">Me</span>
    </div>
</div>
```

**Styling:**
- Uses success alert as base
- Centered content
- Mono font for chain
- Special styling for "Me"

---

### Year Sections (Expandable)
```html
<div class="year-section">
    <div class="year-header">
        <div style="display: flex; align-items: center;">
            <h3 class="year-title">2025</h3>
            <span class="year-count">(5 papers)</span>
        </div>
        <span class="year-toggle">▼</span>
    </div>
    <div class="year-content">
        <div class="year-content-inner">
            <p>Content item 1</p>
            <p>Content item 2</p>
        </div>
    </div>
</div>
```

**Features:**
- Click to expand/collapse
- Smooth height animation
- Hover effects on individual items
- Expand/Collapse All controls (auto-added by JS)

**Where:** research.html, publications.html

---

### Feedback Masonry
```html
<div class="feedback-masonry">
    <blockquote class="medium">
        "Student feedback quote here."
    </blockquote>
    <blockquote class="long">
        "Longer student feedback quote that needs more space."
    </blockquote>
</div>
```

**Classes:**
- `.short` - 1-2 sentences
- `.medium` - 3-4 sentences  
- `.long` - 5+ sentences

**Features:**
- Masonry grid layout
- Glass morphism effect
- Hover: Lifts and brightens

**Where:** teaching.html, collaboration.html

---

## Utility Classes

### Section Spacing
```html
<section class="section">
    <!-- Content -->
</section>
```

**Default:** 3.5rem bottom margin

### Section About (Homepage)
```html
<section class="container section-about">
    <h2 class="section-about-title">Title</h2>
    <!-- Content -->
</section>
```

**Styling:**
- No top padding
- 4rem bottom padding
- Title has no top margin

---

### Image Classes

#### Floating Images
```html
<div class="img-float-right img-medium">
    <img src="image.jpg" alt="Description">
    <span class="img-caption">Caption text</span>
</div>
```

**Float Options:**
- `.img-float-right` - Floats to right
- `.img-float-left` - Floats to left

**Size Options:**
- `.img-small` - max-width: 300px (35%)
- `.img-medium` - max-width: 500px (60%)
- `.img-map` - max-width: 700px (80%)

**Note:** Floats clear on mobile (< 768px)

---

## Typography

### Headings

```html
<h1 class="page-title">Page Title</h1>
<h2>Section Heading</h2>
<h3>Subsection Heading</h3>
```

**Sizes:**
- `.page-title` - 2.5rem / 700 weight
- `h2` - 1.75rem / 700 weight
- `h3` - 1.125rem / 600 weight

**Features:**
- `h2` has colored underline accent
- `.page-title` has animated underline
- All use Space Grotesk font

### Body Text

```html
<p>Regular paragraph</p>
<p class="lead">Introductory paragraph</p>
```

**Sizes:**
- `p` - 1rem / 1.75 line-height
- `.lead` - 1.125rem / 1.8 line-height

---

## Color Variables

### Primary Colors
```css
--bg-primary: #fafafa;
--text-primary: #1a1a1a;
--accent: #0066cc;
--green: #4A9B67;
```

### Alert Colors
```css
--green: #4A9B67;           /* Info alerts */
--accent: #0066cc;          /* Note alerts */
--warning: #f59e0b;         /* Warning alerts */
--green-light: #67B084;     /* Success alerts */
```

### Usage
Always use CSS variables for colors:
```css
/* Good */
color: var(--green);

/* Bad */
color: #4A9B67;
```

---

## Spacing System

### Standard Margins
- Small: 0.5rem
- Medium: 1rem
- Large: 1.5rem
- XLarge: 2rem
- Section: 3.5rem

### Standard Padding
- Card: 1.5rem
- Alert: 1.5rem
- Container: 0 1.5rem

---

## Responsive Breakpoints

### Primary Breakpoint
```css
@media (max-width: 768px) {
    /* Mobile styles */
}
```

**Changes at 768px:**
- Navigation → Mobile menu
- Grids → Single column
- Floats → Stack
- Font sizes may reduce

---

## Best Practices

### When to Use Each Component

**Use Alerts:**
- Important information that needs highlighting
- Callouts separate from main content flow
- Links to external resources

**Use Cards:**
- Content blocks that group related information
- Items in a grid layout
- Interactive elements with hover states

**Use Blockquotes:**
- Actual quotes from people
- Testimonials and feedback
- Citations

**Don't use alerts for:**
- Regular paragraph text
- Actual quotations (use `<blockquote>`)
- Navigation elements

---

### Accessibility Guidelines

**Always include:**
- Proper heading hierarchy
- Alt text for images
- ARIA labels for interactive elements
- Sufficient color contrast

**Avoid:**
- Color as only indicator
- Overly complex nesting
- Unlabeled buttons/links

---

### Component Naming

**Follow BEM-like conventions:**
- `.component` - Base component
- `.component-variant` - Variant of component
- `.component-part` - Part of component

**Examples:**
- `.alert` → `.alert-info`
- `.nav-link` → `.nav-cta`
- `.writing-card` → `.writing-header`

---

## Migration Guide

### Converting Old Patterns

#### Old inline card → Alert
**Before:**
```html
<div class="card" style="background: ...; border: ...;">
    <p>Content</p>
</div>
```

**After:**
```html
<div class="alert alert-info">
    <p>Content</p>
</div>
```

#### Old .blockquote → Alert
**Before:**
```html
<div class="blockquote">
    <p>Non-quote content</p>
</div>
```

**After:**
```html
<div class="alert alert-info">
    <p>Non-quote content</p>
</div>
```

**Keep as blockquote:**
```html
<blockquote>
    <p>"Actual quoted text"</p>
</blockquote>
```

---

## Quick Reference

### Most Common Components

**Highlight important info:**
```html
<div class="alert alert-info"><p>Text</p></div>
```

**Add note:**
```html
<div class="alert alert-note"><p>Text</p></div>
```

**Show achievement:**
```html
<div class="alert alert-success"><p>Text</p></div>
```

**Create content card:**
```html
<div class="card"><p>Content</p></div>
```

**Add CTA button:**
```html
<a href="#" class="action-btn action-primary">Click Here</a>
```

---

**End of Component Documentation**
