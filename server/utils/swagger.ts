import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { Express } from 'express';
import path from 'path';

/**
 * Configure Swagger UI for API documentation
 */
export function setupSwagger(app: Express) {
  // Load OpenAPI specification
  const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Personal Finance Dashboard API Documentation',
  }));

  // Serve raw OpenAPI specification
  app.get('/api-docs.yaml', (req, res) => {
    res.setHeader('Content-Type', 'text/yaml');
    res.sendFile(path.join(__dirname, '../openapi.yaml'));
  });
} 