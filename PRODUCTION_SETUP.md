# Production Setup Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Creating the Admin User](#creating-the-admin-user)
5. [Local Development](#local-development)
6. [Production Deployment](#production-deployment)
7. [Environment Variables](#environment-variables)
8. [Security Configuration](#security-configuration)
9. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Overview

This is a cost management application built with:
- **Frontend**: React + Vite + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database + Authentication + Edge Functions)
- **Payments**: Stripe integration

---

## Prerequisites

Before deploying to production, ensure you have:
- Node.js 18+ and npm installed
- A Supabase project (already configured)
- Access to the Supabase dashboard
- (Optional) Stripe account for payment features

---

## Database Setup

### ✅ Database Tables Created

The following tables have been automatically created via migration:

1. **profiles** - User profile information
   - Stores: email, full_name, phone_number, address (JSONB)
   - Automatically populated on user signup via trigger

2. **user_roles** - Role-based access control
   - Stores: user_id, role (enum: 'admin' | 'user')
   - Used for admin authorization (server-side verified)

3. **subscribers** - Subscription management
   - Stores: subscription status, tier, Stripe IDs
   - Automatically created for each new user

### 🔒 Row Level Security (RLS)

All tables have RLS enabled with proper policies:
- Users can only view/edit their own data
- Admins have full access to all data (verified server-side)
- Role checks use security definer functions to prevent recursion

---

## Creating the Admin User

### Method 1: Via Supabase Dashboard (Recommended)

1. **Create the user account**:
   - Go to: https://supabase.com/dashboard/project/axzlasnufiankujxlsah/auth/users
   - Click "Add User" → "Create new user"
   - Email: `admin@gerenciadordecustos.com`
   - Password: `Admin@2025!Temp` (CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN)
   - Check "Auto Confirm User" to skip email verification

2. **Grant admin role**:
   - Go to: https://supabase.com/dashboard/project/axzlasnufiankujxlsah/editor
   - Run this SQL query in the SQL Editor:

   ```sql
   -- Replace 'USER_ID' with the actual user ID from step 1
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('USER_ID', 'admin')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

### Method 2: Via Application

1. **Register normally**: Go to `/register` and create an account with:
   - Email: `admin@gerenciadordecustos.com`
   - Password: Choose a strong password

2. **Manually promote to admin**: Run this SQL in Supabase Dashboard:
   ```sql
   -- Replace 'admin@gerenciadordecustos.com' with your email
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'admin'::app_role
   FROM auth.users
   WHERE email = 'admin@gerenciadordecustos.com'
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

### 📌 Default Admin Credentials

**⚠️ IMPORTANT: Change these immediately after first login!**

- **Admin Panel URL**: `https://your-domain.com/admin`
- **Default Admin Email**: `admin@gerenciadordecustos.com`
- **Default Admin Password**: `Admin@2025!Temp`

---

## Local Development

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd <project-directory>

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Environment Variables

Environment variables are automatically managed by Lovable. The `.env` file contains:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Public anon key
- `VITE_SUPABASE_PROJECT_ID` - Project reference ID

---

## Production Deployment

### Via Lovable (Recommended)

1. Click the "Publish" button in the Lovable editor (top right)
2. Click "Update" to deploy your latest changes
3. Your app will be live at: `https://your-project.lovable.app`

### Custom Domain Setup

1. Go to Project → Settings → Domains in Lovable
2. Click "Connect Domain"
3. Follow the DNS configuration instructions
4. Wait for DNS propagation (usually 5-60 minutes)

### Via Self-Hosting

If you prefer to self-host:

```bash
# Build for production
npm run build

# The build output will be in the 'dist' folder
# Deploy the contents of 'dist' to your hosting provider
# (Vercel, Netlify, AWS S3 + CloudFront, etc.)
```

**Important**: Configure these environment variables in your hosting provider:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

---

## Environment Variables

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://axzlasnufiankujxlsah.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=axzlasnufiankujxlsah
```

### Supabase Secrets (Edge Functions)

The following secrets are configured in Supabase:
- `SUPABASE_URL` - Automatically set
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically set
- `SUPABASE_DB_URL` - Automatically set

To add more secrets (e.g., for Stripe):
1. Go to: https://supabase.com/dashboard/project/axzlasnufiankujxlsah/settings/functions
2. Add secret key-value pairs
3. Access in edge functions via `Deno.env.get('SECRET_NAME')`

---

## Security Configuration

### Authentication Settings

Configure in Supabase Dashboard → Authentication:

1. **Email Settings** (`https://supabase.com/dashboard/project/axzlasnufiankujxlsah/auth/providers`)
   - Enable Email Provider
   - ✅ Confirm email: **DISABLE** for faster testing (enable in production)
   - ✅ Secure email change: **ENABLED**
   - ✅ Secure password change: **ENABLED**

2. **URL Configuration** (`https://supabase.com/dashboard/project/axzlasnufiankujxlsah/auth/url-configuration`)
   - Site URL: `https://your-production-domain.com`
   - Redirect URLs: Add all your domains:
     - `https://your-production-domain.com/**`
     - `http://localhost:5173/**` (for development)

### RLS Policies

All critical tables have RLS enabled:
- ✅ profiles
- ✅ user_roles  
- ✅ subscribers

**Never disable RLS** on these tables in production!

### Admin Authorization

Admin checks are performed **server-side** using the `has_role()` security definer function. Client-side checks in React components are for UI only—the database enforces actual permissions.

---

## Post-Deployment Checklist

### Required Actions

- [ ] Create admin user account
- [ ] Change default admin password
- [ ] Configure email redirect URLs in Supabase
- [ ] Test user registration flow
- [ ] Test admin panel access
- [ ] Verify RLS policies are working

### Optional Enhancements

- [ ] Set up custom domain
- [ ] Configure email templates (Supabase → Auth → Email Templates)
- [ ] Enable Google/GitHub OAuth (if needed)
- [ ] Set up monitoring and error tracking
- [ ] Configure backup strategy
- [ ] Add custom branding to emails

### Testing in Production

1. **User Registration**:
   - Go to `/register`
   - Create a new user
   - Verify profile is created automatically
   - Verify user can log in

2. **Admin Access**:
   - Log in with admin credentials
   - Go to `/admin`
   - Verify you can see all users
   - Test promoting a user to admin
   - Test subscription management

3. **Subscriptions** (if using Stripe):
   - Test subscription checkout flow
   - Verify webhook updates database
   - Check customer portal access

---

## Troubleshooting

### Common Issues

**Problem**: "requested path is invalid" error on login
- **Solution**: Check URL Configuration in Supabase (add redirect URLs)

**Problem**: User can't access admin panel despite being promoted
- **Solution**: Make sure the user logs out and back in to refresh their session

**Problem**: Multiple GoTrueClient instances warning
- **Solution**: This is just a warning (already fixed in code). Ignore if functionality works.

**Problem**: Subscription status not updating
- **Solution**: Check Stripe webhook configuration and edge function logs

### Getting Help

- **Supabase Logs**: https://supabase.com/dashboard/project/axzlasnufiankujxlsah/logs/explorer
- **Edge Function Logs**: https://supabase.com/dashboard/project/axzlasnufiankujxlsah/functions
- **Auth Logs**: https://supabase.com/dashboard/project/axzlasnufiankujxlsah/auth/users

---

## Security Best Practices

1. **Never commit secrets** to version control
2. **Always use environment variables** for sensitive data
3. **Keep RLS enabled** on all user-facing tables
4. **Change default passwords** immediately
5. **Use HTTPS** in production (automatic with Lovable)
6. **Validate all user inputs** (already implemented with zod)
7. **Monitor logs regularly** for suspicious activity
8. **Keep dependencies updated**: Run `npm audit` regularly

---

## Support

For issues or questions:
- Check the [Lovable documentation](https://docs.lovable.dev/)
- Visit [Supabase documentation](https://supabase.com/docs)
- Contact your development team

---

## Summary

✅ **Database**: Fully configured with RLS policies  
✅ **Authentication**: Secure, token-based auth with Supabase  
✅ **Admin System**: Role-based with server-side verification  
✅ **Production Ready**: All security measures implemented  

**Next Steps**:
1. Create your admin user following the guide above
2. Deploy to production using Lovable's Publish button
3. Configure your custom domain (optional)
4. Test everything thoroughly
5. Change the default admin password!

🎉 **Your application is ready for production!**
