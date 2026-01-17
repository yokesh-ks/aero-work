import { Link } from '@tanstack/react-router'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@aero-work/ui'
import { FolderGit2, ArrowRight } from 'lucide-react'
import { useTheme } from '../components/ThemeProvider'
import logoDark from '../assets/logo.png'
import logoLight from '../assets/logo-light.png'

export default function Home() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex items-center justify-center p-4 h-full overflow-auto">
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img src={isDark ? logoLight : logoDark} alt="Aero Work" className="w-20 h-20" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome to Aero Work</CardTitle>
          <CardDescription className="text-center">
            Your creative workspace is ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Start creating amazing projects with our powerful tools.
          </p>
          <Button asChild className="w-full">
            <Link to="/projects" className="inline-flex items-center justify-center gap-2">
              <FolderGit2 className="h-4 w-4" />
              Go to Projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
