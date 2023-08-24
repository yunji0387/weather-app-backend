//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const cors = require("cors");
const weatherInfo = require(__dirname + "/logic/weatherInfo.js");
const weatherForecast = require(__dirname + "/logic/weatherForecast.js");
const sampleJson = require(__dirname + "/logic/sampleAPI.js");


const app = express();

// app.use(cors({ origin: "https://sky-cast-854836ef4892.herokuapp.com" }));
app.use(cors({ origin: "*" }));

app.set("view engine", "ejs");
require("dotenv").config();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/", async function (req, res) {
    res.render("home");
});

app.get("/sample", async function (req, res) {
    res.json(sampleJson.getSampleJson());
});

app.post("/data", async function (req, res) {
    try {
        // Get the key from the request body
        const clientKey = req.body.key;
        // const testAuth = req.headers.key;
        //console.log(testAuth);
        const city = req.query.city;

        // Check if the clientKey matches the secretKey
        if (clientKey === process.env.ACCESS_KEY) {
            const weatherCurrData = await weatherInfo.getWeatherInfoDB(city);
            const weatherForecastData = await weatherForecast.getWeatherForecastDB(city);
            const weatherData = {
                curr: weatherCurrData,
                forecast: weatherForecastData
            };
            res.json(weatherData);
        } else {
            // If the key doesn't match, return a 401 Unauthorized status
            res.status(401).json({ error: "Unauthorized access", check: clientKey });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch weather data." });
    }
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port 3000");
});