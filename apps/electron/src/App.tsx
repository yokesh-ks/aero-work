import { RouterProvider } from '@tanstack/react-router'
import './styles/globals.css'
import { Sonner, Toaster, TooltipProvider } from '@aero-work/ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './components/ThemeProvider'
import { router } from './utils/routes'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
