# Kudos — Testimonial Collector & Wall of Love

> Self-hosted, white-label ready testimonial collector. Collect text & video testimonials and embed a beautiful Wall of Love. Uses native browser recording — **zero external API costs!**

---

## ✨ Features

- **Text & Video Testimonials** — Collect star ratings, text quotes, and video recordings
- **Native Video Recording** — Browser `getUserMedia` + `MediaRecorder` (no external APIs!)
- **Wall of Love** — Responsive masonry grid embed for your landing page
- **Space Management** — Multiple walls/spaces per account
- **Approval Workflow** — Pending → Approved/Rejected with one click
- **Embeddable** — Copy-paste iframe code for any website
- **White-Label Ready** — Clean, premium design you can rebrand
- **Self-Hosted** — You own the code, you own the data

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/chiahyuzematthew-tech/fdfd.git kudos
cd kudos
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

The default `.env` uses SQLite — no external database needed!

### 3. Set Up Database

```bash
npx prisma db push
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account.

### 5. Seed Demo Data (Optional)

Click **"Or try with demo data →"** on the login page, or call:

```bash
curl -X POST http://localhost:3000/api/seed
```

Demo credentials: `demo@kudos.app` / `demo123`

---

## 📖 Usage

### Create a Space

1. Sign in and click **"Create Space"**
2. Give it a name (e.g., "My SaaS Product") and an optional headline
3. A unique slug is auto-generated for your space

### Share the Submit Page

Share the submit URL with your customers:

```
https://yourdomain.com/?submit=your-space-slug
```

They can:
- ⭐ Leave a star rating (1–5)
- 📝 Write a text testimonial
- 🎥 Record a video testimonial (native browser recording — no app install needed!)

### Manage Testimonials

Go to your space in the dashboard:
- **Pending tab** — Review new submissions. Approve or reject with one click.
- **Approved tab** — View live testimonials on your wall.
- **Rejected tab** — Review rejected submissions. Re-approve if needed.
- **Embed tab** — Copy the iframe code to embed your Wall of Love.

### Embed the Wall of Love

Copy the iframe snippet from the Embed tab:

```html
<iframe
  src="https://yourdomain.com/?wall=your-space-slug"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius:12px"
></iframe>
```

The wall displays only **approved** testimonials in a responsive masonry grid. Text cards show quotes and star ratings. Video cards have native `<video>` players.

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM + SQLite |
| Auth | Cookie-based sessions with bcrypt |
| Video | Native browser APIs (getUserMedia + MediaRecorder) |
| State | Zustand |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Register, Login, Logout, Me
│   │   ├── spaces/        # CRUD spaces
│   │   ├── testimonials/  # CRUD + status management
│   │   ├── upload/        # Video file upload
│   │   ├── wall/          # Public wall API
│   │   └── seed/          # Demo data seeding
│   ├── layout.tsx
│   └── page.tsx           # Main SPA entry
├── components/
│   ├── kudos/
│   │   ├── auth-view.tsx
│   │   ├── dashboard-view.tsx
│   │   ├── space-detail-view.tsx
│   │   ├── submit-view.tsx
│   │   └── wall-of-love-view.tsx
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── auth.ts            # Session helpers
│   ├── db.ts              # Prisma client
│   ├── store.ts           # Zustand state
│   └── utils.ts
└── prisma/
    └── schema.prisma
```

---

## 🎨 Customization

### Theme Color

Each space has a `themeColor` that controls the Wall of Love accent. Set it when creating a space.

### White-Labeling

- Remove the "Powered by Kudos" footer in `wall-of-love-view.tsx`
- Replace the Heart icon/logo with your brand
- Customize card styles, fonts, and layout in the wall component

---

## 📄 License

Full IP Transfer & Master Resale Rights. Buyer can modify, rebrand, and resell. See [LICENSE.txt](./LICENSE.txt).

---

> **Stop paying $50/mo for Testimonial.to.** Self-hosted, white-label ready. Collect text & video testimonials and embed a beautiful Wall of Love. Uses native browser recording (Zero external API costs!). Full source code + resale rights included.
