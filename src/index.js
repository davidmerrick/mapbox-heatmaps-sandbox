var mapboxgl = require('mapbox-gl')

mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

var MAP_CENTER_LAT = process.env.MAP_CENTER_LAT || -74.0060;
var MAP_CENTER_LONG = process.env.MAP_CENTER_LONG || 40.75;
var MAP_ZOOM = process.env.MAP_ZOOM || 11
var LAYER_ID = "exif-heatmap";
var DEFAULT_HEATMAP_RADIUS = 20;
var DEFAULT_HEATMAP_OPACITY = .75;
var START_DATE = new Date("2017:10:07 12:34:57");
var END_DATE = new Date("2017:10:10 15:33:49");
var exifData = null;

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [MAP_CENTER_LAT, MAP_CENTER_LONG],
    zoom: MAP_ZOOM
});

var heatmapLayer = {
    "id": LAYER_ID,
    "type": "heatmap",
    "source": "exif",
    "maxzoom": 22,
    "paint": {
        "heatmap-color": {
            "stops": [
                [0, "rgba(173,216,230,0)"], // light blue
                [0.2, "rgb(0,255,0)"], // blue
                [0.4, "rgb(50,205,50)"], // neon green
                [0.6, "rgb(255,255,0)"], // yellow
                [0.8, "rgb(255,165,0)"], // orange
                [1.0, "rgb(255,0,0)"] // red
            ]
        },
        "heatmap-radius": DEFAULT_HEATMAP_RADIUS,
        "heatmap-opacity": DEFAULT_HEATMAP_OPACITY
    }
};

map.on('load', function () {
    fetch("exif.geojson")
        .then(function(response){
            response.json().then(function(data){
                exifData = data;
                map.addSource('exif', {
                    "type": "geojson",
                    "data": exifData
                });
            })
    });

    map.addLayer(heatmapLayer, 'waterway-label');
});

function hourDelta(date1, date2){
    return Math.abs(date1 - date2) / 36e5;
}

// Filter times within 5% of this percentage value
function filterTime(tripPercentage){
    map.setFilter(LAYER_ID, function(item){
        var currentDate = new Date(item.properties.exif.DateTimeOriginal);
        var hourDelta = hourDelta(currentDate, START_DATE);
        var hourDeltaOverall = hourDelta(START_DATE, END_DATE);
        var currentTripPercentage = hourDelta/hourDeltaOverall;
        return Math.abs(tripPercentage - currentTripPercentage) < .05;
    });
    document.getElementById("time-value").innerText = tripPercentage;
}

function setRadius(value){
    map.setPaintProperty(LAYER_ID, "heatmap-radius", value);
    document.getElementById("radius-value").innerText = value;
}

function setOpacity(value){
    map.setPaintProperty(LAYER_ID, "heatmap-opacity", value);
    document.getElementById("opacity-value").innerText = value;
}

document.getElementById("radius-slider").addEventListener('input', function(e) {
    var value = parseInt(e.target.value, DEFAULT_HEATMAP_RADIUS);
    setRadius(value);
});

document.getElementById("opacity-slider").addEventListener('input', function(e) {
    var value = parseFloat(e.target.value);
    setOpacity(value);
});

document.getElementById("time-slider").addEventListener('input', function(e) {
    var value = parseInt(e.target.value);
    filterTime(value);
});

document.addEventListener("DOMContentLoaded", function(event){
    document.getElementById("radius-value").innerText = DEFAULT_HEATMAP_RADIUS;
    document.getElementById("opacity-value").innerText = DEFAULT_HEATMAP_OPACITY;
});