<template>
  <div class="stores">
    <select @change="selectCountryId" v-model="countryId" class="stores_countries">
      <option value="0">All</option>
      <option
        v-for="country in countries"
        :key="country.term_id"
        :value="country.term_id"
      >{{ country.name }}</option>
    </select>
    <div>
      <input class="stores_search" type="text" placeholder="filter" v-model="keyword">
      <span v-if="pending">... LOADING ...</span>
      <span v-if="error">... ERROR!!! ...</span>
      <ul class="stores_list">
        <li
          v-if="filteredStores.length === 0"
          class="stores_list_store stores_list_store--empty"
        >Non ci sono risultati</li>
        <li
          v-else
          v-for="store in filteredStores"
          :data-storeid="store.ID"
          :key="store.ID"
          v-on:click="selectStore(store.ID)"
          class="stores_list_store"
        >
          <span class="stores_list_store_name">{{ store.post_title }}</span>
          <span>{{ store.custom["wpcf-yoox-store-address"][0] }}</span>
          <span>({{ store.lat }} - {{ store.lng }})</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as R from "ramda";

export default {
  data() {
    return {
      keyword: "",
      countryId: 0
    };
  },
  computed: {
    ...mapState({
      stores: state => state.stores.all,
      countries: state => state.stores.countries,
      CountryId: state => state.stores.selectedCountryId,
      pending: state => state.stores.pending,
      error: state => state.stores.error
    }),
    filteredStores() {
      const keywordInLowerCase = R.toLower(this.keyword);
      const hasKeywordInTitle = R.includes(keywordInLowerCase);
      const storeName = R.prop("post_title");
      const filterByKeyword = R.filter(
        R.compose(
          hasKeywordInTitle,
          R.toLower,
          storeName
        )
      );
      const countryId = this.CountryId;
      const hasCountryId = R.any(R.propEq("term_id", countryId));
      const filterByCountryId = R.filter(
        R.compose(
          hasCountryId,
          R.prop("terms")
        )
      );
      const countryIdGtZero = () => R.gt(this.CountryId, 0);
      const filterByCountryIdAndKeyword = R.compose(
        filterByKeyword,
        R.when(countryIdGtZero, filterByCountryId)
      );
      return filterByCountryIdAndKeyword(this.stores);
    }
  },
  methods: {
    selectStore(clickedId) {
      this.$store.dispatch({
        type: "stores/selectStore",
        id: clickedId
      });
    },
    selectCountryId() {
      this.$store.dispatch({
        type: "stores/selectCountryId",
        id: +this.countryId
      });
    }
  },
  created() {
    this.$store.dispatch("stores/getCountries");
  }
};
</script>

<style lang="scss">
.stores {
  &_search {
    margin-top: 2px;
    box-sizing: border-box;
    border: 1px solid black;
    width: 100%;
    height: 36px;
    font-size: 18px;
    border-bottom: 0;
    text-indent: 8px;
    &::placeholder {
      font-size: 14px;
    }
  }
  &_countries {
    width: 100%;
    height: 60px;
  }
  &_list {
    border-top: 1px solid black;
    width: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
    &_store {
      display: flex;
      flex-direction: column;
      border: 1px solid black;
      border-top: none;
      padding: 4px;
      cursor: pointer;
      &--empty {
        background-color: lightsalmon;
      }
      &:hover {
        background-color: lightgreen;
      }
      &:active {
        background-color: lightcoral;
      }
      &_name {
        font-weight: bold;
      }
    }
  }
}
</style>
