# SecureAuth - Full-Stack Role-Based Authentication System

A modern, secure authentication system built with React, TypeScript, and Supabase, featuring role-based access control, user management, and CRUD operations.

## 🚀 Features

### Authentication & Authorization

- **Secure Signup**: Email/password registration with role selection (User/Admin)
- **JWT Authentication**: Token-based authentication via Supabase
- **Password Security**: Secure password hashing and validation
- **Role-Based Access Control**: Granular permissions for users and administrators
- **Protected Routes**: Automatic authentication guards and redirects

### User Management

- **User Dashboard**: Personal profile, role information, and activity stats
- **Admin Panel**: Complete user management with role promotion/demotion
- **Profile System**: User profiles with automatic creation on signup
- **User Statistics**: Real-time metrics for admins (total users, admins, items)

### CRUD Operations

- **Item Management**: Create, read, update, and delete user-specific items
- **Search & Filter**: Real-time search with status filtering
- **Pagination**: Clean pagination controls (10 items per page)
- **Sorting**: Sort by created date or updated date
- **Owner Tracking**: Admins can view all items with owner information

### Security Features

- **Row-Level Security (RLS)**: Database-level access control
- **Separate Roles Table**: Prevents privilege escalation attacks
- **Input Validation**: Zod schema validation on all forms
- **Security Definer Functions**: Prevents recursive RLS issues
- **Protected API Routes**: All endpoints require authentication

### UI/UX

- **Modern Design**: Professional SaaS-inspired interface with gradients
- **Responsive**: Mobile-first design that works on all devices
- **Dark Mode Ready**: Theme system with dark mode support
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Smooth loading indicators throughout

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Router** - Client-side routing
- **TanStack Query** - Server state management

### Backend

- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row-Level Security** - Database access control
- **JWT Tokens** - Authentication
- **Edge Functions** - Serverless functions (if needed)

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Local Development

1. **Clone the repository**

```bash
git clone <repository-url>
cd secureauth
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**

Create a `.env` file with your Supabase credentials:

```env
# .env.example
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

4. **Start development server**

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 🗄️ Database Schema

### Tables

#### `profiles`

- `id` (UUID, Primary Key) - References auth.users
- `name` (TEXT, NOT NULL) - User's full name
- `email` (TEXT, NOT NULL, UNIQUE) - User's email
- `created_at` (TIMESTAMPTZ) - Account creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

#### `user_roles`

- `id` (UUID, Primary Key)
- `user_id` (UUID, NOT NULL) - References auth.users
- `role` (app_role ENUM: 'user', 'admin')
- `created_at` (TIMESTAMPTZ)

#### `items`

- `id` (UUID, Primary Key)
- `user_id` (UUID, NOT NULL) - References auth.users
- `title` (TEXT, NOT NULL) - Item title
- `description` (TEXT) - Item description
- `status` (item_status ENUM: 'active', 'completed', 'archived')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Row-Level Security (RLS) Policies

#### profiles

- Users can view/update their own profile
- Admins can view all profiles

#### user_roles

- Users can view their own roles
- Admins can view and manage all roles

#### items

- Users can CRUD their own items
- Admins can view, update, and delete all items

## 🔑 API Endpoints (Supabase)

All endpoints are automatically handled by Supabase. Here's the conceptual API structure:

### Authentication

**POST** `/auth/signup`

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "options": {
    "data": {
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

**POST** `/auth/login`

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**GET** `/auth/me`

- Returns current user profile and roles
- Requires: Authorization header with JWT token

**POST** `/auth/logout`

- Clears authentication session

### Database Operations (via Supabase Client)

**Items CRUD**

- `GET /rest/v1/items` - List items (filtered by user/admin)
- `POST /rest/v1/items` - Create item
- `PATCH /rest/v1/items?id=eq.{id}` - Update item
- `DELETE /rest/v1/items?id=eq.{id}` - Delete item

**Admin Operations**

- `GET /rest/v1/profiles` - List all users (admin only)
- `GET /rest/v1/user_roles` - List all roles (admin only)
- `POST /rest/v1/user_roles` - Add role (admin only)
- `DELETE /rest/v1/user_roles` - Remove role (admin only)

## 🧪 Demo Credentials

After deployment, create test accounts:

**Admin Account**

- Email: admin@example.com
- Password: admin123456
- Role: Admin

**Regular User**

- Email: user@example.com
- Password: user123456
- Role: User

## 🚀 Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with one click

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify settings

## 📱 Routes

- `/` - Landing page with features
- `/signup` - User registration
- `/login` - User login
- `/dashboard` - User dashboard (protected)
- `/items` - Item management (protected)
- `/admin` - Admin panel (admin only)

## 🔒 Security Best Practices

1. **Input Validation**: All forms use Zod schemas
2. **Password Requirements**: Minimum 6 characters (increase for production)
3. **RLS Policies**: Database-level access control
4. **Separate Roles Table**: Prevents privilege escalation
5. **Security Definer Functions**: Prevents RLS recursion
6. **JWT Tokens**: Secure session management
7. **HTTPS Only**: Always use HTTPS in production

## 🎨 Customization

### Design System

The design system is defined in `src/index.css` and `tailwind.config.ts`:

```css
/* Custom colors */
--primary: 221 83% 53%;
--gradient-primary: linear-gradient(135deg, hsl(221 83% 53%), hsl(262 83% 58%));
--shadow-lg: 0 10px 40px -10px hsl(221 83% 53% / 0.2);
```

### Add New Roles

To add new roles beyond User/Admin:

1. Update the enum in migration:

```sql
ALTER TYPE public.app_role ADD VALUE 'moderator';
```

2. Update TypeScript types
3. Add RLS policies for new role
4. Update UI components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)

## 📞 Support

For support, email support@yourapp.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Email verification
- [ ] Password reset functionality
- [ ] OAuth providers (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Activity logs
- [ ] Export data functionality
- [ ] Bulk user operations
- [ ] Advanced analytics dashboard
