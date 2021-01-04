<template>
  <div
    :style="{ width: `${initialChartWidth + 40}px`, height: `${initialChartHeight + 40}px`}"
    class="chart-wrap"
  >
    <svg
      :width="initialChartWidth"
      :height="initialChartHeight"
      @mouseenter="showPoint = true"
      @mouseleave="showPoint = false"
      class="chart"
    >
      <g class="axes">
        <g class="axis">
          <line x1="0" x2="0" y1="0" :y2="initialChartHeight"/>
        </g>
        <g class="axis">
          <line x1="0" :x2="initialChartWidth" :y1="initialChartHeight" :y2="initialChartHeight" />
        </g>
      </g>
      <polyline
        fill="none"
        :stroke="dataset.lineColor || '#333333'"
        :stroke-width="dataset.strokeWidth"
        stroke-linejoin="round"
        :points="stringDataset"
      />
      <svg class="areas">
        <g class="area" v-for="(_, i) in new Array(dataset.data.length)" :key="i" @mouseenter="setCirclePoint(i)">
          <rect height="100%" :width="getParamsArea(i).width" :x="getParamsArea(i).x" y="0" fill="transparent" />
        </g>
      </svg>
      <svg class="point-wrap">
        <circle
          v-show="showPoint"
          :cx="cx"
          :cy="cy"
          :fill="dataset.lineColor"
          :r="r"
          class="point"
          stroke="#fff"
          stroke-width="3"
          @mouseenter="r = 6.5"
          @mouseleave="r = 5.5"
        />
      </svg>
    </svg>
    <svg height="100%" width="100%"></svg>
  </div>
</template>

<script>
export default {
  props: {
    dataset: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    showPoint: false,
    cx: 50,
    cy: 50,
    r: 5.5
  }),
  methods: {
    setCirclePoint(i) {
      this.cx = this.chartDataset[i].x
      this.cy = this.chartDataset[i].y
    }
  },
  computed: {
    maxValue() {
      return this.dataset.data.max()
    },
    initialChartHeight() {
      return this.options.height
    },
    initialChartWidth() {
      return this.options.width
    },
    stepWidth() {
      return this.initialChartWidth / (this.dataset.data.length - 1)
    },
    stringDataset() {
      return this.chartDataset.map(el => {
        return `${el.x}, ${el.y}`
      }).join(' ')
    },
    chartDataset() {
      return this.dataset.data.map((el, i) => {
        const point = this.initialChartHeight - (el * this.initialChartHeight / this.maxValue)
        return { x: i * this.stepWidth, y: point }
      })
    },
    getParamsArea() {
      return i => {
        if (i === 0) return { x: 0, width: this.stepWidth / 2 }
        if (i === this.dataset.data.length - 1) return { x: (i * this.stepWidth) - (this.stepWidth / 2), width: this.stepWidth / 2 }
        return { x: (i * this.stepWidth) - (this.stepWidth / 2), width: this.stepWidth }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-wrap {
  position: relative;
  .chart {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
.axis {
  stroke: #ccc;
  stroke-dasharray: 0;
  stroke-width: 3;
}
.point {
  transition: r .3s ease-out;
}
</style>
