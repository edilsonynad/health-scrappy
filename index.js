const express = require('express')
const puppeteer = require('puppeteer');

const app = express()
const port = 3000;

app.get('/products', (req, res) => {
    res.json(req.query)
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
