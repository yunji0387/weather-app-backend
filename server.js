//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); 
const weatherInfo = require(__dirname + "/logic/weatherInfo.js");
const weatherForecast = require(__dirname + "/logic/weatherForecast.js");


const app = express();

app.use(cors({ origin: "https://sky-cast-854836ef4892.herokuapp.com" }));

require("dotenv").config();
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(express.static("public"));

// app.get("/", async function(req, res){
//     try {
//         const currentTime = new Date();
//         const weatherCurrData = await weatherInfo.getWeatherInfoDB(currentTime);
//         const weatherForecastData = await weatherForecast.getWeatherForecastDB(currentTime);
//         const weatherData = {
//             curr: weatherCurrData,
//             forecast: weatherForecastData
//         };
//         res.json(weatherData);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to fetch weather data." });
//     }
// });

app.post("/", async function(req, res){
    try {
        // Get the key from the request body
        const clientKey = req.body.key;
        // Check if the clientKey matches the secretKey
        if (clientKey === process.env.ACCESS_KEY) {
            const currentTime = new Date();
            const weatherCurrData = await weatherInfo.getWeatherInfoDB(currentTime);
            const weatherForecastData = await weatherForecast.getWeatherForecastDB(currentTime);
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

app.listen(process.env.PORT || 3000, function(){
    console.log("Server started on port 3000");
});