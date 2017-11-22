Play with parameters for a heatmap, including radius and opacity.

![](img/demo.gif)

# Getting started

## Configuration

1. Process your images into geoJSON with [this script](https://github.com/davidmerrick/extract-exif-as-geojson).
2. Set up a [MapBox account](https://www.mapbox.com/) and login.
3. Grab a MapBox token from [here](https://www.mapbox.com/studio/account/tokens/).
4. Copy the `.env.example` file to `.env`, and paste in your MapBox token.
5. Put your EXIF geoJSON in `public/exif.geojson`.

Optionally, you can use the following environment variables to configure starting latitude, longitude, and zoom, respectively:
MAP_CENTER_LAT, MAP_CENTER_LONG, and MAP_ZOOM.

## Building

This project is built with NodeJS, WebPack, and Yarn. Make sure you have those installed. 

1. Install the node modules with `yarn install`.
2. Build the project with `webpack`.

## Running 

1. Run `docker-compose up`.
2. Load [localhost:8080](http://localhost:8080) in your browser.

