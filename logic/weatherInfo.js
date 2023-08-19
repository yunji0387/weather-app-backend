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
    iconURL: String
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
            temp: toUpdate.temp,
            description: toUpdate.description,
            icon: toUpdate.icon,
            iconURL: toUpdate.iconURL
          }, // Fields and values to update
          { upsert: true, new: true } // Return the modified document instead of the original
        );
        if (updatedWeather) {
          console.log("Weather info in MongoDB updated successfully.");
        } else {
          console.log("Error, Weather info in MongoDB failed to update or document not found. please check code in weatherInfo.js function: updateWeatherInfoDB.");
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
    
      //using Promise will ensure the result will returned after the "https.get" request and the response is recieved.
      return new Promise((resolve, reject) => {
        https.get(weatherAPI_URL, async function(res) {
          let result = {};
    
          if (res.statusCode >= 200 && res.statusCode < 300) {
            let data = "";
    
            res.on("data", function(chunk) {
              data += chunk;
            });
    
            res.on("end", async function() {
              const weatherData = JSON.parse(data);
              if(weatherData.cod === 200){
                result = {
                  cityName: weatherData.name,
                  lastUpdate: date,
                  temp: weatherData.main.temp,
                  description: weatherData.weather[0].description,
                  icon: weatherData.weather[0].icon,
                  iconURL: getWeatherIcon(weatherData.weather[0].icon)
                };
                console.log("Weather information from API" + " successfully requested.");
              }else{
                console.log("Error, Weather information from API" + " failed to requested. Reason unknown, please check your code in weatherInfo.js function : getWeatherInfoHTTP.");
              }
              resolve(result); // Resolve the promise with the result
            });
          } else {
            result = {};
          console.log("Error, Weather information from API" + " failed to requested. Error status code : " + res.statusCode);
            resolve(result); // Resolve the promise with the result
          }
        }).on("error", function(error) {
          reject(error); // Reject the promise if an error occurs
        });
      });
  }
  
  function getWeatherIcon(iconID){
    const result_URL = "https://openweathermap.org/img/wn/" + iconID + "@2x.png";
    return result_URL;
  }
  
  async function getWeatherInfoDB(date) {
    await updateWeatherInfoDB();
    let currWeather;
    try {
      await mongoose.connect("mongodb+srv://" + process.env.MONGO_USERNAME + ":" + process.env.MONGO_PS + "@cluster0.6gezmfg.mongodb.net/weatherDB", {useNewUrlParser: true});
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