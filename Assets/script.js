var addChecklistItemEl = document.querySelector("#add-checklist-item");
var checklistSubmitBtn = document.querySelector("#checklist-submit");
var checklistEl = document.querySelector(".checklist");
var airQualityAPIToken = "7b5c7d5703572e06ba542ad579df8cd721c962cd";
var cityNameSearchEl = document.querySelector("#city-name-search");
var airQualitySearchEl = document.querySelector("#air-quality-search-box");
var airQualitySearchTableCellEl = document.querySelector("#air-quality-search-items");
var stationNameEl = document.querySelector(".station-name");
var airQualityTableCellEl = document.querySelector("#air-quality-items");
var signUpModalCloseEl = document.querySelector(".delete");
var signUpModalEl = document.querySelector(".sign-up");
var signUpModalSubmitEl = document.querySelector(".sign-up-submit");
var signUpNameEl = document.querySelector(".sign-up-name");
var signUpEmailEl = document.querySelector(".sign-up-email");
var checklistArray = [];
var userArray = [];

// On page load, information from local storage is grabbed and rendered
function init() {
    // Get stored checklist from local storage
    var storedChecklist = JSON.parse(localStorage.getItem("checklist"));

    // Get stored user info from sign up from local storage
    var storedUser = JSON.parse(localStorage.getItem("signUpInfo"));

    // Updates checklist array if there was a stored checklist from local storage
    if (storedChecklist !== null) {
        checklistArray = storedChecklist;
        renderChecklist();
    }

    if (storedUser !== null) {
        userArray = storedUser;

        renderSignUp();
    }
}

// Renders checklist items as <li> elements
function renderChecklist() {
    checklistEl.innerHTML = "";

    for (var i = 0; i < checklistArray.length; i++) {
        var checklistItemText = checklistArray[i];

        var checklistItem = document.createElement("label");
        checklistItem.classList.add("checkbox");
        checklistItem.innerHTML = "<input type='checkbox' id='individualCheckbox' data-index='" + i + "'><p>" + checklistItemText + "</p>";
        checklistEl.appendChild(checklistItem);
    }
}

// When user checks off a checklist item
checklistEl.addEventListener("click", function(event) {
  var element = event.target;

  // Checks if element is a checkbox
    if (element.matches("#individualCheckbox") === true) {
    // Get its data-index value and remove the checklist element from the list
    var index = element.getAttribute("data-index");
    console.log(index);
    checklistArray.splice(index, 1);
    console.log(checklistArray);

    // Store updated checklist array in localStorage, re-render the list
    storeChecklist();
    renderChecklist();
  }
});

// Stores checklist array in local storage
function storeChecklist() {
    localStorage.setItem("checklist", JSON.stringify(checklistArray));
}

// When user clicks submit after typing checklist item
checklistSubmitBtn.addEventListener("click", function(event) {
    event.preventDefault();

    var item = addChecklistItemEl.value.trim();
    
    // Returns from function early if item is blank
    if(item === "") {
        return;
    }

    // Adds checklist item to checklist array and clears input box
    checklistArray.push(item);
    addChecklistItemEl.value = "";

    storeChecklist();
    renderChecklist();
});

// Retrieves any data from local storage and loads (if there are any)
init();

// Air Quality API
// When user searches for city name for air quality
airQualitySearchEl.addEventListener("submit", function(event) {
    event.preventDefault();

    var cityName = cityNameSearchEl.value.trim();

    // Returns from function early if item is blank
    if(cityName === "") {
        return;
    }

    // Resets search box
    cityNameSearchEl.value = "";

    retrieveStations(cityName);
});

// Uses user input to search for station and it's air quality using API
function retrieveStations(cityName) {
    var airQualityStationSearchURL = "http://api.waqi.info/search/?keyword="+cityName+"&token="+airQualityAPIToken;

    fetch(airQualityStationSearchURL)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        if(data.status === "ok") {
            // Saves search results to variable
            var searchResults = data.data;
            // Saves url of top result to variable
            var topResultUrl = data.data[0].station.url;

            // Empties search results list and air quality results list and makes them visible
            airQualitySearchTableCellEl.innerHTML = "";
            airQualityTableCellEl.innerHTML = "";
            document.querySelector("#air-quality-output").style.display = "block";
            document.querySelector("#air-quality-search-result").style.display = "block";
            airQualitySearchEl.classList.add("is-one-quarter");
            

            renderSearchResults(searchResults);
            retrieveAirQuality(topResultUrl);
        }
    })
}

// Uses user input to fetch air quality data from API
function retrieveAirQuality(topResultUrl) {
    var airQualityAPIUrl = "http://api.waqi.info/feed/"+topResultUrl+"/?token="+airQualityAPIToken;

    fetch(airQualityAPIUrl)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if(data.status === "ok") {
            // Saves air quality results to variable
            var airQualityResult = {
                aqi: data.data.aqi,
                name: data.data.city.name,
                iaqi: data.data.iaqi,
                date: data.data.time
            }

            renderAirQuality(airQualityResult);
        }
    })
}

// Renders search results of station names
function renderSearchResults(searchResults) {
    for(var i = 0; i < searchResults.length; i++) {
        var airQualitySearchCellEl = document.createElement("tr");
        airQualitySearchCellEl.className = "search-result-cell";
        airQualitySearchCellEl.innerHTML = "<td id='search-result-station-name' data-name='"+searchResults[i].station.name+"'>"+searchResults[i].station.name+"</td><td>"+searchResults[i].time.stime+"</td>";
        airQualitySearchTableCellEl.appendChild(airQualitySearchCellEl);
    }
}

// Renders air quality information from API
function renderAirQuality(airQuality) {
    stationNameEl.textContent = "Station Name: " + airQuality.name + " on " + airQuality.date.s;

    // Air quality index
    var aqi = document.createElement("tr");
    aqi.innerHTML = "<th>Air Quality Index</th><td>"+(airQuality?.aqi ?? "N/A")+"</td>";
    airQualityTableCellEl.appendChild(aqi);

    // Humidity
    var humidity = document.createElement("tr");
    humidity.innerHTML = "<th>Humidity</th><td>"+(airQuality.iaqi.h?.v ?? "N/A")+"</td>";
    airQualityTableCellEl.appendChild(humidity);

    // Ozone
    var oz = document.createElement("tr");
    oz.innerHTML = "<th>Ozone</th><td>"+(airQuality.iaqi.o3?.v ?? "N/A")+"</td>";
    airQualityTableCellEl.appendChild(oz);

    // Air pressure
    var pressure = document.createElement("tr");
    pressure.innerHTML = "<th>Atmospheric Pressure</th><td>"+(airQuality.iaqi.p?.v ?? "N/A")+"</td>";
    airQualityTableCellEl.appendChild(pressure);

    // Concentration of PM2.5
    var pm25 = document.createElement("tr");
    pm25.innerHTML = "<th>PM<sub>2.5</sub></th><td>"+(airQuality.iaqi.pm25?.v ?? "N/A")+"</td>";
    airQualityTableCellEl.appendChild(pm25);

    // Concentration of PM10
    var pm10 = document.createElement("tr");
    pm10.innerHTML = "<th>PM<sub>10</sub></th><td>"+(airQuality.iaqi.pm10?.v ?? "N/A")+"</td>";
    airQualityTableCellEl.appendChild(pm10);

    // Concentration of carbon monoxide
    var co = document.createElement("tr");
    co.innerHTML = "<th>Carbon Monoxide</th><td>"+(airQuality.iaqi.co?.v ?? "N/A")+"</td>";
    airQualityTableCellEl.appendChild(co);

    // Concentration of nitrogen dioxide
    var no = document.createElement("tr");
    no.innerHTML = "<th>Nitrogen Dioxide</th><td>"+(airQuality.iaqi.no2?.v ?? "N/A")+"</td>";
    airQualityTableCellEl.appendChild(no);

    // Concentration of sulfur dioxide
    var so = document.createElement("tr");
    so.innerHTML = "<th>Sulfur Dioxide</th><td>"+(airQuality.iaqi.so2?.v ?? "N/A")+"</td>";
    airQualityTableCellEl.appendChild(so);
}

// When user clicks on station name from search results, it pulls up the air quality results
airQualitySearchTableCellEl.addEventListener("click", function(event) {
    var element = event.target;

    // Checks if element is a station name from search history
    if(element.matches("#search-result-station-name")) {
        // Gets station name
        var name = element.getAttribute("data-name");

        retrieveStations(name);
    }
});

// To close sign-up for email modal
signUpModalCloseEl.addEventListener("click", closeModal);

function closeModal() {
    signUpModalEl.remove("is-active");
}

// Checks for user input for email modal and closes when successful
signUpModalSubmitEl.addEventListener("click", function() {

    // checks for invalid inputs first, then stores correct inputs in local storage
    if(signUpNameEl.value === "" && signUpEmailEl.value === "") {
        signUpNameEl.classList.add("is-danger");
        signUpEmailEl.classList.add("is-danger");
    } else if (signUpEmailEl.value === "") {
        signUpEmailEl.classList.add("is-danger");
    } else if (signUpNameEl.value === "") {
        signUpNameEl.classList.add("is-danger");
    } else {
        var email = signUpEmailEl.value;
        var name = signUpNameEl.value;

        storeSignUp(name, email);
        closeModal();
    }
})

// Stores user input from sign up modal to  local storage
function storeSignUp(name, email) {
    var user = {
        name,
        email
    }
    localStorage.setItem("signUpInfo", JSON.stringify(user));
}

// Renders any user input from local storage
function renderSignUp() {
    signUpNameEl.value = userArray.name;
    signUpEmailEl.value = userArray.email;

    var message = document.createElement("p");
    message.textContent = "You already signed up for email updates with this name and email!";
    document.querySelector(".modal-card-body").appendChild(message);
}

//non profit API 

var getbutton = document.getElementById("get-button");
var organizationsContainer = document.getElementById("organizations");

    function getApi() {
        var requestUrl = 'https://api.data.charitynavigator.org/v2/organizations?app_id=592a5b63&app_key=4ef18feab51a23a01a4aa299fb1030b7&categoryID=4&pageSize=15';

    fetch(requestUrl)
        .then(function (response) {
              return response.json();
      })
        .then(function (data) {
          for (var i = 0; i < data.length; i++) {
               var organizationName = document.createElement('h2');
               var organizationState = document.createElement('h2');
               var organizationSpacing = document.createElement('p');

               organizationName.textContent = data[i].charityName;
               organizationName.classList.add("title");
               organizationName.classList.add("is-2");
               organizationState.textContent = data[i].mailingAddress.stateOrProvince + ', ' + data[i].mailingAddress.city;
               organizationState.classList.add("title");
               organizationState.classList.add("is-3");
               organizationSpacing.textContent = "----------------------------------------------------";


               organizationsContainer.appendChild(organizationName);
               organizationsContainer.appendChild(organizationState);
               organizationsContainer.appendChild(organizationSpacing);

            }
      })
    }
    getbutton.addEventListener('click', getApi);