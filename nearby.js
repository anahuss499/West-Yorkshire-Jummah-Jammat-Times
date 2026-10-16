/* ==========================================================
   NEARBY MASJIDS
   - Asks the visitor to share their location (or type a postcode)
   - Looks up each masjid's coordinates from the postcode in its
     address (postcodes.io, free, no key) and caches them locally
   - Shows the nearest masjids with distance, times and directions
   Needs: data.js (AREAS) loaded before this file.
   ========================================================== */
(function () {
    "use strict";

    var SHOW_STEP = 5;                       // masjids shown at a time
    var CACHE_KEY = "wyjjt-geo-v1";
    var POSTCODE_RE = /[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i;

    var panel = document.getElementById("nearby");
    var openBtn = document.getElementById("nearbyBtn");
    if (!panel || !openBtn || typeof AREAS === "undefined") return;

    var state = { origin: null, results: [], shown: SHOW_STEP, masjids: null };

    /* ---------- helpers ---------- */
    function normPostcode(p) {
        var s = p.toUpperCase().replace(/\s+/g, "");
        return s.slice(0, -3) + " " + s.slice(-3);
    }

    function allMasjids() {
        var list = [];
        AREAS.forEach(function (a) {
            a.masjids.forEach(function (m) {
                var match = m[1].match(POSTCODE_RE);
                list.push({
                    name: m[0], address: m[1], times: m[2] || [], flags: m[3] || "",
                    area: a.area, postcode: match ? normPostcode(match[0]) : null
                });
            });
        });
        return list;
    }

    function haversineMiles(lat1, lon1, lat2, lon2) {
        var R = 3958.8, rad = Math.PI / 180;
        var dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function readCache() {
        try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch (e) { return {}; }
    }
    function writeCache(c) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch (e) { }
    }

    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    /* ---------- geocoding ---------- */
    function geocodeMasjids() {
        if (state.masjids) return Promise.resolve(state.masjids);
        var masjids = allMasjids();
        var cache = readCache();
        var missing = [];
        masjids.forEach(function (m) {
            if (m.postcode && !cache[m.postcode] && missing.indexOf(m.postcode) === -1) missing.push(m.postcode);
        });

        var chunks = [];
        for (var i = 0; i < missing.length; i += 100) chunks.push(missing.slice(i, i + 100));

        var jobs = chunks.map(function (chunk) {
            return fetch("https://api.postcodes.io/postcodes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postcodes: chunk })
            }).then(function (r) { return r.json(); }).then(function (data) {
                (data.result || []).forEach(function (row) {
                    if (row.result) cache[normPostcode(row.query)] = [row.result.latitude, row.result.longitude];
                });
            });
        });

        return Promise.all(jobs).then(function () {
            writeCache(cache);
            masjids.forEach(function (m) {
                var c = m.postcode && cache[m.postcode];
                if (c) { m.lat = c[0]; m.lng = c[1]; }
            });
            state.masjids = masjids;
            return masjids;
        });
    }

    function lookupPostcode(text) {
        var clean = text.trim();
        if (!POSTCODE_RE.test(clean)) return Promise.reject(new Error("Please enter a full UK postcode, e.g. BD3 9AP."));
        return fetch("https://api.postcodes.io/postcodes/" + encodeURIComponent(clean.replace(/\s+/g, "")))
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (!data.result) throw new Error("We couldn't find that postcode. Please check it and try again.");
                return { lat: data.result.latitude, lng: data.result.longitude, label: data.result.postcode };
            });
    }

    /* ---------- UI ---------- */
    function setStatus(msg, kind) {
        var el = panel.querySelector(".nb-status");
        el.textContent = msg || "";
        el.className = "nb-status" + (kind ? " " + kind : "");
    }

    function renderAsk() {
        panel.hidden = false;
        panel.innerHTML =
            '<div class="nb-card">' +
            '<button class="nb-close" type="button" aria-label="Close">&times;</button>' +
            '<h2>Find masjids near you</h2>' +
            '<p class="nb-msg">Would you like to share your location? We\'ll use it only on your device to show the nearest masjids &mdash; it is never sent to us or stored.</p>' +
            '<div class="nb-actions">' +
            '<button class="nb-primary" type="button" id="nbShare"><i class="fa-solid fa-location-crosshairs"></i> Share my location</button>' +
            '</div>' +
            '<p class="nb-or">or enter your postcode</p>' +
            '<form class="nb-form" id="nbForm">' +
            '<input id="nbPostcode" type="text" placeholder="e.g. BD3 9AP" autocomplete="postal-code" aria-label="Your postcode">' +
            '<button type="submit">Search</button>' +
            '</form>' +
            '<p class="nb-status" role="status" aria-live="polite"></p>' +
            '</div>';

        panel.querySelector(".nb-close").addEventListener("click", closePanel);
        panel.querySelector("#nbShare").addEventListener("click", useGeolocation);
        panel.querySelector("#nbForm").addEventListener("submit", function (e) {
            e.preventDefault();
            usePostcode(panel.querySelector("#nbPostcode").value);
        });
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function closePanel() {
        panel.hidden = true;
        panel.innerHTML = "";
        openBtn.setAttribute("aria-expanded", "false");
    }

    function useGeolocation() {
        if (!("geolocation" in navigator)) {
            setStatus("Your browser doesn't support location. Please enter your postcode instead.", "error");
            return;
        }
        setStatus("Waiting for your permission…");
        navigator.geolocation.getCurrentPosition(function (pos) {
            findNearest({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "your location" });
        }, function (err) {
            var msg = err.code === 1
                ? "Location permission was declined. You can enter your postcode below instead."
                : "We couldn't get your location. Please enter your postcode instead.";
            setStatus(msg, "error");
            var input = panel.querySelector("#nbPostcode");
            if (input) input.focus();
        }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
    }

    function usePostcode(text) {
        setStatus("Looking up postcode…");
        lookupPostcode(text).then(findNearest).catch(function (e) {
            setStatus(e.message || "Something went wrong. Please try again.", "error");
        });
    }

    function findNearest(origin) {
        setStatus("Finding the nearest masjids…");
        geocodeMasjids().then(function (masjids) {
            var results = masjids.filter(function (m) { return typeof m.lat === "number"; })
                .map(function (m) {
                    return { m: m, dist: haversineMiles(origin.lat, origin.lng, m.lat, m.lng) };
                })
                .sort(function (a, b) { return a.dist - b.dist; });
            if (!results.length) throw new Error("We couldn't place the masjids on the map. Please try again later.");
            state.origin = origin;
            state.results = results;
            state.shown = SHOW_STEP;
            renderResults();
        }).catch(function (e) {
            setStatus(e.message || "Something went wrong. Please check your connection and try again.", "error");
        });
    }

    function timesHtml(times) {
        return times.map(function (t, i) {
            var late = /\+$/.test(t);
            var label = late ? t.slice(0, -1) + " (late)" : t;
            return '<span class="nb-time' + (late ? " late" : "") + '"><small>' + (i + 1) + '</small> ' + esc(label) + '</span>';
        }).join("");
    }

    function renderResults() {
        var from = state.origin.label === "your location" ? "your location" : state.origin.label;
        var slice = state.results.slice(0, state.shown);
        var html =
            '<div class="nb-card">' +
            '<button class="nb-close" type="button" aria-label="Close">&times;</button>' +
            '<h2>Nearest masjids</h2>' +
            '<p class="nb-msg">Distances are in a straight line from ' + esc(from) + '.</p>' +
            '<ol class="nb-list">';

        slice.forEach(function (r) {
            var m = r.m;
            var dir = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(m.name + ", " + m.address);
            var badges = "";
            if (m.flags.indexOf("L") > -1) badges += '<span class="nb-badge ladies">Ladies</span>';
            if (m.flags.indexOf("U") > -1) badges += '<span class="nb-badge upd">Updated</span>';
            html +=
                '<li class="nb-item">' +
                '<div class="nb-top"><strong>' + esc(m.name) + '</strong>' +
                '<span class="nb-dist">' + r.dist.toFixed(1) + ' mi</span></div>' +
                '<div class="nb-addr">' + esc(m.address) + ' &middot; ' + esc(m.area) + '</div>' +
                '<div class="nb-times">' + timesHtml(m.times) + badges + '</div>' +
                '<a class="nb-dir" href="' + dir + '" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right"></i> Directions</a>' +
                '</li>';
        });

        html += '</ol><div class="nb-actions">';
        if (state.shown < state.results.length) {
            html += '<button type="button" class="nb-secondary" id="nbMore">Show more</button>';
        }
        html += '<button type="button" class="nb-secondary" id="nbChange">Change location</button></div></div>';

        panel.innerHTML = html;
        panel.querySelector(".nb-close").addEventListener("click", closePanel);
        panel.querySelector("#nbChange").addEventListener("click", renderAsk);
        var more = panel.querySelector("#nbMore");
        if (more) more.addEventListener("click", function () {
            state.shown += SHOW_STEP;
            renderResults();
        });
    }

    openBtn.addEventListener("click", function () {
        openBtn.setAttribute("aria-expanded", "true");
        if (state.results.length) renderResults(); else renderAsk();
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
})();