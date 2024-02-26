
require("dotenv").config()
const axios= require('axios')

module.exports.getBlogs = async (req, resp) => {
    try {
        const response = await axios.get(process.env.URL);
        const data = response.data;
        resp.status(200).json(data);
    } catch (err) {
        console.log(err);
        resp.status(500).json({ error: 'Internal Server Error' });
    }
}