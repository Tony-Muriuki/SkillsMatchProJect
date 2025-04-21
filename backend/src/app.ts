import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import path from 'path';

// Import middleware
import errorMiddleware from './middleware/error.middleware';

// Initialize express app
const app: Application = express();

// Setup swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkillMatch AI API',
      version: '1.0.0',
      description:
        'API for SkillMatch AI platform that matches job seekers with employers',
      contact: {
        name: 'API Support',
        email: 'support@skillmatch.ai',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Import routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import jobsRoutes from './routes/jobs.routes';
import applicationsRoutes from './routes/applications.routes';
import portfoliosRoutes from './routes/portfolios.routes';
import cvsRoutes from './routes/cvs.routes';
import aiRoutes from './routes/ai.routes';
import chatRoutes from './routes/chat.routes';
import notificationsRoutes from './routes/notifications.routes';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/portfolios', portfoliosRoutes);
app.use('/api/cvs', cvsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to SkillMatch AI API',
    documentation: '/api-docs',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use(errorMiddleware);

export default app;
