# Job Application Tracker

A comprehensive web application to track and manage your job applications, interviews, tasks, and follow-ups.

## Features

- **Dashboard**: View statistics, daily progress towards application goals, and status overview
- **Job Applications**: Full CRUD operations with status tracking (Applied, Follow-up, Interview, Task, Rejected)
- **Interviews**: Schedule and manage interviews with calendar integration
- **Tasks**: Create and track job search tasks with priorities and categories
- **Follow-ups**: Schedule and manage application follow-ups
- **Email Notifications**: Automated reminders via email (powered by Nodemailer)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- Gmail account for email notifications

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/job-tracker
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/job-tracker

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Cron Secret (for automated reminders)
CRON_SECRET=your-random-secret-key
```

#### Gmail App Password Setup

1. Enable 2-factor authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new app password for "Mail"
4. Use this password for `EMAIL_PASSWORD` (not your regular Gmail password)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing Email Configuration

After setting up your environment variables, use the "Test Email" button in the application to verify your email configuration is working correctly.

### Setting Up Automated Reminders

The app includes an API endpoint `/api/send-reminders` that sends automated reminders for:
- Interviews scheduled for tomorrow (24-hour reminder)
- Follow-ups due today
- Tasks due today

#### Option 1: Vercel Cron Jobs (Recommended)

If deploying to Vercel, add a `vercel.json` file:

```json
{
  "crons": [{
    "path": "/api/send-reminders",
    "schedule": "0 8 * * *"
  }]
}
```

This runs daily at 8:00 AM UTC.

#### Option 2: External Cron Service

Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Create a new cron job
2. Set URL: `https://your-domain.com/api/send-reminders`
3. Set schedule: Daily at your preferred time
4. Add header: `Authorization: Bearer your-cron-secret`

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Email**: Nodemailer with Gmail
- **Deployment**: Vercel

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── applications/     # Job applications page
│   ├── interviews/       # Interviews page
│   ├── tasks/           # Tasks page
│   ├── follow-ups/      # Follow-ups page
│   └── page.tsx         # Dashboard
├── components/          # React components
├── lib/                # Utility functions
├── models/             # MongoDB models
└── types/              # TypeScript types
```

## License

MIT
