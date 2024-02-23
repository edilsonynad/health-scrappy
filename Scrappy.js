const puppeteer = require('puppeteer');
class Scrappy {

    static async getProductsList(nutrition, nova) {

        //Setting the url paramaters
        let url = 'https://br.openfoodfacts.org/nutrition-grade/' + nutrition + '/nova-group/' + nova;

        console.log("Open the headless browser");
        const browser = await puppeteer.launch();

        console.log("Going to the url the headless browser");
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

        return result;
    }

    static async getSpedificProduct(id) {

        let url = "https://br.openfoodfacts.org/produto/" + id;

        console.log("Open the headless browser");
        const browser = await puppeteer.launch();

        console.log("Going to the url the headless browser");
        const page = await browser.newPage();
        await page.goto(url);

        //Scraping the data
        console.log("Getting the data from the website");
        const result = await page.evaluate(() => {
            // Get the main element
            const elements = document.querySelector('#main-product');

            //Get the title and check for null value 
            let title = elements.querySelector('.title-1');
            title = title !== null ? title.innerText : "";

            //Get the quantity and check for null value 
            let quantity = elements.querySelector('#field_quantity > .field_value');
            quantity = quantity !== null ? quantity.innerText: "";

            //Getting the ingredients data and check for null value 
            let ingredientsList = elements.querySelector('#panel_ingredients_content > div > div > .panel_text');
            ingredientsList = ingredientsList !== null ? ingredientsList.innerText: "";

            //Getting the serving size data and check for null value 
            let servingSize = elements.querySelector('#panel_serving_size > div > div > div > .panel_text');
            servingSize = servingSize !== null ? servingSize.innerText.replace("Tamanho da porção: ", "") : "";

            //Getting the nutrition data table information
            let nutritionTableFacts = elements.querySelectorAll('#panel_nutrition_facts_table_content > div > table > tbody > tr');

            // Objext of nutrition facts 
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

            //Iterate over all all items in the table of nutrients facts  
            for (i = 0; i < nutritionTableFacts.length; i++) {

                //Check for correspondents cell in table 
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


            //Getting the atribuites accordions
            let attributes_grid = elements.querySelectorAll('#attributes_grid > li > .attribute_card > div > div > .attr_text');

            //Getting the nutrition score 
            let nutritionScore = attributes_grid[0].querySelector('h4').innerText.replace("Nutri-Score ", "");

            //Nova score 
            let nova = {
                score: attributes_grid[1].querySelector('h4').innerText.replace("NOVA ", ""),
                title: attributes_grid[1].querySelector('span').innerText
            }


            //GGetting and checking if products hasPalmOil, isVegan, isVegetarian
            let ingredientsAnalysisContent = elements.querySelectorAll('#panel_ingredients_analysis_content > ul > li > a > img');

            let hasPalmOil;
            let palmOilClass = ingredientsAnalysisContent[0].getAttribute('class');
            if (palmOilClass == 'filter-red') {
                hasPalmOil = true;
            } else if (palmOilClass == 'filter-grey') {
                hasPalmOil = "unknown";
            } else if (palmOilClass == 'filter-green') {
                hasPalmOil = false;
            } else if (palmOilClass == 'filter-orange') {
                hasPalmOil = 'may contain';
            }

            let isVegan;
            let veganClass = ingredientsAnalysisContent[1].getAttribute('class');
            if (veganClass == 'filter-red') {
                isVegan = true;
            } else if (veganClass == 'filter-grey') {
                isVegan = "unknown";
            } else if (veganClass == 'filter-green') {
                isVegan = false;
            } else if (veganClass == 'filter-orange') {
                isVegan = 'may contain';
            }

            let isVegetarian;
            let vegetarianClass = ingredientsAnalysisContent[2].getAttribute('class');
            if (vegetarianClass == 'filter-red') {
                isVegetarian = true;
            } else if (vegetarianClass == 'filter-grey') {
                isVegetarian = "unknown";
            } else if (vegetarianClass == 'filter-green') {
                isVegetarian = false;
            } else if (vegetarianClass == 'filter-orange') {
                isVegetarian = 'may contain';
            }


            // Getting the nutrition values 
            let nutritionValues = elements.querySelectorAll('#panel_nutrient_levels_content > div > ul > li > a');
            let values = [];
            for (i = 0; i < nutritionValues.length; i++) {
                let row = [
                    nutritionValues[i].querySelector('img').getAttribute('src').replace('https://static.openfoodfacts.org/images/misc/', '').replace(".svg", ""),
                    nutritionValues[i].querySelector('h4').innerText
                ]
                values.push(row)
            }

            let data = {
                title,
                quantity,
                ingredients: {
                    hasPalmOil: hasPalmOil,
                    isVegan: isVegan,
                    isVegetarian: isVegetarian,
                    list: [
                        ingredientsList
                    ]
                },
                nutrition: {
                    score: nutritionScore,
                    values,
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
                nova
            }

            return data;
        });

        console.log("Closing the headless browser");
        await browser.close();

        return result;
    }

}


module.exports = Scrappy; 