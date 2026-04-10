import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cake API',
      version: '1.0.0',
      description: 'A lightweight REST API for managing cakes with Express and SQLite.',
    },
    components: {
      schemas: {
        Cake: {
          type: 'object',
          required: ['name', 'description', 'flavor', 'price', 'is_available'],
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated custom ID of the cake',
            },
            name: {
              type: 'string',
              description: 'The name of the cake',
            },
            description: {
              type: 'string',
              description: 'A detailed description of the cake',
            },
            flavor: {
              type: 'string',
              description: 'The main flavor of the cake',
            },
            price: {
              type: 'number',
              description: 'The price of the cake',
            },
            is_available: {
              type: 'boolean',
              description: 'Whether the cake is currently available for order',
            },
          },
          example: {
            id: 1,
            name: 'Chocolate Fudge Cake',
            description: 'Rich and moist chocolate cake with fudge frosting.',
            flavor: 'Chocolate',
            price: 25.5,
            is_available: true,
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
