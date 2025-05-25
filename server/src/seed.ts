import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import models using TypeScript imports
import User from './api/v1/auth/auth.model';
import Order from './api/v1/orders/orders.model';
import { OrderStatus } from './api/v1/orders/orders.types';
import Partner from './api/v1/partners/partner.model';
import { DELIVERY_PARTNER_STATUS, ROLE } from './constants/constant';

dotenv.config();

// Sample data
const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@rentkar.com",
    password: "admin123",
    role: ROLE.ADMIN
  },
  {
    name: "John Doe",
    email: "john.doe@partner.com",
    password: "partner123",
    role: ROLE.PARTNER
  },
  {
    name: "Jane Smith",
    email: "jane.smith@partner.com",
    password: "partner123",
    role: ROLE.PARTNER
  },
  {
    name: "Mike Johnson",
    email: "mike.johnson@partner.com",
    password: "partner123",
    role: ROLE.PARTNER
  },
  {
    name: "Sarah Wilson",
    email: "sarah.wilson@partner.com",
    password: "partner123",
    role: ROLE.PARTNER
  }
];

const samplePartners = [
  {
    name: "John Doe",
    email: "john.doe@partner.com",
    phone: "9876543210",
    status: DELIVERY_PARTNER_STATUS.AVAILABLE
  },
  {
    name: "Jane Smith",
    email: "jane.smith@partner.com",
    phone: "9876543211",
    status: DELIVERY_PARTNER_STATUS.ON_DELIVERY
  },
  {
    name: "Mike Johnson",
    email: "mike.johnson@partner.com",
    phone: "9876543212",
    status: DELIVERY_PARTNER_STATUS.ON_BREAK
  },
  {
    name: "Sarah Wilson",
    email: "sarah.wilson@partner.com",
    phone: "9876543213",
    status: DELIVERY_PARTNER_STATUS.OFFLINE
  }
];

const sampleOrders = [
  {
    customer: "Alice Brown",
    customerPhone: "9123456789",
    deliveryAddress: "123 Main St, Downtown, City",
    pickupAddress: "456 Oak Ave, Business District, City",
    pickupAddressCord: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // Delhi coordinates
    },
    deliveryAddressCord: {
      type: 'Point',
      coordinates: [77.2310, 28.6129] // Delhi coordinates
    },
    items: ["Laptop", "Mouse", "Keyboard"],
    status: OrderStatus.PENDING
  },
  {
    customer: "Bob Johnson",
    customerPhone: "9123456788",
    deliveryAddress: "789 Pine St, Residential Area, City",
    pickupAddress: "321 Elm St, Commercial Zone, City",
    pickupAddressCord: {
      type: 'Point',
      coordinates: [77.1910, 28.6339]
    },
    deliveryAddressCord: {
      type: 'Point',
      coordinates: [77.2410, 28.5929]
    },
    items: ["Mobile Phone", "Charger", "Case"],
    status: OrderStatus.ASSIGNED
  },
  {
    customer: "Carol Davis",
    customerPhone: "9123456787",
    deliveryAddress: "456 Maple Dr, Suburb, City",
    pickupAddress: "789 Cedar Ln, Industrial Area, City",
    pickupAddressCord: {
      type: 'Point',
      coordinates: [77.1710, 28.6539]
    },
    deliveryAddressCord: {
      type: 'Point',
      coordinates: [77.2610, 28.5729]
    },
    items: ["Tablet", "Stylus"],
    status: OrderStatus.IN_PROGRESS
  },
  {
    customer: "David Miller",
    customerPhone: "9123456786",
    deliveryAddress: "123 Birch St, Old Town, City",
    pickupAddress: "654 Spruce Ave, Tech Park, City",
    pickupAddressCord: {
      type: 'Point',
      coordinates: [77.1510, 28.6739]
    },
    deliveryAddressCord: {
      type: 'Point',
      coordinates: [77.2810, 28.5529]
    },
    items: ["Camera", "Lens", "Tripod"],
    status: OrderStatus.DELIVERED
  },
  {
    customer: "Eva Garcia",
    customerPhone: "9123456785",
    deliveryAddress: "987 Willow Rd, New District, City",
    pickupAddress: "432 Palm St, Shopping Center, City",
    pickupAddressCord: {
      type: 'Point',
      coordinates: [77.1310, 28.6939]
    },
    deliveryAddressCord: {
      type: 'Point',
      coordinates: [77.3010, 28.5329]
    },
    items: ["Headphones", "Speaker"],
    status: OrderStatus.CANCELLED
  }
];

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rentkar';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Partner.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

async function seedUsers() {
  try {
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password)
      }))
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

async function seedPartners() {
  try {
    const createdPartners = await Partner.insertMany(samplePartners);
    console.log(`✅ Created ${createdPartners.length} partners`);
    return createdPartners;
  } catch (error) {
    console.error('❌ Error seeding partners:', error);
    throw error;
  }
}

async function seedOrders(partners: any[]) {
  try {
    // Assign some orders to partners
    const ordersWithAssignments = sampleOrders.map((order, index) => {
      if (order.status === OrderStatus.ASSIGNED || order.status === OrderStatus.IN_PROGRESS) {
        // Assign to available partners
        const availablePartners = partners.filter((p: any) =>
          p.status === DELIVERY_PARTNER_STATUS.AVAILABLE ||
          p.status === DELIVERY_PARTNER_STATUS.ON_DELIVERY
        );
        if (availablePartners.length > 0) {
          const partnerIndex = index % availablePartners.length;
          return {
            ...order,
            assignedTo: availablePartners[partnerIndex]._id
          };
        }
      }
      return order;
    });

    const createdOrders = await Order.insertMany(ordersWithAssignments);
    console.log(`✅ Created ${createdOrders.length} orders`);
    for (const order of createdOrders) {
      if (order.assignedTo) {
        await Partner.findByIdAndUpdate(
          order.assignedTo,
          { $push: { assignedOrders: order._id } }
        );
      }
    }

    return createdOrders;
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    throw error;
  }
}

async function updateUserPartnerIds(users: any[], partners: any[]) {
  try {
    for (let i = 0; i < partners.length; i++) {
      const partnerUser = users.find((user: any) => user.email === partners[i].email);
      if (partnerUser) {
        await User.findByIdAndUpdate(
          partnerUser._id,
          { partnerId: partners[i]._id }
        );
      }
    }
    console.log('✅ Updated user-partner relationships');
  } catch (error) {
    console.error('❌ Error updating user-partner relationships:', error);
    throw error;
  }
}

async function displaySeedSummary() {
  try {
    const userCount = await User.countDocuments();
    const partnerCount = await Partner.countDocuments();
    const orderCount = await Order.countDocuments();

    console.log('\n📊 Seed Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Partners: ${partnerCount}`);
    console.log(`   Orders: ${orderCount}`);

    console.log('\n👤 Sample Login Credentials:');
    console.log('   Admin: admin@rentkar.com / admin123');
    console.log('   Partner: john.doe@partner.com / partner123');
    console.log('   Partner: jane.smith@partner.com / partner123');

    console.log('\n📱 Partner Phone Numbers:');
    samplePartners.forEach(partner => {
      console.log(`   ${partner.name}: ${partner.phone}`);
    });

  } catch (error) {
    console.error('❌ Error displaying summary:', error);
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    await connectDatabase();
    await clearDatabase();

    const users = await seedUsers();
    const partners = await seedPartners();
    await seedOrders(partners);

    await updateUserPartnerIds(users, partners);
    await displaySeedSummary();

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📕 Database connection closed');
    process.exit(0);
  }
}

// Run the seed script
if (require.main === module) {
  seedDatabase();
}

export {
  clearDatabase,
  connectDatabase,
  seedDatabase
};
