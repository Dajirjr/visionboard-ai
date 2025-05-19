# VisionBoard AI Style Guide

## 🎨 Brand Colors

### Primary Colors
```css
--primary: #4F46E5;    /* Indigo */
--secondary: #3B82F6;  /* Blue */
--dark: #0F172A;       /* Dark Theme */
```

### Supporting Colors
```css
--success: #059669;    /* Green */
--warning: #F59E0B;    /* Amber */
--error: #DC2626;      /* Red */
--info: #3B82F6;       /* Blue */
```

### Gradients
```css
background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
```

## 📝 Typography

### Font Family
- Primary: `Inter` (400, 500, 600, 700)
- Monospace: `JetBrains Mono` (code blocks)

### Font Sizes
```css
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
```

### Line Heights
```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## 🎯 Spacing

### Grid System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px

### Margins
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
```

### Padding
- Buttons: 12px 24px
- Cards: 24px
- Inputs: 12px 16px

## 🔲 Components

### Buttons
```css
border-radius: 8px;
padding: 12px 24px;
font-weight: 500;
transition: all 0.2s;
```

### Cards
```css
border-radius: 12px;
background: var(--bg-card);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Inputs
```css
border-radius: 8px;
padding: 12px 16px;
background: var(--bg-dark);
border: 1px solid rgba(255, 255, 255, 0.1);
```

## 🎭 Dark Mode

### Background Colors
```css
--bg-dark: #0F172A;
--bg-card: #1E293B;
```

### Text Colors
```css
--text: #F8FAFC;
--text-muted: #94A3B8;
```

## 📱 Responsive Design

### Breakpoints
```css
--sm: 640px;   /* Mobile */
--md: 768px;   /* Tablet */
--lg: 1024px;  /* Laptop */
--xl: 1280px;  /* Desktop */
--2xl: 1536px; /* Large Desktop */
```

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
```

## 🎨 Icons & Images

### Icons
- Use Phosphor Icons
- Size: 20px (default)
- Weight: Regular
- Color: Current color

### Images
- Format: WebP (with PNG fallback)
- Max width: 100%
- Border radius: 8px
- Aspect ratios: 16:9, 4:3, 1:1

## 🌟 Effects

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Transitions
```css
--transition: all 0.2s ease;
--transition-slow: all 0.3s ease;
--transition-fast: all 0.1s ease;
```

## 🎯 Best Practices

1. Use CSS variables for consistency
2. Follow 8px grid system
3. Maintain dark mode parity
4. Use semantic HTML
5. Ensure WCAG 2.1 compliance
6. Test on all breakpoints 