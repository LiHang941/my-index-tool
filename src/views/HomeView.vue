<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-divider content-position="left"><h1>均线推演工具</h1></el-divider>
      </el-header>
      <el-main>
        <div class="faq flex flex-direction align-start">
          <h5>1.MA均线有助于形成趋势，从而形成正反馈</h5>
          <h5>
            2.MA均线是不灵敏的，可以通过推演的方式，来查看均线的走向，从而预测大盘的走向
          </h5>
          <h5>3.推演的作用，如果当前收盘价横盘，预测后期的均线走向</h5>
          <p style="color: red">本工具纯粹交流，不构成任何投资建议</p>
        </div>
        <el-divider border-style="double" />

        <el-form label-width="120px" label-position="left">
          <el-form-item label="交易对">
            <el-col :span="3">
              <el-input v-model="token0" placeholder="币0" />
            </el-col>
            <el-col :span="1" class="text-center">
              <span class="text-gray-500">-</span>
            </el-col>
            <el-col :span="3">
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
  data() {
    return {
      token0: this.$store.state.token0,
      token1: this.$store.state.token1,
      interval: this.$store.state.interval,
      deductionCount: this.$store.state.deductionCount,
      mainTechnicalIndicatorTypes: ["MA", "BOLL"],
      subTechnicalIndicatorTypes: ["VOL", "MACD", "KDJ"],
    };
  },
  mounted() {
    this.kLineChart = init("technical-indicator-k-line");
    this.kLineChart.setPriceVolumePrecision(6, 6);
    this.kLineChart.addTechnicalIndicatorTemplate({
      name: "MA",
      shortName: "MA",
      series: "price",
      calcParams: [5, 10, 30, 60, 90, 120, 200],
      precision: 2,
      shouldCheckParamCount: false,
      shouldOhlc: true,
      plots: [
        { key: "ma5", title: "MA5: ", type: "line" },
        { key: "ma10", title: "MA10: ", type: "line" },
        { key: "ma30", title: "MA30: ", type: "line" },
        { key: "ma60", title: "MA60: ", type: "line" },
        { key: "ma90", title: "MA90: ", type: "line" },
        { key: "ma120", title: "MA120: ", type: "line" },
        { key: "ma200", title: "MA200: ", type: "line" },
      ],
      regeneratePlots: (params) => {
        return params.map((p) => {
          return { key: `ma${p}`, title: `MA${p}: `, type: "line" };
        });
      },
      calcTechnicalIndicator: (dataList, { params, plots }) => {
        const closeSums = [];
        return dataList.map((kLineData, i) => {
          const ma = {};
          const close = kLineData.close;
          params.forEach((p, index) => {
            closeSums[index] = (closeSums[index] || 0) + close;
            if (i >= p - 1) {
              ma[plots[index].key] = closeSums[index] / p;
              closeSums[index] -= dataList[i - (p - 1)].close;
            }
          });
          return ma;
        });
      },
    });
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
        this.setCandleTechnicalIndicator("MA");
      } finally {
        loading.close();
      }
    },
    setCandleTechnicalIndicator(type) {
      this.kLineChart.createTechnicalIndicator(type, false, {
        id: "candle_pane",
      });
    },
    setSubTechnicalIndicator(type) {
      this.kLineChart.createTechnicalIndicator(type, false, {
        id: this.paneId,
      });
    },
  },
  unmounted() {
    dispose("technical-indicator-k-line");
  },
};
</script>
<style lang="less">
.k-line-chart {
  height: 600px;
  width: 100%;
  min-width: 1200px;
}
.faq {
  > h5 {
    line-height: 30px;
    height: 30px;
    margin: 0;
  }
}
</style>
