var addChecklistItemEl = document.querySelector("#add-checklist-item");
var checklistSubmitBtn = document.querySelector("#checklist-submit");
var checklistEl = document.querySelector(".checklist");
var airQualityAPIToken = "7b5c7d5703572e06ba542ad579df8cd721c962cd";
var cityNameSearchEl = document.querySelector("#city-name-search");
var airQualitySearchEl = document.querySelector("#air-quality-search-box");
var airQualitySearchTableCellEl = document.querySelector("#air-quality-search-items");

var checklistArray = [];

function init() {
    // Get stored checklist from local storage
    var storedChecklist = JSON.parse(localStorage.getItem("checklist"));

    // Updates checklist array if there was a stored checklist from local storage
    if (storedChecklist !== null) {
        checklistArray = storedChecklist;
    }

    renderChecklist();
}

// Renders checklist items as <li> elements
function renderChecklist() {
    checklistEl.innerHTML = "";

    for (var i = 0; i < checklistArray.length; i++) {
        var checklistItemText = checklistArray[i];

        var checklistItem = document.createElement("label");
        checklistItem.classList.add("checkbox");
        checklistItem.innerHTML = "<input type='checkbox' id='individualCheckbox' data-index='" + i + "'>" + checklistItemText;
        checklistEl.appendChild(checklistItem);
    }
}

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

            // Empties search results list
            airQualitySearchTableCellEl.innerHTML = "";

            renderSearchResults(searchResults);
            retrieveAirQuality(topResultUrl);
        }
    })
}

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

function renderSearchResults(searchResults) {
    for(var i = 0; i < searchResults.length; i++) {
        var airQualitySearchCellEl = document.createElement("tr");
        airQualitySearchCellEl.innerHTML = "<td>"+searchResults[i].station.name+"</td><td>"+searchResults[i].time.stime+"</td>";
        airQualitySearchTableCellEl.appendChild(airQualitySearchCellEl);
    }
}

function renderAirQuality(airQuality) {
    console.log(airQuality);
}


//non profit API 

    var getbutton = document.getElementById('get-button');
    var organizationsContainer = document.getElementById('organizations');

    function getApi() {
        var requestUrl = 'https://api.data.charitynavigator.org/v2/organizations?app_id=503ffc66&app_key=d75996a1f4f75a04e4644d92b1467e8f&search=environment&per_page=5';

    fetch(requestUrl)
        .then(function (response) {
              return response.json();
      })
        .then(function (data) {
          for (var i = 0; i < data.length; i++) {
               var organizationName = document.createElement('h3');
               var organizationState = document.createElement('p');
               var organizationCity = document.createElement('p');

               organizationName.textContent = data[i].charityName;
               organizationState.textContent = data[i].stateOrProvince;
               organizationCity.textContent = data[i].city;


               organizationsContainer.append(organizationName);
               organizationsContainer.append(organizationState);
               organizationsContainer.append(organizationCity);

            }
      })
    }
    getbutton.addEventListener('click', getApi);