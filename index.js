const express = require('express');

const Scrappy = require('./Scrappy.js');

const app = express();
const port = 3000;

app.get('/products', async (req, res) => {
    console.log("Getting the query parameters");
    let query = req.query;
    
    let result = await Scrappy.getProductsList(query.nutrition, query.nova);

    console.log("Returning the data as json");
    res.json(result);
});

app.get('/products/:id', async (req, res) => {


    console.log("Getting the query parameters");
    let result = await Scrappy.getSpedificProduct(req.params.id);

    res.json(result);

});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});