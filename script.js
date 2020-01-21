
$(document).ready(function () {

var APIKey = "16202c6e80fee5da38da3ef00e9cdf59";
var cityName;
var lat;
var lon;
var geoLocSuccess = false;
const modal = document.getElementById("myModal");
const span = document.getElementsByClassName("close")[0];

initializeLocalStorage();
onLoad();

$(".btn").on("click" , displayData);
$(".list-group-item").on("click" , displayData);

function initializeLocalStorage(){
    // localStorage.removeItem("weatherDataKey");
    if(!("weatherDataKey" in localStorage))
    { 
        var locations = [];
        localStorage.setItem("weatherDataKey", JSON.stringify(locations));
    }
}

function onLoad(){

    renderLocationHistory();
    displayData();
    goByUserLocation();
}

function renderLocationHistory(){
    locations = JSON.parse(localStorage.getItem("weatherDataKey"));

    for(let i = locations.length - 1 ; i>=0; i--)
    {
        $(`#listLocation${i}`).text(locations[i]);
    }
}

function updateLocalStorage(currCityName){
    locations = JSON.parse(localStorage.getItem("weatherDataKey"));

    for(let i=0; i<locations.length;i++)
    {
        if(locations[i] === currCityName)
        {
            for(let j=i; j<locations.length - 1;j++)
            {
                locations[j] = locations[j+1];
            }
            locations[locations.length - 1] = currCityName;

            localStorage.setItem("weatherDataKey", JSON.stringify(locations));

            return;
        }
    }

    if(locations.length < 5)
    {  
        locations.push(currCityName);
    }
    else
    {
        locations.shift();
        locations.push(currCityName);
    }
    
    localStorage.setItem("weatherDataKey", JSON.stringify(locations));
}

function goByUserLocation(){
    if (navigator.geolocation) {
        geoLocSuccess = true;
        navigator.geolocation.getCurrentPosition(showPosition);
    } 
   
    function showPosition(position) {
        var latitude = position.coords.latitude.toFixed(2) ;
        var longitude = position.coords.longitude.toFixed(2);
 
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/weather?appid=" + APIKey + "&lat=" + latitude + "&lon=" + longitude ,
            method: "GET",
            error: function(){
            modal.style.display = "block";

            $("#errorMsg").text("There was an error in location service. Please continue to use the app without it.");
  
            // When the user clicks on <span> (x), close the modal
            span.onclick = function() {
                modal.style.display = "none";
            }
                geoLocSuccess = false;
                displayData();
            }
            
          }).then(function(response) {
            console.log(response.name); 
            geoLocSuccess = true;
            if(geoLocSuccess)
            {cityName = response.name; displayData();}
            
          });
        }
}
function displayData(){

   if($(this).is("button")) 
   {
    event.preventDefault();
    cityName = $(".form-control").val();
    //updateLocalStorage(cityName);
   // renderLocationHistory();
    
   }
   else if($(this).is("li"))
   {
    cityName = $(this).text();
    //updateLocalStorage(cityName);
   // renderLocationHistory();
   }
   else
   {
       if(!geoLocSuccess)
       cityName = $("#listLocation4").text();
   }

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
    
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function(){

            modal.style.display = "block";
  
            // When the user clicks on <span> (x), close the modal
            span.onclick = function() {
                modal.style.display = "none";
            }
        }}).then(function(response) {
        updateLocalStorage(cityName);
        renderLocationHistory();

        //getting the current weather icon from the response data
        var iconcode = response.weather[0].icon;
        var iconurl = "https://openweathermap.org/img/w/" + iconcode + ".png";
        $("#wicon").attr('src', iconurl);

        //setting the current temperature
        let tempInK = response.main.temp;
        let tempInF = (tempInK - 273.15) * 9/5 + 32;
        $("#currTemp").text(tempInF.toFixed(2));
    
        //setting the current humidity
        $("#currHumidity").text(response.main.humidity);
    
        //setting the wind speed
        $("#currWindSpeed").text(response.wind.speed);
    
        //get the latutude and longitude to get the UV Index 
        lat = response.coord.lat;
        lon = response.coord.lon;
    
        //get the timestamp to display current day
        var timeStamp = response.dt;
        var date = new Date(timeStamp * 1000);
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
    
        var dateStr = "(" + month + "/" + date.getDate() + "/" + year + ")";
    
        $("#cityName").text(cityName + " " + dateStr);
    
        getUVIndex();
        getForecast();
    
    });
    
}

function getUVIndex(){
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lat + "&lon=" + lon ,
        method: "GET"
      }).then(function(response) {
        $("#currUVindex").text(response.value);
      });
}

function getForecast(){

    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast?appid=" + APIKey + "&lat=" + lat + "&lon=" + lon ,
        method: "GET"
    }).then(function(response){

        //console.log(response.list.length);

        var j=1;
        for(let i=3; i<response.list.length;i+=8)
        {
            //Temperature
            let tempK = response.list[i].main.temp;
            let tempF = (tempK - 273.15) * 9/5 + 32;
            $(`#tempDay${j}`).text(tempF.toFixed(2));

            //Humidity
            $(`#humDay${j}`).text(response.list[i].main.humidity);

            //Date
            var dateTimeString = response.list[i].dt_txt;
            dateString = dateTimeString.split(" ");
            dateString = moment(dateString[0], "YYYY/MM/DD").format("MM/DD/YY");
            $(`#dateDay${j}`).text(dateString);

            //Get icon
            var iconcode = response.list[i].weather[0].icon;
            var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
            $(`#wiconDay${j}`).attr('src', iconurl);

            j++;
        }
        // **** The following commented lines of code are an alternative to the code above; another way to sample the 5-day data.
        // var j = 0;
        // for(let i=0; i<response.list.length;i++)
        // {
        //     var dateTimeString = response.list[i].dt_txt;
        //     dateStringArr = dateTimeString.split(" ");
        //     timeString = dateStringArr[1];
            
        //     if(timeString === "12:00:00")
        //     {   
        //         j++;
                
        //         //Temperature
        //         let tempK = response.list[i].main.temp;
        //         let tempF = (tempK - 273.15) * 9/5 + 32;
        //         $(`#tempDay${j}`).text(tempF.toFixed(2));

        //         //Humidity
        //         $(`#humDay${j}`).text(response.list[i].main.humidity);

        //         dateString = moment(dateStringArr[0], "YYYY/MM/DD").format("MM/DD/YY");
        //         $(`#dateDay${j}`).text(dateString);

        //         //Get icon
        //         var iconcode = response.list[i].weather[0].icon;
        //         var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
        //         $(`#wiconDay${j}`).attr('src', iconurl);

        //     }
        // }

    });
}

});//end of document.ready



