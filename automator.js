import van from "vanjs-core";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import { FastAverageColor } from "fast-average-color";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.tz.setDefault("America/Chicago");

const PERIWINKLE_HEX = "92a2e8";
const NEW_BADGE_MONTHS = 4;
const WHITE_LOGO_SRC =
  "https://cdn.jsdelivr.net/gh/elijahducote/EV@main/public/external/white-logo.png";

const frag = (n) => van.tags[n];

const $hero = document.querySelector(".home-hero");
const $heroSlot = document.querySelector(".home-container");
const $navDropdown = document.querySelector(".navigation-links3-thq-dropdown");
const $mobDropdown = document.querySelector(".home-thq-dropdown");
const $header = document.querySelector(".home-header");
const $mobMenu = document.querySelector(".home-mobile-menu");
const $logo1 = document.querySelector(".home-image");
const $logo2 = document.querySelector(".home-image1");
const $grid = document.querySelector(".home-tracks");
const $chips = document.querySelector(".home-tag-chips");
const root = document.documentElement;

document.addEventListener(
  "DOMContentLoaded",
  () => {
    if ($header) $header.style.display = "flex";
  },
  { once: true },
);

async function loadTracks() {
  const res = await fetch("./automation.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`automation.json ${res.status}`);
  const { tracks = [] } = await res.json();
  return tracks
    .map(normalize)
    .sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf());
}

function normalize(t) {
  return {
    id: t.id,
    title: t.name,
    about: t.about || "",
    artwork: t.cover,
    url: t.url,
    time: t.time,
    embed: t.embed || buildEmbed(t.url),
    tags: (t.tags || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

function buildEmbed(url) {
  const params = new URLSearchParams({
    url,
    color: `#${PERIWINKLE_HEX}`,
    auto_play: "false",
    hide_related: "true",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "false",
    visual: "true",
  });
  return `https://w.soundcloud.com/player/?${params}`;
}

loadTracks().then(render).catch(renderError);

function render(tracks) {
  if (!tracks.length) return renderEmpty();
  const top = tracks[0];

  van.add(
    $hero,
    frag("div")(
      { class: "home-btn-group" },
      frag("a")(
        {
          href: top.url,
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

  van.add($heroSlot, buildFeatured(top));

  van.add($mobDropdown, populate(tracks, 4));
  van.add($navDropdown, populate(tracks, 7));

  if ($grid && $chips) renderGrid(tracks);

  themeFromCover(top.artwork);
}

function buildFeatured(track) {
  const showing = van.state(false);
  return () =>
    showing.val
      ? frag("iframe")({
          class: "home-iframe",
          src: track.embed,
          allow: "autoplay",
          frameborder: "no",
          scrolling: "no",
          loading: "lazy",
          title: track.title,
        })
      : frag("button")(
          {
            class: "home-iframe home-iframe-lite",
            type: "button",
            "aria-label": `Play ${track.title}`,
            onclick: () => {
              showing.val = true;
            },
          },
          frag("img")({ src: track.artwork, alt: "", loading: "lazy" }),
          frag("span")({ class: "home-iframe-play" }, "▶"),
        );
}

function populate(tracks, max) {
  const kairos = dayjs.tz();
  const cap = Math.min(max, tracks.length);
  const showExpand = cap < tracks.length;

  const ul = frag("ul")({
    class: "home-dropdown-list",
    "data-thq": "thq-dropdown-list",
  });

  for (let i = 0; i < cap; i++) {
    const t = tracks[i];
    const isNew = kairos.diff(t.time, "month") < NEW_BADGE_MONTHS;
    const toggle = frag("div")(
      {
        class: "navigation-links3-dropdown-toggle01",
        "data-thq": "thq-dropdown-toggle",
      },
      frag("img")({
        src: t.artwork,
        class: "home-dropdown-thumb",
        alt: "",
        rel: "noreferrer",
        crossorigin: "",
      }),
      frag("a")(
        { href: t.url, target: "_blank", rel: "noreferrer noopener" },
        t.title,
      ),
      isNew ? frag("span")({ class: "home-dropdown-new" }, "NEW") : null,
    );
    van.add(
      ul,
      frag("li")(
        {
          style: "max-width:50vw",
          class: "navigation-links3-dropdown01 list-item",
          "data-thq": "thq-dropdown",
        },
        toggle,
      ),
    );
  }

  if (showExpand) {
    const expandToggle = frag("div")(
      {
        class: "navigation-links3-dropdown-toggle01",
        "data-thq": "thq-dropdown-toggle",
        onclick: () => {
          ul.replaceWith(populate(tracks, max + 2));
        },
      },
      frag("span")("EXPAND"),
    );
    van.add(
      ul,
      frag("li")(
        {
          class: "navigation-links3-dropdown01 list-item",
          "data-thq": "thq-dropdown",
        },
        expandToggle,
      ),
    );
  }

  return ul;
}

function renderGrid(tracks) {
  const allTags = [...new Set(tracks.flatMap((t) => t.tags))].sort();
  const activeFilter = van.state("");
  const activeCard = van.state(null);

  const chipFor = (label, value) =>
    frag("button")(
      {
        type: "button",
        class: () =>
          `home-tag-chip${activeFilter.val === value ? " is-active" : ""}`,
        onclick: () => {
          activeFilter.val = activeFilter.val === value ? "" : value;
          activeCard.val = null;
        },
      },
      label,
    );

  van.add($chips, chipFor("All", ""));
  for (const tag of allTags) van.add($chips, chipFor(tag, tag));

  van.add($grid, () => {
    const filter = activeFilter.val;
    const visible = filter
      ? tracks.filter((t) => t.tags.includes(filter))
      : tracks;
    return frag("div")(
      { class: "home-tracks-grid" },
      visible.map((track) => buildCard(track, activeCard)),
    );
  });
}

function buildCard(track, activeCard) {
  const months = dayjs.tz().diff(track.time, "month");
  const cover = frag("div")(
    { class: "home-track-cover" },
    () =>
      activeCard.val === track.id
        ? frag("iframe")({
            src: track.embed,
            allow: "autoplay",
            frameborder: "no",
            scrolling: "no",
            loading: "lazy",
            title: track.title,
          })
        : frag("button")(
            {
              type: "button",
              class: "home-track-cover-btn",
              "aria-label": `Play ${track.title}`,
              onclick: () => {
                activeCard.val = track.id;
              },
            },
            frag("img")({
              src: track.artwork,
              alt: track.title,
              loading: "lazy",
              crossorigin: "",
            }),
            frag("span")({ class: "home-track-play" }, "▶"),
          ),
    months < NEW_BADGE_MONTHS
      ? frag("span")({ class: "home-track-new" }, "NEW")
      : null,
  );

  const meta = frag("div")(
    { class: "home-track-meta" },
    frag("a")(
      {
        href: track.url,
        target: "_blank",
        rel: "noreferrer noopener",
        class: "home-track-title",
      },
      track.title,
    ),
    frag("span")({ class: "home-track-date" }, dayjs(track.time).fromNow()),
    track.about
      ? frag("p")({ class: "home-track-about" }, track.about)
      : null,
    track.tags.length
      ? frag("div")(
          { class: "home-track-tags" },
          track.tags.map((t) =>
            frag("span")({ class: "home-track-tag" }, `#${t}`),
          ),
        )
      : null,
  );

  return frag("article")({ class: "home-track-card" }, cover, meta);
}

function renderEmpty() {
  if ($grid)
    van.add(
      $grid,
      frag("p")(
        { class: "home-tracks-empty" },
        "Tracks will appear here as they're released.",
      ),
    );
}

function renderError(err) {
  console.error("[automator]", err);
  if ($grid)
    van.add(
      $grid,
      frag("p")(
        { class: "home-tracks-empty" },
        "Unable to load releases right now.",
      ),
    );
}

function themeFromCover(coverUrl) {
  const fac = new FastAverageColor();
  fac
    .getColorAsync(coverUrl, {
      speed: "precision",
      algorithm: "dominant",
      step: 3,
    })
    .then((color) => {
      const bg = mix([127, 127, 127], color.value, 62.5);
      const tint = `rgba(${bg[0]},${bg[1]},${bg[2]},1)`;
      $heroSlot.style.backgroundColor = tint;
      $header.style.backgroundColor = tint;
      $mobMenu.style.backgroundColor = tint;
      applyTheme(bg);
      const c = color.rgba.substring(0, color.rgb.length);
      $hero.style.backgroundImage = `linear-gradient(175deg, ${c},0.375) 0%, ${c},0.5) 100%),url("${coverUrl}")`;
    })
    .catch((e) => console.warn("[automator] FAC failed", e));
}

function applyTheme(pageBg) {
  const onLight = isLight(pageBg);
  const base = onLight ? "#000" : "#FFF";
  const invert = onLight ? "#FFF" : "#000";
  const link = onLight ? "#0074F0" : "#a1e0fb";
  const muted = onLight ? "rgba(0,0,0,0.74)" : "rgba(255,255,255,0.82)";
  const surface = onLight ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.22)";
  const surfaceStrong = onLight
    ? "rgba(255,255,255,0.55)"
    : "rgba(0,0,0,0.42)";
  const cardBorder = onLight
    ? "rgba(0,0,0,0.22)"
    : "rgba(255,255,255,0.20)";
  const heroShadow = onLight
    ? "0 0.15rem 0.4rem rgb(0,0,0), 0 0.3rem 0.85rem rgb(0,0,0)"
    : "0 0.2rem 0.15rem rgb(0,0,0), 0 0.4rem 0.65rem rgba(0,0,0), 0 0.9rem 1.15rem rgb(0,0,0)";

  root.style.setProperty("--basecolor", base);
  root.style.setProperty("--invertcolor", invert);
  root.style.setProperty("--linkcolor", link);
  root.style.setProperty("--muted", muted);
  root.style.setProperty("--surface", surface);
  root.style.setProperty("--surface-strong", surfaceStrong);
  root.style.setProperty("--card-border", cardBorder);
  root.style.setProperty("--hero-text-shadow", heroShadow);

  if (!onLight) {
    for (const el of [$logo1, $logo2]) {
      if (!el) continue;
      van.hydrate(el, () =>
        frag("img")({
          alt: "logo",
          class: el.className,
          src: WHITE_LOGO_SRC,
          loading: "lazy",
          rel: "noreferrer",
          crossorigin: "",
        }),
      );
    }
  }
}

function relativeLuminance([r, g, b]) {
  const lin = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function isLight(rgb) {
  return relativeLuminance(rgb) > 0.18;
}

function mix(a, b, percent) {
  const r = percent / 100;
  const ir = 1 - r;
  return a.map((c, i) => Math.round(c * ir + b[i] * r));
}
