import * as plot from './js/createPlot'
import Data from './data/advanced-data-2019430.csv'
import Indicators from './data/advanced-indicators-2019430.csv'
import './scss/main.scss'
import intro from 'intro.js'
import translations from './js/translations'
import strings from './js/translationStrings'

const introJs = intro.introJs()
let plotted
let breakpoint = calculateBreakpoint()
let lang = translations.displayLang()
const langStrings = strings.strings

function init () {
  plotted = plot.createPlot({
    data: Data,
    indicators: Indicators,
    useHints: true,
    language: lang,
    strings: langStrings
  })
  plotted.init()
  loadIntro()
}

function loadIntro () {
  let landingContent = document.querySelector('.landing-content p')
  landingContent.innerHTML = langStrings.intro.landing[lang]
  setupRestartTourBtn()
  if (breakpoint != 'xsmall' && breakpoint != 'small') {
    assignAnnotations()
  }
  setupTourBtns()
}

function setupTourBtns () {
  let introBtn = document.querySelector('.btn-intro')
  if (introBtn) {
    introBtn.innerHTML = langStrings.intro.takeTour[lang]
    introBtn.addEventListener('click', event => {
      hideLanding()
      startIntro()
    })
  }

  let chartBtn = document.querySelector('.btn-chart')
  if (chartBtn) {
    chartBtn.innerHTML = langStrings.intro.skipTracker[lang]
    chartBtn.addEventListener('click', function () {
      exploreChart()
    })
  }
}

function setupRestartTourBtn () {
  let restartBtn = document.querySelector('.btn-intro-restart')
  restartBtn.innerHTML = langStrings.intro.retakeTour[lang]
  restartBtn.addEventListener('click', function () {
    plotted.resetChart()
    startIntro()
  })
}

function exploreChart () {
  let overlays = document.querySelectorAll('.introjs-overlay')
  overlays.forEach(function (element) { element.remove() })
  setupHints()
}

function hideLanding () {
  updateDom.hideLanding()
}

function startIntro () {
  introJs.start()
  introWatchStepChange()
}

function assignAnnotations () {
  introJs.setOptions({
    skipLabel: langStrings.intro.skipLabel[lang],
    hidePrev: true,
    hideNext: true,
    doneLabel: langStrings.intro.doneLabel[lang],
    prevLabel: langStrings.intro.prevLabel[lang],
    nextLabel: langStrings.intro.nextLabel[lang],
    showStepNumbers: false,
    steps: [
      {
        intro: langStrings.intro.step0[lang],
        tooltipClass: 'intro-firstSlide'
      },
      {
        element: document.querySelector('circle[data-iso="CHN"]'),
        intro: langStrings.intro.step1[lang],
        position: 'right',
        tooltipClass: 'intro-circleSelect'
      },
      {
        element: document.querySelector('.filter-axis-x'),
        intro: langStrings.intro.step2[lang],
        position: 'left'
      },
      {
        element: document.querySelector('.chart-color-legend'),
        intro: langStrings.intro.step3[lang],
        position: 'bottom'
      },
      {
        element: document.querySelector('.chart-primary'),
        intro: langStrings.intro.step4[lang],
        position: 'right'
      },
      {
        element: document.querySelector('.filter-axis-y'),
        intro: langStrings.intro.step5[lang],
        position: 'left'
      },
      {
        element: document.querySelector('.chart-mean-line'),
        intro: langStrings.intro.step6[lang],
        position: 'right'
      },
      {
        element: document.querySelector('.chart-container'),
        intro: langStrings.intro.step7[lang],
        position: 'bottom'
      },
      {
        element: document.querySelector('.chart-primary'),
        intro: langStrings.intro.step8[lang],
        position: 'right'
      },
      {
        element: document.querySelector('.chart-primary'),
        intro: langStrings.intro.step9[lang],
        position: 'right'
      },
      {
        intro: langStrings.intro.step10[lang]
      }
    ]
  })
}

function introWatchStepChange () {
  introJs.onbeforechange(function (targetElement) {
    let currentStep = this._currentStep
    if (currentStep == 4) {
      updateDom.highlightCountries({
        show: ['USA', 'CHN'],
        hide: ['ZAF', 'IND']
      })
    } else if (currentStep == 7) {
      plotted.resetChart()
      updateDom.playTimeline()
    } else if (currentStep == 9) {
      updateDom.highlightCountries({
        show: ['CHN', 'ZAF', 'IND'],
        hide: ['USA']
      })
    } else if (currentStep == 10) {
      updateDom.highlightCountries({
        hide: ['USA', 'CHN', 'ZAF', 'IND']
      })
      plotted.updateTransitionLength()
    }
  })

  introJs.onchange(function (targetElement) {
    let currentStep = this._currentStep
    if (currentStep == 1 || currentStep == 5 || currentStep == 10) {
      document.querySelector('.introjs-tooltipReferenceLayer').classList.add('intro-circleSelectRef')
    } else if (currentStep != 0) {
      document.querySelector('.introjs-tooltipReferenceLayer').classList.remove('intro-circleSelectRef')
    }

    if (currentStep < 4) {
      updateDom.highlightCountries({
        hide: ['USA', 'CHN', 'ZAF', 'IND']
      })
    }
  })

  introJs.onexit(function () {
    plotted.resetChart()
  })
}

let updateDom = {
  hideLanding: function () {
    document.body.classList.toggle('is-relative')
    document.querySelector('.landing-container').classList.toggle('is-hidden')
    document.querySelector('.landing-content').classList.toggle('is-hidden')
  },
  highlightCountries: function (args) {
    if (args.hide) {
      args.hide.forEach(function (country) {
        let checkbox = document.querySelector('input[name="country"][data-iso="' + country + '"]')
        checkbox.checked = false
      })
    }
    if (args.show) {
      args.show.forEach(function (country) {
        let checkbox = document.querySelector('input[name="country"][data-iso="' + country + '"]')
        checkbox.checked = true
      })
    }
    plotted.drawChart()
  },
  playTimeline: function () {
    plotted.updateTransitionLength(300)
    document.querySelector('#playbtn').click()
  }
}

function setupHints () {
  introJs.setOptions({
    hintPosition: 'middle-left'
  })
  let axes = ['x', 'y', 'c', 'r']
  axes.forEach(function (axis) {
    let filter = document.querySelector('.filter-axis-' + axis)

    if (axis == 'c') {
      document.querySelector('.filter-axis-c').setAttribute('data-hintPosition', 'middle-right')
    }

    filter.addEventListener('change', function (e) {
      let introjsHints = document.querySelector('.introjs-hints')
      if (introjsHints) {
        introjsHints.innerHTML = ''
      }
      introJs.addHints()
      introJs.showHints()
    })
  })
  introJs.showHints()
}

function calculateBreakpoint () {
  return getComputedStyle(document.body).getPropertyValue('--breakpoint').replace(/\"/g, '')
}

function resize () {
  breakpoint = calculateBreakpoint()
}

window.addEventListener('DOMContentLoaded', init)
window.addEventListener('resize', resize)
