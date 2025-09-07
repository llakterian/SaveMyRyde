# SaveMyRyde 🚗

<p align="center">
  <img src="frontend/public/img/SaveMyRydebyDecabits.png" alt="SaveMyRyde Logo" width="600" />
</p>

## Kenya's Premier Vehicle Marketplace

SaveMyRyde is a modern, full-stack vehicle marketplace platform designed for the Kenyan market. It connects buyers and sellers of vehicles with a focus on trust, security, and ease of use.

## 🌟 Features

- **Multiple Payment Methods**: Credit cards, mobile money, bank transfers, cryptocurrency, and platform credits
- **Beautiful Modern UI**: Responsive design with science-backed color psychology
- **Credits System**: Earn and spend platform credits with cashback rewards
- **Subscription Plans**: Basic, Premium, and VIP tiers with escalating benefits
- **Referral Program**: Earn credits by referring friends
- **Vehicle Verification**: Professional inspection services
- **Enhanced Listings**: Tiered listing options with varying features
- **Admin Dashboard**: Comprehensive management tools

## 🚀 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- React Query

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- Redis
- JWT Authentication

### DevOps
- Docker & Docker Compose
- GitHub Actions

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## 🛠️ Installation

### Using Docker (Recommended)

1. Clone the repository:
   ```
   git clone https://github.com/llakterian/SaveMyRyde.git
   cd SaveMyRyde
   ```

2. Start all services:
   ```
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001
   - Email Testing: http://localhost:8025 (MailHog)

### Manual Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/llakterian/SaveMyRyde.git
   cd SaveMyRyde
   ```

2. Install dependencies:
   ```
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```

4. Start the development servers:
   ```
   npm run dev
   ```

## 🔍 Project Structure

```
SaveMyRyde/
├── backend/               # Node.js/Express API
│   ├── src/               # Source code
│   │   ├── config/        # Configuration files
│   │   ├── db/            # Database schemas and migrations
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── Dockerfile         # Backend Docker configuration
├── frontend/              # React application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main App component
│   │   └── main.tsx       # Entry point
│   └── Dockerfile         # Frontend Docker configuration
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # Project documentation
```

## 💳 Payment Integration

SaveMyRyde supports multiple payment methods:

- **Mobile Money**: M-Pesa, Airtel Money, T-Kash
- **Credit/Debit Cards**: Visa, Mastercard, American Express
- **Bank Transfers**: Direct bank deposits
- **Cryptocurrency**: Bitcoin, Ethereum, USDT, USDC
- **Platform Credits**: Internal credit system with cashback

## 👨‍💼 Admin Management

Access the admin platform at `/admin/login` with the default admin credentials:
- Username: `admin@savemyryde.co.ke`
- Password: `admin123` (change immediately after first login)

Key admin features:
- User management
- Listing approval/verification
- Payment verification
- Reports and analytics
- System settings

## 🌐 Deployment

### Netlify Deployment

1. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

2. Deploy the `frontend/dist` folder to Netlify

### Backend Deployment

The backend can be deployed to:
- Heroku
- Railway
- DigitalOcean App Platform
- Any VPS with Docker support

## 🎨 Color Psychology

SaveMyRyde implements science-backed color psychology to enhance user engagement:
- **Orange (#f0730a)**: Creates feelings of enthusiasm, excitement, and warmth
- **Teal (#14b8a6)**: Conveys trustworthiness, reliability, and security
- **White/Light Backgrounds**: Provides clarity and simplicity
- **Strategic Accent Colors**: Drives action and highlights important elements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For inquiries or support, please contact:
- Email: support@savemyryde.co.ke
- Website: https://savemyryde.co.ke

---

© 2024 SaveMyRyde. All rights reserved.