import { useState, useRef, useEffect, useMemo } from 'react';
import Map, { Source, Layer, type MapRef, type LayerProps } from 'react-map-gl/maplibre';
import { bbox } from '@turf/turf';
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/App.css';
import jsonData from './assets/data.json';
import { makeGeoJSON, type CrashData } from './geo/makeGeoJSON';
import { useAtom } from 'jotai';
import { selectedPointAtom, filterStateAtom } from './state';
import { House } from 'lucide-react';
import './styles/Map.css';

const MAPTILER_STYLE_URI = import.meta.env.VITE_MAPTILER_STYLE_URI;
const data = jsonData as unknown as CrashData[];

const clusterLayer: LayerProps = {
  id: 'clusters',
  type: 'circle',
  source: 'crashes',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#42a5f5',  // Medium blue for smallest clusters
      25, '#1e88e5',  // Darker blue
      50, '#1565c0', // Even darker blue
      100, '#0d47a1'  // Very dark blue for largest clusters
    ],
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['get', 'point_count'],
      1, 20,
      100, 40,
      1000, 60
    ]
  }
};

const clusterCountLayer: LayerProps = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'crashes',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 16,
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': 'rgba(0, 0, 0, 0.25)',
    'text-halo-width': 1
  }
};

const unclusteredPointLayer: LayerProps = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'crashes',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'case',
      ['==', ['get', 'hasDeaths'], true], '#d32f2f', // Red if has deaths
      ['==', ['get', 'hasInjuries'], true], '#fbc02d', // Yellow if has injuries
      '#388e3c' // Green otherwise
    ],
    'circle-radius': 12,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff'
  }
};

export default function Map__() {

  const mapRef = useRef<MapRef>(null);
  const [selectedPoint, setSelectedPoint] = useAtom(selectedPointAtom);
  const [filters] = useAtom(filterStateAtom);
  const [cursor, setCursor] = useState<string>('grab');
  const [showHomeButton, setShowHomeButton] = useState<boolean>(false);

  // Filter data based on state
  const filteredGeoJSON = useMemo(() => {
    const filteredData = data.filter(d => {
      // Filter by Municipality
      if (filters.municipality !== 'All' && d.Municipality !== filters.municipality) {
        return false;
      }
      // Filter by Severity
      if (filters.severity === 'Deaths' && !d.hasDeaths) return false;
      if (filters.severity === 'Injuries' && !d.hasInjuries) return false;

      // Filter by Date
      if (filters.startDate || filters.endDate) {
        const crashDate = d["Date (DD/MM/YY)"] as string; // Format is YYYY-MM-DD
        if (filters.startDate && crashDate < filters.startDate) return false;
        if (filters.endDate && crashDate > filters.endDate) return false;
      }

      return true;
    });
    return makeGeoJSON(filteredData);
  }, [filters]);

  // Calculate bounds for filtered data
  const dataBounds = useMemo(() => {
    try {
      return bbox(filteredGeoJSON);
    } catch (e) {
      console.error("Error calculating bbox", e);
      return null;
    }
  }, [filteredGeoJSON]);

  // Fit bounds when filters change
  useEffect(() => {
    if (mapRef.current && dataBounds) {
      // Check if bounds are valid (not all zeros or Infinity)
      const isValid = dataBounds.every(n => isFinite(n));
      if (isValid) {
        mapRef.current.fitBounds(dataBounds as [number, number, number, number], {
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
          duration: 1000
        });
      }
    }
  }, [dataBounds]);

  useEffect(() => {
    console.log('Selected Point changed:', selectedPoint);
    if (selectedPoint) {
      setMapCenter(selectedPoint.longitude, selectedPoint.latitude);
    }
  }, [selectedPoint]);

  function resetBounds() {
    setShowHomeButton(false);
    if (mapRef.current && dataBounds) {
      mapRef.current.fitBounds(dataBounds as [number, number, number, number], {
        padding: {
          top: 100, bottom: 100, left: 100, right: 100
        }, duration: 1000
      });
    }
  }

  function onClickCluster(clusterId: number, coordinates: [number, number]) {
    const source = mapRef.current?.getSource('crashes') as GeoJSONSource;
    if (source && source.getClusterExpansionZoom) {
      // Get the zoom level to expand the cluster
      source.getClusterExpansionZoom(clusterId).then((zoom) => {
        mapRef.current?.easeTo({
          center: coordinates,
          zoom: zoom * 1.2,
          duration: 500
        });
      }).catch((err) => {
        console.error('Error getting cluster expansion zoom:', err);
      });
    }
  }

  function setMapCenter(longitude: number, latitude: number) {
    mapRef.current?.easeTo({
      center: [longitude, latitude],
      duration: 500,
      padding: {
        left: 400, // Offset for sidebar
      }
    });
  }

  function onClickMap(e: MapLayerMouseEvent) {
    setShowHomeButton(true);
    if (e.features && e.features[0]) {
      const feature = e.features[0];
      const properties = feature.properties;

      // Check if clicked on a cluster
      if (properties?.cluster) {
        const clusterId = properties.cluster_id as number;
        const source = mapRef.current?.getSource('crashes') as GeoJSONSource;
        const geometry = feature.geometry;

        if (source && geometry && geometry.type === 'Point') {
          const coordinates = geometry.coordinates as [number, number];
          onClickCluster(clusterId, coordinates);
        }
      } else {
        // Regular point click
        setSelectedPoint(properties as CrashData);
      }
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', height: '100%' }}>
      <Map
        attributionControl={false}
        ref={mapRef}
        initialViewState={{
          longitude: -123.0,
          latitude: 49.2,
          zoom: 10
        }}
        style={{ flex: 1 }}
        mapStyle={MAPTILER_STYLE_URI}
        interactiveLayerIds={['clusters', 'unclustered-point']}
        cursor={cursor}
        onMouseEnter={() => setCursor('pointer')}
        onMouseLeave={() => setCursor('grab')}
        onLoad={e => {
          if (dataBounds) {
            e.target.fitBounds(dataBounds as [number, number, number, number], {
              padding: { top: 100, bottom: 100, left: 100, right: 100 },
              duration: 1000
            });
          }
        }}
        onClick={onClickMap}
      >
        <Source
          id="crashes"
          type="geojson"
          data={filteredGeoJSON}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      </Map>
      {showHomeButton && (
        <span className='circle-button float-bottom-right' onClick={resetBounds} title="Reset View">
          <House color="white" size={30} strokeWidth={2} />
        </span>
      )}
    </div>
  );
}