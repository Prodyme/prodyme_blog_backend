const axios = require('axios')
require('dotenv').config()

module.exports.getCategoryProducts = async (req, resp) => {
    try {
        const { category, tags } = req.query
        const response = await axios.get(process.env.PRODUCTS_URL)
        const { combinedData } = response.data

        const filteredData = combinedData.filter(items => items.categoryname === category)

        let filteredProducts = []
        const tagsArray = tags ? tags.split(',') : [];

        if (tagsArray.length > 0) {
            filteredProducts = filteredData.flatMap(items =>
                items.subcategories.flatMap(subcategory =>
                    subcategory.products.filter(product =>
                        tagsArray.some(tag => product.SearchTags.includes(tag))))
            );
        } else {
            filteredProducts = filteredData.flatMap(items =>
                items.subcategories.flatMap(subcategory => subcategory.products)
            );
        }

        const slicedProducts = filteredProducts.slice(0, 15)
        const simplifiedData = {
            categoryname: category,
            products: slicedProducts
        }
        console.log('Category:', category);
        console.log('Tags:', tags);
        // console.log('Filtered Products:', filteredProducts);
        
        // console.log(simplifiedData);
        resp.status(200).json(simplifiedData);

    } catch (error) {
        console.error('Error:', error);
        resp.status(500).json({ error: 'Internal Server Error' });
    }
}