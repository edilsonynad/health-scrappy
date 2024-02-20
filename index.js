const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.get('/products', async (req, res) => {
    console.log("Getting the query parameters");
    let query = req.query;
    let url = 'https://br.openfoodfacts.org/nutrition-grade/' + query.nutrition + '/nova-group/' + query.nova;


    console.log("Open the headless browser");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    console.log("Getting the data from the website");
    const result = await page.evaluate(() => {
        const data = [];

        const elements = document.querySelectorAll('#products_match_all > li');

        elements.forEach(element => {

            let linkId = element.querySelector('a').getAttribute("href");
            let productId = linkId.slice(linkId.search("o/") + 2, linkId.search("o/") + 15);


            let nutritionElement = element.querySelectorAll('.list_product_icons')[0].getAttribute("title");
            let nutritionScore = nutritionElement.at(12);
            let nutritionTitle = nutritionElement.slice(16, nutritionElement.length);

            let novaElement = element.querySelectorAll('.list_product_icons')[1].getAttribute("title");
            let novaScore = novaElement.at(5);
            let novaTitle = novaElement.slice(9, novaElement.length);

            const item = {
                id: productId,
                name: element.querySelector('.list_product_name').innerText,
                nutrition: {
                    score: nutritionScore,
                    title: nutritionTitle
                },
                nova: {
                    score: novaScore,
                    title: novaTitle
                }
            }

            data.push(item);
        });

        return data
    })

    console.log("Closing the headless browser");
    await browser.close();

    console.log("Returning the data as json");
    res.json(result);
});

app.get('/products/:id', async (req, res) => {
 
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});