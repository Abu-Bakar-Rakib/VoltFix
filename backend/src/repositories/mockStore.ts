import bcrypt from 'bcryptjs';

export interface MockStore {
  users: any[];
  electricianProfiles: any[];
  verificationDocuments: any[];
  categories: any[];
  services: any[];
  availabilitySlots: any[];
  timeOffs: any[];
  addresses: any[];
  bookings: any[];
  bookingPhotos: any[];
  quotes: any[];
  bookingStatusHistories: any[];
  invoices: any[];
  payments: any[];
  reviews: any[];
  messages: any[];
  notifications: any[];
  favorites: any[];
  disputes: any[];
  reports: any[];
  auditLogs: any[];
}

export const mockStore: MockStore = {
  users: [],
  electricianProfiles: [],
  verificationDocuments: [],
  categories: [],
  services: [],
  availabilitySlots: [],
  timeOffs: [],
  addresses: [],
  bookings: [],
  bookingPhotos: [],
  quotes: [],
  bookingStatusHistories: [],
  invoices: [],
  payments: [],
  reviews: [],
  messages: [],
  notifications: [],
  favorites: [],
  disputes: [],
  reports: [],
  auditLogs: [],
};

let isInitialized = false;

export async function initializeMockData() {
  if (isInitialized) return;

  const passwordAdmin = await bcrypt.hash('Admin@12345', 10);
  const passwordElectrician = await bcrypt.hash('Electrician@123', 10);
  const passwordCustomer = await bcrypt.hash('Customer@123', 10);

  // 1. Admin
  const adminId = 'usr-admin-001';
  mockStore.users.push({
    id: adminId,
    name: 'Abu Bakar Rakib',
    email: 'admin@voltfix.com',
    password: passwordAdmin,
    phone: '+8801700000001',
    role: 'ADMIN',
    isVerified: true,
    avatarUrl: '/avatar-rakib.png',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 2. Categories
  const categoryDefs = [
    { id: 'cat-01', name: 'Emergency Repairs', slug: 'emergency-repairs', description: 'Rapid response for short circuits, sparking panels, power outages, and electrical hazards.', iconUrl: 'Zap', isActive: true },
    { id: 'cat-02', name: 'Residential Wiring', slug: 'residential-wiring', description: 'Full home wiring, rewiring older homes, adding new switchboards and power points.', iconUrl: 'Home', isActive: true },
    { id: 'cat-03', name: 'Panel & Breaker Upgrades', slug: 'panel-breaker-upgrades', description: 'Main service panel upgrades (100A to 200A+), modern circuit breakers, surge protectors.', iconUrl: 'Cpu', isActive: true },
    { id: 'cat-04', name: 'Lighting & Ceiling Fans', slug: 'lighting-ceiling-fans', description: 'Chandelier mounting, recessed LED downlights, ceiling fan balancing, outdoor security floodlights.', iconUrl: 'Sun', isActive: true },
    { id: 'cat-05', name: 'EV Charger Installation', slug: 'ev-charger-installation', description: 'Level 2 EV fast charger stations, Tesla wall connectors, dedicated high-amperage sub-panels.', iconUrl: 'BatteryCharging', isActive: true },
    { id: 'cat-06', name: 'Solar & Inverter Setup', slug: 'solar-inverter-setup', description: 'Grid-tie & hybrid solar inverters, IPS battery banks, transfer switches and clean energy wiring.', iconUrl: 'ShieldCheck', isActive: true },
    { id: 'cat-07', name: 'Appliance & HVAC Circuits', slug: 'appliance-hvac-circuits', description: 'Dedicated circuits for AC compressors, water geysers, induction ovens, and commercial washers.', iconUrl: 'Wrench', isActive: true },
    { id: 'cat-08', name: 'Commercial & 3-Phase', slug: 'commercial-industrial', description: 'Commercial facilities, 3-phase machinery wiring, load balancing, safety compliance certificates.', iconUrl: 'Layers', isActive: true },
  ];
  mockStore.categories.push(...categoryDefs);

  // 3. Electricians
  const electricianDefs = [
    { id: 'elec-01', name: 'Tariqul Islam', email: 'tariqul.electric@gmail.com', phone: '+8801811223344', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', bio: 'Licensed Master Electrician with 12+ years experience specializing in smart panel upgrades, commercial 3-phase systems, and round-the-clock emergency diagnostics.', exp: 12, skills: ['Emergency Troubleshooting', '3-Phase Wiring', 'Smart Home Panels', 'Industrial Sub-stations'], radius: 20, lat: 23.7925, lng: 90.4078, addr: 'Road 11, Block D, Gulshan 1', rate: 450, emergency: true, status: 'APPROVED', rating: 5.0, count: 1 },
    { id: 'elec-02', name: 'Shahidul Alam', email: 'shahidul.alam@voltfix.com', phone: '+8801722334455', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', bio: 'Certified electrical technician for residential properties. Certified for Level 2 EV Chargers & Modern LED installations with flawless customer ratings.', exp: 8, skills: ['EV Chargers', 'Panel Upgrades', 'LED Architecture', 'Surge Protection'], radius: 15, lat: 23.8699, lng: 90.3995, addr: 'Sector 7, Uttara Model Town', rate: 350, emergency: true, status: 'APPROVED', rating: 4.8, count: 6 },
    { id: 'elec-03', name: 'Mahmudur Rahman', email: 'mahmud.volt@gmail.com', phone: '+8801933445566', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', bio: 'Solar energy & hybrid inverter specialist. I help homeowners and businesses slash their electricity bills with safe, high-durability battery and panel setups.', exp: 10, skills: ['Solar Inverters', 'IPS Batteries', 'Load Balancing', 'Generator ATS'], radius: 25, lat: 23.7461, lng: 90.3742, addr: 'Road 8A, Dhanmondi', rate: 400, emergency: false, status: 'APPROVED', rating: 4.9, count: 8 },
    { id: 'elec-04', name: 'Anisur Zaman', email: 'anis.spark@gmail.com', phone: '+8801644556677', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400', bio: 'Fastest emergency responder in Mirpur and surrounding zones. Fast diagnosis of breaker trips, wire burns, and water pump electrical faults.', exp: 7, skills: ['Emergency Repairs', 'Pump Motors', 'Circuit Breakers', 'Earthing Testing'], radius: 12, lat: 23.8041, lng: 90.3687, addr: 'Section 10, Mirpur', rate: 300, emergency: true, status: 'APPROVED', rating: 4.7, count: 12 },
    { id: 'elec-05', name: 'Kamrul Hassan', email: 'kamrul.power@gmail.com', phone: '+8801755667788', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', bio: 'Certified industrial & commercial contractor. Expert in factory installations, switchgear maintenance, transformer testing, and code compliance.', exp: 15, skills: ['Commercial', 'Switchgear', 'Transformers', 'Energy Audits'], radius: 30, lat: 23.7772, lng: 90.4194, addr: 'Merul Badda, Progoti Shoroni', rate: 550, emergency: false, status: 'APPROVED', rating: 4.9, count: 15 },
    { id: 'elec-06', name: 'Farhan Kabir', email: 'farhan.fix@gmail.com', phone: '+8801866778899', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400', bio: 'High-end interior lighting designer and technician. Specializing in ambient cove lights, smart wireless dimmers, and complex chandelier hangings.', exp: 6, skills: ['Smart Dimmers', 'Chandelier Installation', 'Recessed Downlights', 'Landscape Lighting'], radius: 15, lat: 23.7937, lng: 90.4066, addr: 'Block C, Banani', rate: 380, emergency: true, status: 'APPROVED', rating: 4.8, count: 5 },
    { id: 'elec-07', name: 'Rafiqul Islam', email: 'rafiqul.tech@gmail.com', phone: '+8801977889900', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', bio: 'HVAC and high-voltage appliance circuits specialist. AC lines, heavy geyser circuits, bakery ovens, and industrial compressors.', exp: 9, skills: ['AC Power Lines', 'Geyser Wiring', 'Heavy Appliance Isolation', 'Leakage Detection'], radius: 18, lat: 23.7334, lng: 90.3854, addr: 'Azimpur Estate', rate: 320, emergency: true, status: 'APPROVED', rating: 4.6, count: 9 },
    { id: 'elec-08', name: 'Zahid Hossain', email: 'zahid.ev@voltfix.com', phone: '+8801688990011', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400', bio: 'Pioneer in Electric Vehicle EVSE infrastructure. Level 1, 2, and DC fast charger installations with integrated load shedding logic.', exp: 11, skills: ['Tesla Wall Connector', 'EV Chargers', 'Sub-panel Expansion', 'Earth Pits'], radius: 25, lat: 23.8223, lng: 90.4274, addr: 'Block D, Bashundhara R/A', rate: 500, emergency: true, status: 'APPROVED', rating: 5.0, count: 4 },
    { id: 'elec-09', name: 'Nasir Uddin', email: 'nasir.pending@voltfix.com', phone: '+8801799001122', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', bio: 'Experienced wireman with 5 years in new residential buildings. Currently undergoing official VoltFix verification.', exp: 5, skills: ['House Wiring', 'Socket Replacement', 'Ceiling Fans'], radius: 10, lat: 23.7509, lng: 90.3934, addr: 'Tejgaon Industrial Area', rate: 250, emergency: false, status: 'PENDING', rating: 0.0, count: 0 },
    { id: 'elec-10', name: 'Babul Akhter', email: 'babul.rejected@voltfix.com', phone: '+8801811002233', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400', bio: 'Electrician apprentice with documentation discrepancy during background check.', exp: 2, skills: ['Basic Repairs'], radius: 8, lat: 23.7104, lng: 90.4074, addr: 'Armanitola, Old Dhaka', rate: 200, emergency: false, status: 'REJECTED', rejectionReason: 'Invalid trade certificate copy provided. Re-submission required.', rating: 0.0, count: 0 },
  ];

  for (const e of electricianDefs) {
    const userId = `usr-${e.id}`;
    mockStore.users.push({
      id: userId,
      name: e.name,
      email: e.email,
      password: passwordElectrician,
      phone: e.phone,
      avatarUrl: e.avatar,
      role: 'ELECTRICIAN',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const profileId = `prof-${e.id}`;
    mockStore.electricianProfiles.push({
      id: profileId,
      userId,
      bio: e.bio,
      experienceYears: e.exp,
      skills: e.skills,
      serviceRadiusKm: e.radius,
      latitude: e.lat,
      longitude: e.lng,
      addressText: e.addr,
      city: 'Dhaka',
      isOnline: true,
      verificationStatus: e.status,
      rejectionReason: (e as any).rejectionReason || null,
      hourlyRate: e.rate,
      emergencyAvailable: e.emergency,
      ratingAverage: e.rating,
      reviewCount: e.count,
      portfolioPhotos: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Verification documents
    mockStore.verificationDocuments.push(
      {
        id: `doc-${e.id}-1`,
        electricianProfileId: profileId,
        documentType: 'GOVERNMENT_ID',
        documentUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
        documentNumber: `NID-882910${e.id}`,
        verificationStatus: e.status,
        reviewedAt: e.status === 'APPROVED' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `doc-${e.id}-2`,
        electricianProfileId: profileId,
        documentType: 'TRADE_LICENSE',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
        documentNumber: `TL-2024-99${e.id}`,
        verificationStatus: e.status,
        reviewedAt: e.status === 'APPROVED' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    // Standard services
    if (e.status === 'APPROVED') {
      mockStore.services.push(
        {
          id: `srv-${e.id}-1`,
          electricianProfileId: profileId,
          categoryId: 'cat-01',
          title: 'Emergency Diagnostic & Circuit Isolation',
          description: 'Immediate dispatch to identify tripped circuits, overheated connections, or grounding failures.',
          pricingType: 'INSPECTION',
          basePrice: 400.0,
          estimatedDurationMin: 60,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `srv-${e.id}-2`,
          electricianProfileId: profileId,
          categoryId: 'cat-02',
          title: 'Complete Room Switch & Fixture Rewire',
          description: 'Replacement of wiring, fireproof conduit installation, and grounding wire verification.',
          pricingType: 'FIXED',
          basePrice: 1200.0,
          estimatedDurationMin: 180,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `srv-${e.id}-3`,
          electricianProfileId: profileId,
          categoryId: 'cat-03',
          title: 'Modern Breaker Box Overhaul',
          description: 'Replace dangerous old porcelain fuses with dual-pole RCBO breakers and surge suppression.',
          pricingType: 'FIXED',
          basePrice: 2200.0,
          estimatedDurationMin: 240,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    }
  }

  // 4. Customers
  const customerDefs = [
    { id: 'cust-01', name: 'Arif Chowdhury', email: 'arif.chowdhury@gmail.com', phone: '+8801711122233', lat: 23.7925, lng: 90.4078, street: 'House 42, Road 12, Gulshan 1' },
    { id: 'cust-02', name: 'Nusrat Jahan', email: 'nusrat.jahan@gmail.com', phone: '+8801822233344', lat: 23.8710, lng: 90.4010, street: 'House 14, Sector 3, Uttara' },
    { id: 'cust-03', name: 'Tanvir Ahmed', email: 'tanvir.ahmed@gmail.com', phone: '+8801933344455', lat: 23.7480, lng: 90.3750, street: 'Apartment 5B, Road 6, Dhanmondi' },
    { id: 'cust-04', name: 'Sabrina Rahman', email: 'sabrina.r@gmail.com', phone: '+8801644455566', lat: 23.8230, lng: 90.4280, street: 'Plot 210, Road 4, Bashundhara' },
    { id: 'cust-05', name: 'Imtiaz Hasan', email: 'imtiaz.hasan@gmail.com', phone: '+8801755566677', lat: 23.7780, lng: 90.4210, street: 'House 8, Middle Badda' },
    { id: 'cust-06', name: 'Sadia Afreen', email: 'sadia.afreen@gmail.com', phone: '+8801866677788', lat: 23.7940, lng: 90.4070, street: 'Road 11, Block D, Banani' },
    { id: 'cust-07', name: 'Faisal Karim', email: 'faisal.karim@gmail.com', phone: '+8801977788899', lat: 23.8050, lng: 90.3700, street: 'Section 6, Mirpur' },
    { id: 'cust-08', name: 'Mehnaz Parveen', email: 'mehnaz.p@gmail.com', phone: '+8801688899900', lat: 23.7340, lng: 90.3860, street: 'Lalbagh Road' },
    { id: 'cust-09', name: 'Rashid Khan', email: 'rashid.khan@gmail.com', phone: '+8801799900011', lat: 23.7800, lng: 90.4000, street: 'Mohakhali DOHS' },
    { id: 'cust-10', name: 'Zarin Tasnim', email: 'zarin.tasnim@gmail.com', phone: '+8801811122299', lat: 23.7510, lng: 90.3940, street: 'Tejgaon Farmgate' },
  ];

  for (const c of customerDefs) {
    const userId = `usr-${c.id}`;
    mockStore.users.push({
      id: userId,
      name: c.name,
      email: c.email,
      password: passwordCustomer,
      phone: c.phone,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name)}`,
      role: 'CUSTOMER',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockStore.addresses.push({
      id: `addr-${c.id}`,
      userId,
      label: 'Home',
      street: c.street,
      city: 'Dhaka',
      latitude: c.lat,
      longitude: c.lng,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // 5. Sample Bookings
  const b1Id = 'book-001';
  mockStore.bookings.push({
    id: b1Id,
    bookingNumber: 'VF-2026-1001',
    customerId: 'usr-cust-01',
    electricianId: 'prof-elec-01',
    serviceId: 'srv-elec-01-1',
    categoryId: 'cat-01',
    status: 'COMPLETED',
    type: 'DIRECT',
    isEmergency: true,
    problemDescription: 'Frequent breaker trip in the kitchen whenever microwave and induction run together. Smelled hot plastic.',
    scheduledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    estimatedDurationMin: 90,
    addressStreet: 'House 42, Road 12, Gulshan 1',
    addressCity: 'Dhaka',
    addressLat: 23.7925,
    addressLng: 90.4078,
    customerPhone: '+8801711122233',
    electricianPhone: '+8801811223344',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  });

  mockStore.bookingPhotos.push({
    id: 'photo-001',
    bookingId: b1Id,
    photoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    caption: 'Breaker box charred connector',
    createdAt: new Date(),
  });

  mockStore.invoices.push({
    id: 'inv-001',
    invoiceNumber: 'INV-2026-001',
    bookingId: b1Id,
    electricianId: 'prof-elec-01',
    customerId: 'usr-cust-01',
    laborCost: 45.0,
    partsCost: 35.0,
    tax: 4.0,
    platformFee: 4.0,
    totalAmount: 88.0,
    items: [
      { description: 'Emergency diagnostic & isolation', cost: 45.0 },
      { description: 'Schneider 32A C-curve Miniature Circuit Breaker', cost: 25.0 },
      { description: 'Heavy duty insulated copper connecting lugs', cost: 10.0 },
    ],
    notes: 'Work guaranteed for 90 days. Load test passed at 3.8kW sustained.',
    status: 'PAID',
    approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  mockStore.payments.push({
    id: 'pay-001',
    bookingId: b1Id,
    invoiceId: 'inv-001',
    customerId: 'usr-cust-01',
    amount: 88.0,
    currency: 'USD',
    method: 'ONLINE_SANDBOX',
    status: 'COMPLETED',
    transactionId: 'TXN-SANDBOX-9928172',
    idempotencyKey: 'IDEMP-VF-1001-PAY',
    receiptUrl: 'https://voltfix.local/receipts/VF-2026-1001.pdf',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  mockStore.reviews.push({
    id: 'rev-001',
    bookingId: b1Id,
    customerId: 'usr-cust-01',
    electricianId: 'prof-elec-01',
    rating: 5,
    comment: 'Tariqul arrived within 30 minutes! Diagnosed the melted neutral wire immediately and replaced the breaker safely. Highly recommended!',
    replyComment: 'Thank you Arif! Always glad to ensure your home electrical panel is completely safe.',
    repliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isReported: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const b2Id = 'book-002';
  mockStore.bookings.push({
    id: b2Id,
    bookingNumber: 'VF-2026-1002',
    customerId: 'usr-cust-02',
    electricianId: 'prof-elec-02',
    serviceId: 'srv-elec-02-2',
    categoryId: 'cat-04',
    status: 'IN_PROGRESS',
    type: 'DIRECT',
    isEmergency: false,
    problemDescription: 'Install 5 smart dimmer switches and 2 ceiling fans in bedrooms.',
    scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    estimatedDurationMin: 180,
    addressStreet: 'House 14, Sector 3, Uttara',
    addressCity: 'Dhaka',
    addressLat: 23.8710,
    addressLng: 90.4010,
    customerPhone: '+8801822233344',
    electricianPhone: '+8801722334455',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const b3Id = 'book-003';
  mockStore.bookings.push({
    id: b3Id,
    bookingNumber: 'VF-2026-1003',
    customerId: 'usr-cust-03',
    electricianId: 'prof-elec-03',
    serviceId: 'srv-elec-03-1',
    categoryId: 'cat-06',
    status: 'ACCEPTED',
    type: 'DIRECT',
    isEmergency: false,
    problemDescription: 'Solar hybrid inverter battery bank setup and load calculation.',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    estimatedDurationMin: 240,
    addressStreet: 'Apartment 5B, Road 6, Dhanmondi',
    addressCity: 'Dhaka',
    addressLat: 23.7480,
    addressLng: 90.3750,
    customerPhone: '+8801933344455',
    electricianPhone: '+8801933445566',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const b4Id = 'book-004';
  mockStore.bookings.push({
    id: b4Id,
    bookingNumber: 'VF-2026-1004',
    customerId: 'usr-cust-04',
    electricianId: 'prof-elec-04',
    categoryId: 'cat-01',
    status: 'PENDING',
    type: 'DIRECT',
    isEmergency: true,
    problemDescription: 'Main water pump switch sparking and not powering on.',
    scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
    estimatedDurationMin: 60,
    addressStreet: 'Plot 210, Road 4, Bashundhara',
    addressCity: 'Dhaka',
    addressLat: 23.8230,
    addressLng: 90.4280,
    customerPhone: '+8801644455566',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const b5Id = 'book-open-01';
  mockStore.bookings.push({
    id: b5Id,
    bookingNumber: 'VF-2026-OPEN-01',
    customerId: 'usr-cust-05',
    status: 'PENDING',
    type: 'OPEN_REQUEST',
    isEmergency: false,
    problemDescription: 'Looking for licensed electrician to rewire 3-room office with Cat6 conduits and dedicated 20A server rack power lines.',
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    estimatedDurationMin: 360,
    addressStreet: 'House 8, Middle Badda',
    addressCity: 'Dhaka',
    addressLat: 23.7780,
    addressLng: 90.4210,
    customerPhone: '+8801755566677',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  mockStore.quotes.push(
    {
      id: 'quote-01',
      bookingId: b5Id,
      electricianId: 'prof-elec-05',
      estimatedPrice: 320.0,
      laborCost: 240.0,
      partsCost: 80.0,
      estimatedDurationMin: 360,
      note: 'Industrial grade fire-resistant cabling included. Can complete within 1 business day.',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'quote-02',
      bookingId: b5Id,
      electricianId: 'prof-elec-01',
      estimatedPrice: 350.0,
      laborCost: 270.0,
      partsCost: 80.0,
      estimatedDurationMin: 300,
      note: 'Certified master electrician inspection and surge protector installation included.',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );

  // Chat messages
  mockStore.messages.push(
    {
      id: 'msg-01',
      bookingId: b2Id,
      senderId: 'usr-cust-02',
      content: 'Hi Shahidul! Will you be able to bring extra dimmer faceplates just in case?',
      isRead: true,
      readAt: new Date(Date.now() - 90 * 60 * 1000),
      createdAt: new Date(Date.now() - 100 * 60 * 1000),
    },
    {
      id: 'msg-02',
      bookingId: b2Id,
      senderId: 'usr-elec-02',
      content: 'Hello Nusrat! Yes, I have standard Legrand and Havells faceplates with me right now.',
      isRead: true,
      readAt: new Date(Date.now() - 80 * 60 * 1000),
      createdAt: new Date(Date.now() - 85 * 60 * 1000),
    }
  );

  // Notifications
  mockStore.notifications.push(
    {
      id: 'notif-01',
      userId: 'usr-cust-01',
      title: 'Booking Completed',
      message: 'Your booking VF-2026-1001 with Tariqul Islam has been marked completed. Please leave a review!',
      type: 'STATUS',
      entityId: b1Id,
      entityType: 'BOOKING',
      isRead: true,
      createdAt: new Date(),
    },
    {
      id: 'notif-02',
      userId: 'usr-elec-01',
      title: 'Payment Received',
      message: 'Payment of $88.00 received for Invoice INV-2026-001.',
      type: 'PAYMENT',
      entityId: 'inv-001',
      entityType: 'INVOICE',
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: 'notif-03',
      userId: 'usr-cust-05',
      title: 'New Quote Received',
      message: 'Kamrul Hassan submitted a quote for your open electrical request.',
      type: 'BOOKING',
      entityId: b5Id,
      entityType: 'QUOTE',
      isRead: false,
      createdAt: new Date(),
    }
  );

  isInitialized = true;
}
