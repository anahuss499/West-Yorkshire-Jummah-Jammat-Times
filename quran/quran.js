(function () {
    "use strict";

    /* Text is loaded from the Quran.com API (IndoPak script) when a surah/parah is opened. */
    var API = "https://api.quran.com/api/v4/quran/verses/indopak";
    var CACHE_PREFIX = "wyjjt-quran-v1-";
    var LAST_KEY = "wyjjt-quran-last";
    var SIZE_KEY = "wyjjt-quran-size";

    var $ = function (id) { return document.getElementById(id); };
    var listView = $("listView"), readerView = $("readerView");
    var listEl = $("list"), emptyEl = $("empty"), searchEl = $("search");
    var tabSurah = $("tabSurah"), tabParah = $("tabParah");
    var readerEl = $("reader"), barTitle = $("barTitle");
    var prevBtn = $("prevBtn"), nextBtn = $("nextBtn");

    var tab = "s";                 // "s" = surahs, "p" = parahs
    var memory = {};               // in-memory cache of fetched verses
    var loadToken = 0;             // guards against out-of-order loads
    var size = 2.2;                // rem

    /* ---------- small helpers ---------- */
    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;
        return e;
    }
    function arDigits(n) { return String(n).replace(/\d/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[d]; }); }
    function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
    function fetchStored(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

    /* ---------- list ---------- */
    function renderList() {
        var q = searchEl.value.trim().toLowerCase();
        listEl.textContent = "";
        var shown = 0;

        if (tab === "s") {
            SURAHS.forEach(function (s, i) {
                var n = i + 1;
                if (q && String(n) !== q && s[0].toLowerCase().indexOf(q) === -1 && s[1].indexOf(q) === -1) return;
                listEl.appendChild(item("#s/" + n, n, s[0], s[2] + " ayahs", s[1]));
                shown++;
            });
        } else {
            PARAHS.forEach(function (p, i) {
                var n = i + 1;
                var surah = SURAHS[p[1] - 1];
                if (q && String(n) !== q && p[0].toLowerCase().indexOf(q) === -1 && surah[0].toLowerCase().indexOf(q) === -1) return;
                listEl.appendChild(item("#p/" + n, n, "Para " + n + " · " + p[0], "Starts: " + surah[0] + " " + p[1] + ":" + p[2], arDigits(n)));
                shown++;
            });
        }
        emptyEl.hidden = shown > 0;
    }

    function item(href, n, title, sub, ar) {
        var a = el("a", "item");
        a.href = href;
        a.appendChild(el("span", "num", n));
        var meta = el("span", "meta");
        meta.appendChild(el("strong", null, title));
        meta.appendChild(el("span", null, sub));
        a.appendChild(meta);
        a.appendChild(el("span", "ar", ar));
        var li = el("li");
        li.appendChild(a);
        return li;
    }

    function setTab(t) {
        tab = t;
        tabSurah.setAttribute("aria-selected", t === "s");
        tabParah.setAttribute("aria-selected", t === "p");
        searchEl.value = "";
        renderList();
    }
    tabSurah.addEventListener("click", function () { setTab("s"); });
    tabParah.addEventListener("click", function () { setTab("p"); });
    searchEl.addEventListener("input", renderList);

    /* ---------- continue card ---------- */
    function titleFor(kind, n) {
        return kind === "s"
            ? "Surah " + SURAHS[n - 1][0]
            : "Para " + n + " · " + PARAHS[n - 1][0];
    }
    function showContinue() {
        var card = $("continueCard");
        var m = /^(s|p)\/(\d+)$/.exec(fetchStored(LAST_KEY) || "");
        if (!m) { card.hidden = true; return; }
        card.href = "#" + m[0];
        $("continueName").textContent = titleFor(m[1], +m[2]);
        card.hidden = false;
    }

    /* ---------- data ---------- */
    function getVerses(kind, n) {
        var key = kind + n;
        if (memory[key]) return Promise.resolve(memory[key]);
        var cached = fetchStored(CACHE_PREFIX + key);
        if (cached) {
            try { memory[key] = JSON.parse(cached); return Promise.resolve(memory[key]); } catch (e) { }
        }
        var url = API + "?" + (kind === "s" ? "chapter_number=" : "juz_number=") + n;
        return fetch(url).then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
        }).then(function (data) {
            var verses = (data.verses || []).map(function (v) { return [v.verse_key, v.text_indopak]; });
            if (!verses.length) throw new Error("empty");
            memory[key] = verses;
            store(CACHE_PREFIX + key, JSON.stringify(verses));
            return verses;
        });
    }

    function getBismillah() {
        // Ayah 1:1 is the bismillah, taken from the same script so it matches the font.
        return getVerses("s", 1).then(function (v) { return v[0][1]; });
    }

    /* ---------- reader ---------- */
    function showStatus(node) {
        readerEl.textContent = "";
        readerEl.appendChild(node);
    }
    function loadingNode() {
        var d = el("div", "status");
        d.appendChild(el("div", "spinner"));
        d.appendChild(el("div", null, "Loading…"));
        return d;
    }

    function openReader(kind, n) {
        var count = kind === "s" ? SURAHS.length : PARAHS.length;
        if (n < 1 || n > count) { location.hash = ""; return; }

        listView.hidden = true;
        readerView.hidden = false;
        window.scrollTo(0, 0);
        barTitle.textContent = titleFor(kind, n);
        document.title = titleFor(kind, n) + " | Holy Quran";
        store(LAST_KEY, kind + "/" + n);

        setPager(prevBtn, kind, n - 1, count, "← ");
        setPager(nextBtn, kind, n + 1, count, "");

        var token = ++loadToken;
        showStatus(loadingNode());

        Promise.all([getVerses(kind, n), getBismillah()]).then(function (res) {
            if (token !== loadToken) return;
            renderVerses(res[0], res[1]);
        }).catch(function () {
            if (token !== loadToken) return;
            var d = el("div", "status");
            d.appendChild(el("div", null, "Couldn't load the text. Please check your connection and try again."));
            var b = el("button", null, "Try again");
            b.type = "button";
            b.addEventListener("click", function () { openReader(kind, n); });
            d.appendChild(b);
            showStatus(d);
        });
    }

    function setPager(btn, kind, target, count, arrow) {
        if (target < 1 || target > count) {
            btn.setAttribute("aria-disabled", "true");
            btn.removeAttribute("href");
            btn.textContent = "";
            return;
        }
        btn.removeAttribute("aria-disabled");
        btn.href = "#" + kind + "/" + target;
        var label = kind === "s" ? SURAHS[target - 1][0] : "Para " + target;
        btn.textContent = arrow ? "← " + label : label + " →";
    }

    function renderVerses(verses, bismillah) {
        readerEl.textContent = "";
        var p = null;

        verses.forEach(function (v) {
            var parts = v[0].split(":");
            var sNum = +parts[0], aNum = +parts[1];

            if (aNum === 1) {
                var s = SURAHS[sNum - 1];
                var head = el("div", "surah-head");
                head.appendChild(el("span", "ar-name", "سورة " + s[1]));
                head.appendChild(el("span", "en-name", "Surah " + s[0] + " · " + s[2] + " ayahs"));
                readerEl.appendChild(head);
                if (sNum !== 1 && sNum !== 9) readerEl.appendChild(el("p", "bismillah", bismillah));
                p = el("p", "verses");
                p.setAttribute("dir", "rtl");
                readerEl.appendChild(p);
            }
            if (!p) { // parah that begins mid-surah
                p = el("p", "verses");
                p.setAttribute("dir", "rtl");
                readerEl.appendChild(p);
            }
            p.appendChild(document.createTextNode(v[1] + " "));
            p.appendChild(el("span", "ayah-no", arDigits(aNum)));
            p.appendChild(document.createTextNode(" "));
        });
    }

    /* ---------- text size ---------- */
    function applySize() {
        document.documentElement.style.setProperty("--q-size", size + "rem");
        store(SIZE_KEY, String(size));
    }
    $("smaller").addEventListener("click", function () { size = Math.max(1.4, +(size - 0.2).toFixed(1)); applySize(); });
    $("larger").addEventListener("click", function () { size = Math.min(4, +(size + 0.2).toFixed(1)); applySize(); });

    /* ---------- routing (#s/2, #p/5) ---------- */
    function route() {
        var m = /^#(s|p)\/(\d+)$/.exec(location.hash);
        if (m) {
            openReader(m[1], +m[2]);
        } else {
            loadToken++;
            readerView.hidden = true;
            listView.hidden = false;
            document.title = "Holy Quran | West Yorkshire Jummah";
            showContinue();
        }
    }
    $("backBtn").addEventListener("click", function (e) {
        e.preventDefault();
        location.hash = "";
        if (location.hash === "") route();
    });
    window.addEventListener("hashchange", route);

    /* ---------- init ---------- */
    var savedSize = parseFloat(fetchStored(SIZE_KEY));
    if (savedSize >= 1.4 && savedSize <= 4) size = savedSize;
    applySize();
    renderList();
    route();
})();