import * as R from "rambda";
import places from "../../../data/alexandermcqueen";
import termsJson from "../../../data/terms";
import { termsToCountries } from "../../helpers";

const state = {
  all: [],
  pending: false,
  error: false,
  selectedStoreId: 0,
  countries: [],
  selectedCountryTermId: 0
};

const getters = {
  getSelectedStore: state => {
    const selectStoreFromId = post => post.ID === state.selectedStoreId;
    const selectStore = pred => R.filter(pred);
    const getStore = selectStore(selectStoreFromId);
    return R.head(getStore(state.all));
  },
  getSelectedCountry: state => {
    const selectStoreFromId = post =>
      post.term_id === state.selectedCountryTermId;
    const selectStore = pred => R.filter(pred);
    const getStore = selectStore(selectStoreFromId);
    return R.head(getStore(state.countries));
  }
};

const actions = {
  getCountries({ commit }) {
    commit("apiPending");

    commit("receiveNations", termsJson);
  },
  getAllStores({ commit }) {
    commit("apiPending");

    commit(
      "receiveAll",
      places.sort((a, b) => (a.post_title < b.post_title ? -1 : 1)) // stink
    );
    // return fetch("../../../data/store-locator.json")
    //   .then(r => r.json())
    //   .then(json => {
    //     commit("receiveAll", json);
    //   })
    //   .catch(e => {
    //     commit("apiFailure", e);
    //   });
  },
  selectStore({ commit }, { id }) {
    commit("selectStore", id);
  },
  selectCountryTermId({ commit }, { id }) {
    commit("selectCountryTermId", id);
  }
};

const mutations = {
  selectCountryTermId(state, term_id) {
    state.selectedCountryTermId = term_id;
  },
  receiveNations(state, jsonTerms) {
    state.pending = false;
    state.countries = termsToCountries(jsonTerms.terms).countries;
  },
  receiveAll(state, stores) {
    state.pending = false;
    state.all = stores;
  },
  apiPending(state) {
    state.pending = true;
  },
  apiFailure(state) {
    state.pending = false;
    state.error = true;
  },
  selectStore(state, id) {
    state.selectedStoreId = id;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
