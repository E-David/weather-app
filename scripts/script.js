var switchViewContainerNode = document.querySelector(".switch-view-container"),
	weatherDisplayContainerNode = document.querySelector(".weather-display-container"),
	searchBarNode = document.querySelector(".search-bar")

var weatherBaseUrl = "https://api.darksky.net/forecast/",
	googleGeocodeBaseUrl = "https://maps.googleapis.com/maps/api/geocode/json?"
	DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']


var getWeatherData = function(positionObject) {
	console.log(positionObject)
    var lat = positionObject.coords.latitude,
        long = positionObject.coords.longitude,
        forecastUrl = weatherBaseUrl + API_KEY + "/" + lat + "," + long + "?callback=?",
        hash = location.hash.substring(1),
		//excludes certain data results for faster data retrieval
        cleanForecastUrl = cleanUrl(forecastUrl,hash)
        //creates function name from inputHandler function (current/hourly/daily)
        inputFunctionFromHash = "input" + hash + "WeatherHtml"

    console.log(cleanForecastUrl)
    var promise = $.getJSON(cleanForecastUrl)
    showGif()
    //window[] takes inputFunctionFromHash string and outputs function for promise.then method
    promise.then(window[inputFunctionFromHash])
}

//formats url to exclude all data types except for provided hash
var cleanUrl = function(forecastUrl,hash) {
	var hash = hash.toLowerCase(),
		excludeArray = ["minutely","flags","monthly"]

	if(hash === "current"){
		excludeArray.push(["hourly","daily"])
	} else if(hash === "hourly"){
		excludeArray.push(["currently","daily"])
	} else if(hash === "daily"){
		excludeArray.push(["currently","hourly"])
	}

    var cleanForecastUrl = forecastUrl + "&exclude=" + excludeArray.join(",")
    return cleanForecastUrl;
}

var inputCurrentWeatherHtml = function(weatherData) {
	var currentTemperature = weatherData.currently.temperature
	htmlString = ""
	htmlString += "<p>" + formatTemperature(currentTemperature) + "</p>"
	weatherDisplayContainerNode.innerHTML = htmlString
}

var inputHourlyWeatherHtml = function(weatherData) {
	var hourlyWeatherArray = weatherData.hourly.data,
		htmlString = ""

	htmlString += "<ol class='hourly-weather'>"
	for(var i = 0; i <= 24; i++) {
		var timeToParse = new Date(parseInt(hourlyWeatherArray[i].time + "000")),
			hour = timeToParse.getHours()
			temperature = hourlyWeatherArray[i].temperature

		htmlString += "<li>" + formatHour(hour) + ": " + formatTemperature(temperature) + "</li>"
	}
	htmlString += "</ol>"

	weatherDisplayContainerNode.innerHTML = htmlString
}

var inputDailyWeatherHtml = function(weatherData) {
	var dailyWeatherArray = weatherData.daily.data,
		htmlString = ""
	
	htmlString += "<ol class='daily-weather'>"
	for(var i = 0; i <= 6; i++) {
		var timeToParse = new Date(parseInt(dailyWeatherArray[i].time + "000")),
			day = DAYS[timeToParse.getDay()],
			minTemperature = dailyWeatherArray[i].temperatureMin,
			maxTemperature = dailyWeatherArray[i].temperatureMax

		htmlString += "<li>" + day + ": High - " + formatTemperature(maxTemperature)
		+ " Low - " + formatTemperature(minTemperature) + "</li>"
	}
	htmlString += "</ol>"

	weatherDisplayContainerNode.innerHTML = htmlString
}

var formatHour = function(hourInt) {
	if (hourInt > 12) {
	    hourInt -= 12
	    return hourInt + "PM"
	} else if (hourInt === 0) {
	   hourInt = 12;
	}
	return hourInt + "AM"
}

var formatTemperature = function(tempInt) {
	return Math.round(tempInt) + "F"
}

var showGif = function() {
	weatherDisplayContainerNode.innerHTML = '<img src="./imgs/sun loading.gif">'
}

var inputHandler = function(clickEvent) {
	var buttonClicked = clickEvent.target,
		buttonName = buttonClicked.value
	//names hash from HTML of button clicked by user (HTML should be current, hourly, or daily)
	location.hash = buttonName
}

var hashController = function(coordinates) {
	navigator.geolocation.getCurrentPosition(getWeatherData)
}

var search = function(eventObj){
	if(eventObj.keyCode === 13){
		var searchNode = eventObj.target,
		searchTerms = searchNode.value
		getLocation(searchTerms)
		searchNode.value = ""
	}
}

var getLocation = function(searchTerms) {
	googleGeocodeUrl = googleGeocodeBaseUrl + "key=" + GOOGLE_API + "&address=" + searchTerms
	var promise = $.getJSON(googleGeocodeUrl)
	promise.then(getLatAndLong)
}

var getLatAndLong = function(geocodeData) {
	var geocodeDataArray = geocodeData.results,
		geocodeFirstResult = geocodeDataArray[0],
		geocodeLocationObject = geocodeFirstResult.geometry.location,
		coordinates = {
			coords: {
				latitude: geocodeLocationObject.lat,
				longitude: geocodeLocationObject.lng
			}
		}
	getWeatherData(coordinates)
}

window.addEventListener('hashchange',hashController)
switchViewContainerNode.addEventListener('click',inputHandler)
searchBarNode.addEventListener('keydown',search)

navigator.geolocation.getCurrentPosition(getWeatherData)
location.hash = "Current"
