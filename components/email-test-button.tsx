"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Mail } from "lucide-react"

export function EmailTestButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleTestEmail() {
    setLoading(true)
    try {
      const response = await fetch("/api/test-email", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Test email sent!",
          description: "Check your inbox to confirm email notifications are working.",
        })
      } else {
        toast({
          title: "Failed to send test email",
          description: data.error || "Please check your email configuration.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error testing email:", error)
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleTestEmail} disabled={loading} variant="outline">
      <Mail className="h-4 w-4 mr-2" />
      {loading ? "Sending..." : "Test Email"}
    </Button>
  )
}
