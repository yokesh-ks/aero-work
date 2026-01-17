import type { ReactNode } from 'react'
import { SettingsButton } from './SettingsButton'
import { ThemeToggle } from './ThemeToggle'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen bg-background flex flex-col">
      <header
        className="flex items-center justify-between h-16 px-6 w-full border-b-2 border-border bg-secondary-background"
        data-testid="app-header"
      >
        {/* Left: Branding */}
        <div className="brand-logo">
          <span className="text-xl font-heading text-foreground">AeroWork</span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          <SettingsButton />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-auto scrollbar">
        <div className="container mx-auto p-4 h-full max-w-container">
          <div className="h-full overflow-auto">{children}</div>
        </div>
      </main>
    </div>
  )
}
