# GharKaSwad – Customer Application

GharKaSwad is a homemade food ordering platform that connects customers with nearby HomeChefs. It helps students, working professionals, and people living away from home enjoy fresh, hygienic, home-style meals prepared by local cooks.

The Customer Application provides a simple and responsive interface where users can explore homemade food, discover HomeChefs, place orders, manage subscriptions, earn reward points, and track their orders.

## Features

### 1. Explore Homemade Food  
- Browse available homemade food without logging in.
- Explore food categories.
- View food details, prices, images, and descriptions.
- Discover nearby HomeChefs.
- View HomeChef profiles and available food items.

### 2. Customer Authentication
- Customer registration and login.
- Email OTP-based registration verification.
- Secure authentication using JWT.
- Customers can browse the application without logging in.
- Login is required when placing an order or accessing protected features.

### 3. Cart & Food Ordering
- Add food items to the cart.
- Update item quantities.
- Remove items from the cart.
- Select a saved delivery address.
- Choose an available delivery option:
  - Chef Delivery
  - Customer Pickup
- Place food orders using supported payment methods.

### 4. Payment System
- Online payment integration.
- Cash on Delivery (COD), subject to eligibility.
- ₹20 discount on eligible online orders.
- ₹20 COD handling fee.
- Secure payment verification through the backend.

### 5. Meal Subscription
- Subscribe to meals for a flexible number of days.
- Select Breakfast, Lunch, and Dinner.
- Choose meals from different HomeChefs.
- Manage scheduled meals.
- Skip eligible meals or dates before the configured cutoff time.
- View subscription details and meal history.

### 6. Reward Points & Coupons
- Earn reward points according to completed subscription meals and platform rules.
- Track reward points in the customer account.
- Receive reward coupons after reaching the required points.
- Redeem eligible reward coupons according to platform rules.

### 7. Order Management
- View current and previous orders.
- Check order details.
- Track order status.
- View payment information.
- Access order history.

### 8. Customer Profile
- Manage personal information.
- Add, edit, and delete delivery addresses.
- View order history.
- Manage subscriptions.
- View reward points and coupons.

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Development server and build tool |
| Tailwind CSS | Responsive UI styling |
| React Router DOM | Application routing |
| Axios | Backend API communication |
| Lucide React | Icons |
| Node.js | Backend runtime |
| Express.js | Backend framework |
| MongoDB | Database |
| JWT | Authentication |
| Cloudinary | Image storage |
| Socket.IO | Real-time communication, where supported by the backend |
| Razorpay | Online payment integration, where configured |

## Project Structure

```text
Customer/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │
│   ├── pages/
│   │   ├── Home/
│   │   ├── Explore/
│   │   ├── FoodDetails/
│   │   ├── ChefProfile/
│   │   ├── Authentication/
│   │   ├── Cart/
│   │   ├── Checkout/
│   │   ├── Orders/
│   │   ├── Subscriptions/
│   │   ├── Rewards/
│   │   └── Profile/
│   │
│   ├── layouts/
│   ├── routes/
│   ├── services/
│   ├── context/
│   ├── hooks/
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── .gitignore
├── index.html
├── package.json
└── README.md
```

*Note: Folder structure may vary according to the actual implementation.*

## Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_CUSTOMER_REPOSITORY_URL
```

### 2. Navigate to Customer Folder

```bash
cd Customer
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the Customer project root.

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Replace the API URL with your deployed backend URL when deploying the application.

Use only the environment variables required by your actual frontend implementation. Never expose secret keys or private credentials in frontend environment variables.

### 5. Start Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### 6. Create Production Build

```bash
npm run build
```

### 7. Preview Production Build

```bash
npm run preview
```

## UI Theme & Design

GharKaSwad uses a consistent visual identity across its Customer, HomeChef, and Admin applications.

| Color | Hex Code |
|---|---|
| Primary Green | `#14513F` |
| Primary Orange | `#F6A23A` |
| Cream White | `#FFFDF8` |
| Dark Text | `#27352F` |
| Secondary Text | `#737B76` |
| Light Background | `#F7F8F5` |
| Border | `#E8ECE7` |

### Design Principles
- Premium and clean user interface.
- Mobile-first responsive design.
- Easy navigation and user-friendly experience.
- Consistent typography, spacing, and components.
- Mobile application-like navigation.
- Optimized food images and layouts.

## Responsive Support

The Customer Application is designed to work across:

- Mobile phones
- Tablets
- Laptops
- Desktop screens

## Important Notes

- Customers can explore food without logging in.
- Authentication is required for protected customer activities.
- All order, subscription, reward, payment, and wallet calculations are controlled by the backend.
- Frontend components must use the actual backend API responses.
- Payment success must be verified by the backend.
- Do not store sensitive payment or authentication secrets in frontend code.

## Future Enhancements

Potential future improvements include:
- Push notifications.
- Enhanced live order tracking.
- Improved HomeChef discovery.
- Mobile application packaging.
- Additional customer engagement features.

## Project

**GharKaSwad – Homemade Food, Made with Love.**

Connecting local HomeChefs with people who miss the taste of home-cooked food.