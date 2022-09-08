import './style.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Draw } from 'ol/interaction';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';

const raster = new TileLayer({
  source: new OSM(),
});

const source = new VectorSource();
const vector = new VectorLayer({
  source: source,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.2)',
    'stroke-color': 'black',
    'stroke-width': 4,
    'circle-radius': 7,
    'circle-fill-color': 'black',
  },
});


const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [1528647, 6631453],
    zoom: 14
  }),
});

let draw;

function addInteractions() {
  draw = new Draw({
    source: source,
    type: 'Polygon',
  });
  map.addInteraction(draw);
}
const textBox = document.getElementById('api-output');

function requestOapiProcesses(url, payload) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify(payload);

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch(url, requestOptions)
    .then(response => response.json())
    .then(json => {
      var html = `
      <h2>input</h2>
      <p><pre><code>${JSON.stringify(payload, null, 2)}</code></pre></p>
      <h2>output</h2>
      <p><pre><code>${JSON.stringify(json, null, 2)}</code></pre></p>
      `;
      textBox.innerHTML = html;
    })
    .catch(error => console.log('error', error));
}


addInteractions();

draw.on('drawstart', () => {
  source.clear();
});

draw.on('drawend', (event) => {
  const polygonFeature3857 = event.feature;
  var formatGeoJson = new GeoJSON({
    featureProjection: 'EPSG:3857'
  });
  const geoJsonGeom = formatGeoJson.writeGeometry(polygonFeature3857.getGeometry());
  const url = "https://demo.pygeoapi.io/stable/processes/hello-world/execution";
  const payload = {
    "mode": "async",
    "inputs": {
      "name": "Jakob",
      "customGeom": {
        "value": geoJsonGeom,
        "mediaType": "application/geo+json"
      }
    }
  };
  console.log(payload);
  requestOapiProcesses(url, payload)
})
