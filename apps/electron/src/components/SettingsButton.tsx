import { Settings } from 'lucide-react'
import { Button } from '@aero-work/ui'

export function SettingsButton() {
  return (
    <Button variant="ghost" size="icon" aria-label="Settings">
      <Settings className="h-5 w-5" />
    </Button>
  )
}
