<template>
  <div class="chart-wrap" :style="{ width: wrapWidth }" ref="chart">
    <div class="labels">
      <div class="label" v-for="(label, i) in datasets" :key="i">
        <div class="circle" :style="{ backgroundColor: label.lineColor }" />
        <span class="label-text">{{ label.labelText }}</span>
      </div>
    </div>
    <div class="main-chart-wrap">
      <div class="tooltip"
        v-show="showPoint"
        ref="tooltip"
        :style="{
          [tooltipParams.vertical]: `${tooltipParams.y}px`,
          [tooltipParams.side]: `${tooltipParams.x}px`,
          minWidth: `${tooltipParams.width}px`,
          minHeight: `${tooltipParams.height}px`
        }"
      >
        <span class="date">{{ tooltipParams.date }}</span>
        <div class="params">
          <div class="param" v-for="(label, i) in tooltipParams.labels" :key="i">
            <span class="count" :style="{ color: label.color }">{{ label.text }}</span>
            <small class="label" :style="{ color: label.color }">{{ label.label }}</small>
          </div>
        </div>
      </div>
      <svg width="100%" :height="initialChartHeight">
        <g class="axis">
          <line x1="0" :x2="chartWidth" :y1="initialChartHeight - 1" :y2="initialChartHeight - 1" />
        </g>
        <g class="chart-axis">
          <line
            v-for="(_, line) in new Array(horizontalAxesLength)"
            :key="line"
            x1="0"
            :x2="chartWidth"
            :y1="initialChartHeight - ((line + 1) * 40)"
            :y2="initialChartHeight - ((line + 1) * 40)"
          />
        </g>
        <g class="axis-labels">
          <g class="left-axis-labels">
            <text
              class="text-label"
              v-for="(label, i) in leftDataset.axisLabels"
              :key="i"
              :y="initialChartHeight - (i * 40) - 4"
            >
              {{ label }}
            </text>
          </g>
          <g class="right-axis-labels">
            <text
              class="text-label"
              v-for="(label, i) in rightDataset.axisLabels"
              :key="i"
              :x="chartWidth"
              text-anchor="end"
              :y="initialChartHeight - (i * 40) - 4"
            >
              {{ label }}
            </text>
          </g>
        </g>
        <svg
          :x="-chartOffset"
          :width="chartWidth + chartOffset"
          :height="initialChartHeight"
          @mouseenter="showPoint = true"
          @mouseleave="showPoint = false"
          @mousemove="tooltipPosition($event)"
        >
          <svg class="chart-window">
            <polyline
              class="chart"
              v-for="(_, i) in new Array(datasets.length)"
              :key="i"
              fill="none"
              stroke-width="2"
              stroke-linejoin="round"
              :stroke="datasets[i].lineColor"
              :points="stringWindowChart[i]"
            />
          </svg>
          <g class="areas">
            <g
              class="area"
              v-for="(_, i) in new Array(purificationAreas.count)"
              :key="i"
              @mouseenter="setPosition(i)"
              @click="setPosition(i)"
            >
              <rect
                :height="initialChartHeight"
                :width="areaParams(i).width"
                :x="areaParams(i).x"
                fill="transparent"
              />
            </g>
          </g>
          <g class="hover-line" v-show="showPoint">
            <line :x1="hoverLineParams.x" :x2="hoverLineParams.x" y1="0" :y2="initialChartHeight" />
          </g>
          <g class="points" v-show="showPoint">
            <circle
              v-for="(dataset, i) in datasets"
              :key="i"
              :fill="dataset.lineColor"
              :cx="pointsParams.x"
              :cy="pointsParams[dataset.axis].y"
              :r="pointsParams[dataset.axis].r"
              class="point"
              stroke="#fff"
              stroke-width="3"
              @mouseenter="pointsParams[dataset.axis].r = 6.5"
              @mouseleave="pointsParams[dataset.axis].r = 5.5"
            />
          </g>
        </svg>
      </svg>
    </div>
    <svg height="20" width="100%">
      <svg height="100%" :x="-chartOffset" :width="chartWidth + chartOffset">
        <text
          class="text-label"
          y="15"
          :x="date.x"
          v-for="(date, i) in xLabels"
          :key="i"
          v-show="date.x + 50 < chartWidth"
        >
          {{ getFormatDate(date.date) }}
        </text>
      </svg>
    </svg>
    <div class="chart-slider-wrap">
      <div class="slider-elements">
        <div class="invisible-part invisible-left" ref="left" :style="{ width: `${sliderParams.left}%` }">
          <div class="slider" @touchstart="slide($event, 'left')" @mousedown="slide($event, 'left')"></div>
        </div>
        <div class="window" @mousedown="moveWindow" ref="window" :style="{ width: `${sliderWindowWidth}%` }" />
        <div class="invisible-part invisible-right" ref="right" :style="{ width: `${sliderParams.right}%` }">
          <div class="slider" @mousedown="slide($event, 'right')"></div>
        </div>
      </div>
      <svg class="chart-slider" height="100%" width="100%">
        <polyline
          v-for="(_, i) in new Array(datasets.length)"
          fill="none"
          stroke-width="2"
          stroke-linejoin="round"
          :key="i"
          :stroke="datasets[i].lineColor"
          :points="stringSliderChart[i]"
        />
      </svg>
    </div>
  </div>
</template>

<script>
import {
  chartDataset,
  formatDate,
  getAreaParams,
  getMappedDatasets,
  getXLabels,
  purificationDataset,
  stringDataset
} from '@/utils'

export default {
  props: {
    datasets: {
      type: Array,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    chartWidth: null,
    showPoint: false,
    sliderParams: {
      left: 0,
      right: 0
    },
    hoverLineParams: {
      x: 0,
    },
    pointsParams: {
      x: 0,
      left: {
        y: 0,
        r: 5.5
      },
      right: {
        y: 0,
        r: 5.5
      }
    },
    tooltipParams: {
      date: '',
      x: 0,
      y: 0,
      height: 70,
      width: 140,
      side: 'left',
      vertical: 'top',
      labels: [{}, {}]
    }
  }),
  methods: {
    getChartWidth() {
      this.chartWidth = this.$refs['chart'].clientWidth
    },
    slide(event, side) {
      const clientX = event.clientX || (event.touches[0] || event.changedTouches[0]).clientX
      const initParam = this.sliderParams[side]
      const reside = side === 'left' ? 'right' : 'left'
      const minWidth = 5 * 100 / this.chartWidth
      document.onmousemove = e => {
        let delta = side === 'left' ? e.clientX - clientX : clientX - e.clientX
        delta = delta / this.chartWidth * 100
        if (initParam + delta >= 100 - this.sliderParams[reside] - 10) return
        if (initParam + delta <= minWidth) {
          this.sliderParams[side] = 0
          return
        }
        this.sliderParams[side] = initParam + delta
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onouseup = null
      }
    },
    moveWindow(event) {
      const clientX = event.clientX
      const initParams = JSON.parse(JSON.stringify(this.sliderParams))
      const minWidth = 5 * 100 / this.chartWidth
      document.onmousemove = e => {
        let delta = e.clientX - clientX
        delta = delta / this.chartWidth * 100
        if (initParams.left + delta <= minWidth) return
        if (initParams.right - delta <= minWidth) return
        this.sliderParams.left = initParams.left + delta
        this.sliderParams.right = initParams.right - delta
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onouseup = null
      }
    },
    getFormatDate(date) {
      return formatDate(date)
    },
    areaParams(i) {
      return getAreaParams(i, this.purificationAreas.stepWidth)
    },
    setPosition(i) {
      const x = i * this.leftDataset.stepWidth
      this.hoverLineParams.x = x
      this.pointsParams.x = this.pointsParams.x = x
      this.windowChart.forEach((chart, index) => {
        if (index === 0) this.pointsParams.left.y = chart[i].y
        else this.pointsParams.right.y = chart[i].y
      })
      this.tooltipParams.date = formatDate(this.purificationAreas.allDates[i])
      this.mappedDatasets.forEach((ds, index) => {
        this.tooltipParams.labels[index].text = (ds.prefix ?? '') + ds.data[i].v.toFixed(ds.fix ?? 2) + (ds.postfix ?? '')
        this.tooltipParams.labels[index].color = this.mappedDatasets[index].lineColor
        this.tooltipParams.labels[index].label = this.mappedDatasets[index].labelText
      })
    },
    tooltipPosition(e) {
      this.tooltipParams.side = 'left'
      this.tooltipParams.vertical = 'top'
      this.tooltipParams.x = e.offsetX + 20
      this.tooltipParams.y = e.offsetY + 20
      if (e.offsetX + this.tooltipParams.width + 40 > this.chartWidth) {
        this.tooltipParams.side = 'right'
        this.tooltipParams.x = this.chartWidth - e.offsetX + 20
      }
      if (e.offsetY + this.tooltipParams.height + 40 > this.initialChartHeight) {
        this.tooltipParams.vertical = 'bottom'
        this.tooltipParams.y = this.initialChartHeight - e.offsetY + 20
      }
    }
  },
  computed: {
    mappedDatasets() {
      return getMappedDatasets(
        this.datasets,
        this.initialChartHeight,
        this.horizontalAxesLength,
        this.chartWidth
      )
    },
    leftDataset() {
      return this.mappedDatasets.find(dataset => dataset.axis === 'left')
    },
    rightDataset() {
      return this.mappedDatasets.find(dataset => dataset.axis === 'right')
    },
    initialChartHeight() {
      return this.options.height || 300
    },
    initialChartWidth() {
      return this.options.width || '100%'
    },
    wrapWidth() {
      return typeof this.initialChartWidth === 'string'
        ? this.initialChartWidth
        : `${this.initialChartWidth}px`
    },
    sliderChart() {
      return chartDataset(this.mappedDatasets, 50, 'slider')
    },
    stringSliderChart() {
      return stringDataset(this.sliderChart, 50)
    },
    windowChart() {
      return chartDataset(this.mappedDatasets, this.initialChartHeight)
    },
    stringWindowChart() {
      return stringDataset(this.windowChart, this.initialChartHeight)
    },
    sliderWindowWidth() {
      return 100 - this.sliderParams.left - this.sliderParams.right
    },
    horizontalAxesLength() {
      return Math.floor(this.initialChartHeight / 40)
    },
    purificationAreas() {
      return purificationDataset(this.mappedDatasets, this.chartWidth)
    },
    xLabels() {
      return getXLabels(this.mappedDatasets, this.chartWidth)
    },
    chartOffset() {
      return this.chartWidth * this.sliderParams.left / 100
    }
  },
  mounted() {
    if (!this.options.width) {
      this.getChartWidth()
      window.addEventListener('resize', this.getChartWidth)
    } else {
      this.chartWidth = this.options.width
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.getChartWidth)
  }
}
</script>

<style lang="scss" scoped>
.chart-wrap {
  font-family: 'Open Sans', sans-serif;
  user-select: none;
  .labels {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    .label {
      display: flex;
      align-items: center;
      .circle {
        height: 12px;
        width: 12px;
        border-radius: 50%;
      }
      .label-text {
        font-size: 12px;
        font-weight: 600;
        color: #A9ABC2;
      }
      &:first-child {
        .circle {
          margin-right: 5px;
        }
      }
      &:last-child {
        flex-direction: row-reverse;
        .circle {
          margin-left: 5px;
        }
      }
    }
  }
  .main-chart-wrap {
    display: flex;
    margin-bottom: 2px;
    position: relative;
    .tooltip {
      box-sizing: border-box;
      position: absolute;
      border: 1px solid #D8DEE8;
      background-color: #FFFFFF;
      border-radius: 3px;
      text-align: center;
      .date {
        white-space: nowrap;
        font-size: 12px;
        font-weight: 600;
        color: #A9ABC2;
        padding: 5px 0;
        display: flex;
        justify-content: center;
      }
      .params {
        display: flex;
        width: 100%;
        .param {
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          padding: 0 5px;
          .count {
            font-weight: 600;
            font-size: 14px;
          }
          .label {
            font-size: 10px;
            font-weight: 700;
          }
        }
      }
    }
  }
  .chart-slider-wrap {
    height: 50px;
    position: relative;
    .slider-elements {
      position: absolute;
      display: flex;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      .invisible-part {
        height: 100%;
        background-color: rgba(216, 222, 232, 0.5);
        display: flex;
        min-width: 5px;
        .slider {
          height: 100%;
          width: 5px;
          background-color: #D8DEE8;
          cursor: e-resize;
        }
        &.invisible-left {
          justify-content: flex-end;
        }
      }
      .window {
        cursor: move;
      }
    }
  }
}
.chart {
  transition: all .3s ease-out;
}
.axis {
  stroke: #D8DEE8;
  stroke-width: 2;
}
.chart-axis, .hover-line {
  stroke: #EEF0F3;
  stroke-width: 1;
}
.text-label {
  font-size: 10px;
  line-height: 10px;
  font-weight: 600;
  fill: #A9ABC2;
}
.point {
  transition: r .1s ease-out;
}
</style>
