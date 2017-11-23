var mapboxgl = require('mapbox-gl')

mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

var MAP_CENTER_LAT = process.env.MAP_CENTER_LAT || -74.0060;
var MAP_CENTER_LONG = process.env.MAP_CENTER_LONG || 40.75;
var MAP_ZOOM = process.env.MAP_ZOOM || 11
var LAYER_ID = "exif-heatmap";
var DEFAULT_HEATMAP_RADIUS = 20;
var DEFAULT_HEATMAP_OPACITY = .75;
var START_DATE;
var END_DATE;
var exifData;

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

map.on('load', () => {
    fetch("exif.geojson")
        .then(response => response.json())
        .then(data => {
            exifData = data;

            initializeStartAndEndDates(exifData);

            map.addSource('exif', {
                "type": "geojson",
                "data": exifData
            });
            map.addLayer(heatmapLayer, 'waterway-label');
        });
});

function initializeStartAndEndDates(exifData){
    let sorted = exifData.features.sort((a, b) => {
        let aDate = new Date(a.properties.gpsTime);
        let bDate = new Date(b.properties.gpsTime);
        return aDate - bDate;
    });
    START_DATE = new Date(sorted[0].properties.gpsTime);
    END_DATE = new Date(sorted[sorted.length - 1].properties.gpsTime);
}

// Filter times within 5% of this percentage value
function filterTime(tripPercentage){
    let filteredFeatures = exifData.features.filter(item => {
        let currentDate = new Date(item.properties.gpsTime);
        let hourDelta = Math.abs(currentDate - START_DATE) / 36e5;
        let hourDeltaOverall = Math.abs(START_DATE - END_DATE) / 36e5;
        let currentTripPercentage = hourDelta/hourDeltaOverall;
        return Math.abs(tripPercentage/100 - currentTripPercentage) < .05;
    });
    let clonedData = Object.assign({}, exifData);
    clonedData.features = filteredFeatures;
    map.getSource('exif').setData(clonedData);

    document.getElementById("time-value").innerText = `${tripPercentage}%`;
}

function setRadius(value){
    map.setPaintProperty(LAYER_ID, "heatmap-radius", value);
    document.getElementById("radius-value").innerText = value;
}

function setOpacity(value){
    map.setPaintProperty(LAYER_ID, "heatmap-opacity", value);
    document.getElementById("opacity-value").innerText = value;
}

document.getElementById("radius-slider").addEventListener('input', e => {
    var value = parseInt(e.target.value, DEFAULT_HEATMAP_RADIUS);
    setRadius(value);
});

document.getElementById("opacity-slider").addEventListener('input', e => {
    var value = parseFloat(e.target.value);
    setOpacity(value);
});

document.getElementById("time-slider").addEventListener('input', e => {
    var value = parseInt(e.target.value);
    filterTime(value);
});

document.addEventListener("DOMContentLoaded", e => {
    document.getElementById("radius-value").innerText = DEFAULT_HEATMAP_RADIUS;
    document.getElementById("opacity-value").innerText = DEFAULT_HEATMAP_OPACITY;
});