<template>
  <div>
    <template v-if="!!this.google && !!this.map">
      <slot :google="google" :map="map"/>
    </template>
    <div class="map-container">
      <div id="map" class="map"></div>
    </div>
  </div>
</template>

<script>
import GoogleMapsApiLoader from "google-maps-api-loader";
import { mapState } from "vuex";

export default {
  props: {
    mapConfig: Object,
    apiKey: String
  },
  data() {
    return {
      google: null
    };
  },
  mounted() {
    GoogleMapsApiLoader({
      apiKey: this.apiKey
    }).then(google => {
      this.google = google;
      this.initializeMap();
    });
  },
  computed: {
    ...mapState({
      store: state => state.stores.selectedStoreId,
      country: state => state.stores.selectedCountryId,
      mapLoaded: state => state.stores.mapLoaded
    })
  },
  watch: {
    store: function() {
      this.mapLoaded && this.panToSelectedStore();
    },
    country: function(val) {
      this.selectCountry(val);
    },
    mapLoaded: function() {
      this.store && this.panToSelectedStore();
    }
  },
  methods: {
    initializeMap() {
      const mapContainer = this.$el.querySelector("#map");
      const { Map } = this.google.maps;
      this.map = new Map(mapContainer, this.mapConfig);
      const { Geocoder } = this.google.maps;
      this.geocoder = new Geocoder();
      this.mapIsLoaded();
    },
    mapIsLoaded() {
      this.$store.dispatch({
        type: "stores/mapLoaded"
      });
    },
    panToSelectedStore() {
      const storeSelected = this.$store.getters["stores/getSelectedStore"];
      if (storeSelected.lat !== "" && storeSelected.lng !== "") {
        this.panToAndZoom(storeSelected.lat, storeSelected.lng, 14);
      } else {
        const storeAddress = storeSelected.custom["wpcf-yoox-store-address"][0];
        const position = this.geocode(storeAddress);
        if (position.geometry) {
          this.panToAndZoom(
            position.geometry.location.lat(),
            position.geometry.location.lng(),
            18
          );
        } else {
          throw "Geocode was not successful: " + status;
        }
      }
    },
    selectCountry(selectedCountryId) {
      if (selectedCountryId === 0) {
        this.panToAndZoom(
          this.mapConfig.center.lat,
          this.mapConfig.center.lng,
          this.mapConfig.zoom
        );
        return;
      }
      const countrySelected = this.$store.getters["stores/getSelectedCountry"];
      const position = this.geocode(countrySelected.name);
      if (position.geometry) {
        this.panToAndZoom(
          position.geometry.location.lat(),
          position.geometry.location.lng(),
          6
        );
      } else {
        throw "Geocode was not successful: " + status;
      }
    },
    panToAndZoom(lat, lng, zoom) {
      this.map.panTo({
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      });
      this.map.setZoom(zoom);
    },
    geocode(searchKey) {
      this.geocoder.geocode(
        { address: searchKey },
        (results, status) =>
          status === "OK" ? results[0] : `Geocode was not successful: ${status}`
      );
    }
  }
};
</script>

<style lang="scss">
.app-container {
  display: grid;
  grid-template-areas: "nav content";
  grid-template-columns: 300px 1fr;
  grid-template-rows: auto 1fr;
  grid-gap: 10px;
}
.map-container {
  grid-area: content;
  height: 100vh;
}
.map {
  height: 100%;
}
</style>
