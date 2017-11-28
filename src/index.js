mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

const MAP_CENTER_LAT = process.env.MAP_CENTER_LAT || -71.0;
const MAP_CENTER_LONG = process.env.MAP_CENTER_LONG || 42.4487;
const MAP_ZOOM = process.env.MAP_ZOOM || 11
const LAYER_ID = "exif-heatmap";
const DEFAULT_HEATMAP_RADIUS = 20;
const DEFAULT_HEATMAP_OPACITY = .75;
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

            let sortedFeatures = exifData.features.sort((a, b) => {
                let aDate = new Date(a.properties.gpsTime);
                let bDate = new Date(b.properties.gpsTime);
                return aDate - bDate;
            });

            exifData.features = sortedFeatures;

            map.addSource('exif', {
                "type": "geojson",
                "data": exifData
            });
            map.addLayer(heatmapLayer, 'waterway-label');
        });
});

function filterTime(percentageValue){
    let tripPercentage = percentageValue/100;
    let indexAtPercentage = Math.floor(tripPercentage * (exifData.features.length - 1));
    let sliced = exifData.features.slice(0, indexAtPercentage);
    let clonedData = Object.assign({}, exifData);
    clonedData.features = sliced;
    map.getSource('exif').setData(clonedData);

    document.getElementById("time-value").innerText = `${percentageValue}%`;
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