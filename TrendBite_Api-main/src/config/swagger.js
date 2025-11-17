import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the swagger.yaml file
const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yaml'));

// Swagger UI options
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin-bottom: 30px }
    .swagger-ui .scheme-container { margin-bottom: 30px }
    .swagger-ui .info .title { color: #2c5234; font-size: 36px; }
    .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
    .swagger-ui .btn.authorize { background-color: #2c5234; border-color: #2c5234; }
    .swagger-ui .btn.authorize:hover { background-color: #1a3120; border-color: #1a3120; }
    .swagger-ui .opblock.opblock-post { border-color: #49cc90; background: rgba(73, 204, 144, 0.1); }
    .swagger-ui .opblock.opblock-post .opblock-summary { border-color: #49cc90; }
    .swagger-ui .opblock.opblock-get { border-color: #61affe; background: rgba(97, 175, 254, 0.1); }
    .swagger-ui .opblock.opblock-get .opblock-summary { border-color: #61affe; }
    .swagger-ui .opblock.opblock-put { border-color: #fca130; background: rgba(252, 161, 48, 0.1); }
    .swagger-ui .opblock.opblock-put .opblock-summary { border-color: #fca130; }
    .swagger-ui .opblock.opblock-delete { border-color: #f93e3e; background: rgba(249, 62, 62, 0.1); }
    .swagger-ui .opblock.opblock-delete .opblock-summary { border-color: #f93e3e; }
  `,
  customSiteTitle: 'TrendBite API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      // Add any request interceptors here
      return req;
    },
    responseInterceptor: (res) => {
      // Add any response interceptors here
      return res;
    }
  }
};

// Setup function to add Swagger to Express app
export const setupSwagger = (app) => {
  // Serve the raw swagger.json first (before Swagger UI)
  app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });
  
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
  
  // Redirect /docs to /api-docs for convenience
  app.get('/docs', (req, res) => {
    res.redirect('/api-docs');
  });
  
  console.log('📚 Swagger documentation available at:');
  console.log('   • Interactive UI: http://localhost:3000/api-docs');
  console.log('   • JSON Schema: http://localhost:3000/api-docs/swagger.json');
  console.log('   • Alternative URL: http://localhost:3000/docs');
};

export default setupSwagger;
