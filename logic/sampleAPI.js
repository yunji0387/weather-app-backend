//jshint esversion:6

function getSampleJson() {
    return ({
        curr: {
            cityName: "String",
            lastUpdate: "Date",
            temp: "Number",
            description: "String",
            icon: "String",
            iconURL: "String",
            coord: {
                lon: "Number",
                lat: "Number"
            },
            weather: [
                {
                    id: "Number",
                    main: "String",
                    description: "String",
                    icon: "String"
                }
            ],
            base: "String",
            main: {
                temp: "Number",
                feels_like: "Number",
                temp_min: "Number",
                temp_max: "Number",
                pressure: "Number",
                humidity: "Number",
                sea_level: "Number",
                grnd_level: "Number"
            },
            visibility: "Number",
            wind: {
                speed: "Number",
                deg: "Number",
                gust: "Number"
            },
            rain: {
                "1h": "Number"
            },
            clouds: {
                all: "Number"
            },
            dt: "Number",
            sys: {
                typeCode: "Number",
                id: "Number",
                country: "String",
                sunrise: "Number",
                sunset: "Number"
            },
            timezone: "Number",
            id: "Number",
            cod: "Number"
        },
        forecast: {
            cod: "Number",
            message: "Number",
            cnt: "Number",
            cityName: "String",
            lastUpdate: "Date",
            city: {
                id: "Number",
                name: "String",
                coord: {
                    lat: "Number",
                    lon: "Number",
                },
                country: "String",
                population: "Number",
                timezone: "Number",
                sunrise: "Number",
                sunset: "Number",
            },
            forecasts: [
                {
                    dt: "Number",
                    temp: "Number",
                    feels_like: "Number",
                    temp_min: "Number",
                    temp_max: "Number",
                    pressure: "Number",
                    humidity: "Number",
                    weather: [
                        {
                            id: "Number",
                            main: "String",
                            description: "String",
                            icon: "String",
                        },
                    ],
                    clouds: {
                        all: "Number",
                    },
                    wind: {
                        speed: "Number",
                        deg: "Number",
                        gust: "Number",
                    },
                    visibility: "Number",
                    pop: "Number",
                    sys: {
                        pod: "String",
                    },
                    dt_txt: "String",
                    iconURL: "String",
                },
            ]
        }
    });
}

module.exports = {
    getSampleJson
};