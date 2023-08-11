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