## ✅ Header Implementation Plan

### **Objective**  
Integrate a consistent, responsive header into the application layout that includes branding, user settings access, and theme control—without disrupting the existing full-height content flow.

---

### **1. Update `Layout.tsx`**
- Insert a `<header>` element **above** the main content container.
- Ensure the header:
  - Has a fixed height (e.g., `h-16` or `64px`) for predictable spacing.
  - Uses a subtle background (e.g., `bg-background` or `bg-card`) with a bottom border (`border-b`) for visual separation.
  - Maintains full width (`w-full`) and is positioned statically (not fixed) to allow natural scrolling unless PRD specifies otherwise.
- Adjust the main content area to start **below** the header (e.g., add `pt-16` or use flex/column layout with `flex-1` for content).

---

### **2. Header Structure (Flex Layout)**
Use a **flex container** with space-between alignment:

```tsx
<header className="flex items-center justify-between h-16 px-6 w-full border-b bg-background">
  {/* Left: Branding */}
  <div className="text-xl font-bold">AeroWork</div>

  {/* Right: Controls */}
  <div className="flex items-center gap-3">
    <SettingsButton />
    <ThemeToggle />
  </div>
</header>
```

- **Left Side**:  
  - Display "AeroWork" as styled text (e.g., `font-bold`, matching app typography).  
  - Placeholder for future logo replacement (wrap in a `<span>` or `<div>` with a clear class like `brand-logo`).

- **Right Side**:  
  - Group `SettingsButton` and `ThemeToggle` with consistent spacing (`gap-3`).

---

### **3. Settings Button Component**
- Create a new component `SettingsButton.tsx`:
  ```tsx
  import { Settings } from 'lucide-react';
  import { Button } from '@/components/ui/button'; // Adjust path per your UI lib

  export function SettingsButton() {
    return (
      <Button variant="ghost" size="icon" aria-label="Settings">
        <Settings className="h-5 w-5" />
      </Button>
    );
  }
  ```
- Use `variant="ghost"` for minimal visual weight.
- Include `aria-label` for accessibility.

---

### **4. Styling & Responsiveness**
- **Mobile-first**: Ensure the header remains usable on small screens (logo may shrink, icons stay tappable).
- **Consistency**: Reuse existing Tailwind classes from your design system (e.g., `bg-background`, `text-foreground`).
- **Spacing**: Use `px-4`/`px-6` for horizontal padding; avoid magic numbers.
- **Z-index**: If the header becomes sticky/fixed later, assign a safe `z-10` or higher.

---

### **5. Integration Notes**
- **Preserve Layout Flow**: The main content should occupy the remaining viewport height (e.g., `min-h-[calc(100vh-4rem)]` if header is `4rem` tall).
- **Future-Proofing**:  
  - Wrap the logo in a component (`<AppLogo />`) for easy image replacement.  
  - Add a `data-testid` attribute if using E2E tests (e.g., `data-testid="app-header"`).

---