import van from "vanjs-core";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { FastAverageColor } from "fast-average-color";
import { reactive, list } from "vanjs-ext";
import { discography as json, tracks as jsontwo } from "./automation.json";
function getMostRecentItem (array1, array2) {
    // Combine both arrays
    const combinedArray = [array1, array2];

    // Sort the combined array based on the "date" property
    combinedArray.sort((a, b) => {
        const dateA = dayjs(a.date);
        const dateB = dayjs(b.date);
        return dateB.isAfter(dateA) ? 1 : -1;
    });

    // Return the first element, which is the most recent date
    return combinedArray[0];
}
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Chicago");
const fac = new FastAverageColor(),
  root = document.documentElement;
var tint,
unfoldSize,
expandSize,
store,
urlpath,
chosen = getMostRecentItem(json[0],jsontwo[0]);

if (chosen.album) urlpath = "track";
else urlpath = "album";

jsontwo.reverse();

function mixColors(color1, color2, percentage) {
  const ratio = percentage / 100;
  const inverseRatio = 1 - ratio;

  const mixedColor = color1.map((component, index) => {
    return Math.round(component * inverseRatio + color2[index] * ratio);
  });

  return mixedColor;
}

function throttle(func, delay) {
  var prev = 0;
  return function () {
    if (Date.now() - prev > delay) {
      prev = Date.now();
      return func.apply(this, arguments);
    }
  };
}

function frag(item) {
  return van.tags[item];
}

const sectionA = document.getElementsByClassName("home-thq-dropdown")[0],
  sectionB = document.getElementsByClassName(
    "navigation-links3-thq-dropdown",
  )[0],
  sectionC = document.getElementsByClassName("home-container")[0],
  sectionD = document.getElementsByClassName("home-hero")[0],
  sectionE = document.getElementsByClassName(
    "navigation-links3-dropdown-toggle",
  )[0],
  sectionF = document.getElementsByClassName("home-mobile-menu")[0],
  bg = document.getElementsByClassName("home-container")[0],
  headr = document.getElementsByClassName("home-header")[0],
  wordmark = document.getElementsByClassName("home-image")[0],
  brand = document.getElementsByClassName("home-image1")[0];

van.add(
  sectionD,
  frag("div")(
    { class: "home-btn-group" },
    frag("a")(
      {
        href: chosen.url,
        target: "_blank",
        rel: "noreferrer noopener",
        class: "home-link8 button",
      },
      frag("span")(
        { class: "home-text5" },
        frag("span")("Stream Now", frag("br")),
      ),
    ),
  ),
);

fac.getColorAsync(chosen.cover, {
    speed: "precision",
    algorithm: "dominant",
    step: 3,
  })
  .then(function (color) {
    var combined = mixColors([255, 255, 255], color.value, 6.25),
      bgcolor = mixColors([127, 127, 127], color.value, 62.5),
      avrg = `rgba(${bgcolor[0]},${bgcolor[1]},${bgcolor[2]},1)`;
    //van.add(optionB,releases);
    //van.add(optionC,djev);
    //van.add(optionD,merch);
    //van.add(optionE,listen);
    bg.style.backgroundColor = avrg;
    headr.style.backgroundColor = avrg;
    sectionF.style.backgroundColor = avrg;
    if (color.isLight) {
      root.style.setProperty("--basecolor", "#000");
      root.style.setProperty("--linkcolor", "#0074F0");
    } else {
      // about = document.getElementsByClassName("home-text2")[0],
      root.style.setProperty("--basecolor", "#FFF");
      root.style.setProperty("--linkcolor", "#a1e0fb");
      van.hydrate(wordmark, function () {
        return frag("img")({
          alt: "logo",
          class: "home-image",
          src: "https://cdn.jsdelivr.net/gh/elijahducote/Ev@main/public/external/white-logo.png",
          loading: "lazy",
          rel: "noreferrer",
          crossorigin: "",
        });
      });
      van.hydrate(brand, function () {
        return frag("img")({
          alt: "logo",
          class: "home-image1",
          src: "https://cdn.jsdelivr.net/gh/elijahducote/Ev@main/public/external/white-logo.png",
          loading: "lazy",
          rel: "noreferrer",
          crossorigin: "",
        });
      });
    }
    //about.style.color = `rgba(${combined[0]},${combined[1]},${combined[2]},1)`;
    tint = color.rgba.substring(0, color.rgb.length);
    sectionD.style.backgroundImage = `linear-gradient(175deg, ${tint},0.48) 0%, ${tint},0.64) 100%),url("${chosen.cover}")`;
  });

function populate(max) {
  let kairos = dayjs.tz(),
    typo = [],
    link = [],
    img = [],
    date = [],
    len = jsontwo.length,
    cur = json.length + jsontwo.length,
    ndx = -1,
    offset = json.length - jsontwo.length,
    ocur = 0,
    diff,
    nth,
    monthsApart,
    item;
  if (max <= cur) cur = max;
  else max = null;
  for (nth = cur; cur; --cur) {
    diff = nth - cur;
    if (diff & 1 && len) {
      typo[diff] = jsontwo[len - 1].name;
      link[diff] = jsontwo[len - 1].url;
      img[diff] = jsontwo[len - 1].cover;
      date[diff] = jsontwo[len - 1].date;
      --len;
      continue;
    }

    typo[diff] = json[ocur].name;
    link[diff] = json[ocur].url;
    img[diff] = json[ocur].cover;
    date[diff] = json[ocur].date;
    ++ocur;
  }
  if (max) typo.push("EXPAND");
  const items = reactive(typo);

  return list(
    frag("ul")({
      class: "home-dropdown-list",
      "data-thq": "thq-dropdown-list",
    }),
    items,
    function (v) {
      ++ndx;
      //if (ndx) numbr = ndx;
      //affix = "0" + (ndx + 1);
      //affix = affix.slice(-2);
      item = frag("div")({
        class: "navigation-links3-dropdown-toggle01",
        "data-thq": "thq-dropdown-toggle",
      });

      if (ndx === max) {
        van.add(item, frag("span")(typo[ndx]));
        item.addEventListener("click", function () {
          unfoldSize = max;
          van.hydrate(item.parentNode.parentNode, function () {
            return populate(unfoldSize + 2);
          });
        });
        return frag("li")(
          {
            class: "navigation-links3-dropdown01 list-item",
            "data-thq": "thq-dropdown",
          },
          item,
        );
      }

      monthsApart = kairos.diff(date[ndx], "months");
      if (monthsApart < 4)
        van.add(
          item,
          frag("img")({
            src: "https://cdn.jsdelivr.net/gh/elijahducote/Ev@main/new-icon.png",
            style:
              "width:2rem !important;height:2rem !important;z-index:2;margin-left:.05rem;margin-right:1rem;position:relative;inset:0;position:absolute",
            rel: "noreferrer",
            crossorigin: "",
          }),
        );
      van.add(
        item,
        frag("img")({
          src: img[ndx],
          style:
            "width:2rem !important;height:2rem !important;z-index:1;margin-left:.05rem;margin-right:1rem",
          rel: "noreferrer",
          crossorigin: "",
        }),
      );
      van.add(
        item,
        frag("a")(
          { href: link[ndx], target: "_blank", rel: "noreferrer noopener" },
          typo[ndx],
        ),
      );
      return frag("li")(
        {
          style: "max-width:50vw",
          class: "navigation-links3-dropdown01 list-item",
          "data-thq": "thq-dropdown",
        },
        item,
      );
    },
  );
}
van.add(sectionA, populate(4));
van.add(sectionB, populate(7));
van.add(
  sectionC,
  frag("iframe")({
    style: "width:100%",
    class: "home-iframe",
    src: `https://open.spotify.com/embed/${urlpath}/${chosen.id}?utm_source=oembed`,
    allowfullscreen: "",
    allow: "clipboard-write; encrypted-media; fullscreen; picture-in-picture;",
    frameborder: "no",
    scrolling: "no",
  }),
);
var elm = document.querySelector(".home-text1"),
  val = window.getComputedStyle(elm, null);
document.addEventListener(
  "DOMContentLoaded",
  function () {
    headr.style.display = "flex";
  },
  { once: true },
);
///window.alert(parseInt(val.getPropertyValue("line-height"),10)*window.devicePixelRatio);
//setInterval(function () {window.alert(JSON.stringify(elm.getBoundingClientRect()))}, 4000);

//window.alert(*20)
//van.hydrate(sectionA,populate())
