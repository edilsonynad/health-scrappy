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


    console.log("Getting the query parameters");
    let url = "https://br.openfoodfacts.org/produto/" + req.params.id;

    console.log("Open the headless browser");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const result = await page.evaluate( () => {
        const elements = document.querySelector('#main-product');

        let title = elements.querySelector('.title-1').innerText;
        let quantity = elements.querySelector('#field_quantity > .field_value').innerText;

        let data = {
            title,
            quantity,
            ingredients: {
                hasPalmOil: "unknown",
                isVegan: false,
                isVegetarian: false,
                list: [
                    "Água, preparado proteico (proteína texturizada de soja, proteína isolada de soja e proteína de ervilha), gordura de coco, óleo de canola, aroma natural, estabilizante metilcelulose, sal, beterraba em pó e corante carvão vegetal."
                ]
            },
            nutrition: {
                score: "D",
                values: [
                    [
                        "moderate",
                        "Gorduras/lípidos em quantidade moderada (11.9%)"
                    ],
                    [
                        "high",
                        "Gorduras/lípidos/ácidos gordos saturados em quantidade elevada (8%)"
                    ],
                    [
                        "low",
                        "Açúcares em quantidade baixa (0%)"
                    ]
                ],
                servingSize: "80 g",
                data: {
                    Energia: {
                        per100g: "814 kj(194 kcal)",
                        perServing: "651 kj(155 kcal)"
                    },

                    Carboidratos: {
                        per100g: "7,88 g",
                        perServing: "6,3 g"
                    },
                    'Fibra alimentar': {
                        per100g: "?",
                        perServing: "?"
                    },
                    Proteínas: {
                        per100g: "13,8 g",
                        perServing: "11 g"
                    },
                    Sal: {
                        per100g: "0,565 g",
                        perServing: "0,452 g"
                    }
                }
            },
            nova: {
                score: 4,
                title: "Alimentos ultra-processados"
            }
        }

        return data;
    });

    res.json(result);

});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});