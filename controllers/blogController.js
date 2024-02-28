require("dotenv").config();
const axios = require('axios');

module.exports.getBlogs = async (req, resp) => {
    try {
        const postsResponse = await axios.get(process.env.POSTS_URL);
        const postsData = postsResponse.data;

        const categoriesResponse = await axios.get(process.env.CATEGORIES_URL);
        const categoriesData = categoriesResponse.data;

        const categoryMap = {};
        categoriesData.forEach(category => {
            categoryMap[category.id] = category.name;
        });

        const structuredData = {};
        postsData.forEach(post => {
            post.categories.forEach(categoryId => {
                const categoryName = categoryMap[categoryId];
                if (structuredData.hasOwnProperty(categoryName)) {
                    structuredData[categoryName].push(post);
                } else {
                    structuredData[categoryName] = [post];
                }
            });
        });

        const result = Object.entries(structuredData).map(([categoryName, posts]) => ({
            categoryname: categoryName,
            posts: posts
        }));

        resp.status(200).json(result);
    } catch (err) {
        console.log(err);
        resp.status(500).json({ error: 'Internal Server Error' });
    }
}
