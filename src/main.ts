import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import store from "./store";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./assets/base.less";

createApp(App).use(store).use(i18n).use(router).use(ElementPlus).mount("#app");
