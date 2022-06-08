import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import MapGL, { Marker, Map, Source, Layer } from 'react-map-gl';
import { Editor, DrawPolygonMode } from 'react-map-gl-draw';
import inside from 'point-in-polygon';
// import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
  selectedCoordinatesLayer,
} from './components/layers';
import './style.css';

const MAPBOX_TOKEN =
  'pk.eyJ1Ijoia2Vpbm8iLCJhIjoiOE5oc094SSJ9.DHxjhFy2Ef33iP8yqIm5cA';

const DEFAULT_VIEWPORT = {
  width: 800,
  height: 600,
  longitude: 23,
  latitude: 23,
  zoom: 3,
};

const INIT_MAKERS = [
  { id: 'lsadf;rk', longitude: 23.3, latitude: 21.3, toggle: false },
  { id: 'lredf;k', longitude: 14, latitude: 20, toggle: false },
  { id: 'lsadf;k', longitude: 13, latitude: 23, toggle: false },
];

const geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [23.3, 21.3] },
      properties: { id: 'lsadf;k', toggle: false },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [14, 20] },
      properties: { id: 'lsadf;rk', toggle: false },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [10, 30] },
      properties: { id: 'lsadf;rr', toggle: false },
    },
  ],
};

export default function App() {
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [markers, setMarkers] = useState({});
  const [mode, setMode] = useState(null);
  // const [isDataLoading, setIsDataLoading] = useState(true);
  const [features, setFeatures] = useState([]);

  const updateViewport = (viewport) => {
    setViewport(viewport);
  };

  useEffect(() => {
    if (geojson.features) {
      setMarkers(geojson);
      // setIsDataLoading(false);
    }
  }, [geojson]);

  useEffect(() => {
    console.log("updated markers coordinates", markers);
  }, [markers])

  const handleUpdate = (val) => {
    // console.log('handle update data', val);
    setFeatures(val.data);

    if (val.editType === 'addFeature') {
      const polygon = val.data[0].geometry.coordinates[0];
      // console.log('polygon', polygon);
      const newMarkers = markers.features.map((marker, i) => {
        const { geometry } = marker;
        const { coordinates } = geometry;
        let longitude = coordinates[0];
        let latitude = coordinates[1];

        console.log("longitude", longitude)
        console.log("latitude", latitude)
        const isInsidePolygon = inside([longitude, latitude], polygon);
        console.log("isInsidePolygon", isInsidePolygon)

        return { ...marker, properties: { ...marker.properties, toggle: isInsidePolygon } };
      });

      const updatedMarker = {...markers, features: newMarkers}

      console.log("newMarkers", newMarkers)
      console.log("updatedMarker", updatedMarker)
      setMarkers(updatedMarker);
      setFeatures([]);
      setMode(null);
    }
  };

  const handleModeChange = () => {
    setMode(new DrawPolygonMode());
  };

  return (
    <MapGL
      {...viewport}
      width="100%"
      height="100%"
      mapboxApiAccessToken={MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/dark-v9"
      onViewportChange={updateViewport}
    >
      <Editor
        clickRadius={12}
        mode={mode}
        onUpdate={handleUpdate}
        features={features}
      />

       <Source
        id="earthquakes"
        type="geojson"
        data={markers}
        // data={"https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredPointLayer} />
        <Layer {...selectedCoordinatesLayer} />
      </Source>

      {/* markers */}
      {/* {markers.map(({ longitude, latitude, toggle, id }) => (
        <Marker key={id} latitude={latitude} longitude={longitude}>
          <span
            style={{
              backgroundColor: toggle ? 'red' : 'black',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              display: 'block',
            }}
          />
        </Marker>
      ))} */}

      {/* toolbar */}
      <div className="toolbar-wrapper">
        <div
          className={`tool-wrapper ${mode ? 'active' : ''}`}
          onClick={handleModeChange}
        >
          {/* <CenterFocusStrongIcon /> */}X
        </div>
      </div>
    </MapGL>
  );
}
