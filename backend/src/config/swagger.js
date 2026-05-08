import { fileURLToPath } from "url";
import { dirname, join } from "path";
import swaggerJsdoc from "swagger-jsdoc";

const __dirname = dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Primetrade API",
      version: "1.0.0",
      description: "Scalable REST API with JWT Authentication and Role-Based Access Control",
      contact: { name: "Primetrade.ai", email: "dev@primetrade.ai" },
    },
    servers: [{ url: "http://localhost:5001", description: "Development server" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
            userId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [join(__dirname, "../routes/v1/*.js")],
};

export default swaggerJsdoc(options);
