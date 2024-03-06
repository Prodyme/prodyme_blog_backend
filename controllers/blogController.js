require("dotenv").config();
const axios = require("axios");
const fuzzyset = require("fuzzyset");

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
module.exports.getBlog = async (req, resp) => {
  const { slug } = req.query;
  try {
    const result = await axios.get(process.env.POSTS_URL + `?slug=${slug}`);
    // console.log(result.data);
    const data = result.data; // Extracting data from Axios response
    resp.status(200).json(data);
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "Internal Server Error" });
  }
};

// Code for search functionality
// Replace base url with env variable
const baseURL =
  "https://public-api.wordpress.com/wp/v2/sites/amansamant23.wordpress.com/posts";

async function fetchCategories() {
  const url = process.env.CATEGORIES_URL + "?_fields=id,name";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const categories = await response.json();

    // Convert categories to the desired format
    const categoryList = {};
    categories.forEach((category) => {
      categoryList[category.name] = category.id;
    });

    return categoryList;
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    throw error;
  }
}

async function fetchTags() {
  const url = process.env.TAGS_URL + "?_fields=id,name";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch tags");
    }
    const tags = await response.json();

    // Convert tags to the desired format
    const tagsList = {};
    tags.forEach((tag) => {
      tagsList[tag.name] = tag.id;
    });
    // console.log(tagsList);
    return tagsList;
  } catch (error) {
    console.error("Error fetching tags:", error.message);
    throw error;
  }
}

// const categoryList = {
//   Aman: 249591,
//   "HELLOW WORLD CATEGORY": 769759474,
//   Productivity: 2704,
//   Testing: 12,
//   Uncategorized: 1,
// };

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
  // Convert the input category name to lowercase
  const lowerCategoryName = categoryName.toLowerCase();

  // Split the input category name into an array of words
  const categoryWords = lowerCategoryName.split(" ");

  // Fetch the category list
  const categoryList = await fetchCategories();

  // Create a fuzzyset dictionary from the category list
  const categoryFuzzyset = fuzzyset(Object.keys(categoryList));

  // Initialize an empty array to store matching categories
  const matchingCategories = [];

  // Perform fuzzy matching on the entire lowerCategoryName
  const fullMatch = categoryFuzzyset.get(lowerCategoryName);
  if (fullMatch && fullMatch[0] && fullMatch[0][0] >= 0.6) {
    matchingCategories.push(fullMatch[0][1]);
  }

  // Iterate over each word in the input category name
  for (const word of categoryWords) {
    // Get the fuzzy matches for the current word
    const matches = categoryFuzzyset.get(word);

    // Check if a match with similarity score >= 0.6 is found
    if (matches && matches[0] && matches[0][0] >= 0.6) {
      // If a match is found, add the matched category to the array of matching categories
      const matchedCategory = matches[0][1];
      matchingCategories.push(matchedCategory);
    }
  }

  // Make categoryId string for URL
  let categoryIds = "";

  // Iterate over the matching categories
  for (const matchedCategory of matchingCategories) {
    // Get the corresponding category ID from the category list
    const categoryId = categoryList[matchedCategory];
    categoryIds += categoryId + ",";
  }

  // Remove trailing comma
  categoryIds = categoryIds.replace(/,$/, "");

  // If categoryIds is not empty, fetch blogs by categories
  if (categoryIds !== "") {
    try {
      const response = await fetch(`${baseURL}?categories=${categoryIds}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blogs by category");
      }
      return await response.json();
    } catch (error) {
      console.error("Error searching blogs by category:", error.message);
      throw error; // Re-throw the error to handle it in the calling function
    }
  } else {
    // If no match or low similarity score, return an empty array or handle accordingly
    return [];
  }
};


const searchByTags = async (tagsName) => {
  // Convert the input tags name to lowercase
  const lowerTagsName = tagsName.toLowerCase();

  // Split the input tags name into an array of words
  const tagsWords = lowerTagsName.split(" ");
  // fetching taglist
  const tagsList = await fetchTags();

  // Initialize an empty array to store matching tags
  const matchingTags = [];

  // setting fuzzy word list/dictionary
  const tagsFuzzyset = fuzzyset(Object.keys(tagsList));

  // Perform fuzzy matching on the entire lowerTagsName
  const fullMatch = tagsFuzzyset.get(lowerTagsName);
  if (fullMatch && fullMatch[0] && fullMatch[0][0] >= 0.6) {
    matchingTags.push(fullMatch[0][1]);
  }

  // Iterate over each word in the input tags name
  for (const word of tagsWords) {
    // Use fuzzyset to get fuzzy matches for the current word
    const matches = tagsFuzzyset.get(word);

    // Check if a match with similarity score >= 0.6 is found
    if (matches && matches[0] && matches[0][0] >= 0.6) {
      // If a match is found, add the matched tag to the array of matching tags
      const matchedTag = matches[0][1];
      matchingTags.push(matchedTag);
    }
  }

  // making tagId string for url

  let tagsId = "";
  for (const matchedTag of matchingTags) {
    // Get the corresponding tag ID from the tags list
    tagsId = tagsId + tagsList[matchedTag] + ", ";
  }

  // Remove trailing comma and space
  tagsId = tagsId.replace(/,\s*$/, "");

  if (tagsId !== "") {
    try {
      const response = await fetch(`${baseURL}?tags=${tagsId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blogs by category");
      }
      return await response.json();
    } catch (error) {
      console.error("Error searching blogs by category:", error.message);
      throw error; // Re-throw the error to handle it in the calling function
    }
  } else {
    // If no match or low similarity score, return an empty array or handle accordingly
    return [];
  }
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
    console.log(err);
    resp.status(500).json({ error: "Internal Server Error" });
  }
};



// Categories fetching api

module.exports.getCategories = async (req,resp) => {
  const {categoryId} = req.query;
  const url = process.env.CATEGORIES_URL + `?_fields=name&include=${categoryId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const data = await response.json();
    const category = await data[0].name

    resp.status(200).json(category);
  } catch (error) {
    console.log(err);
    resp.status(500).json({ error: "Internal Server Error" });
  }
}

