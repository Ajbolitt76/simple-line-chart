Array.prototype.max = function () {
  return Math.max(...this)
}
Array.prototype.min = function () {
  return Math.min(...this)
}

export function getMinValue(arr) {
  if (arr.min() >= 0) {
    return 0
  }
  return arr.min()
}

export function chartDataset(datasets, height, type = 'default') {
  return datasets.map(dataset => {
    const field = type === 'slider' ? 'sliderSegmentHeight' : 'segmentHeight'
    return dataset.dataList.map((v, i) => {
      const el = v + Math.abs(dataset.minValue)
      return { x: i * dataset.stepWidth, y: height - el * dataset[field] }
    })
  })
}

export function stringDataset(datasets, h) {
  return datasets.map(dataset => {
    return dataset.map(el => {
      if ((h - el.y) < 1) {
        return `${el.x}, ${el.y - 1}`
      }
      if (el.y < 1) {
        return `${el.x}, 1`
      }
      return `${el.x}, ${el.y}`
    }).join(' ')
  })
}

export function getAxisLabels(list, height, count, fix = 2, prefix = '', postfix = '') {
  return new Array(count + 1).fill(0).map((_, i) => {
    const max = list.max()
    const min = getMinValue(list)
    const diff = max - min
    return prefix + (((i * 40) * diff) / height).toFixed(fix) + postfix
  })
}

Date.prototype.addDays = function(days) {
  const date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}

function getDates(startDate, stopDate) {
  const dateArray = []
  let currentDate = startDate
  while (currentDate <= stopDate) {
    dateArray.push(currentDate)
    currentDate = currentDate.addDays(1)
  }
  return dateArray
}

export function purificationDataset(datasets, width = 500) {
  let allDates = [...new Set(datasets.map(ds => ds.data.map(el => el.date)).flat())].sort()
  allDates = getDates(new Date(allDates[0]), new Date(allDates[allDates.length - 1]))
  const count = allDates.length
  return {
    allDates,
    count: count,
    stepWidth: width / (count - 1)
  }
}

export function fullData(datasets, dataset) {
  const { allDates } = purificationDataset(datasets)
  const tempDataset = [...dataset]
  getDates(new Date(allDates[0]), new Date(allDates[allDates.length - 1])).forEach(date => {
    const formatDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    if (!dataset.find(el => el.date === formatDate)) {
      tempDataset.push({ date: formatDate, v: 0 })
    }
  })
  tempDataset.sort((a, b) => {
    return a.date < b.date ? -1 : 1
  })
  return tempDataset
}

function textMonth(month) {
  switch (month) {
    case 0:
      return 'Jan'
    case 1:
      return 'Feb'
    case 2:
      return 'Mar'
    case 3:
      return 'Apr'
    case 4:
      return 'May'
    case 5:
      return 'Jun'
    case 6:
      return 'Jul'
    case 7:
      return 'Aug'
    case 8:
      return 'Sep'
    case 9:
      return 'Oct'
    case 10:
      return 'Nov'
    case 11:
      return 'Dec'
  }
}

export function formatDate(date, showYear = true) {
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = textMonth(d.getMonth())
  const year = showYear ? d.getFullYear() : ''
  return `${day} ${month} ${year}`
}

export function getXLabels(datasets, width = 500) {
  const { allDates, stepWidth, count } = purificationDataset(datasets, width)
  const step = Math.floor(count / Math.floor(width / 120)) || 3
  return allDates
    .map((el, i) => {
      return {
        date: i % step === 0 ? el : null,
        x: i * stepWidth
      }
    })
    .filter(el => el.date)
}

export function getAreaParams(i, stepWidth) {
  return {
    x: i * stepWidth - (stepWidth / 2),
    width: stepWidth
  }
}

export function getMappedDatasets(datasets, initialChartHeight, horizontalAxesLength, chartWidth) {
  return datasets.map(dataset => {
    const data = fullData(datasets, dataset.data)
    const dataList = data.map(el => el.v)
    const minValue = getMinValue(dataList)
    const maxValue = dataList.max()
    const axisLabels = getAxisLabels(
      dataList,
      initialChartHeight,
      horizontalAxesLength,
      dataset.fix,
      dataset.prefix,
      dataset.postfix
    )
    const stepWidth = Math.abs(chartWidth / (dataList.length - 1))
    return {
      ...dataset,
      data,
      dataList,
      minValue,
      maxValue,
      axisLabels,
      stepWidth,
      segmentHeight: initialChartHeight / (maxValue - minValue),
      sliderSegmentHeight: 50 / (maxValue - minValue)
    }
  })
}
