import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ingenious-studio/ui'
import { useTheme } from '../components/ThemeProvider'
import logoDark from '../assets/logo.png'
import logoLight from '../assets/logo-light.png'

export default function Home() {
  const { theme } = useTheme()
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="flex items-center justify-center p-4 h-full overflow-auto">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img src={isDark ? logoLight : logoDark} alt="IngeniousStudio" className="w-20 h-20" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to IngeniousStudio
          </CardTitle>
          <CardDescription className="text-center">
            Your creative workspace is ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Start creating amazing projects with our powerful tools.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
