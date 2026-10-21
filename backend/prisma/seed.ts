import { PrismaClient, Role, VerificationStatus, DocumentType, PricingType, BookingStatus, BookingType, InvoiceStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('🌱 Starting VoltFix Database Seeding...');

  // Hash standard passwords
  const passwordAdmin = await bcrypt.hash('Admin@12345', 10);
  const passwordElectrician = await bcrypt.hash('Electrician@123', 10);
  const passwordCustomer = await bcrypt.hash('Customer@123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@voltfix.com' },
    update: {
      name: 'Abu Bakar Rakib',
      avatarUrl: '/avatar-rakib.png',
    },
    create: {
      name: 'Abu Bakar Rakib',
      email: 'admin@voltfix.com',
      password: passwordAdmin,
      phone: '+8801700000001',
      role: Role.ADMIN,
      isVerified: true,
      avatarUrl: '/avatar-rakib.png',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // 2. Create Categories
  const categoryData = [
    {
      name: 'Emergency Repairs',
      slug: 'emergency-repairs',
      description: 'Rapid response for short circuits, sparking panels, power outages, and electrical hazards.',
      iconUrl: 'Zap',
    },
    {
      name: 'Residential Wiring',
      slug: 'residential-wiring',
      description: 'Full home wiring, rewiring older homes, adding new switchboards and power points.',
      iconUrl: 'Home',
    },
    {
      name: 'Panel & Breaker Upgrades',
      slug: 'panel-breaker-upgrades',
      description: 'Main service panel upgrades (100A to 200A+), modern circuit breakers, surge protectors.',
      iconUrl: 'Cpu',
    },
    {
      name: 'Lighting & Ceiling Fans',
      slug: 'lighting-ceiling-fans',
      description: 'Chandelier mounting, recessed LED downlights, ceiling fan balancing, outdoor security floodlights.',
      iconUrl: 'Sun',
    },
    {
      name: 'EV Charger Installation',
      slug: 'ev-charger-installation',
      description: 'Level 2 EV fast charger stations, Tesla wall connectors, dedicated high-amperage sub-panels.',
      iconUrl: 'BatteryCharging',
    },
    {
      name: 'Solar & Inverter Setup',
      slug: 'solar-inverter-setup',
      description: 'Grid-tie & hybrid solar inverters, IPS battery banks, transfer switches and clean energy wiring.',
      iconUrl: 'ShieldCheck',
    },
    {
      name: 'Appliance & HVAC Circuits',
      slug: 'appliance-hvac-circuits',
      description: 'Dedicated circuits for AC compressors, water geysers, induction ovens, and commercial washers.',
      iconUrl: 'Wrench',
    },
    {
      name: 'Commercial & 3-Phase',
      slug: 'commercial-industrial',
      description: 'Commercial facilities, 3-phase machinery wiring, load balancing, safety compliance certificates.',
      iconUrl: 'Layers',
    },
  ];

  const categories = [];
  for (const cat of categoryData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(c);
  }
  console.log(`✅ ${categories.length} Categories seeded.`);

  // 3. Create 10 Electricians
  const electricianSeeds = [
    {
      name: 'Tariqul Islam',
      email: 'tariqul.electric@gmail.com',
      phone: '+8801811223344',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: 'Licensed Master Electrician with 12+ years experience specializing in smart panel upgrades, commercial 3-phase systems, and round-the-clock emergency diagnostics.',
      experienceYears: 12,
      skills: ['Emergency Troubleshooting', '3-Phase Wiring', 'Smart Home Panels', 'Industrial Sub-stations'],
      serviceRadiusKm: 20.0,
      latitude: 23.7925,
      longitude: 90.4078, // Gulshan, Dhaka
      addressText: 'Road 11, Block D, Gulshan 1',
      city: 'Dhaka',
      hourlyRate: 450.0,
      emergencyAvailable: true,
      verificationStatus: VerificationStatus.APPROVED,
    },
    {
      name: 'Shahidul Alam',
      email: 'shahidul.alam@voltfix.com',
      phone: '+8801722334455',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      bio: 'Certified electrical technician for residential properties. Certified for Level 2 EV Chargers & Modern LED installations with flawless customer ratings.',
      experienceYears: 8,
      skills: ['EV Chargers', 'Panel Upgrades', 'LED Architecture', 'Surge Protection'],
      serviceRadiusKm: 15.0,
      latitude: 23.8699,
      longitude: 90.3995, // Uttara, Dhaka
      addressText: 'Sector 7, Uttara Model Town',
      city: 'Dhaka',
      hourlyRate: 350.0,
      emergencyAvailable: true,
      verificationStatus: VerificationStatus.APPROVED,
    },
    {
      name: 'Mahmudur Rahman',
      email: 'mahmud.volt@gmail.com',
      phone: '+8801933445566',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
      bio: 'Solar energy & hybrid inverter specialist. I help homeowners and businesses slash their electricity bills with safe, high-durability battery and panel setups.',
      experienceYears: 10,
      skills: ['Solar Inverters', 'IPS Batteries', 'Load Balancing', 'Generator ATS'],
      serviceRadiusKm: 25.0,
      latitude: 23.7461,
      longitude: 90.3742, // Dhanmondi, Dhaka
      addressText: 'Road 8A, Dhanmondi',
      city: 'Dhaka',
      hourlyRate: 400.0,
      emergencyAvailable: false,
      verificationStatus: VerificationStatus.APPROVED,
    },
    {
      name: 'Anisur Zaman',
      email: 'anis.spark@gmail.com',
      phone: '+8801644556677',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
      bio: 'Fastest emergency responder in Mirpur and surrounding zones. Fast diagnosis of breaker trips, wire burns, and water pump electrical faults.',
      experienceYears: 7,
      skills: ['Emergency Repairs', 'Pump Motors', 'Circuit Breakers', 'Earthing Testing'],
      serviceRadiusKm: 12.0,
      latitude: 23.8041,
      longitude: 90.3687, // Mirpur, Dhaka
      addressText: 'Section 10, Mirpur',
      city: 'Dhaka',
      hourlyRate: 300.0,
      emergencyAvailable: true,
      verificationStatus: VerificationStatus.APPROVED,
    },
    {
      name: 'Kamrul Hassan',
      email: 'kamrul.power@gmail.com',
      phone: '+8801755667788',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      bio: 'Certified industrial & commercial contractor. Expert in factory installations, switchgear maintenance, transformer testing, and code compliance.',
      experienceYears: 15,
      skills: ['Commercial', 'Switchgear', 'Transformers', 'Energy Audits'],
      serviceRadiusKm: 30.0,
      latitude: 23.7772,
      longitude: 90.4194, // Badda / Rampura
      addressText: 'Merul Badda, Progoti Shoroni',
      city: 'Dhaka',
      hourlyRate: 550.0,
      emergencyAvailable: false,
      verificationStatus: VerificationStatus.APPROVED,
    },
    {
      name: 'Farhan Kabir',
      email: 'farhan.fix@gmail.com',
      phone: '+8801866778899',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
      bio: 'High-end interior lighting designer and technician. Specializing in ambient cove lights, smart wireless dimmers, and complex chandelier hangings.',
      experienceYears: 6,
      skills: ['Smart Dimmers', 'Chandelier Installation', 'Recessed Downlights', 'Landscape Lighting'],
      serviceRadiusKm: 15.0,
      latitude: 23.7937,
      longitude: 90.4066, // Banani
      addressText: 'Block C, Banani',
      city: 'Dhaka',
      hourlyRate: 380.0,
      emergencyAvailable: true,
      verificationStatus: VerificationStatus.APPROVED,
    },
    {
      name: 'Rafiqul Islam',
      email: 'rafiqul.tech@gmail.com',
      phone: '+8801977889900',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      bio: 'HVAC and high-voltage appliance circuits specialist. AC lines, heavy geyser circuits, bakery ovens, and industrial compressors.',
      experienceYears: 9,
      skills: ['AC Power Lines', 'Geyser Wiring', 'Heavy Appliance Isolation', 'Leakage Detection'],
      serviceRadiusKm: 18.0,
      latitude: 23.7334,
      longitude: 90.3854, // New Market / Lalbagh
      addressText: 'Azimpur Estate',
      city: 'Dhaka',
      hourlyRate: 320.0,
      emergencyAvailable: true,
      verificationStatus: VerificationStatus.APPROVED,
    },
    {
      name: 'Zahid Hossain',
      email: 'zahid.ev@voltfix.com',
      phone: '+8801688990011',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      bio: 'Pioneer in Electric Vehicle EVSE infrastructure. Level 1, 2, and DC fast charger installations with integrated load shedding logic.',
      experienceYears: 11,
      skills: ['Tesla Wall Connector', 'EV Chargers', 'Sub-panel Expansion', 'Earth Pits'],
      serviceRadiusKm: 25.0,
      latitude: 23.8223,
      longitude: 90.4274, // Bashundhara R/A
      addressText: 'Block D, Bashundhara R/A',
      city: 'Dhaka',
      hourlyRate: 500.0,
      emergencyAvailable: true,
      verificationStatus: VerificationStatus.APPROVED,
    },
    {
      name: 'Nasir Uddin',
      email: 'nasir.pending@voltfix.com',
      phone: '+8801799001122',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      bio: 'Experienced wireman with 5 years in new residential buildings. Currently undergoing official VoltFix verification.',
      experienceYears: 5,
      skills: ['House Wiring', 'Socket Replacement', 'Ceiling Fans'],
      serviceRadiusKm: 10.0,
      latitude: 23.7509,
      longitude: 90.3934, // Tejgaon
      addressText: 'Tejgaon Industrial Area',
      city: 'Dhaka',
      hourlyRate: 250.0,
      emergencyAvailable: false,
      verificationStatus: VerificationStatus.PENDING,
    },
    {
      name: 'Babul Akhter',
      email: 'babul.rejected@voltfix.com',
      phone: '+8801811002233',
      avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400',
      bio: 'Electrician apprentice with documentation discrepancy during background check.',
      experienceYears: 2,
      skills: ['Basic Repairs'],
      serviceRadiusKm: 8.0,
      latitude: 23.7104,
      longitude: 90.4074, // Old Dhaka
      addressText: 'Armanitola, Old Dhaka',
      city: 'Dhaka',
      hourlyRate: 20.0,
      emergencyAvailable: false,
      verificationStatus: VerificationStatus.REJECTED,
      rejectionReason: 'Invalid trade certificate copy provided. Re-submission required.',
    },
  ];

  const electricianProfiles = [];

  for (let i = 0; i < electricianSeeds.length; i++) {
    const s = electricianSeeds[i];
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        password: passwordElectrician,
        phone: s.phone,
        avatarUrl: s.avatarUrl,
        role: Role.ELECTRICIAN,
        isVerified: true,
      },
    });

    const portfolioPhotos = [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
    ];

    const profile = await prisma.electricianProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: s.bio,
        experienceYears: s.experienceYears,
        skills: s.skills,
        serviceRadiusKm: s.serviceRadiusKm,
        latitude: s.latitude,
        longitude: s.longitude,
        addressText: s.addressText,
        city: s.city,
        isOnline: true,
        verificationStatus: s.verificationStatus,
        rejectionReason: (s as any).rejectionReason || null,
        hourlyRate: s.hourlyRate,
        emergencyAvailable: s.emergencyAvailable,
        portfolioPhotos,
      },
    });

    // Verification documents
    await prisma.verificationDocument.createMany({
      data: [
        {
          electricianProfileId: profile.id,
          documentType: DocumentType.GOVERNMENT_ID,
          documentUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
          documentNumber: `NID-${1000000000 + i}`,
          verificationStatus: s.verificationStatus,
          reviewedAt: s.verificationStatus === VerificationStatus.APPROVED ? new Date() : null,
        },
        {
          electricianProfileId: profile.id,
          documentType: DocumentType.TRADE_LICENSE,
          documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
          documentNumber: `TL-2024-${8800 + i}`,
          verificationStatus: s.verificationStatus,
          reviewedAt: s.verificationStatus === VerificationStatus.APPROVED ? new Date() : null,
        },
      ],
      skipDuplicates: true,
    });

    // Weekly availability (Monday through Saturday, 08:00 to 20:00)
    for (let day = 1; day <= 6; day++) {
      await prisma.availabilitySlot.create({
        data: {
          electricianProfileId: profile.id,
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '20:00',
          isActive: true,
        },
      });
    }

    // Services
    if (s.verificationStatus === VerificationStatus.APPROVED) {
      await prisma.service.createMany({
        data: [
          {
            electricianProfileId: profile.id,
            categoryId: categories[0].id, // Emergency
            title: 'Emergency Diagnostic & Circuit Isolation',
            description: 'Immediate dispatch to identify tripped circuits, overheated connections, or grounding failures.',
            pricingType: PricingType.INSPECTION,
            basePrice: 40.0,
            estimatedDurationMin: 60,
          },
          {
            electricianProfileId: profile.id,
            categoryId: categories[1].id, // Residential
            title: 'Complete Room Switch & Fixture Rewire',
            description: 'Replacement of wiring, fireproof conduit installation, and grounding wire verification.',
            pricingType: PricingType.FIXED,
            basePrice: 120.0,
            estimatedDurationMin: 180,
          },
          {
            electricianProfileId: profile.id,
            categoryId: categories[2].id, // Panel
            title: 'Modern Breaker Box Overhaul',
            description: 'Replace dangerous old porcelain fuses with dual-pole RCBO breakers and surge suppression.',
            pricingType: PricingType.FIXED,
            basePrice: 220.0,
            estimatedDurationMin: 240,
          },
        ],
      });
    }

    electricianProfiles.push(profile);
  }
  console.log(`✅ ${electricianProfiles.length} Electricians seeded.`);

  // 4. Create 10 Customers
  const customerSeeds = [
    { name: 'Arif Chowdhury', email: 'arif.chowdhury@gmail.com', phone: '+8801711122233', lat: 23.7925, lng: 90.4078, street: 'House 42, Road 12, Gulshan 1' },
    { name: 'Nusrat Jahan', email: 'nusrat.jahan@gmail.com', phone: '+8801822233344', lat: 23.8710, lng: 90.4010, street: 'House 14, Sector 3, Uttara' },
    { name: 'Tanvir Ahmed', email: 'tanvir.ahmed@gmail.com', phone: '+8801933344455', lat: 23.7480, lng: 90.3750, street: 'Apartment 5B, Road 6, Dhanmondi' },
    { name: 'Sabrina Rahman', email: 'sabrina.r@gmail.com', phone: '+8801644455566', lat: 23.8230, lng: 90.4280, street: 'Plot 210, Road 4, Bashundhara' },
    { name: 'Imtiaz Hasan', email: 'imtiaz.hasan@gmail.com', phone: '+8801755566677', lat: 23.7780, lng: 90.4210, street: 'House 8, Middle Badda' },
    { name: 'Sadia Afreen', email: 'sadia.afreen@gmail.com', phone: '+8801866677788', lat: 23.7940, lng: 90.4070, street: 'Road 11, Block D, Banani' },
    { name: 'Faisal Karim', email: 'faisal.karim@gmail.com', phone: '+8801977788899', lat: 23.8050, lng: 90.3700, street: 'Section 6, Mirpur' },
    { name: 'Mehnaz Parveen', email: 'mehnaz.p@gmail.com', phone: '+8801688899900', lat: 23.7340, lng: 90.3860, street: 'Lalbagh Road' },
    { name: 'Rashid Khan', email: 'rashid.khan@gmail.com', phone: '+8801799900011', lat: 23.7800, lng: 90.4000, street: 'Mohakhali DOHS' },
    { name: 'Zarin Tasnim', email: 'zarin.tasnim@gmail.com', phone: '+8801811122299', lat: 23.7510, lng: 90.3940, street: 'Tejgaon Farmgate' },
  ];

  const customers = [];
  for (const c of customerSeeds) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        password: passwordCustomer,
        phone: c.phone,
        role: Role.CUSTOMER,
        isVerified: true,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name)}`,
      },
    });

    await prisma.address.create({
      data: {
        userId: user.id,
        label: 'Home',
        street: c.street,
        city: 'Dhaka',
        latitude: c.lat,
        longitude: c.lng,
        isDefault: true,
      },
    });

    customers.push(user);
  }
  console.log(`✅ ${customers.length} Customers seeded.`);

  // 5. Seed Sample Bookings, Status Histories, Invoices, Payments, Reviews
  const approvedElectricians = electricianProfiles.filter(e => e.verificationStatus === VerificationStatus.APPROVED);

  // Booking 1: COMPLETED with Review & Payment & Invoice
  const b1Date = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000); // 4 days ago
  const booking1 = await prisma.booking.create({
    data: {
      bookingNumber: 'VF-2026-1001',
      customerId: customers[0].id,
      electricianId: approvedElectricians[0].id,
      status: BookingStatus.COMPLETED,
      type: BookingType.DIRECT,
      isEmergency: true,
      problemDescription: 'Frequent breaker trip in the kitchen whenever microwave and induction run together. Smelled hot plastic.',
      scheduledAt: b1Date,
      estimatedDurationMin: 90,
      addressStreet: 'House 42, Road 12, Gulshan 1',
      addressCity: 'Dhaka',
      addressLat: 23.7925,
      addressLng: 90.4078,
      customerPhone: customers[0].phone!,
      electricianPhone: '+8801811223344',
    },
  });

  await prisma.bookingPhoto.create({
    data: {
      bookingId: booking1.id,
      photoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      caption: 'Breaker box showing charred neutral connector',
    },
  });

  // Status histories for Booking 1
  const b1Transitions = [
    { from: null, to: BookingStatus.PENDING, reason: 'Booking requested by customer' },
    { from: BookingStatus.PENDING, to: BookingStatus.ACCEPTED, reason: 'Accepted by Tariqul Islam' },
    { from: BookingStatus.ACCEPTED, to: BookingStatus.ON_THE_WAY, reason: 'Electrician on the way via motorbike' },
    { from: BookingStatus.ON_THE_WAY, to: BookingStatus.IN_PROGRESS, reason: 'Diagnosis and replacement started' },
    { from: BookingStatus.IN_PROGRESS, to: BookingStatus.COMPLETED, reason: 'Dual 32A breaker installed and load tested' },
  ];

  for (const t of b1Transitions) {
    await prisma.bookingStatusHistory.create({
      data: {
        bookingId: booking1.id,
        fromStatus: t.from,
        toStatus: t.to,
        changedByUserId: approvedElectricians[0].userId,
        reason: t.reason,
      },
    });
  }

  // Invoice for Booking 1
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-001',
      bookingId: booking1.id,
      electricianId: approvedElectricians[0].id,
      customerId: customers[0].id,
      laborCost: 45.0,
      partsCost: 35.0,
      tax: 4.0,
      platformFee: 4.0,
      totalAmount: 88.0,
      items: [
        { description: 'Emergency electrical diagnostic & isolation', cost: 45.0 },
        { description: 'Schneider 32A C-curve Miniature Circuit Breaker', cost: 25.0 },
        { description: 'Heavy duty insulated copper connecting lugs', cost: 10.0 },
      ],
      notes: 'Work guaranteed for 90 days. Load test passed at 3.8kW sustained.',
      status: InvoiceStatus.PAID,
      approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Payment for Booking 1
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      invoiceId: invoice1.id,
      customerId: customers[0].id,
      amount: 88.0,
      currency: 'USD',
      method: PaymentMethod.ONLINE_SANDBOX,
      status: PaymentStatus.COMPLETED,
      transactionId: 'TXN-SANDBOX-9928172',
      idempotencyKey: 'IDEMP-VF-1001-PAY',
      receiptUrl: 'https://voltfix.local/receipts/VF-2026-1001.pdf',
    },
  });

  // Review for Booking 1
  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      customerId: customers[0].id,
      electricianId: approvedElectricians[0].id,
      rating: 5,
      comment: 'Tariqul arrived within 30 minutes! Diagnosed the melted neutral wire immediately and replaced the breaker safely. Highly recommended!',
      replyComment: 'Thank you Arif! Always glad to ensure your home electrical panel is completely safe.',
      repliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Update electrician average rating & count
  await prisma.electricianProfile.update({
    where: { id: approvedElectricians[0].id },
    data: {
      ratingAverage: 5.0,
      reviewCount: 1,
    },
  });

  // Booking 2: IN_PROGRESS
  const booking2 = await prisma.booking.create({
    data: {
      bookingNumber: 'VF-2026-1002',
      customerId: customers[1].id,
      electricianId: approvedElectricians[1].id,
      status: BookingStatus.IN_PROGRESS,
      type: BookingType.DIRECT,
      isEmergency: false,
      problemDescription: 'Install 5 smart dimmer switches and 2 ceiling fans in bedrooms.',
      scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago today
      estimatedDurationMin: 180,
      addressStreet: 'House 14, Sector 3, Uttara',
      addressCity: 'Dhaka',
      addressLat: 23.8710,
      addressLng: 90.4010,
      customerPhone: customers[1].phone!,
      electricianPhone: '+8801722334455',
    },
  });

  await prisma.bookingStatusHistory.create({
    data: {
      bookingId: booking2.id,
      fromStatus: BookingStatus.ACCEPTED,
      toStatus: BookingStatus.IN_PROGRESS,
      changedByUserId: approvedElectricians[1].userId,
      reason: 'On site and wiring living room dimmers.',
    },
  });

  // Booking 3: ACCEPTED
  const booking3 = await prisma.booking.create({
    data: {
      bookingNumber: 'VF-2026-1003',
      customerId: customers[2].id,
      electricianId: approvedElectricians[2].id,
      status: BookingStatus.ACCEPTED,
      type: BookingType.DIRECT,
      isEmergency: false,
      problemDescription: 'Solar hybrid inverter battery bank setup and load calculation.',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      estimatedDurationMin: 240,
      addressStreet: 'Apartment 5B, Road 6, Dhanmondi',
      addressCity: 'Dhaka',
      addressLat: 23.7480,
      addressLng: 90.3750,
      customerPhone: customers[2].phone!,
      electricianPhone: '+8801933445566',
    },
  });

  // Booking 4: PENDING
  await prisma.booking.create({
    data: {
      bookingNumber: 'VF-2026-1004',
      customerId: customers[3].id,
      electricianId: approvedElectricians[3].id,
      status: BookingStatus.PENDING,
      type: BookingType.DIRECT,
      isEmergency: true,
      problemDescription: 'Main water pump switch sparking and not powering on.',
      scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours later
      estimatedDurationMin: 60,
      addressStreet: 'Plot 210, Road 4, Bashundhara',
      addressCity: 'Dhaka',
      addressLat: 23.8230,
      addressLng: 90.4280,
      customerPhone: customers[3].phone!,
    },
  });

  // Booking 5: Open Request with Quotes
  const openBooking = await prisma.booking.create({
    data: {
      bookingNumber: 'VF-2026-OPEN-01',
      customerId: customers[4].id,
      status: BookingStatus.PENDING,
      type: BookingType.OPEN_REQUEST,
      isEmergency: false,
      problemDescription: 'Looking for licensed electrician to rewire 3-room office with Cat6 conduits and dedicated 20A server rack power lines.',
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      estimatedDurationMin: 360,
      addressStreet: 'House 8, Middle Badda',
      addressCity: 'Dhaka',
      addressLat: 23.7780,
      addressLng: 90.4210,
      customerPhone: customers[4].phone!,
    },
  });

  await prisma.quote.createMany({
    data: [
      {
        bookingId: openBooking.id,
        electricianId: approvedElectricians[4].id,
        estimatedPrice: 320.0,
        laborCost: 240.0,
        partsCost: 80.0,
        estimatedDurationMin: 360,
        note: 'Industrial grade fire-resistant cabling included. Can complete within 1 business day.',
      },
      {
        bookingId: openBooking.id,
        electricianId: approvedElectricians[0].id,
        estimatedPrice: 350.0,
        laborCost: 270.0,
        partsCost: 80.0,
        estimatedDurationMin: 300,
        note: 'Certified master electrician inspection and surge protector installation included.',
      },
    ],
  });

  // Sample Chat Messages for Booking 2
  await prisma.message.createMany({
    data: [
      {
        bookingId: booking2.id,
        senderId: customers[1].id,
        content: 'Hi Shahidul! Will you be able to bring extra dimmer faceplates just in case?',
        isRead: true,
        readAt: new Date(Date.now() - 90 * 60 * 1000),
      },
      {
        bookingId: booking2.id,
        senderId: approvedElectricians[1].userId,
        content: 'Hello Nusrat! Yes, I have standard Legrand and Havells faceplates with me right now.',
        isRead: true,
        readAt: new Date(Date.now() - 80 * 60 * 1000),
      },
    ],
  });

  // Sample Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customers[0].id,
        title: 'Booking Completed',
        message: 'Your booking VF-2026-1001 with Tariqul Islam has been marked completed. Please leave a review!',
        type: 'STATUS',
        entityId: booking1.id,
        entityType: 'BOOKING',
      },
      {
        userId: approvedElectricians[0].userId,
        title: 'Payment Received',
        message: 'Payment of $88.00 received for Invoice INV-2026-001.',
        type: 'PAYMENT',
        entityId: invoice1.id,
        entityType: 'INVOICE',
      },
      {
        userId: customers[4].id,
        title: 'New Quote Received',
        message: 'Kamrul Hassan submitted a quote for your open electrical request.',
        type: 'BOOKING',
        entityId: openBooking.id,
        entityType: 'QUOTE',
      },
    ],
  });

  console.log('🎉 VoltFix Database Seeding Completed Successfully!');
}

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error('❌ Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
