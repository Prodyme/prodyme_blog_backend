require("dotenv").config();
const axios = require("axios");

module.exports.getBlogs = async (req, resp) => {
  try {
    const postsResponse = await axios.get(process.env.POSTS_URL);
    const postsData = postsResponse.data;

    const categoriesResponse = await axios.get(process.env.CATEGORIES_URL);
    const categoriesData = categoriesResponse.data;

        const categoryMap = {};
        categoriesData.forEach(category => {
            categoryMap[category.id] = { name: category.name, id: category.id, posts: [] };
        });

        postsData.forEach(post => {
            post.categories.forEach(categoryId => {
                const { name, id } = categoryMap[categoryId];
                categoryMap[categoryId].posts.push({ ...post, categoryId: id });
            });
        });

        const result = Object.values(categoryMap).map(category => ({
            categoryname: category.name,
            categoryid: category.id,
            posts: category.posts
        }));

    resp.status(200).json(result);
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports.getsBlog = async (req, resp) => {
  const { slug } = req.query;
  try {
    const result = await axios.get(process.env.SLUG_URL + `?slug=${slug}`);
    // console.log(result.data);
    const data = result.data; // Extracting data from Axios response
    resp.status(200).json(data);
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "Internal Server Error" });
  }
};
