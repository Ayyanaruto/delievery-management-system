# Rentkar - Delivery Management System

A comprehensive delivery management platform built with Next.js frontend and Node.js backend, designed to streamline order management and delivery partner coordination.

## 🚀 Features

### Admin Features
- **Dashboard Overview**: Real-time statistics of orders, partners, and deliveries
- **Order Management**: Create, view, update, and track delivery orders
- **Partner Management**: Manage delivery partners, view their status and performance
- **Order Assignment**: Assign orders to available delivery partners
- **Real-time Tracking**: Monitor order status and delivery progress

### Partner Features
- **Partner Dashboard**: View assigned orders and delivery statistics
- **Order Updates**: Update order status during delivery process
- **Status Management**: Set availability status (Available, On Break, Offline, etc.)
- **Order History**: Track completed and ongoing deliveries

### Core Functionalities
- **User Authentication**: Role-based access control (Admin/Partner)
- **Order Tracking**: Real-time order status updates
- **Geolocation Support**: Address coordinates for delivery tracking
- **Responsive Design**: Mobile-friendly interface
- **RESTful API**: Complete backend API for all operations

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI component library
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
  ```bash
  git clone <repository-url>
  cd rentkar
  ```

2. **Install dependencies**
  ```bash
  npm install:all
  ```

3. **Set up environment variables**

  Create a `.env` file in server folder and add the following variables:
  ```plaintext
  PORT=
  MONGODB_URI=mongodb://localhost:27017/rentkar
  JWT_SECRET=6676123317607578de6124211b14737d83c9db5e31de5e80485a570232658da89b7c1a7d97ebbcdd4975ee0243e25d44e36c47196d03f4a8790e30b41bbdbeb9
  NODE_ENV=development
  ```

  Create a `.env` file in web folder and add the following variables:
  ```plaintext
  NEXT_PUBLIC_API_URL=http://localhost:3000/api
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
  ```

  **How to get your Google Maps API key:**
  - Go to the [Google Cloud Console](https://console.cloud.google.com/)
  - Create a new project or select an existing one
  - Navigate to "APIs & Services" > "Credentials"
  - Click "Create credentials" and select "API key"
  - Enable the "Maps JavaScript API" for your project

4. **Seed the database**

  For initial data, you can seed the database with sample data. Run the following command in the root directory:
  ```bash
  npm run seed
  ```

5. **Start the development server**
  ```bash
  npm run dev
  ```

6. **Access the application**

  Open your browser and go to `http://localhost:3000` for the frontend and `http://localhost:5000` for the backend API.

## 📚 Documentation

[FEATURES.md](FEATURES.md) - Detailed feature list and user flows
