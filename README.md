# Mentorship Platform

## Overview
The Mentorship Platform is a web-based application designed to connect users with experienced mentors across various domains, including Business & Entrepreneurship, Career Growth & Professional Development, Social Impact & Non-Profit, and Legal Consulting. The platform facilitates both one-on-one mentorship and group sessions to provide accessible guidance and networking opportunities.

## Tech Stack
This project is built using the following modern technologies:

- **Vite** – Fast and optimized build tool for frontend development
- **TypeScript** – Ensures type safety and better developer experience
- **React** – Component-based UI development
- **shadcn-ui** – Pre-built UI components for streamlined development
- **Tailwind CSS** – Utility-first CSS framework for modern styling

## Features
- **User Authentication** – Secure login and registration
- **Mentor Directory** – Explore mentors across various categories
- **One-on-One Mentorship** – Direct booking of personalized mentorship sessions
- **Group Sessions** – Participate in expert-led discussions
- **User Dashboard** – Personalized dashboard with session tracking
- **Admin & Mentor Dashboard** – Manage bookings, schedules, and user engagement
- **Responsive UI** – Seamless experience across devices

## Project Structure
```
public/
├── favicon.ico
├── placeholder.svg
├── robots.txt
src/
├── components/
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx
│   │   ├── DashboardSkeleton.tsx
│   │   ├── SessionCard.tsx
│   │   ├── SessionsTab.tsx
│   │   ├── SessionsTabs.tsx
│   │   ├── StatCards.tsx
│   ├── profile/
│   │   ├── AccountTypeSection.tsx
│   │   ├── ProfileHeader.tsx
│   │   ├── ProfilePictureCard.tsx
│   ├── ui/  # Shadcn UI components
│   ├── Button.tsx
│   ├── FilterBar.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── MentorCard.tsx
│   ├── Navbar.tsx
│   ├── SessionCard.tsx
│   ├── TestimonialSection.tsx
├── contexts/
├── hooks/
├── integrations/
│   ├── supabase/
├── lib/
├── pages/
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── GroupSessions.tsx
│   ├── Index.tsx
│   ├── MentorDashboard.tsx
│   ├── MentorDirectory.tsx
│   ├── NotFound.tsx
│   ├── Profile.tsx
├── App.tsx
├── main.tsx
├── vite-env.d.ts
supabase/
├── functions/send-session-reminder/
│   ├── config.toml
.gitignore
README.md
package.json
vite.config.ts
```

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- Node.js (v18+ recommended)
- npm or bun

### Steps to Run the Project
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/mentorship-platform.git
   cd mentorship-platform
   ```
2. Install dependencies:
   ```sh
   npm install  # or bun install
   ```
3. Start the development server:
   ```sh
   npm run dev  # or bun dev
   ```
4. Open the application in your browser at:
   ```
   http://localhost:5173
   ```

## Configuration
### Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Contribution Guidelines
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch`
3. Make your changes and commit them: `git commit -m "Add new feature"`
4. Push to your fork: `git push origin feature-branch`
5. Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
For queries or contributions, reach out to [Your Email] or open an issue on GitHub.

---

This README provides a professional, structured, and highly detailed overview of your mentorship platform.

