import nodemailer from "nodemailer"

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }
  return transporter
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const transporter = getTransporter()

    const info = await transporter.sendMail({
      from: `"Job Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    })

    console.log("[v0] Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return { success: false, error }
  }
}

export function generateInterviewReminderEmail(company: string, position: string, date: string, time: string) {
  return {
    subject: `Interview Reminder: ${company} - ${position}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Interview Reminder</h1>
            </div>
            <div class="content">
              <p>You have an upcoming interview scheduled!</p>
              <div class="details">
                <div class="detail-row">
                  <span class="label">Company:</span> ${company}
                </div>
                <div class="detail-row">
                  <span class="label">Position:</span> ${position}
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span> ${date}
                </div>
                <div class="detail-row">
                  <span class="label">Time:</span> ${time}
                </div>
              </div>
              <p><strong>Good luck with your interview!</strong></p>
              <p>Make sure to:</p>
              <ul>
                <li>Review the company and role requirements</li>
                <li>Prepare answers to common questions</li>
                <li>Test your equipment (if video interview)</li>
                <li>Have questions ready to ask</li>
              </ul>
            </div>
            <div class="footer">
              <p>Sent from your Job Application Tracker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

export function generateFollowUpReminderEmail(company: string, position: string, date: string, method: string) {
  return {
    subject: `Follow-up Reminder: ${company} - ${position}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #f59e0b; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Follow-up Reminder</h1>
            </div>
            <div class="content">
              <p>Don't forget to follow up on your application!</p>
              <div class="details">
                <div class="detail-row">
                  <span class="label">Company:</span> ${company}
                </div>
                <div class="detail-row">
                  <span class="label">Position:</span> ${position}
                </div>
                <div class="detail-row">
                  <span class="label">Follow-up Date:</span> ${date}
                </div>
                <div class="detail-row">
                  <span class="label">Method:</span> ${method}
                </div>
              </div>
              <p><strong>Tips for following up:</strong></p>
              <ul>
                <li>Be polite and professional</li>
                <li>Reaffirm your interest in the position</li>
                <li>Keep it brief and to the point</li>
                <li>Ask about the timeline for next steps</li>
              </ul>
            </div>
            <div class="footer">
              <p>Sent from your Job Application Tracker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

export function generateTaskReminderEmail(title: string, dueDate: string, priority: string) {
  return {
    subject: `Task Reminder: ${title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #3b82f6; }
            .priority { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .priority-high { background: #fee2e2; color: #dc2626; }
            .priority-medium { background: #fef3c7; color: #d97706; }
            .priority-low { background: #dbeafe; color: #2563eb; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Task Reminder</h1>
            </div>
            <div class="content">
              <p>You have a task due soon!</p>
              <div class="details">
                <div class="detail-row">
                  <span class="label">Task:</span> ${title}
                </div>
                <div class="detail-row">
                  <span class="label">Due Date:</span> ${dueDate}
                </div>
                <div class="detail-row">
                  <span class="label">Priority:</span> 
                  <span class="priority priority-${priority}">${priority.toUpperCase()}</span>
                </div>
              </div>
              <p>Make sure to complete this task before the due date.</p>
            </div>
            <div class="footer">
              <p>Sent from your Job Application Tracker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}
