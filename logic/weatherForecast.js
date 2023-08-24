//jshint esversion:6

const https = require("https");
require("dotenv").config();
const mongoose = require("mongoose");

const weatherForecastSchema = new mongoose.Schema({
    cod: Number,
    message: Number,
    cnt: Number,
    cityName: String,
    lastUpdate: Date,
    city: {
        id: Number,
        name: String,
        coord: {
            lat: Number,
            lon: Number,
        },
        country: String,
        population: Number,
        timezone: Number,
        sunrise: Number,
        sunset: Number,
    },
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
            iconURL: String,
        },
    ],
});

const WeatherForecast = mongoose.model("WeatherForecast", weatherForecastSchema);

async function updateWeatherForecastDB(city) {
    let curr = new Date();
    const toUpdate = await getWeatherForecastHTTP(curr, city);
    try {
        await mongoose.connect("mongodb+srv://" + process.env.MONGO_USERNAME + ":" + process.env.MONGO_PS + "@cluster0.6gezmfg.mongodb.net/weatherDB", { useNewUrlParser: true });
        if (Object.keys(toUpdate).length > 0) {
            const updatedWeather = await WeatherForecast.findOneAndUpdate(
                { cityName: toUpdate.city.name }, // Use city name as a filter
                {
                    cod: parseInt(toUpdate.cod),
                    message: toUpdate.message,
                    cnt: toUpdate.cnt,
                    lastUpdate: toUpdate.lastUpdate,
                    city: toUpdate.city,
                    forecasts: toUpdate.forecasts,
                },
                { upsert: true, new: true }
            );
            if (updatedWeather) {
                console.log("Weather forecast in MongoDB updated successfully.");
            } else {
                console.log("Error, Weather forecast in MongoDB failed to update or document not found. Please check the code in weatherForecast.js function: updateWeatherForecastDB.");
            }
        }
        await mongoose.connection.close();
    } catch (error) {
        console.error(error);
        await mongoose.connection.close();
    }
}

async function getWeatherForecastHTTP(date, city) {
    const weatherAPI_URL = "https://api.openweathermap.org/data/2.5/forecast?q=Winnipeg&appid=" + process.env.WEATHER_API_KEY + "&units=metric";
    if (city !== undefined) {
        weatherAPI_URL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + process.env.WEATHER_API_KEY + "&units=metric";
    }

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
                    if (weatherData.cod === "200") {
                        result = {
                            cityName: weatherData.city.name,
                            lastUpdate: date,
                            cod: parseInt(weatherData.cod),
                            message: weatherData.message,
                            cnt: weatherData.cnt,
                            city: weatherData.city,
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
                                dt_txt: forecast.dt_txt,
                                iconURL: getWeatherIcon(forecast.weather[0].icon)
                            })),
                        };
                        console.log("Weather forecast information from API" + " successfully requested.");
                    } else {
                        console.log("Error, Weather forecast information from API" + " failed to requested. Reason unknown, please check your code in weatherForecast.js function : getWeatherForecastHTTP.");
                    }
                    resolve(result);
                });
            } else {
                result = {};
                console.log("Error, Weather forecast information from API" + " failed to requested. Error status code : " + res.statusCode);
                resolve(result);
            }
        }).on("error", function (error) {
            reject(error);
        });
    });
}

function getWeatherIcon(iconID) {
    const result_URL = "https://openweathermap.org/img/wn/" + iconID + "@2x.png";
    return result_URL;
}

async function getWeatherForecastDB(city) {
    await updateWeatherForecastDB(city);
    if (city === undefined) {
        city = "Winnipeg"
    }
    let currWeather;
    try {
        await mongoose.connect("mongodb+srv://" + process.env.MONGO_USERNAME + ":" + process.env.MONGO_PS + "@cluster0.6gezmfg.mongodb.net/weatherDB", { useNewUrlParser: true });
        currWeather = await WeatherForecast.findOne({ cityName: city });
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