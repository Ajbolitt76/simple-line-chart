<template>
  <svg
    :width="initialChartWidth"
    :height="initialChartHeight"
    ref="chart"
    class="chart-wrap"
    @mouseleave="showPoint = false"
  >
    <svg
      class="chart"
      x="30"
      y="30"
      @mouseenter="showPoint = true"
    >
      <g class="axes">
        <g class="axis">
          <line x1="0" x2="0" y1="0" :y2="initialChartHeight - 60"/>
        </g>
        <g class="axis">
          <line x1="0" :x2="chartWidth - 60" :y1="initialChartHeight - 60" :y2="initialChartHeight - 60" />
        </g>
      </g>
      <polyline
        :stroke="dataset.lineColor"
        :points="stringDataset"
        fill="none"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <g class="hover-line" v-show="showPoint">
        <line :x1="point.cx - 30" :x2="point.cx - 30" y1="0" :y2="initialChartHeight - 60" />
      </g>
      <svg class="areas">
        <g class="area" v-for="(_, i) in new Array(dataset.data.length)" :key="i" @mouseenter="setPointPosition(i)">
          <rect
            :height="initialChartHeight - 60"
            :width="getParamsArea(i).width"
            :x="getParamsArea(i).x"
            y="0"
            fill="transparent"
          />
        </g>
      </svg>
    </svg>
    <circle
      :fill="dataset.lineColor"
      :cx="point.cx"
      :cy="point.cy"
      :r="point.r"
      v-show="showPoint"
      class="point"
      stroke="#fff"
      stroke-width="3"
      @mouseenter="point.r = 7"
      @mouseleave="point.r = 5.5"
    />
    <svg v-show="showPoint" :x="point.cx - (labelData.width / 2)" :y="0">
      <rect height="22" :width="labelData.width" class="label" ry="3" />
      <text :x="labelData.width / 2" y="15" text-anchor="middle">{{ labelData.text }}</text>
    </svg>
  </svg>
</template>

<script>
export default {
  props: {
    dataset: {
      type: Object,
      required: true
    },
    options: Object
  },
  data: () => ({
    chartWidth: null,
    showPoint: false,
    point: {
      cx: 0,
      cy: 0,
      r: 5.5
    },
    labelData: {
      text: '',
      width: 40
    }
  }),
  computed: {
    maxValue() {
      return this.dataset.data.max()
    },
    minValue() {
      if (this.dataset.data.min() >= 0) {
        return 0
      } else return this.dataset.data.min()
    },
    datasetHeight() {
      return this.maxValue - this.minValue
    },
    segmentHeight() {
      return (this.initialChartHeight - 60) / this.datasetHeight
    },
    initialChartWidth() {
      return this.options.width || '100%'
    },
    initialChartHeight() {
      return this.options.height || 300
    },
    stringDataset() {
      return this.chartDataset.map(el => {
        return `${el.x}, ${el.y}`
      }).join(' ')
    },
    stepWidth() {
      return Math.abs((this.chartWidth - 60) / (this.dataset.data.length - 1))
    },
    chartDataset() {
      return this.dataset.data.map((el, i) => {
        const absEl = el + Math.abs(this.minValue)
        return { x: i * this.stepWidth, y: (this.initialChartHeight - 60) - absEl * this.segmentHeight }
      })
    },
    getParamsArea() {
      return i => {
        if (i === 0) return { x: 0, width: this.stepWidth / 2 }
        if (i === this.dataset.data.length - 1) return { x: (i * this.stepWidth) - (this.stepWidth / 2), width: this.stepWidth / 2 }
        return { x: (i * this.stepWidth) - (this.stepWidth / 2), width: this.stepWidth }
      }
    }
  },
  methods: {
    getChartWidth() {
      this.chartWidth = this.$refs['chart'].clientWidth
    },
    setPointPosition(i) {
      this.point.cx = this.chartDataset[i].x + 30
      this.point.cy = this.chartDataset[i].y + 30
      this.labelData.text = String(this.dataset.data[i])
    }
  },
  mounted() {
    if (!this.options.width) {
      this.getChartWidth()
      window.addEventListener('resize', this.getChartWidth)
    } else {
      this.chartWidth = this.options.width
    }
  }
}
</script>

<style lang="scss" scoped>
.point {
  transition: r .3s ease-out;
}
.hover-line {
  stroke: #e2e2e2;
  stroke-dasharray: 0;
  stroke-width: 1;
}
.label {
  fill: #f1f1f3;
}
text {
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
}
.axis {
  stroke: #ccc;
  stroke-dasharray: 0;
  stroke-width: 1.5;
}
</style>
