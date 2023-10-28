//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const cors = require("cors");
// const weatherInfo = require(__dirname + "/logic/weatherInfo.js");
// const weatherForecast = require(__dirname + "/logic/weatherForecast.js");
const sampleJson = require(__dirname + "/logic/sampleAPI.js");
const weatherCurr = require(__dirname + "/logic/weatherCurrentAPI.js");
const weatherForecast2 = require(__dirname + "/logic/weatherForecastAPI.js");

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

app.post("/data/weather", async function (req, res) {
    try {
        const authHeader = req.headers.authorization; // Get the authorization header from the request

        // Check if the authHeader exists and starts with "Bearer "
        if (authHeader && authHeader.startsWith("Bearer ")) {
            // Extract the token part (without "Bearer ")
            const token = authHeader.split(" ")[1];

            // Check if the token matches your secret key
            if (token === process.env.ACCESS_KEY) {
                let lat = req.query.lat;
                let lon = req.query.lon;
                let addressName = req.body.address;

                if(lat !== undefined && lon !== undefined){
                    lat = parseFloat(lat).toFixed(4);
                    lon = parseFloat(lon).toFixed(4);
                }else{
                    lat = 49.8954;
                    lon = -97.1385;
                }

                const weatherCurrData = await weatherCurr.getWeatherCurrDB(lat, lon, addressName);
                const weatherForecastData = await weatherForecast2.getWeatherForecastDB(lat, lon, addressName);
                const weatherData = {
                    curr: weatherCurrData,
                    forecast: weatherForecastData
                };
                res.json(weatherData);
            } else {
                // If the token doesn't match, return a 401 Unauthorized status
                res.status(401).json({ error: "Unauthorized access" });
            }
        } else {
            // If the header is missing or doesn't start with "Bearer ", return a 401 Unauthorized status
            res.status(401).json({ error: "Unauthorized access" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch weather data." });
    }
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port 3000");
});