//jshint esversion:6

const https = require("https");
require("dotenv").config();
const mongoose = require("mongoose");

const weatherForecastSchema = new mongoose.Schema({
    cityName: String,
    lastUpdate: Date,
    forecasts: [
        {
            dt: Number,
            temp: Number,
            feels_like: Number,
            temp_min: Number,
            temp_max: Number,
            pressure: Number,
            humidity: Number,
            weather: [
                {
                    id: Number,
                    main: String,
                    description: String,
                    icon: String,
                },
            ],
            clouds: {
                all: Number,
            },
            wind: {
                speed: Number,
                deg: Number,
                gust: Number,
            },
            visibility: Number,
            pop: Number,
            sys: {
                pod: String,
            },
            dt_txt: String,
            iconURL: String
        },
    ]
});

const WeatherForecast = mongoose.model("WeatherForecast", weatherForecastSchema);

async function updateWeatherForecastDB() {
    let curr = new Date();
    const toUpdate = await getWeatherForecastHTTP(curr);
    try {
        await mongoose.connect("mongodb+srv://" + process.env.MONGO_USERNAME + ":" + process.env.MONGO_PS + "@cluster0.6gezmfg.mongodb.net/weatherDB", { useNewUrlParser: true });
        if (Object.keys(toUpdate).length > 0) {
            const updatedWeather = await WeatherForecast.findOneAndUpdate(
                { cityName: toUpdate.cityName }, // Filter to find the document to update
                {
                    lastUpdate: toUpdate.lastUpdate,
                    forecasts: toUpdate.forecasts
                }, // Fields and values to update
                { upsert: true, new: true } // Return the modified document instead of the original
            );
            if (updatedWeather) {
                console.log("Weather forecast in MongoDB updated successfully.");
            } else {
                console.log("Error, Weather forecast in MongoDB failed to update or document not found. please check code in weatherForecast.js function: updateWeatherForecastDB.");
            }
        }
        await mongoose.connection.close();
    } catch (error) {
        console.error(error);
        await mongoose.connection.close();
    }
}

async function getWeatherForecastHTTP(date) {
    const weatherAPI_URL = "https://api.openweathermap.org/data/2.5/forecast?q=winnipeg&appid=" + process.env.WEATHER_API_KEY + "&units=metric";

    //using Promise will ensure the result will returned after the "https.get" request and the response is recieved.
    return new Promise((resolve, reject) => {
        https.get(weatherAPI_URL, async function (res) {
            let result = {};

            if (res.statusCode >= 200 && res.statusCode < 300) {
                let data = "";

                res.on("data", function (chunk) {
                    data += chunk;
                });

                res.on("end", async function () {
                    const weatherData = JSON.parse(data);
                    // console.log("data cod: " + weatherData.cod + "--" + (weatherData.cod === "200"));
                    if (weatherData.cod === "200") {
                        result = {
                            cityName: weatherData.city.name,
                            lastUpdate: date,
                            forecasts: weatherData.list.map((forecast) => ({
                                dt: forecast.dt,
                                temp: forecast.main.temp,
                                feels_like: forecast.main.feels_like,
                                temp_min: forecast.main.temp_min,
                                temp_max: forecast.main.temp_max,
                                pressure: forecast.main.pressure,
                                humidity: forecast.main.humidity,
                                weather: forecast.weather,
                                clouds: forecast.clouds,
                                wind: forecast.wind,
                                visibility: forecast.visibility,
                                //pop: forecast.pop,
                                //sys: forecast.sys,
                                dt_txt: forecast.dt_txt,
                                iconURL: getWeatherIcon(forecast.weather[0].icon)
                            })),
                        };
                        console.log("Weather forecast information from API" + " successfully requested.");
                    } else {
                        console.log("Error, Weather forecast information from API" + " failed to requested. Reason unknown, please check your code in weatherForecast.js function : getWeatherForecastHTTP.");
                        //console.log(weatherData);
                    }
                    resolve(result); // Resolve the promise with the result
                });
            } else {
                result = {};
                console.log("Error, Weather forecast information from API" + " failed to requested. Error status code : " + res.statusCode);
                resolve(result); // Resolve the promise with the result
            }
        }).on("error", function (error) {
            reject(error); // Reject the promise if an error occurs
        });
    });
}

function getWeatherIcon(iconID) {
    const result_URL = "https://openweathermap.org/img/wn/" + iconID + "@2x.png";
    return result_URL;
}

async function getWeatherForecastDB(date) {
    await updateWeatherForecastDB();
    let currWeather;
    try {
        await mongoose.connect("mongodb+srv://" + process.env.MONGO_USERNAME + ":" + process.env.MONGO_PS + "@cluster0.6gezmfg.mongodb.net/weatherDB", { useNewUrlParser: true });
        currWeather = await WeatherForecast.findOne({});
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
    return currWeather;
}

module.exports = {
    getWeatherForecastDB
};