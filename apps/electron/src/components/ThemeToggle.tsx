import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Button } from '@aero-work/ui'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      size="icon"
      onClick={toggleTheme}
      className="size-9 p-0 [&_svg]:size-5 bg-secondary-background text-foreground border-2 border-border shadow-nav hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
    >
      <Sun className="hidden dark:inline stroke-foreground" />
      <Moon className="inline dark:hidden stroke-foreground" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
