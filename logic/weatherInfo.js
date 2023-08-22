//jshint esversion:6

const https = require("https");
require("dotenv").config();
const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
  cityName: String,
  lastUpdate: Date,
  temp: Number,
  description: String,
  icon: String,
  iconURL: String,
  coord: {
    lon: Number,
    lat: Number
  },
  weather: [
    {
      id: Number,
      main: String,
      description: String,
      icon: String
    }
  ],
  base: String,
  main: {
    temp: Number,
    feels_like: Number,
    temp_min: Number,
    temp_max: Number,
    pressure: Number,
    humidity: Number,
    sea_level: Number,
    grnd_level: Number
  },
  visibility: Number,
  wind: {
    speed: Number,
    deg: Number,
    gust: Number
  },
  rain: {
    "1h": Number
  },
  clouds: {
    all: Number
  },
  dt: Number,
  sys: {
    typeCode: Number,
    id: Number,
    country: String,
    sunrise: Number,
    sunset: Number
  },
  timezone: Number,
  id: Number,
  cod: Number
});

const Weather = mongoose.model("Weather", weatherSchema);

async function updateWeatherInfoDB() {
  let curr = new Date();
  const toUpdate = await getWeatherInfoHTTP(curr);
  try {
    await mongoose.connect("mongodb+srv://" + process.env.MONGO_USERNAME + ":" + process.env.MONGO_PS + "@cluster0.6gezmfg.mongodb.net/weatherDB", { useNewUrlParser: true });
    if (Object.keys(toUpdate).length > 0) {
      const updatedWeather = await Weather.findOneAndUpdate(
        { cityName: toUpdate.cityName }, // Filter to find the document to update
        {
          lastUpdate: toUpdate.lastUpdate,
          temp: toUpdate.main.temp,
          description: toUpdate.weather[0].description,
          icon: toUpdate.weather[0].icon,
          iconURL: toUpdate.iconURL,
          coord: toUpdate.coord,
          weather: toUpdate.weather,
          base: toUpdate.base,
          main: toUpdate.main,
          visibility: toUpdate.visibility,
          wind: toUpdate.wind,
          rain: toUpdate.rain,
          clouds: toUpdate.clouds,
          dt: toUpdate.dt,
          sys: {
            typeCode: toUpdate.sys.type,
            id: toUpdate.sys.id,
            country: toUpdate.sys.country,
            sunrise: toUpdate.sys.sunrise,
            sunset: toUpdate.sys.sunset,
          },
          timezone: toUpdate.timezone,
          id: toUpdate.id,
          cod: toUpdate.cod
        }, // Fields and values to update
        { upsert: true, new: true } // Return the modified document instead of the original
      );
      if (updatedWeather) {
        console.log("Weather info in MongoDB updated successfully.");
      } else {
        console.log("Error, Weather info in MongoDB failed to update or document not found. Please check the code in weatherInfo.js function: updateWeatherInfoDB.");
      }
    }
    await mongoose.connection.close();
  } catch (error) {
    console.error(error);
    await mongoose.connection.close();
  }
}

async function getWeatherInfoHTTP(date) {
  const weatherAPI_URL = "https://api.openweathermap.org/data/2.5/weather?q=Winnipeg&appid=" + process.env.WEATHER_API_KEY + "&units=metric";

  // Using async/await to simplify the code
  try {
    const response = await fetch(weatherAPI_URL);
    if (!response.ok) {
      throw new Error("Weather information from API failed to request. Error status code: " + response.status);
    }

    const weatherData = await response.json();

    if (weatherData.cod === 200) {
      const result = {
        cityName: weatherData.name,
        lastUpdate: date,
        temp: weatherData.main.temp,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        iconURL: getWeatherIcon(weatherData.weather[0].icon),
        coord: weatherData.coord,
        weather: weatherData.weather,
        base: weatherData.base,
        main: weatherData.main,
        visibility: weatherData.visibility,
        wind: weatherData.wind,
        rain: weatherData.rain,
        clouds: weatherData.clouds,
        dt: weatherData.dt,
        sys: weatherData.sys,
        timezone: weatherData.timezone,
        id: weatherData.id,
        cod: weatherData.cod
      };
      console.log("------------------------");
      console.log(result);
      console.log("Weather information from API successfully requested.");
      return result;
    } else {
      console.log("Error, Weather information from API failed to request. Reason unknown, please check your code in weatherInfo.js function: getWeatherInfoHTTP.");
      return {};
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {};
  }
}


function getWeatherIcon(iconID) {
  const result_URL = "https://openweathermap.org/img/wn/" + iconID + "@2x.png";
  return result_URL;
}

async function getWeatherInfoDB(date) {
  await updateWeatherInfoDB();
  let currWeather;
  try {
    await mongoose.connect("mongodb+srv://" + process.env.MONGO_USERNAME + ":" + process.env.MONGO_PS + "@cluster0.6gezmfg.mongodb.net/weatherDB", { useNewUrlParser: true });
    currWeather = await Weather.findOne({});
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
  return currWeather;
}

module.exports = {
  getWeatherInfoDB
};