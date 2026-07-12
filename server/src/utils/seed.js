// src/utils/seed.js
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import connectDB from '../config/db.js';
import { ROLES, OWNER_STATUS, LISTING_STATUS, VEHICLE_STATUS, VEHICLE_TYPE, FUEL_TYPE, TRANSMISSION } from '../constants/index.js';

const vehiclesData = [
  {
    make: 'Tesla',
    model: 'Model Y',
    vehicleType: VEHICLE_TYPE.SUV,
    fuelType: FUEL_TYPE.ELECTRIC,
    transmission: TRANSMISSION.AUTOMATIC,
    registrationNumber: 'MH02EV2024',
    description: 'All-electric SUV with autopilot capabilities, pristine dual motor performance, premium sound system, and glass roof. Ideal for city tours or smooth highway getaways.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80',
        publicId: 'tesla_y_1',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
        publicId: 'tesla_y_2',
        isPrimary: false,
      }
    ],
    specifications: {
      year: 2023,
      seats: 5,
      doors: 5,
      mileage: 500, // 500 km range
      color: 'White',
      features: ['Autopilot', 'Panoramic Roof', 'Heated Seats', 'Wireless Charger', '360 Camera'],
    },
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      coordinates: { type: 'Point', coordinates: [72.8777, 19.0760] },
    },
    pricing: {
      daily: 8500,
      weekly: 55000,
      monthly: 180000,
      securityDeposit: 15000,
    },
    status: VEHICLE_STATUS.AVAILABLE,
    listingStatus: LISTING_STATUS.APPROVED,
    averageRating: 4.9,
    ratingCount: 12,
  },
  {
    make: 'BMW',
    model: '3 Series M Sport',
    vehicleType: VEHICLE_TYPE.CAR,
    fuelType: FUEL_TYPE.PETROL,
    transmission: TRANSMISSION.AUTOMATIC,
    registrationNumber: 'DL01C1234',
    description: 'Ultimate driving machine with premium leather interiors, high acceleration, adaptive suspension, and smart infotainment. Perfectly maintained.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
        publicId: 'bmw_3_1',
        isPrimary: true,
      }
    ],
    specifications: {
      year: 2022,
      seats: 5,
      doors: 4,
      mileage: 12,
      color: 'Black',
      features: ['Sports Mode', 'Harman Kardon Audio', 'Ambient Lighting', 'Adaptive Cruise'],
    },
    location: {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110001',
      coordinates: { type: 'Point', coordinates: [77.2090, 28.6139] },
    },
    pricing: {
      daily: 6500,
      weekly: 42000,
      monthly: 140000,
      securityDeposit: 10000,
    },
    status: VEHICLE_STATUS.AVAILABLE,
    listingStatus: LISTING_STATUS.APPROVED,
    averageRating: 4.8,
    ratingCount: 8,
  },
  {
    make: 'Hyundai',
    model: 'Creta',
    vehicleType: VEHICLE_TYPE.SUV,
    fuelType: FUEL_TYPE.DIESEL,
    transmission: TRANSMISSION.MANUAL,
    registrationNumber: 'KA51MD9876',
    description: 'Comfortable family SUV with high ground clearance, responsive diesel engine, and spacious boot. Excellent fuel economy and comfort.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
        publicId: 'creta_1',
        isPrimary: true,
      }
    ],
    specifications: {
      year: 2021,
      seats: 5,
      doors: 5,
      mileage: 16,
      color: 'Silver',
      features: ['Sunroof', 'Airbags', 'Rear AC Vents', 'Navigation'],
    },
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001',
      coordinates: { type: 'Point', coordinates: [77.5946, 12.9716] },
    },
    pricing: {
      daily: 2500,
      weekly: 16000,
      monthly: 50000,
      securityDeposit: 5000,
    },
    status: VEHICLE_STATUS.AVAILABLE,
    listingStatus: LISTING_STATUS.APPROVED,
    averageRating: 4.6,
    ratingCount: 22,
  },
  {
    make: 'Kawasaki',
    model: 'Ninja 400',
    vehicleType: VEHICLE_TYPE.BIKE,
    fuelType: FUEL_TYPE.PETROL,
    transmission: TRANSMISSION.MANUAL,
    registrationNumber: 'MH12RN8888',
    description: 'Sporty parallel-twin entry-level superbike. High revving, lightweight, and perfect for weekend highway carving.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
        publicId: 'ninja_1',
        isPrimary: true,
      }
    ],
    specifications: {
      year: 2022,
      seats: 2,
      doors: 0,
      mileage: 25,
      color: 'Lime Green',
      features: ['ABS', 'Slipper Clutch', 'LED Headlights'],
    },
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400050',
      coordinates: { type: 'Point', coordinates: [72.83, 19.05] },
    },
    pricing: {
      daily: 1800,
      weekly: 11000,
      monthly: 32000,
      securityDeposit: 3000,
    },
    status: VEHICLE_STATUS.AVAILABLE,
    listingStatus: LISTING_STATUS.APPROVED,
    averageRating: 4.7,
    ratingCount: 15,
  },
  {
    make: 'Ather',
    model: '450X Gen 3',
    vehicleType: VEHICLE_TYPE.SCOOTER,
    fuelType: FUEL_TYPE.ELECTRIC,
    transmission: TRANSMISSION.AUTOMATIC,
    registrationNumber: 'MH02EV5566',
    description: 'Fast, premium smart electric scooter. Loaded with Google Maps navigation, warp mode, and a robust battery pack.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1695662121735-373809fb3f9f?auto=format&fit=crop&w=800&q=80',
        publicId: 'ather_1',
        isPrimary: true,
      }
    ],
    specifications: {
      year: 2023,
      seats: 2,
      doors: 0,
      mileage: 105, // 105 km range
      color: 'Space Grey',
      features: ['Touchscreen Dashboard', 'Navigation', 'Reverse Mode', 'Bluetooth Keys'],
    },
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400064',
      coordinates: { type: 'Point', coordinates: [72.85, 19.18] },
    },
    pricing: {
      daily: 600,
      weekly: 3800,
      monthly: 12000,
      securityDeposit: 2000,
    },
    status: VEHICLE_STATUS.AVAILABLE,
    listingStatus: LISTING_STATUS.APPROVED,
    averageRating: 4.9,
    ratingCount: 41,
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('Creating demo users...');
    const demoPassword = 'Demo@1234';

    const customer = await User.create({
      name: 'Demo Customer',
      email: 'customer@demo.com',
      password: demoPassword,
      role: ROLES.CUSTOMER,
      phone: '9876543210',
      isEmailVerified: true,
    });

    const owner = await User.create({
      name: 'Demo Owner',
      email: 'owner@demo.com',
      password: demoPassword,
      role: ROLES.OWNER,
      ownerStatus: OWNER_STATUS.APPROVED,
      businessName: 'RentiGo Premium Fleet',
      phone: '9876543211',
      isEmailVerified: true,
    });

    const admin = await User.create({
      name: 'Demo Admin',
      email: 'admin@demo.com',
      password: demoPassword,
      role: ROLES.ADMIN,
      phone: '9876543212',
      isEmailVerified: true,
    });

    console.log('Creating vehicles...');
    const vehiclesWithOwners = vehiclesData.map(v => ({
      ...v,
      owner: owner._id,
    }));

    await Vehicle.create(vehiclesWithOwners);
    console.log('Database seeded successfully! 🎉');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding database failed:', error);
    process.exit(1);
  }
};

seedDB();
