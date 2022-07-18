<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <h1>均线推演工具</h1>
      </el-header>
      <el-main>
        <el-form label-width="120px" label-position="left">
          <el-form-item label="交易对">
            <el-col :span="11">
              <el-input v-model="token0" placeholder="币0" />
            </el-col>
            <el-col :span="2" class="text-center">
              <span class="text-gray-500">-</span>
            </el-col>
            <el-col :span="11">
              <el-input v-model="token1" placeholder="币1" />
            </el-col>
          </el-form-item>

          <el-form-item label="周期">
            <el-select v-model="interval" placeholder="周期">
              <el-option label="15分钟" value="15m" />
              <el-option label="30分钟" value="30m" />
              <el-option label="1小时" value="1h" />
              <el-option label="2小时" value="2h" />
              <el-option label="4小时" value="4h" />
              <el-option label="6小时" value="6h" />
              <el-option label="8小时" value="8h" />
              <el-option label="12小时" value="12h" />
              <el-option label="1日" value="1d" />
              <el-option label="3日" value="3d" />
              <el-option label="周" value="1w" />
              <el-option label="月" value="1M" />
            </el-select>
          </el-form-item>

          <el-form-item label="向后推演次数">
            <el-input-number
              v-model="deductionCount"
              :min="0"
              :max="300"
              @change="handleNumberChange"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="initData">加载数据</el-button>
          </el-form-item>
        </el-form>

        <div id="technical-indicator-k-line" class="k-line-chart" />
        <div class="k-line-chart-menu-container" style="margin-top: 10px">
          <span style="padding-right: 10px">主图指标</span>
          <el-button
            v-for="type in mainTechnicalIndicatorTypes"
            :key="type"
            v-on:click="setCandleTechnicalIndicator(type)"
          >
            {{ type }}
          </el-button>
          <span style="padding-right: 10px; padding-left: 12px">副图指标</span>
          <el-button
            v-for="type in subTechnicalIndicatorTypes"
            :key="type"
            v-on:click="setSubTechnicalIndicator(type)"
          >
            {{ type }}
          </el-button>
        </div>
      </el-main>
      <el-footer style="margin-top: 200px">
        copyright &copy; 2022 All rights reserved.
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { dispose, init } from "klinecharts";
import { apis } from "@/api";
import { Trace } from "@/tool/Tool";
import { ElLoading } from "element-plus";
import { UPDATE_QUERY } from "@/store/mutation-types";

export default {
  name: "HomeView",
  data: function () {
    return {
      token0: this.$store.state.token0,
      token1: this.$store.state.token1,
      interval: this.$store.state.interval,
      deductionCount: this.$store.state.deductionCount,
      mainTechnicalIndicatorTypes: ["MA", "BOLL"],
      subTechnicalIndicatorTypes: ["VOL", "MACD", "KDJ"],
    };
  },
  mounted: function () {
    this.kLineChart = init("technical-indicator-k-line");
    this.kLineChart.setPriceVolumePrecision(6, 6);
    this.paneId = this.kLineChart.createTechnicalIndicator("VOL", false);
    this.initData();
  },
  methods: {
    handleNumberChange(value) {
      this.deductionCount = value;
    },
    async initData() {
      const loading = ElLoading.service({ fullscreen: true });
      try {
        this.kLineChart.clearData();
        let res = await apis
          .getBinanceApi()
          .getAllKline(this.token0 + this.token1, this.interval);
        if (parseInt(this.deductionCount, 10) > 0 && res.length > 10) {
          let kline1 = res[res.length - 1];
          let kline2 = res[res.length - 2];
          let time = kline1.timestamp - kline2.timestamp;
          for (let i = 0; i < parseInt(this.deductionCount, 10); i++) {
            res.push({
              open: kline1.close,
              high: kline1.close,
              low: kline1.close,
              close: kline1.close,
              volume: 0,
              timestamp: kline1.timestamp + time * (i + 1),
            });
          }
        }

        this.$store.commit(UPDATE_QUERY, {
          token0: this.token0,
          token1: this.token1,
          interval: this.interval,
          deductionCount: this.deductionCount,
        });

        Trace.print("SHOW", res);
        this.kLineChart.applyNewData(res);
      } finally {
        loading.close();
      }
    },
    setCandleTechnicalIndicator: function (type) {
      this.kLineChart.createTechnicalIndicator(type, false, {
        id: "candle_pane",
      });
    },
    setSubTechnicalIndicator: function (type) {
      this.kLineChart.createTechnicalIndicator(type, false, {
        id: this.paneId,
      });
    },
  },
  unmounted: function () {
    dispose("technical-indicator-k-line");
  },
};
</script>
<style>
.k-line-chart {
  height: 600px;
  width: 100%;
  min-width: 1200px;
}
</style>
