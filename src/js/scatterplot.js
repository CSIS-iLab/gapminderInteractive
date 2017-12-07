import * as d3 from 'd3'

const graphic = d3.select('.chart-container')
const tooltip = d3.select('.tooltip')

const COLORS = ['#58a897', '#83badc', '#3b75bb', '#a483a8', '#f7890e', '#69518d', '#f7d768', '#8cb561', '#728c99']
const FONT_SIZE = 11
const MAX_VAL = 100
const formatAmount = d3.format('.1s')
const formatPercentage = d3.format('.3')
const formatLegend = d3.format('$' + '.3s')

const chart = scatterplot()
let el = d3.select('.chart')

function resize () {
  const sz = Math.min(el.node().offsetWidth, window.innerHeight)
  const height = el.node().offsetHeight
  chart.width(sz).height(height)
  el.call(chart)
}

function scatterplot () {
  const margin = {top: 30, right: 30, bottom: 30, left: 40}
  const scaleX = d3.scaleLinear()
  const scaleY = d3.scaleLog()
  const scaleR = d3.scaleSqrt()
  const scaleC = d3.scaleOrdinal()

  scaleC
      .domain(['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'])
      .range(COLORS)

  let width = 0
  let height = 0
  let chartWidth = 0
  let chartHeight = 0
  let currentX
  let currentY
  let currentRadius
  let currentRanges

  function translate (x, y) {
    return `translate(${x}, ${y})`
  }

  function enter ({ container, data }) {
    const svg = container.selectAll('svg').data([data])
    const svgEnter = svg.enter().append('svg')
    const gEnter = svgEnter.append('g')

    gEnter.append('g').attr('class', 'g-plot')

    const axis = gEnter.append('g').attr('class', 'g-axis')

    const x = axis.append('g').attr('class', 'axis axis--x')

    const y = axis.append('g').attr('class', 'axis axis--y')

    x.append('text').attr('class', 'axis__label')
      .attr('text-anchor', 'start')

    y.append('text').attr('class', 'axis__label')
      .attr('text-anchor', 'end')
      .text('% ODA-like')
  }

  function updateScales ({ data }) {
    const maxR = 40

    scaleX
      .domain(currentRanges.x)
      .range([1, width])

    scaleY
      .domain(currentRanges.y)
      .range([height, 0])

    scaleR
      .domain(currentRanges.r)
      .range([2, maxR])
  }

  function updateDom ({ container, data }) {
    const svg = container.select('svg')

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)

    const g = svg.select('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    const plot = g.select('.g-plot')

    const circles = plot.selectAll('circle.item').data(data)

    circles.exit().remove()

    circles.enter().append('circle')
    .merge(circles)
      .attr('class', 'item')
      .attr('data-country', d => d.Country)
      .attr('data-iso', d => d.ISO)
      .attr('cx', d => scaleX(d[currentX]))
      .attr('cy', d => scaleY(d[currentY]))
      .attr('r', d => scaleR(d[currentRadius]))
      // .attr('fill', d => scaleC(d.region))
      // .attr('stroke', d => d3.color(scaleC(d.region)).darker(0.7))
      .on('mouseover', function (d) {
        let selectedItem = d3.select(this)
        mouseover(selectedItem, d)
      })
      .on('mouseout', mouseout)
  }

  function updateAxis ({ container, data }) {
    const axis = container.select('.g-axis')

    const axisLeft = d3.axisLeft(scaleY).tickSizeOuter(0).tickSizeInner(-width).ticks(3).tickFormat(d => formatAmount(d))
    const axisBottom = d3.axisBottom(scaleX)

    axisBottom.tickFormat(function (d) {
      return isMajorTick(d)
    })

    const x = axis.select('.axis--x')
    const maxY = scaleY.range()[0]
    const offset = maxY

    x.attr('transform', 'translate(0,' + height + ')')
      .call(axisBottom)

    x.selectAll('g').filter(function (d, i) {
      return isMajorTick(d)
    })
    .classed('major', true)

    x.select('.axis__label')
      .attr('x', width / 2)
      .attr('y', margin.bottom)
      .text(currentX)

    const y = axis.select('.axis--y')

    y.call(axisLeft)

    y.select('.axis__label')
      .attr('y', 0 - margin.left + 10)
      .attr('x', 0 - (height / 2))
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90)`)
  }

  function isMajorTick (d) {
    if (Number.isInteger(d)) {
      return d
    }
  }

  function chart (container) {
    const data = container.datum()

    enter({ container, data })
    updateScales({ container, data })
    updateDom({ container, data })
    updateAxis({ container, data })
  }

  chart.width = function (...args) {
    if (!args.length) return width
    width = args[0]
    chartWidth = width - margin * 2.5
    return chart
  }

  chart.height = function (...args) {
    if (!args.length) return height
    height = args[0]
    chartHeight = height - margin * 2.5
    return chart
  }

  chart.currentX = function (...args) {
    if (!args.length) return currentX
    currentX = args[0]
    return chart
  }

  chart.currentY = function (...args) {
    if (!args.length) return currentY
    currentY = args[0]
    return chart
  }

  chart.currentRadius = function (...args) {
    if (!args.length) return currentRadius
    currentRadius = args[0]
    return chart
  }

  chart.currentRanges = function (...args) {
    if (!args.length) return currentRanges
    currentRanges = args[0]
    return chart
  }

  return chart
}

function mouseover (item, d) {
  // Unselect previous item
  d3.selectAll('.item:not(.isActive)').style('fill', null).style('stroke-width', null).style('fill-opacity', '0.4')

  item.style('fill', function () {
    return d3.rgb(item.attr('fill')).brighter(0.75)
  })
  .style('stroke-width', 1.5)
  .style('fill-opacity', 1)
  showTooltip(d, item)
}

function mouseout (d) {
  if (!d3.select(this).classed('isActive')) {
    d3.selectAll('.item').style('fill-opacity', null)
    d3.select(this).style('fill', null).style('stroke-width', null).style('fill-opacity', null)
    hideTooltip()
  }
}

function showTooltip (d, item) {
  let year = ''
  if (d.Year != undefined) {
    year = d.Year
  }

  let xPos = 0
  let yPos = 0

  if (d3.event != undefined) {
    xPos = d3.event.pageX
    yPos = d3.event.pageY
  } else {
    let position = item.node().getBoundingClientRect()
    xPos = position.x
    yPos = position.y
  }

  if (window.innerWidth <= 768) {
    xPos = xPos - 30
    yPos = yPos - 380
  } else {
    xPos = xPos - 50
    yPos = yPos - 280
  }

  let totalAmount = '$' + formatAmount(d.total_sum)

  if (d.total_sum == 0) {
    totalAmount = 'N/A'
  }

  tooltip.transition()
    .duration(200)
    .style('opacity', 0.9)
  tooltip.html(`<p class="tooltip-heading">${d.Country} ${year}</p>
    <p class="tooltip-body">
    </p>`)
    .style('left', xPos + 'px')
    .style('top', yPos + 'px')
}

function hideTooltip () {
  tooltip.transition()
    .duration(500)
    .style('opacity', 0)
}

function init (args) {
  el = d3.select(args.container)
  el.datum(args.data)
  chart.currentX(args.currentX)
  chart.currentY(args.currentY)
  chart.currentRadius(args.currentRadius)
  chart.currentRanges(args.currentRanges)
  el.call(chart)

  resize()
}

export default { init, resize, mouseover, hideTooltip }