import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Button } from '@aero-work/ui'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const getIcon = () => {
    return theme === 'light'
      ? <Sun className="h-[1.2rem] w-[1.2rem]" />
      : <Moon className="h-[1.2rem] w-[1.2rem]" />
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
