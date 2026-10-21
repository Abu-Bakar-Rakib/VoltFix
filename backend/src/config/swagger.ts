import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'VoltFix API Documentation',
    version: '1.0.0',
    description: 'Production-quality REST API for VoltFix - Local Service Marketplace connecting customers with verified electricians.',
    contact: {
      name: 'VoltFix Support & Engineering',
      email: 'engineering@voltfix.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT access token (e.g. Bearer <token>)',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['CUSTOMER', 'ELECTRICIAN', 'ADMIN'] },
          isVerified: { type: 'boolean' },
          avatarUrl: { type: 'string' },
        },
      },
      ElectricianProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          bio: { type: 'string' },
          experienceYears: { type: 'integer' },
          skills: { type: 'array', items: { type: 'string' } },
          serviceRadiusKm: { type: 'number' },
          hourlyRate: { type: 'number' },
          emergencyAvailable: { type: 'boolean' },
          ratingAverage: { type: 'number' },
          reviewCount: { type: 'integer' },
          verificationStatus: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          bookingNumber: { type: 'string' },
          customerId: { type: 'string', format: 'uuid' },
          electricianId: { type: 'string', format: 'uuid', nullable: true },
          status: {
            type: 'string',
            enum: ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
          },
          type: { type: 'string', enum: ['DIRECT', 'OPEN_REQUEST'] },
          isEmergency: { type: 'boolean' },
          problemDescription: { type: 'string' },
          scheduledAt: { type: 'string', format: 'date-time' },
          estimatedDurationMin: { type: 'integer' },
          addressStreet: { type: 'string' },
          addressCity: { type: 'string' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          bookingId: { type: 'string', format: 'uuid' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string' },
          replyComment: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new Customer or Electrician',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'phone', 'role'],
                properties: {
                  name: { type: 'string', example: 'Rahim Uddin' },
                  email: { type: 'string', format: 'email', example: 'rahim@voltfix.com' },
                  password: { type: 'string', example: 'Secret123!' },
                  phone: { type: 'string', example: '+8801712345678' },
                  role: { type: 'string', enum: ['CUSTOMER', 'ELECTRICIAN'], example: 'CUSTOMER' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate and receive access token + refresh cookie',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@voltfix.com' },
                  password: { type: 'string', example: 'Admin@12345' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Refresh JWT access token using httpOnly cookie or payload',
        tags: ['Auth'],
        responses: {
          200: { description: 'Token refreshed' },
          401: { description: 'Expired or invalid refresh token' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current authenticated user data' },
        },
      },
    },
    '/search': {
      get: {
        summary: 'Find nearby verified electricians with filters and sorting',
        tags: ['Search'],
        parameters: [
          { name: 'lat', in: 'query', schema: { type: 'number', example: 23.8103 } },
          { name: 'lng', in: 'query', schema: { type: 'number', example: 90.4125 } },
          { name: 'radius', in: 'query', schema: { type: 'number', example: 20 } },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
          { name: 'minRating', in: 'query', schema: { type: 'number' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['distance_asc', 'rating_desc', 'price_asc', 'price_desc'] } },
        ],
        responses: {
          200: { description: 'List of matching electricians' },
        },
      },
    },
    '/bookings/direct': {
      post: {
        summary: 'Create a direct booking with double-booking prevention',
        tags: ['Bookings'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['electricianId', 'problemDescription', 'scheduledAt', 'addressStreet', 'addressCity', 'addressLat', 'addressLng', 'customerPhone'],
                properties: {
                  electricianId: { type: 'string' },
                  problemDescription: { type: 'string' },
                  scheduledAt: { type: 'string', format: 'date-time' },
                  estimatedDurationMin: { type: 'integer', default: 60 },
                  isEmergency: { type: 'boolean', default: false },
                  addressStreet: { type: 'string' },
                  addressCity: { type: 'string' },
                  addressLat: { type: 'number' },
                  addressLng: { type: 'number' },
                  customerPhone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Booking confirmed' },
          409: { description: 'Conflict: Electrician already booked in this slot' },
        },
      },
    },
    '/bookings/{id}/status': {
      patch: {
        summary: 'Advance booking status flow (ACCEPTED, ON_THE_WAY, IN_PROGRESS, COMPLETED)',
        tags: ['Bookings'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated' },
        },
      },
    },
    '/reviews': {
      post: {
        summary: 'Submit a verified review (Allowed only once per COMPLETED booking)',
        tags: ['Reviews'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bookingId', 'rating', 'comment'],
                properties: {
                  bookingId: { type: 'string' },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  comment: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Review published and rating average recalculated' },
          400: { description: 'Booking not completed' },
          409: { description: 'Review already exists for this booking' },
        },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
