const express = require('express');
const { Client } = require("twitter-api-sdk");
require('dotenv').config();
const ejs = require('ejs');

// Environment variables
const port = process.env.PORT || 3000;
const bearerToken = process.env.BEARER_TOKEN;

const app = express();

// Set view engine
app.set('view engine', 'ejs');

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ############################Function to get url of video from twitter#######################
async function getVideoUrl(TwitterUrl) {
    const id = TwitterUrl.split("/").pop().split("?")[0]; // get status id from url
    const client = new Client(bearerToken);
    const response = await client.tweets.findTweetsById({
        "ids": [
            id
        ],
        "expansions": [
            "attachments.media_keys"
        ],
        "media.fields": [
            "variants"
        ]
    });
    return response.includes.media[0].variants[0].url;
}

// index page
app.get('/', function (req, res) {
    res.render('index');
});

// post request to get video url
app.post('/download', async (req, res) => {
    try {
        const url = req.body.url;
        if (url === undefined || url === null || url === '') {
            return res.render('error', { error: 'Please enter a valid url' });
        }
        const videoUrl = await getVideoUrl(url);
        return res.render('download', { videoUrl });

    } catch (error) {
        if (error instanceof TypeError) {
            return res.render('error', { error: 'Please enter a valid url' });
        }
        return res.render('error', { error });    // error page
    }
});

app.listen(port, () => console.log(`listening on port ${port}!`));
