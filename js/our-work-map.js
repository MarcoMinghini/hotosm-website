String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

var countries = {};
var projectCountries, memberCountries = [];
var activeCountries = {};
var currentTab = '';
var centroids = {};

fetch('/countries.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(jsonData) {
    countries = jsonData;
    countriesList = Object.keys(countries);
    projectCountries = countriesList.filter(function(item) {
      return countries[item].hot_program || countries[item].community_program;
    });
    memberCountries = countriesList.filter(function(item) {
      return countries[item].member && !projectCountries.includes(item);
    });
  }
);

fetch('/country-centroids.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(jsonData) {
    centroids = jsonData;
  }
);

fetch('/allProjects.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(jsonData) {
    allProjects = jsonData;
  }
);

fetch('/activeCountries.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(jsonData) {
    activeCountries = jsonData;
  }
);

function getCountriesByContinent(continent) {
  return projectCountries.filter(function(item) {
    return countries[item].continent === continent;
  });
}

function generateCountriesLinks(continent) {
  continentCountries = getCountriesByContinent(continent);
  $("#continents").addClass('hide');
  $("#countries-list").empty();
  continentCountries.map(function(item) {
    $("#countries-list").append(
      '<a href="/where-we-work/' + item.split(' ').join('-') + '" class="regions-link">' +
      item.capitalize() +
      '</a>'
    );
  });
  $("#countries-list").append('<p><a class="back-btn" onClick="showContinents()">Back to regions</a></p>');
}

function activateAfrica() {
  generateCountriesLinks('AF');
}
function activateAsia() {
  generateCountriesLinks('AS');
}
function activateEurope() {
  generateCountriesLinks('EU');
}
function activateNAmerica() {
  generateCountriesLinks('NA');
}
function activateSAmerica() {
  generateCountriesLinks('SA');
}
function activateOceania() {
  generateCountriesLinks('OC');
}

function showContinents() {
  $("#continents").removeClass('hide');
  $("#countries-list").empty();
}

mapboxgl.accessToken = 'pk.eyJ1IjoiaG90IiwiYSI6IlBtUmNiR1kifQ.dCS1Eu9DIRNZGktc24IwtA';
var map = new mapboxgl.Map({
  container: 'map',
  logoPosition: 'bottom-right',
  // scrollZoom: false,
  // dragRotate: false,
  maxZoom: 18,
  minZoom: 1.25,
  zoom: 1.25,
  center: [0, 8],
  style: 'mapbox://styles/hot/cjepk5hhz5o9w2rozqj353ut4'
});

map.on('load', function () {
  $('.mapboxgl-ctrl').addClass('hide');
  $('#loading-map').detach();

  map.addSource('countriesbetter', {
    "type": "vector",
    "url": "mapbox://hot.6w45pyli"
  });

  map.addSource('countriescentroids', {
    "type": "geojson",
    "data": centroids
  });

  map.addSource('allprojects', {
    "type": "geojson",
    "data": allProjects,
    "cluster": true,
    "clusterRadius": 50,
    "clusterMaxZoom": 6
  });


  map.addLayer({
    "id": "project_countries",
    "type": "fill",
    "source": "countriesbetter",
    "source-layer": "countries-polygon-7jl2br",
    "minzoom": 0,
    "maxzoom": 8,
    "paint": {
      "fill-pattern": "lines-red-4",
      "fill-outline-color": "#EFB4B4"
    }
  }, 'place-city-sm');

  map.addLayer({
    "id": "member_countries",
    "type": "fill",
    "source": "countriesbetter",
    "source-layer": "countries-polygon-7jl2br",
    "minzoom": 0,
    "maxzoom": 8,
    "filter": ['in', 'name_low'].concat(memberCountries),
    "paint": {
      "fill-pattern": "lines-bluelight-4",
      "fill-outline-color": "#C2C6CE"
    }
  }, 'place-city-sm');

  map.addLayer({
    "id": "centroids_project_countries",
    "type": "circle",
    "source": "countriescentroids",
    "minzoom": 0,
    "maxzoom": 8,
    "filter": ['in', 'NAME'].concat(projectCountries),
    "paint": {
      "circle-radius": 4,
      "circle-color": "#D73F3F"
    }
  }, 'place-city-sm');

  map.addLayer({
    "id": "centroids_member_countries",
    "type": "circle",
    "source": "countriescentroids",
    "minzoom": 0,
    "maxzoom": 8,
    "filter": ['in', 'NAME'].concat(memberCountries),
    "paint": {
      "circle-radius": 3,
      "circle-color": "#929DB3"
    }
  }, 'place-city-sm');

  map.addLayer({
    'id': 'active_centroids_project_countries',
    'type': 'circle',
    "source": "countriescentroids",
    "filter":['all', ['in', 'NAME'].concat(activeCountries.countries), ['in', 'NAME'].concat(projectCountries) ],
    "paint": {
            "circle-radius": 2,
            "circle-color": "#FFFFFF"
        }
  }, 'place-city-sm');

  map.addLayer({
    "id": "active_centroids_project_countries_pulse",
    "type": "circle",
    "source": "countriescentroids",
    "minzoom": 0,
    "maxzoom": 8,
    "filter":['all', ['in', 'NAME'].concat(activeCountries.countries), ['in', 'NAME'].concat(projectCountries) ],
    "paint": {
      "circle-radius": 4,
      "circle-color": "#D73F3F"
    }
  }, 'place-city-sm');

  map.addLayer({
    "id": "all-projects-edits-circle",
    "type": "circle",
    "source": "allprojects",
    "minzoom": 0,
    "maxzoom": 18,
    "filter": ['!has', 'point_count'],
    "layout" : {
      "visibility": "none"
    },
   "paint": {
    'circle-radius': {
      property: 'edits',
      stops: [
      [0, 10],
      [10000, 15],
      [50000, 20],
      [100000, 25],
      [125000, 30],
      [150000, 35],
      [200000, 40]

      ]
     },
    "circle-opacity": 0.7,
    "circle-color": "#FFC151",
    }
  }, 'place-city-sm');

  map.addLayer({
    "id": "all-projects-black-circle",
    "type": "circle",
    "source": "allprojects",
    "minzoom": 0,
    "maxzoom": 18,
    "filter": ['!has', 'point_count'],
    "layout" : {
      "visibility": "none"
    },
   "paint": {
    'circle-radius': 6.5,
    "circle-opacity": 1,
    "circle-color": "#000000",
    }
  }, 'place-city-sm');
  
map.addLayer({
    "id": "all-projects-symbol",
    "type": "symbol",
    "source": "allprojects",
    "minzoom": 0,
    "maxzoom": 18,
    "filter": ['!has', 'point_count'],
    "layout" : {
      "visibility": "none",
      "text-field": "+",
      "text-font" : ["Open Sans Bold"]
    },
   "paint": {
     "text-color": "#FFFFFF"
    }
  }, 'place-city-sm');

  map.addLayer({
    id: 'all-projects-clusters',
    type: 'circle',
    source: 'allprojects',
    "minzoom": 0,
    "maxzoom": 8,
    filter: ['has', 'point_count'],
    "layout" : {
      "visibility": "none"
    },
    paint: {
        'circle-opacity': .65,
        'circle-color': {
            property: 'point_count',
            type: 'interval',
            stops: [
                [0, '#B7BACB'],
                [50, '#B7BACB'],
                [200, '#B7BACB'],
            ]
        },
        'circle-radius': 
        {
            property: 'point_count',
            type: 'interval',
            stops: [
                [0, 35],
                [50, 50],
                [200, 65]
            ]
        }
    }
}, 'place-city-sm');

var framesPerSecond = 2;
var multiplier = 0.01;
var opacity = .1;
var circleRadius = 3;

function pulseMarker(timestamp){
  setTimeout(function() {
    requestAnimationFrame(pulseMarker)
    multiplier += .1;
    opacity -= ( .3 / framesPerSecond );
    circleRadius += ( 1 / framesPerSecond );

    map.setPaintProperty('active_centroids_project_countries_pulse', 'circle-opacity', opacity)
    map.setPaintProperty('active_centroids_project_countries_pulse', 'circle-radius', circleRadius)

    if (opacity <= 0.1) {
      opacity = 1;
      circleRadius = 3;
    }

  }, 1000 / framesPerSecond );
}

pulseMarker(0);

})
var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

  map.on('click', function(e) {
    var features = map.queryRenderedFeatures(
      [e.point.x, e.point.y],
      {layers: ['project_countries', 'member_countries']}
    );
    if (features.length) {
      var country_name = features[0].properties.name_low.split(' ').join('-');
      $(location).attr('href', '/where-we-work/' + country_name);
    }
  });
  
  map.on('click', function(e) {
    var features = map.queryRenderedFeatures(
      [e.point.x, e.point.y],
      {layers: ['all-projects-symbol', 'all-projects-black-circle', 'all-projects-edits-circle']}
    );
    if (features.length) {
      
    }
  });

  var lastCountry;
  map.on('mousemove', function(e) {
    if (currentTab === 'country-map'){
      var areaHover = map.queryRenderedFeatures(
        e.point,
        {layers: ['member_countries', 'project_countries']}
      );
      if (areaHover.length) {
        map.getCanvas().style.cursor = 'pointer';
        if (lastCountry !== areaHover[0].properties.NAME_LONG) {
          $("#hover-details").empty();
          $("#hover-details").removeClass('hide');
          $("#hover-details").append(
            '<p class="hover-name">' + areaHover[0].properties.NAME_LONG + '</p>' +
            '<p>Click on the country to see the details</p>'
          );
          lastCountry = areaHover[0].properties.NAME_LONG;
        }
      } else {
        map.getCanvas().style.cursor = '';
        lastCountry = '';
        $("#hover-details").empty();
        $("#hover-details").addClass('hide');
      }
    } else {
      var projectHover = map.queryRenderedFeatures(
        e.point,
        {layers: ['all-projects-symbol', 'all-projects-black-circle', 'all-projects-edits-circle']}
      );
      if (projectHover.length){
        map.getCanvas().style.cursor = 'pointer';
        $("#hover-details").empty();
        $("#hover-details").removeClass('hide');
        $("#hover-details").append(
          '<p class="hover-name">' + projectHover[0].properties.title + '</p>' +
          '<p class= "hover-edits">' + formatedData(projectHover[0].properties.edits) + ' Edits </p>' 
        );
        var coordinates = projectHover[0].geometry.coordinates.slice();
        var description = "<html><h6><a target='_blank' href='https://tasks.hotosm.org/project/" + projectHover[0].properties.id
                          + "'</a>#" + projectHover[0].properties.id + " - "
                          + projectHover[0].properties.title + "</h6></html>";
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup.setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
        
      } else {
        map.getCanvas().style.cursor = '';
        $("#hover-details").empty();
        $("#hover-details").addClass('hide');
        popup.remove();
      }
    }
  });

map.on('mousemove', 'all-projects-clusters', function (e) {
  $("#hover-details").empty();
  $("#hover-details").removeClass('hide');
  $("#hover-details").append(
    '<p class="hover-name">'+ e.features[0].properties.point_count + ' tasking manager projects</p>' +
    '<p>Zoom in to explore projects in the cluster</p>'
 );
});

var fullMap = false;

function expandMap() {
  if (fullMap) {
    map.scrollZoom.disable();
    $('.project-index-header').removeClass('hidden');
    $('.mapboxgl-ctrl').addClass('hide');
    $('#regions-select').addClass('hidden');
  } else {
    map.scrollZoom.enable();
    $('.project-index-header').addClass('hidden');
    $('.home-highlights-wrapper').addClass('right');
    $('.home-highlights-wrapper').addClass('right');
    $('.mapboxgl-ctrl').removeClass('hide');
    $('#regions-select').removeClass('hidden');
  }
  fullMap = !fullMap;
}

function countryTabSwitch(evt, tabName) {
  currentTab = tabName;
  evt.currentTarget.className += ' active';
  var projectLayers = ['all-projects-symbol', 'all-projects-black-circle', 'all-projects-edits-circle', 'all-projects-clusters']
  var countryLayers = ['project_countries', 'member_countries', 'centroids_project_countries', 'centroids_member_countries', 'active_centroids_project_countries', 'active_centroids_project_countries_pulse']
  var countryLegends = ['prefix-legend', 'projects-legend', 'active-legend', 'member-legend']
  var projectLegends = ['project-area-legend']
  tablinks = document.getElementsByClassName('tablinks');
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  }
  evt.currentTarget.className += ' active';
  if (tabName === 'project-map') {
    $('#expand-collapse').removeClass('hide');
    for (let i =0; i<projectLegends.length; i++){
      $('#'+projectLegends[i]).removeClass('hide');
    }
    for (let i =0; i<countryLegends.length; i++){
      $('#'+countryLegends[i]).addClass('hide');
    }
    for (let i=0; i< projectLayers.length; i++) {
      map.setLayoutProperty(projectLayers[i], 'visibility', 'visible')
    }
    for (let j=0; j< countryLayers.length; j++) {
      map.setLayoutProperty(countryLayers[j], 'visibility', 'none')
    }
  } else if (tabName === 'country-map') {
    $('#expand-collapse').addClass('hide');
    for (let i =0; i<countryLegends.length; i++){
      $('#'+countryLegends[i]).removeClass('hide');
    }
    for (let i =0; i<projectLegends.length; i++){
      $('#'+projectLegends[i]).addClass('hide');
    }
    for (let i=0; i< projectLayers.length; i++) {
      map.setLayoutProperty(projectLayers[i], 'visibility', 'none')
    }
    for (let j=0; j< countryLayers.length; j++) {
      map.setLayoutProperty(countryLayers[j], 'visibility', 'visible')
    }}
}

function legend(event, legend){
  if (legend === 'cluster'){
    if (event === 'expand'){
      // $('#legend-sep').removeClass('hide')
      $('#lone-project-legend').addClass('hide')
      $('#cluster-detailed').removeClass('hide')
      $('#cluster-collapse').removeClass('hide')
      $('#cluster-expand').addClass('hide')
    } else {
      $('#lone-project-legend').removeClass('hide')
      $('#cluster-detailed').addClass('hide')
      $('#cluster-collapse').addClass('hide')
      $('#cluster-expand').removeClass('hide')
    }
    
  } else {
    if (event === 'expand'){
      console.log('Give details')
      $('#cluster-legend').addClass('hide')
      $('#collapse').removeClass('hide')
      $('#expand').addClass('hide')
      $('#lone-project-detailed').removeClass('hide')
      // $('#legend-sep').removeClass('hide')
    } else {
      console.log('Hide details')
      $('#cluster-legend').removeClass('hide')
      $('#expand').removeClass('hide')
      $('#collapse').addClass('hide')
      $('#lone-project-detailed').addClass('hide')
      // $('#legend-sep').addClass('hide')
    }
  }
  
  
}

