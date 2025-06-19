// types/leaflet-extensions.d.ts
import * as L from 'leaflet';

declare module 'leaflet' {
  interface MarkerClusterGroup extends L.LayerGroup {
    addLayer(layer: L.Layer): this;
    removeLayer(layer: L.Layer): this;
    clearLayers(): this;
    refreshClusters(): void;
    getVisibleParent(marker: L.Marker): L.Layer;
    spiderfy(): void;
    unspiderfy(): void;
  }

  interface MarkerCluster extends L.Marker {
    getChildCount(): number;
    getAllChildMarkers(): L.Marker[];
    getBounds(): L.LatLngBounds;
  }

  namespace markerClusterGroup {
    interface MarkerClusterGroupOptions {
      showCoverageOnHover?: boolean;
      zoomToBoundsOnClick?: boolean;
      spiderfyOnMaxZoom?: boolean;
      removeOutsideVisibleBounds?: boolean;
      animate?: boolean;
      animateAddingMarkers?: boolean;
      disableClusteringAtZoom?: number;
      maxClusterRadius?: number | ((zoom: number) => number);
      polygonOptions?: L.PolylineOptions;
      singleMarkerMode?: boolean;
      spiderLegPolylineOptions?: L.PolylineOptions;
      spiderfyDistanceMultiplier?: number;
      iconCreateFunction?: (cluster: MarkerCluster) => L.Icon | L.DivIcon;
      clusterPane?: string;
      chunkedLoading?: boolean;
    }
  }

  function markerClusterGroup(options?: markerClusterGroup.MarkerClusterGroupOptions): MarkerClusterGroup;
}