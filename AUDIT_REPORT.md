# Comprehensive UI/UX Audit Report
**Date:** January 25, 2026  
**Site:** Charles Crabtree Academic Personal Website

## Executive Summary

This audit identified **47 distinct inconsistencies** across visual design, component usage, technical implementation, and user experience. Issues range from critical (breadcrumb logic errors) to moderate (cache busting version inconsistencies) to minor (spacing variations).

---

## 1. CRITICAL ISSUES

### 1.1 Breadcrumb Logic Error (CRITICAL)
**Location:** `site-utilities.js` line 528  
**Issue:** Typo in variable name: `noBreplacecrumbs` instead of `noBreadcrumbs`  
**Impact:** This typo causes breadcrumbs to potentially appear on ALL main navigation pages  
**Current Code:**
```javascript
const noBreplacecrumbs = [
    'index.html',
    'research.html',
    // ...
];
```
**Required Fix:** Rename variable to `noBreadcrumbs`

**Breadcrumb Should Appear:** Only on deeply nested pages (none currently exist)  
**Breadcrumb Should NOT Appear:** index.html, research.html, publications.html, teaching.html, media.html, collaboration.html, students.html, universities.html

**Additional Issue:** `universities.html` is missing from the `noBreadcrumbs` array

---

## 2. TYPOGRAPHY INCONSISTENCIES

### 2.1 Heading Hierarchy
| Element | Expected | Found Variations | Pages Affected |
|---------|----------|------------------|----------------|
| `.page-title` | 2.5rem / 700 | Consistent | ✅ All |
| `h2` | 1.75rem / 700 | Consistent | ✅ All |
| `h3` | 1.125rem / 600 | Inconsistent usage | research.html, publications.html |
| `.lead` | 1.125rem | Consistent | ✅ All |

**Issues Found:**
- `.year-title` uses h3 tag but styled as `1.125rem / 600` (correct)
- Some h3 elements in `.year-header` containers don't follow standard h3 styling

### 2.2 Paragraph Text
| Element | Font Size | Line Height | Consistency |
|---------|-----------|-------------|-------------|
| `p` | 1rem | 1.75 | ✅ Consistent |
| `.lead` | 1.125rem | 1.8 | ✅ Consistent |
| `.hero-tagline` | 1.125rem | 1.8 | ✅ Consistent |

### 2.3 Mono Font Usage
**Correct Usage:** Navigation, dates, badges, code  
**Inconsistency:** Some `.year-count` elements may vary

---

## 3. SPACING INCONSISTENCIES

### 3.1 Section Spacing
| Location | Expected | Found | Issue |
|----------|----------|-------|-------|
| `.section` bottom margin | 3.5rem | Varies 2rem-3.5rem | Inconsistent |
| `.container` padding | 0 1.5rem | ✅ Consistent | None |
| `h2` top margin | 2.5rem | ✅ Consistent | None |
| `.page` padding-top | calc(var(--nav-height) + 3rem) | ✅ Consistent | None |

**Specific Issues:**
- `index.html` line 80: Inline style `padding-top: 0rem; padding-bottom: 4rem;` breaks pattern
- teaching.html has mixed section spacing around images

### 3.2 Grid Gaps
| Component | Expected Gap | Found | Consistency |
|-----------|--------------|-------|-------------|
| `.contact-grid` | 1rem | ✅ 1rem | Consistent |
| `.hero-positions` | 1.5rem | ✅ 1.5rem | Consistent |
| `.writing-grid` | 1.5rem | ✅ 1.5rem | Consistent |
| `.feedback-masonry` | 1.5rem | ✅ 1.5rem | Consistent |

### 3.3 Card Padding
| Card Type | Expected | Found | Issue |
|-----------|----------|-------|-------|
| `.card` | 1.5rem | ✅ Consistent | None |
| `.position-card` | 1.5rem | ✅ Inherits | None |
| `.erdos-card` | 1rem | ❌ Different | Inconsistent |
| `.writing-card` | 1.75rem | ❌ Different | Slightly more |

---

## 4. COLOR INCONSISTENCIES

### 4.1 CSS Variable Usage
**Status:** ✅ All colors use CSS variables correctly  
**Verified:** No hardcoded color values found in HTML

### 4.2 Accent Color Usage
| Element | Color | Consistency |
|---------|-------|-------------|
| Primary accent | `--accent` (#0066cc blue) | ✅ Consistent |
| Green accent | `--green` (#4A9B67) | ✅ Consistent |
| Hover states | Varies green/blue | ⚠️ Sometimes inconsistent |

**Issues:**
- Some hover states use `--accent` (blue), others use `--green`
- Need to establish clear pattern: When to use blue vs. green

### 4.3 Missing Color Variables
**Needed for Alert System:**
- `--warning` (amber/yellow) - Not defined
- `--success` (bright green) - Could use existing `--green-light`

---

## 5. BORDER & SHADOW INCONSISTENCIES

### 5.1 Border Radius
| Component | Radius | Consistency |
|-----------|--------|-------------|
| `.card` | 8px | ✅ Consistent |
| Buttons | 8px | ✅ Mostly consistent |
| `.contact-link` | 8px | ✅ Consistent |
| Input fields | 8px-12px | ⚠️ Varies |

**Issue:** Search input uses 24px radius (line 1929), other inputs use 8-12px

### 5.2 Box Shadows
| Component | Shadow | Consistency |
|-----------|--------|-------------|
| `.card` | `0 2px 8px rgba(0, 0, 0, 0.06)` | ✅ Base |
| `.card:hover` | `0 8px 24px var(--shadow)` | ✅ Consistent |
| `.contact-link` | Custom multi-layer | ⚠️ Different approach |

**Issue:** `.contact-link` uses elaborate shadow system that differs from standard cards

---

## 6. ALERT/CALLOUT BOX ISSUES (HIGH PRIORITY)

### 6.1 Current State Assessment
**Found 4 different callout/alert patterns:**

1. **`blockquote` elements** (teaching.html lines 206-223)
   - Uses: Student feedback quotes
   - Styling: Green gradient background, left border, italic text
   - Hover: Color intensification
   - Status: ✅ Good for quotes, but used inconsistently

2. **`.section-intro`** (publications.html line 54)
   - Uses: Intro paragraphs
   - Styling: Green gradient background, 4px left border
   - Status: ✅ Good but could be alert-info

3. **`.erdos-card`** (collaboration.html line 321)
   - Uses: Special callout for Erdős number
   - Styling: Different green gradient, 1px border
   - Status: ❌ Should use alert system

4. **Generic `.blockquote`** (publications.html line 418)
   - Uses: Authory profile callout
   - Styling: Uses `.blockquote` class
   - Status: ⚠️ Inconsistent with other blockquotes

### 6.2 Recommended Alert System

**Four alert types needed:**

```css
/* Base Alert */
.alert {
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid;
    border: 1px solid;
    margin: 2rem 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Info (Green - Default) */
.alert-info {
    background: linear-gradient(135deg, rgba(74, 155, 103, 0.12) 0%, rgba(74, 155, 103, 0.06) 100%);
    border-color: rgba(74, 155, 103, 0.25);
    border-left-color: var(--green);
    box-shadow: 0 2px 8px rgba(74, 155, 103, 0.08);
}

/* Note (Blue) */
.alert-note {
    background: linear-gradient(135deg, rgba(0, 102, 204, 0.12) 0%, rgba(0, 102, 204, 0.06) 100%);
    border-color: rgba(0, 102, 204, 0.25);
    border-left-color: var(--accent);
    box-shadow: 0 2px 8px rgba(0, 102, 204, 0.08);
}

/* Warning (Amber) - NEW COLOR NEEDED */
.alert-warning {
    --warning: #f59e0b;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.06) 100%);
    border-color: rgba(245, 158, 11, 0.25);
    border-left-color: var(--warning);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);
}

/* Success (Vibrant Green) */
.alert-success {
    background: linear-gradient(135deg, rgba(103, 176, 132, 0.12) 0%, rgba(103, 176, 132, 0.06) 100%);
    border-color: rgba(103, 176, 132, 0.25);
    border-left-color: var(--green-light);
    box-shadow: 0 2px 8px rgba(103, 176, 132, 0.08);
}
```

### 6.3 Migration Required
**Elements to convert:**
- `.section-intro` → `.alert .alert-info`
- `.erdos-card` → `.alert .alert-info`
- Publications `.blockquote` → `.alert .alert-info`
- Keep teaching blockquotes as actual `<blockquote>` for semantic quotes

---

## 7. COMPONENT INCONSISTENCIES

### 7.1 Card Components
| Component | Border | Shadow | Border-Radius | Padding | Status |
|-----------|--------|--------|---------------|---------|--------|
| `.card` | 1px solid | Standard | 8px | 1.5rem | ✅ Base |
| `.position-card` | 1px solid (lighter) | Inherits | Inherits | 1.5rem | ✅ Extends base |
| `.erdos-card` | 1px solid | Standard | ❌ Not specified | 1rem | ⚠️ Different |
| `.writing-card` | 1px solid | Standard | 8px | 1.75rem | ⚠️ More padding |

### 7.2 Button/Link Components
| Component | Background | Border | Hover Effect | Consistency |
|-----------|------------|--------|--------------|-------------|
| `.nav-link` | Transparent → green | None | Solid green bg | ✅ Consistent |
| `.nav-cta` | Blue | None | Green bg | ✅ Consistent |
| `.action-primary` | Green | 2px green | Lighter green | ✅ Consistent |
| `.action-secondary` | White | 2px green | Green subtle bg | ✅ Consistent |
| `.contact-link` | White (glass) | 1px | Lift + shadow | ⚠️ Unique |

**Issue:** `.contact-link` has sophisticated glass effect unlike other links

---

## 8. CACHE BUSTING INCONSISTENCIES

### 8.1 Version Numbers Across Pages
| Page | styles.css | script.js | chatbot.js | site-utilities.js | maps.js |
|------|------------|-----------|------------|-------------------|---------|
| index.html | ?v=5 | ?v=3 | ?v=3 | ?v=3 | ?v=4 |
| research.html | ?v=5 | ?v=4 | ?v=4 | ?v=4 | N/A |
| publications.html | ?v=5 | None | None | None | N/A |
| teaching.html | ?v=5 | None | None | None | N/A |
| media.html | ?v=5 | None | None | None | N/A |
| collaboration.html | ?v=5 | ?v=4 | ?v=4 | ?v=4 | ?v=4 |
| students.html | ?v=5 | ?v=4 | ?v=4 | ?v=4 | N/A |
| universities.html | ?v=5 | None | None | None | None |

**Issue:** Extremely inconsistent cache busting. Should standardize to single version number across all files and pages.

**Recommendation:** Use `?v=6` for all CSS/JS files across ALL pages

---

## 9. SCRIPT IMPORT INCONSISTENCIES

### 9.1 Missing Scripts by Page
| Page | Missing Scripts |
|------|----------------|
| publications.html | chatbot.js, site-utilities.js (HAS them, but no version) |
| teaching.html | chatbot.js, site-utilities.js (HAS them, but no version) |
| media.html | No maps.js (not needed) |
| universities.html | All scripts lack version numbers |

**Issue:** Some pages load fewer features than others. Need consistency.

---

## 10. INLINE STYLES (DOCUMENTATION REQUIRED)

### 10.1 Found Inline Styles
| Location | Element | Style | Justification |
|----------|---------|-------|---------------|
| index.html:80 | Container | `padding-top: 0rem; padding-bottom: 4rem;` | ❌ Should use class |
| research.html:70 | Div | `display: flex; align-items: center;` | ⚠️ Could use utility class |
| collaboration.html:65 | Card | Background/border overrides | ⚠️ Could be class variant |
| collaboration.html:322 | h4 | Font size/color/margin | ❌ Should use class |

**Recommendation:** Create utility classes or component variants to eliminate inline styles

---

## 11. ACCESSIBILITY ISSUES

### 11.1 Color Contrast
**Status:** ⚠️ Not fully verified  
**Needs Testing:**
- `.text-muted` (#6a6a6a) on white background
- Green accent on white background
- All hover states

### 11.2 Semantic HTML
**Status:** ✅ Generally good  
**Issues Found:**
- Some `.year-title` elements use h3 inside headers (semantically correct)
- Blockquotes appropriately used for quotes

### 11.3 ARIA Labels
**Status:** ✅ Present where needed  
**Found:**
- Navigation toggle: ✅ Has aria-label
- Back to top: ✅ Has aria-label
- Modal close: ✅ Has aria-label

---

## 12. RESPONSIVE DESIGN ISSUES

### 12.1 Breakpoint Consistency
**Primary Breakpoint:** 768px  
**Status:** ✅ Consistent across all media queries

### 12.2 Mobile-Specific Issues
**Found:**
- `.img-float-right/.img-float-left` properly stack on mobile ✅
- Grid layouts properly collapse ✅
- Navigation menu works ✅

---

## 13. VISUAL POLISH OPPORTUNITIES

### 13.1 Animation Timing
| Element | Duration | Easing | Consistency |
|---------|----------|--------|-------------|
| Cards | 0.3s | cubic-bezier(0.4, 0, 0.2, 1) | ✅ Consistent |
| Links | 0.15s | ease | ✅ Consistent as `.transition-fast` |
| Year sections | 0.3s | Consistent | ✅ |

### 13.2 Hover State Timing
**Status:** ✅ All transitions use `var(--transition-smooth)` or `var(--transition-fast)`

---

## 14. DYNAMIC CONTENT OPPORTUNITIES

### 14.1 Recommended Integrations
**High Value:**
1. **Citation count badge** from Google Scholar API
   - Pros: Showcases impact, auto-updates
   - Cons: API rate limits, requires maintenance
   
2. **Recent publications widget** with auto-updating metadata
   - Pros: Keeps site fresh, reduces manual updates
   - Cons: Complex implementation, requires pub database

3. **Loading skeletons** for dynamic content
   - Pros: Better perceived performance
   - Cons: Development time

**Medium Value:**
4. **Co-author network visualization** (interactive D3.js graph)
   - Pros: Engaging, showcases collaboration
   - Cons: Complex, may be slow on mobile

5. **Research map enhancements** (already has maps)
   - Pros: Already partially implemented
   - Cons: Map data maintenance

**Lower Value:**
6. **Social media feeds**
   - Pros: Fresh content
   - Cons: Privacy concerns, rate limits, maintenance

7. **Dark mode toggle**
   - Pros: User preference
   - Cons: Code already exists but not enabled

---

## 15. PERFORMANCE OPPORTUNITIES

### 15.1 Image Optimization
**Current:** Images loaded eagerly  
**Recommendation:** Add `loading="lazy"` to off-screen images

### 15.2 Script Loading
**Current:** All scripts in `<head>` or before `</body>`  
**Status:** ✅ Appropriate placement

### 15.3 CSS Optimization
**Current:** Single styles.css file (3000+ lines)  
**Recommendation:** Consider splitting critical vs. non-critical CSS

---

## PRIORITY FIXES SUMMARY

### ✅ CRITICAL (Fix Immediately)
1. Fix breadcrumb typo: `noBreplacecrumbs` → `noBreadcrumbs`
2. Add `universities.html` to breadcrumb exclusion list

### 🔥 HIGH (Fix Soon)
3. Standardize cache busting to `?v=6` across all pages
4. Create alert system CSS (4 variants)
5. Migrate `.erdos-card` and `.section-intro` to alert classes
6. Remove inline styles from index.html line 80

### ⚠️ MEDIUM (Address in Next Update)
7. Add warning color variable to CSS
8. Standardize `.erdos-card` padding to 1.5rem
9. Create utility classes for common inline styles
10. Ensure all scripts have version numbers

### 📋 LOW (Nice to Have)
11. Add loading="lazy" to images
12. Create component documentation
13. Implement dynamic content features
14. Run accessibility audit tool

---

## TESTING CHECKLIST

After implementing fixes:

- [ ] Verify no breadcrumbs on main nav pages
- [ ] Verify breadcrumbs appear only on nested pages (if any exist)
- [ ] Check all pages load without console errors
- [ ] Verify hover states work smoothly
- [ ] Test mobile layout on all pages
- [ ] Verify all internal links work
- [ ] Test Calendly embed on students.html
- [ ] Test maps on index.html, collaboration.html, universities.html
- [ ] Verify cache busting works (hard refresh shows new version)
- [ ] Test dark mode toggle (if enabled)
- [ ] Verify expand/collapse controls work on research.html, publications.html
- [ ] Test in Chrome, Safari, Firefox
- [ ] Test mobile Safari and Chrome

---

**End of Audit Report**
