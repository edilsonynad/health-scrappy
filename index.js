const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const Scrappy = require('./Scrappy.js');

const app = express();
const port = 3000;

// Swagger options
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Health Scrappy Project',
            description: 'Get nutrition infos as an api',
            version: '1.0.0',
        },
    },
    apis: ['index.js'], // Specify the file where your routes are defined
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI at /api-docs endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


/**
 * @openapi
 * '/products/':
 *  get:
 *     tags:
 *     - Get List of Products
 *     summary: Using the specific product id, you can get its details as an json
 *     parameters:
 *      - name: nutrition
 *        in: query
 *        description: The username of the user
 *        required: true
 *      - name: nova
 *        in: query
 *        description: The username of the user
 *        required: true
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */

app.get('/products', async (req, res) => {

    console.log("Getting the query parameters");
    let query = req.query;

    let result = await Scrappy.getProductsList(query.nutrition, query.nova);

    console.log("Returning the data as json");
    res.json(result);

});



/**
 * @openapi
 * '/products/{id}':
 *  get:
 *     tags:
 *     - Get Single Product Detail
 *     summary: Using the specific product id, you can get its details as an json
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The username of the user
 *        required: true
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */

app.get('/products/:id', async (req, res) => {

    console.log("Getting the query parameters");
    let result = await Scrappy.getSpedificProduct(req.params.id);

    console.log("Returning the data as json");
    res.json(result);

});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});