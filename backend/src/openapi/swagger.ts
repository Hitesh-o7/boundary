import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Boundary Insights - IPL Data Platform API",
    version: "1.0.0",
    description:
      "REST API for Boundary Insights IPL data platform, providing analytics and match data."
  },
  servers: [
    {
      url: "http://localhost:4000/api",
      description: "Local development server"
    }
  ]
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  // Path is relative to the project root when running via ts-node
  apis: ["./backend/src/routes/*.ts", "./backend/src/controllers/*.ts"]
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };

