# Gerenciador de Custos - Cost Management System

A comprehensive cost management application built with React, TypeScript, and Supabase.

## 🚀 Quick Start

### For Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

### For Production Deployment

**📖 See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for complete deployment instructions**

---

## 🎯 Features

- **User Authentication**: Secure login/register with email
- **Role-Based Access Control**: Admin and user roles
- **Subscription Management**: Integration with Stripe for payments
- **Cost Tracking**: Manage expenses, income, and refuelings
- **Company Management**: Track multiple companies
- **Vehicle Management**: Monitor vehicle costs and refuelings
- **Admin Dashboard**: User management and system configuration
- **Responsive Design**: Works on desktop and mobile

---

## 🏗️ Tech Stack

- **Frontend**: 
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - shadcn/ui components
  
- **Backend**: 
  - Supabase (PostgreSQL)
  - Edge Functions (Deno)
  - Row Level Security (RLS)
  
- **Authentication**: 
  - Supabase Auth
  - JWT tokens
  
- **Payments**: 
  - Stripe integration

---

## 📁 Project Structure

```
├── src/
│   ├── components/         # React components
│   │   ├── admin/         # Admin panel components
│   │   ├── auth/          # Authentication components
│   │   ├── common/        # Shared components
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── lib/               # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── integrations/      # External integrations (Supabase)
├── supabase/
│   ├── functions/         # Edge functions
│   ├── migrations/        # Database migrations
│   └── config.toml        # Supabase configuration
└── public/                # Static assets
```

---

## 🔐 Admin Access

### Default Admin Credentials (⚠️ CHANGE IMMEDIATELY)

- **Admin Panel**: `/admin`
- **Email**: `admin@gerenciadordecustos.com`
- **Password**: `Admin@2025!Temp`

**⚠️ CRITICAL**: Change this password immediately after first login!

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for detailed instructions on creating admin users.

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build           # Build for production
npm run preview         # Preview production build locally

# Testing
npm run test           # Run tests
npm run test:ui        # Run tests with UI

# Linting
npm run lint           # Check code quality
```

---

## 🔒 Security

This application implements multiple security layers:

1. **Row Level Security (RLS)** on all database tables
2. **Server-side role verification** for admin actions
3. **JWT-based authentication** with automatic token refresh
4. **Input validation** using Zod schemas
5. **Secure password hashing** handled by Supabase
6. **CORS protection** on Edge Functions

---

## 📦 Database Schema

### Tables

- **profiles**: User profile information
- **user_roles**: Role assignments (admin/user)
- **subscribers**: Subscription and payment data
- **companies**: Company records (to be implemented)
- **vehicles**: Vehicle information (to be implemented)
- **refuelings**: Fuel records (to be implemented)
- **incomes**: Income tracking (to be implemented)
- **expenses**: Expense tracking (to be implemented)

All tables have RLS policies to ensure data security.

---

## 🌐 Deployment

### Via Lovable (Recommended)

1. Open your project in Lovable
2. Click "Publish" button (top right)
3. Click "Update" to deploy
4. Your app is live at: `https://your-project.lovable.app`

### Via Custom Hosting

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for self-hosting instructions.

---

## 🧪 Environment Variables

Create a `.env` file (already configured in Lovable):

```env
VITE_SUPABASE_URL=https://axzlasnufiankujxlsah.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=axzlasnufiankujxlsah
```

**Note**: Never commit the actual `.env` file to version control!

---

## 📝 Key Features Documentation

### Authentication Flow

1. User registers via `/register` (2-step form)
2. Profile, role, and subscriber records created automatically (via trigger)
3. User can log in via `/login`
4. Session persisted in localStorage
5. Admin role checked against `user_roles` table (server-side)

### Admin Functions

Admins can:
- View all users
- Promote/demote users to admin
- Manage user subscriptions
- Delete users (with cascade to related data)

Access admin panel at `/admin` (requires admin role).

### Subscription System

- Integrated with Stripe
- Supports Premium and Enterprise tiers
- Automatic webhook handling via Edge Functions
- Customer portal for managing subscriptions

---

## 🐛 Troubleshooting

### "requested path is invalid" on login

**Solution**: Configure redirect URLs in Supabase:
1. Go to Auth → URL Configuration
2. Add your domain to Redirect URLs
3. Set Site URL to your production domain

### User can't access admin panel

**Solution**: Verify the user has admin role:
```sql
SELECT * FROM user_roles WHERE user_id = 'USER_ID';
```

### Subscription not updating

**Solution**: Check webhook configuration and Edge Function logs

---

## 📚 Additional Resources

- [Complete Production Setup Guide](./PRODUCTION_SETUP.md)
- [Security Checklist](./SECURITY_CHECKLIST.md)
- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🆘 Support

For issues or questions:
- Check [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) troubleshooting section
- Review Supabase logs
- Contact your development team

---

## ✅ Production Checklist

Before going live:

- [ ] Database migrations applied
- [ ] Admin user created and tested
- [ ] Default admin password changed
- [ ] Authentication redirect URLs configured
- [ ] RLS policies verified
- [ ] Edge functions deployed
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS enabled
- [ ] Email templates customized
- [ ] Error monitoring set up
- [ ] Backup strategy implemented

---

**🎉 Your application is ready for production!**

For detailed deployment instructions, see [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md).
