import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen bg-background flex flex-col">
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 h-full">
          <div className="h-full overflow-auto">{children}</div>
        </div>
      </main>
    </div>
  )
}
