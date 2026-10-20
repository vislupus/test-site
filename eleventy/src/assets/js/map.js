// Инициализира всички карти на страницата.
// Всяка карта е <div class="map" data-lat data-lng data-zoom data-markers='[...]' data-route="true">.
// data-markers е JSON масив от { "lat": 42.2, "lng": 23.3, "label": "Текст" }.
function initMaps(L) {
  if (!L) return;
  const tiles = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  for (const el of document.querySelectorAll(".map[data-lat]:not([data-ready])")) {
    el.dataset.ready = "true";
    const center = [Number(el.dataset.lat), Number(el.dataset.lng)];
    const zoom = Number(el.dataset.zoom || 12);
    let markers = [];
    try { markers = JSON.parse(el.dataset.markers || "[]"); } catch (e) { console.warn("Невалиден data-markers", e); }

    const map = L.map(el, { scrollWheelZoom: false }).setView(center, zoom);
    L.tileLayer(tiles, { maxZoom: 19, attribution }).addTo(map);

    const accent = getComputedStyle(el).getPropertyValue("--forest").trim() || "#2a6a4c";
    const points = markers.map((m) => {
      const p = [Number(m.lat), Number(m.lng)];
      const mk = L.circleMarker(p, { radius: 7, color: "#fff", weight: 2, fillColor: accent, fillOpacity: 1 }).addTo(map);
      if (m.label) mk.bindTooltip(m.label, { direction: "top", offset: [0, -6] });
      return p;
    });
    if (el.dataset.route === "true" && points.length > 1) {
      L.polyline(points, { color: accent, weight: 3, dashArray: "6 7" }).addTo(map);
    }
    if (el.dataset.fit === "true" && points.length > 1) map.fitBounds(points, { padding: [32, 32] });
    // Скролът с колелцето се включва след клик в картата, за да не „хваща“ страницата.
    map.once("focus", () => map.scrollWheelZoom.enable());
  }
}

// Leaflet е зареден като обикновен <script> преди този файл.
initMaps(window.L);
