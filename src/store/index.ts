import { createStore } from "vuex";
import { UPDATE_QUERY } from "@/store/mutation-types";
import createPersistedState from "vuex-persistedstate";

import SecureLS from "secure-ls";
const ls = new SecureLS({ isCompression: false });

export default createStore({
  state: {
    token0: "BTC",
    token1: "USDT",
    interval: "1d",
    deductionCount: 300,
  },
  getters: {},
  mutations: {
    [UPDATE_QUERY](state, data) {
      state.token0 = data.token0;
      state.token1 = data.token1;
      state.interval = data.interval;
      state.deductionCount = data.deductionCount;
      console.log("data ", data);
    },
  },
  actions: {},
  modules: {},
  plugins: [
    createPersistedState({
      paths: ["token0", "token1", "interval", "deductionCount"], //需要持久化的
      storage: {
        getItem: (key) => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: (key) => ls.remove(key),
      },
    }),
  ],
});
