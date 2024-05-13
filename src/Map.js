import React, { useRef, useEffect, useState} from "react";
import mapboxgl from "mapbox-gl";
import "./Map.css";
import { portsDataGeoJson } from "./ports";
import { SidePanel } from "./components/SidePanel";
import { getLatestLocationOfShips, getParticularShipGeoData, getShipNames, getShipNamesPassedThroughPort } from "./shipsArray";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZXNwYWNlc2VydmljZSIsImEiOiJjbHZ1dHZjdTQwMDhrMm1uMnoxdWRibzQ4In0.NaprcMBbdX07f4eXXdr-lw";

function getRandomColor() {
  // Generate random values for red, green, and blue components
  const red = Math.floor(Math.random() * 256); // Random value between 0 and 255
  const green = Math.floor(Math.random() * 256); // Random value between 0 and 255
  const blue = Math.floor(Math.random() * 256); // Random value between 0 and 255

  // Convert RGB values to hexadecimal format
  const redHex = red.toString(16).padStart(2, '0'); // Ensure two digits
  const greenHex = green.toString(16).padStart(2, '0'); // Ensure two digits
  const blueHex = blue.toString(16).padStart(2, '0'); // Ensure two digits

  // Combine RGB components into a hexadecimal color code
  const colorHex = `#${redHex}${greenHex}${blueHex}`;

  return colorHex;
}
const Map = () => {
  const mapContainerRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState("2024-05-03"); // Default to 3rd May 2024
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [shipsPassed, setShipsPassed] = useState([]);
  const [portClicked, setPortClicked] = useState(null);


  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [-87.65, 41.84],
      zoom: 3,
    });

    map.on("load", function () {
      // Add an image to use as a custom marker
      map.loadImage(
        "https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png",
        function (error, image) {
          if (error) throw error;
          map.addImage("custom-marker", image);
          // Add a GeoJSON source with multiple points
          map.addSource("ports", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: portsDataGeoJson,
            },
          });

          // layer for port markers

          map.addLayer({
            id: "ports",
            type: "symbol",
            source: "ports",
            layout: {
              "icon-image": "custom-marker",
              // get the title name from the source's "title" property
              "text-field": ["get", "title"],
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-offset": [0, 1.25],
              "text-anchor": "top",
            },
          });

          // TO show names of the ships that have passed through this port. 
          map.on('mouseenter', 'ports', (e) => {
            setShipsPassed(getShipNamesPassedThroughPort(e.features[0].properties));
            setPortClicked(e.features[0].properties);
            setShowSidePanel(true);
          });

          // /* Here Source  for ships , then line layer for ships then symbol for ship name is added */
          //TODO - give a select option to user, which if he enables then only ship lines are shown.
          const shipNames = getShipNames();
          shipNames.forEach((shipName) => {
            map.addSource(shipName, {
              type: "geojson",
              data: getParticularShipGeoData(shipName, selectedDate)
            })
            map.addLayer({
              id: `${shipName}_line`,
              type: "line",
              source: shipName,
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                'line-color': getRandomColor(),
                'line-width': 4
              }
            });
  
            map.addLayer({
              id:  `${shipName}_symbol`,
              type: "symbol",
              source: shipName,
              layout: {
                  "text-field": ["get", "title"], // Get the ship name from the "title" property
                  "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
                  "text-size": 12,
                  "text-offset": [0, 0.5], // Offset to position the label above the line
                  "text-anchor": "top"
              },
              paint: {
                  "text-color": "#000" // Color of the text labels
              }
            });
            let popup;

            map.on('mouseenter', `${shipName}_line`, (e) => {
              map.getCanvas().style.cursor = 'pointer';
              const coordinates = e.lngLat;
              const shipTitle = e.features[0].properties.title;
              popup = new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(shipTitle)
                .addTo(map);
            });

            map.on('mouseleave', `${shipName}_line`, () => {
              map.getCanvas().style.cursor = '';
              if (popup) {
                popup.remove(); // Remove the popup from the map
                popup = null; // Set popup to null to indicate it has been removed
              }
            });

          })

          






          
        }
      );
      
      // To add latestLocationOfShips source
      map.addSource('latestLocationOfShips', {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: getLatestLocationOfShips(), 
        }
        
      })
      
      // To add shipName Text Layer
      map.addLayer({
        id: "ships",
        type: "symbol",
        source: "latestLocationOfShips",
        layout: {
          // get the title name from the source's "title" property
          "icon-image": "ship-marker",
          "text-field": ["get", "title"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 1.25],
          "text-anchor": "top",
        },
      })

      // TO add ship-marker icon layer
      const shipGeoJson = getLatestLocationOfShips();
      shipGeoJson.forEach(({ geometry }) => {
        const markerElement = document.createElement('div');
        markerElement.className = 'marker';
        new mapboxgl.Marker(markerElement)
          .setLngLat(geometry.coordinates)
          .addTo(map);
      })




    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Clean up on unmount
    return () => map.remove();
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  //TODO - Make a seperate componet for Select Date

  return (
    <div>

      <div>
        <label htmlFor="date-select">Select Date: </label>
        <select id="date-select" value={selectedDate} onChange={handleDateChange}>
          <option value="2024-04-27">27th April 2024</option>
          <option value="2024-04-28">28th April 2024</option>
          <option value="2024-04-29">29th April 2024</option>
          <option value="2024-04-30">30th April 2024</option>
          <option value="2024-05-01">1st May 2024</option>
          <option value="2024-05-02">2nd May 2024</option>
          <option value="2024-05-03">3rd May 2024</option>
        </select>
      </div>

      {
        showSidePanel &&
        <SidePanel
          shipsPassed={shipsPassed}
          portClicked={portClicked}
        />
      }
      
      <div className="map-container" ref={mapContainerRef} />

    </div>
  )
};

export default Map;
