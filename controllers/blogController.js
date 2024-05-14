require("dotenv").config();
const axios = require("axios");
const sanitizeHtml = require("sanitize-html");
const fuzzyset = require("fuzzyset");

/* currently we are getting only 100 blogs at a time but later will need to update the api such that it only gets the data for a particular page eg. 10-20, 20-30, it will reduce the storage load on frontend. */

// for getting 100 blogs and seperating them into multiple objects based on category and returning to the frontend
module.exports.getBlogs = async (req, resp) => {
  try {
    const postsResponse = await axios.get(process.env.POSTS_URL);
    const postsData = postsResponse.data;

    const categoriesResponse = await axios.get(process.env.CATEGORIES_URL);
    const categoriesData = categoriesResponse.data;

    const categoryMap = {};
    categoriesData.forEach((category) => {
      categoryMap[category.id] = {
        name: category.name,
        id: category.id,
        posts: [],
      };
    });

    postsData.forEach((post) => {
      post.categories.forEach((categoryId) => {
        const { name, id } = categoryMap[categoryId];
        categoryMap[categoryId].posts.push({ ...post, categoryId: id });
      });
    });

    const result = Object.values(categoryMap).map((category) => ({
      categoryname: category.name,
      categoryid: category.id,
      posts: category.posts,
    }));

    resp.status(200).json(result);
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "Internal Server Error" });
  }
};

// for getting single blog
module.exports.getBlog = async (req, resp) => {
  const { slug } = req.query;
  try {
    const result = await axios.get(process.env.SLUG_URL + `?slug=${slug}`);
    // console.log(result.data);
    const data = result.data; // Extracting data from Axios response
    resp.status(200).json(data);

    // increasing the views of count in the content section of blogs. Currently not in use only a prototype.
    const username = "Amansinghsamant";
    const pass = "ohna 5F3g HLcL EgRb F5mA wGuu";
    const token = Buffer.from(`${username}:${pass}`, "utf-8").toString(
      "base64"
    );
    let clearedHtml = parseInt(
      data[0].content.rendered.replace(/<[^>]*>?/gm, "")
    );
    // console.log(parsedCount);
    if(clearedHtml === NaN || data[0].content.rendered === ""){
      clearedHtml = 0;
    }
    const params = {
      // cache: "no-cache",
      method: "PATCH",
      // credentials: "omit",
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: {
          raw: clearedHtml + 1,
        },
      }),
    };

    await fetch(process.env.SLUG_URL + `/${data[0].id}`, params)
      .then((response) => {
        if (!response.ok) {
          // Log the status code and any error message
          console.error(`Error: ${response.status} ${response.statusText}`);
          throw new Error("Response is not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Views updated successfully:", data);
      })
      .catch((error) => {
        console.error("Error updating views:", error);
      });
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "Internal Server Error" });
  }
};

// Code for search functionality
// Replace base url with env variable
const baseURL = process.env.SLUG_URL;

// example of categoryList 
// const categoryList = {
//   Aman: 249591,
//   "HELLOW WORLD CATEGORY": 769759474,
//   Productivity: 2704,
//   Testing: 12,
//   Uncategorized: 1,
// };

// example of tagsList
// const tagsList = {
//   adaptation: 61092,
//   anime: 1122,
//   bible: 10051,
//   "book-review": 7215,
//   books: 178,
//   "cozy-mystery": 491427,
//   god: 7816,
//   history: 678,
//   mystery: 13078,
//   mythology: 5174,
// };

const searchByCategory = async (categoryName) => {
  
  // search method to directly searching for category id and matching it
  try {
    const resp1 = await fetch(
      `${process.env.TAGS_URL}?search=${categoryName}&_fields=id,name`
    );
    if (!resp1.ok) {
      throw new Error("Failed to fetch categories");
    }
    const categories = await resp1.json();
    const categoriesId = categories[0].id;
    try {
      const resp2 = await fetch(`${baseURL}?categories=${categoriesId}`);
      if (!resp2.ok) {
        throw new Error("Failed to fetch blogs by categories");
      }
      return await resp2.json();
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
  return [];
};

const searchByTags = async (tagsName) => {
  // method for directly searching for tag id and matching it
  try {
    const resp1 = await fetch(`${process.env.TAGS_URL}?search=${tagsName}&_fields=id,name`);
    if (!resp1.ok) {
        throw new Error("Failed to fetch tags"); 
      }
    const tags = await resp1.json();
    const tagsId = tags[0].id;
    // console.log(tags)
    try {
      const resp2 = await fetch(`${baseURL}?tags=${tagsId}`);
      if (!resp2.ok) {
        throw new Error(resp2);
      }
      return await resp2.json();
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
  return [];
};

const searchByContent = async (query) => {
  try {
    const response = await fetch(`${baseURL}?search=${query}`);
    if (!response.ok) {
      throw new Error("Failed to fetch blogs by content");
    }
    return await response.json();
  } catch (error) {
    console.error("Error searching blogs by content:", error.message);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

module.exports.searchBlogs = async (req, resp) => {
  const { searchInput } = req.query;
  try {
    const [categoryPosts, tagsPosts, contentPosts] = await Promise.all([
      searchByCategory(searchInput),
      searchByTags(searchInput),
      searchByContent(searchInput),
    ]);
    const mergedData = [...categoryPosts, ...tagsPosts, ...contentPosts];
    // console.log(mergedData);
    // Removed duplicate posts
    const uniqueMergedData = mergedData.reduce((acc, current) => {
      const isDuplicate = acc.some((item) => item.id === current.id);
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);
    resp.status(200).json(uniqueMergedData);
  } catch (error) {
    console.log(error);
    resp.status(500).json({ error: "Internal Server Error" });
  }
};

// Categories fetching api

module.exports.getCategories = async (req, resp) => {
  const { categoryId } = req.query;
  const url =
    process.env.CATEGORIES_URL + `?_fields=name&include=${categoryId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const data = await response.json();
    const category = await data[0].name;

    resp.status(200).json(category);
  } catch (error) {
    console.log(err);
    resp.status(500).json({ error: "Internal Server Error" });
  }
};

// Tags fetching api

module.exports.getTags = async (req, resp) => {
  const { tagsId } = req.query;
  const url = process.env.TAGS_URL + `?_fields=name&include=${tagsId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const data = await response.json();
    const tags = data.map((item) => item.name);

    resp.status(200).json(tags);
  } catch (error) {
    console.log(err);
    resp.status(500).json({ error: "Internal Server Error" });
  }
};



// controller for getting most 20 recent blogs
module.exports.getLatestBlogs = async (req, resp) => {
  const url =
    process.env.SLUG_URL +
    `?orderby=date&order=desc&per_page=20`;
  try {
    const response = await fetch(url);
    if(!response.ok){
      throw new Error("Fetch error for latest blogs");
    }
    const data = await response.json();
    resp.status(200).json(data);
  } catch (error) {
    console.log("try catch error",error)
  }
}