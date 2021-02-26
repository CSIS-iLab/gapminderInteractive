import * as plot from "./js/createPlot";
import Data from "./data/air-pollution-data-20210203.csv";
import Indicators from "./data/air-pollution-indicators-20210203.csv";
import "./scss/main.scss";
import translations from "./js/translations";
import strings from "./js/translationStrings";

let plotted;
let lang = translations.displayLang();
const langStrings = strings.strings;

function init() {
  plotted = plot.createPlot({
    data: Data,
    indicators: Indicators,
    language: lang,
    strings: langStrings
  });
  plotted.init();
}
window.addEventListener("DOMContentLoaded", init);
