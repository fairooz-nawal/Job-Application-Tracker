import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST() {
  try {
    if (!process.env.EMAIL_USER) {
      return NextResponse.json(
        { error: "Email not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables." },
        { status: 400 },
      )
    }

    const result = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "Job Tracker - Test Email",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .success { background: #d1fae5; border: 2px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Email Configuration Test</h1>
              </div>
              <div class="content">
                <div class="success">
                  <strong>Success!</strong> Your email notifications are configured correctly.
                </div>
                <p>You will now receive automated reminders for:</p>
                <ul>
                  <li>Upcoming interviews (24 hours before)</li>
                  <li>Follow-ups due today</li>
                  <li>Tasks due today</li>
                </ul>
                <p>To set up automated reminders, configure a cron job to call the <code>/api/send-reminders</code> endpoint daily.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (result.success) {
      return NextResponse.json({ success: true, message: "Test email sent successfully!" })
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to send test email. Check your email configuration." },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Error sending test email:", error)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}
