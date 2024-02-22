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

    const result = await page.evaluate(() => {
        const elements = document.querySelector('#main-product');

        let title = elements.querySelector('.title-1').innerText;
        let quantity = elements.querySelector('#field_quantity > .field_value').innerText;
        let ingredientsList = elements.querySelector('#panel_ingredients_content > div > div > .panel_text').innerText;


        let servingSize = elements.querySelector('#panel_serving_size > div > div > div > .panel_text').innerText.replace("Tamanho da porção: ", "");


        let nutritionTableFacts = elements.querySelectorAll('#panel_nutrition_facts_table_content > div > table > tbody > tr')


        let nutritionDataFetched = {
            energyPer100g: "",
            energyPerServing: "",
            carboidratosPer100g: "",
            carboidratosPerServing: "",
            fiberPer100g: "",
            fiberPerServing: "",
            proteinPer100g: "",
            proteinPerServing: "",
            saltPer100g: "",
            saltPerServing: ""
        }

        for (i = 0; i < nutritionTableFacts.length; i++) {
            if (nutritionTableFacts[i].querySelectorAll('td')[0].innerText == "Energia") {

                nutritionDataFetched.energyPer100g = nutritionTableFacts[i].querySelectorAll('td')[1].innerText;
                nutritionDataFetched.energyPerServing = nutritionTableFacts[i].querySelectorAll('td')[2].innerText;

            } else if (nutritionTableFacts[i].querySelectorAll('td')[0].innerText == "Gorduras/lípidos") {

                nutritionDataFetched.carboidratosPer100g = nutritionTableFacts[i].querySelectorAll('td')[1].innerText;
                nutritionDataFetched.carboidratosPerServing = nutritionTableFacts[i].querySelectorAll('td')[2].innerText;

            } else if (nutritionTableFacts[i].querySelectorAll('td')[0].innerText == "Fibra alimentar") {

                nutritionDataFetched.fiberPer100g = nutritionTableFacts[i].querySelectorAll('td')[1].innerText;
                nutritionDataFetched.fiberPerServing = nutritionTableFacts[i].querySelectorAll('td')[2].innerText;

            } else if (nutritionTableFacts[i].querySelectorAll('td')[0].innerText == "Proteínas") {

                nutritionDataFetched.proteinPer100g = nutritionTableFacts[i].querySelectorAll('td')[1].innerText;
                nutritionDataFetched.proteinPerServing = nutritionTableFacts[i].querySelectorAll('td')[2].innerText;

            } else if (nutritionTableFacts[i].querySelectorAll('td')[0].innerText == "Sal") {
                nutritionDataFetched.saltPer100g = nutritionTableFacts[i].querySelectorAll('td')[1].innerText;
                nutritionDataFetched.saltPerServing = nutritionTableFacts[i].querySelectorAll('td')[2].innerText;
            }

        }


        //Getting the nova score data
        let attributes_grid = elements.querySelectorAll('#attributes_grid > li > .attribute_card > div > div > .attr_text > h4');

        let nutritionScore =  attributes_grid[0].innerText.replace("Nutri-Score ", "");
        let novaScore =  attributes_grid[1].innerText.replace("NOVA ", "");
        


        let data = {
            title,
            quantity,
            ingredients: {
                hasPalmOil: "unknown",
                isVegan: false,
                isVegetarian: false,
                list: [
                    ingredientsList
                ]
            },
            nutrition: {
                score: nutritionScore,
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
                servingSize: servingSize,
                data: {
                    Energia: {
                        per100g: nutritionDataFetched.energyPer100g,
                        perServing: nutritionDataFetched.energyPerServing
                    },

                    Carboidratos: {
                        per100g: nutritionDataFetched.carboidratosPer100g,
                        perServing: nutritionDataFetched.carboidratosPerServing
                    },
                    'Fibra alimentar': {
                        per100g: nutritionDataFetched.fiberPer100g,
                        perServing: nutritionDataFetched.fiberPer100g
                    },
                    Proteínas: {
                        per100g: nutritionDataFetched.proteinPer100g,
                        perServing: nutritionDataFetched.proteinPerServing
                    },
                    Sal: {
                        per100g: nutritionDataFetched.saltPer100g,
                        perServing: nutritionDataFetched.saltPerServing
                    }
                }
            },
            nova: {
                score: novaScore,
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