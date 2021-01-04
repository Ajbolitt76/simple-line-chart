<template>
  <div class="wrap">
    <LineChart :datasets="datasets" :options="options" />
  </div>
</template>

<script>
export default {
  components: {
    LineChart: () => import('@/components/LineChart')
  },
  data: () => ({
    datasets: [
      {
        axis: 'left',
        labelText: 'Clicks',
        lineColor: '#F74844',
        fix: 0,
        data: [
          { date: '2021-07-01', v: 182 },
          { date: '2021-07-02', v: 211 },
          { date: '2021-07-03', v: 140 },
          { date: '2021-07-04', v: 150 },
          { date: '2021-07-05', v: 234 },
          { date: '2021-07-06', v: 210 },
          { date: '2021-07-07', v: 179 },
          { date: '2021-07-08', v: 145 },
          { date: '2021-07-09', v: 189 },
          { date: '2021-07-10', v: 248 },
          { date: '2021-07-11', v: 257 },
          { date: '2021-07-12', v: 255 },
          { date: '2021-07-13', v: 289 },
          { date: '2021-07-14', v: 162 },
          { date: '2021-07-15', v: 152 },
          { date: '2021-07-16', v: 130 },
          { date: '2021-07-17', v: 120 },
          { date: '2021-07-18', v: 96 }
        ]
      },
      {
        axis: 'right',
        labelText: 'Cost',
        lineColor: '#28b509',
        prefix: '$',
        data: [
          { date: '2021-07-01', v: 18.9 },
          { date: '2021-07-02', v: 19.7 },
          { date: '2021-07-03', v: 15.5 },
          { date: '2021-07-04', v: 17.75 },
          { date: '2021-07-05', v: 16.128 },
          { date: '2021-07-06', v: 28.15 },
          { date: '2021-07-07', v: 21.37 },
          { date: '2021-07-08', v: 16.125 },
          { date: '2021-07-09', v: 27.625 },
          { date: '2021-07-10', v: 30 },
          { date: '2021-07-11', v: 32.125 },
          { date: '2021-07-12', v: 36.75 },
          { date: '2021-07-13', v: 34.825 },
          { date: '2021-07-14', v: 24.375 },
          { date: '2021-07-15', v: 23 },
          { date: '2021-07-16', v: 19.6 },
          { date: '2021-07-17', v: 12.6 },
          { date: '2021-07-18', v: 8.6 },
          { date: '2021-07-19', v: 6.1 },
          { date: '2021-07-20', v: 1 }
        ]
      }
    ],
    options: {
      width: 600,
      height: 300
    }
  })
}
</script>

<style lang="scss">
.wrap {
}
</style>
