(function () {
  "use strict";

  var STORE_KEY = "wyjjt-durood-v3";   // list of recitations
  var OLD_KEY = "wyjjt-durood-v2";     // earlier single-recitation version (migrated)
  var MAX_TARGET = 1000000;

  var $ = function (id) { return document.getElementById(id); };
  var setupScreen = $("setupScreen"), reciteScreen = $("reciteScreen");
  var form = $("setupForm"), textInput = $("textInput"), targetInput = $("targetInput");
  var formError = $("formError");
  var startBtn = $("startBtn"), addBtn = $("addBtn"), cancelEdit = $("cancelEdit");
  var chips = document.querySelectorAll(".chips button");
  var savedList = $("savedList");
  var reciteText = $("reciteText"), countEl = $("count"), ofTarget = $("ofTarget");
  var progress = $("progress");
  var announce = $("announce");
  var resetDialog = $("resetDialog"), deleteDialog = $("deleteDialog");

  var state = { items: [], currentId: null, mode: "list" };
  var editingId = null;
  var pendingDeleteId = null;

  /* ---------- icons ---------- */
  var ICONS = {
    play: '<svg class="i fill" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    check: '<svg class="i" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    edit: '<svg class="i" viewBox="0 0 24 24"><path d="M4 20h4l10-10-4-4L4 16v4zM13 7l4 4"/></svg>',
    trash: '<svg class="i" viewBox="0 0 24 24"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg>'
  };

  /* ---------- helpers ---------- */
  function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function find(id) {
    for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return state.items[i];
    return null;
  }
  function current() { return find(state.currentId); }

  function cleanItem(x) {
    if (!x || typeof x.text !== "string" || !x.text.trim()) return null;
    var target = Math.floor(x.target);
    if (!(target >= 1)) return null;
    return {
      id: typeof x.id === "string" && x.id ? x.id : newId(),
      text: x.text,
      target: Math.min(target, MAX_TARGET),
      count: Math.max(0, Math.floor(x.count) || 0)
    };
  }

  /* ---------- storage ---------- */
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        state.items = (s.items || []).map(cleanItem).filter(Boolean);
        state.currentId = s.currentId;
        state.mode = s.mode === "recite" && find(s.currentId) ? "recite" : "list";
        return;
      }
      // migrate the earlier single-recitation save so nobody loses progress
      var old = JSON.parse(localStorage.getItem(OLD_KEY));
      var item = cleanItem(old);
      if (item) {
        state.items = [item];
        state.currentId = item.id;
        state.mode = old.mode === "recite" ? "recite" : "list";
      }
    } catch (e) { }
  }

  /* ---------- screens ---------- */
  function showList() {
    state.mode = "list";
    reciteScreen.hidden = true;
    setupScreen.hidden = false;
    renderSaved();
    resetForm();
    save();
    window.scrollTo(0, 0);
  }

  function openItem(id) {
    var item = find(id);
    if (!item) return showList();
    state.currentId = id;
    state.mode = "recite";
    setupScreen.hidden = true;
    reciteScreen.hidden = false;
    reciteText.textContent = item.text;
    render(false);
    save();
    window.scrollTo(0, 0);
  }

  /* ---------- saved list ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function actionBtn(icon, label, act, id, cls) {
    var b = el("button", cls || "");
    b.type = "button";
    b.innerHTML = ICONS[icon] + "<span>" + label + "</span>";
    b.setAttribute("data-act", act);
    b.setAttribute("data-id", id);
    return b;
  }

  function renderSaved() {
    savedList.textContent = "";
    savedList.hidden = state.items.length === 0;

    state.items.forEach(function (item) {
      var done = item.count >= item.target;
      var li = el("li", "item-card" + (done ? " done" : ""));

      var txt = el("p", "item-text", item.text);
      txt.setAttribute("dir", "auto");
      li.appendChild(txt);

      var meta = el("div", "item-meta");
      meta.appendChild(el("span", "item-count",
        item.count.toLocaleString() + " / " + item.target.toLocaleString()));
      if (done) {
        var tick = el("span", "tick");
        tick.innerHTML = ICONS.check;
        meta.appendChild(tick);
      }
      li.appendChild(meta);

      var bar = document.createElement("progress");
      bar.max = item.target;
      bar.value = Math.min(item.count, item.target);
      bar.setAttribute("aria-label", "Progress");
      li.appendChild(bar);

      var actions = el("div", "item-actions");
      actions.appendChild(actionBtn("play", "Recite", "recite", item.id, "item-go"));
      actions.appendChild(actionBtn("edit", "Edit", "edit", item.id));
      actions.appendChild(actionBtn("trash", "Remove", "delete", item.id, "item-del"));
      li.appendChild(actions);

      savedList.appendChild(li);
    });
  }

  savedList.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-act]");
    if (!b) return;
    var id = b.getAttribute("data-id"), act = b.getAttribute("data-act");
    if (act === "recite") openItem(id);
    else if (act === "edit") startEdit(id);
    else if (act === "delete") askDelete(id);
  });

  /* ---------- form: add / edit ---------- */
  function syncChips() {
    var v = String(parseInt(targetInput.value, 10));
    chips.forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-amount") === v); });
  }

  function setStartIcon(icon, label, action) {
    startBtn.innerHTML = ICONS[icon] + "<span>" + label + "</span>";
    startBtn.setAttribute("data-action", action);
  }

  function resetForm() {
    editingId = null;
    textInput.value = "";
    targetInput.value = 100;
    syncChips();
    formError.textContent = "";
    setStartIcon("play", "Start", "start");
    addBtn.hidden = false;
    cancelEdit.hidden = true;
  }

  function startEdit(id) {
    var item = find(id);
    if (!item) return;
    editingId = id;
    textInput.value = item.text;
    targetInput.value = item.target;
    syncChips();
    formError.textContent = "";
    setStartIcon("check", "Save", "save");
    addBtn.hidden = true;
    cancelEdit.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    textInput.focus();
  }

  chips.forEach(function (b) {
    b.addEventListener("click", function () {
      targetInput.value = b.getAttribute("data-amount");
      syncChips();
    });
  });
  targetInput.addEventListener("input", syncChips);
  cancelEdit.addEventListener("click", resetForm);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var action = (e.submitter && e.submitter.getAttribute("data-action")) || "start";
    var text = textInput.value.trim();
    var target = parseInt(targetInput.value, 10);

    if (!text) { formError.textContent = "Please write what you would like to recite."; textInput.focus(); return; }
    if (!(target >= 1) || target > MAX_TARGET) { formError.textContent = "Enter a number between 1 and " + MAX_TARGET.toLocaleString() + "."; targetInput.focus(); return; }
    formError.textContent = "";

    if (action === "save" && editingId) {
      var item = find(editingId);
      if (item) { item.text = text; item.target = target; }   // the count is kept
      save();
      showList();
      return;
    }

    var added = { id: newId(), text: text, target: target, count: 0 };
    state.items.push(added);
    state.currentId = added.id;

    if (action === "add") {
      save();
      renderSaved();
      resetForm();
      textInput.focus();
    } else {
      openItem(added.id);
    }
  });

  /* ---------- counter ---------- */
  function render(pulse) {
    var item = current();
    if (!item) return;
    var c = item.count, t = item.target;
    countEl.textContent = c.toLocaleString();
    ofTarget.textContent = "/ " + t.toLocaleString();
    progress.max = t;
    progress.value = Math.min(c, t);
    reciteScreen.classList.toggle("done", c >= t);

    if (pulse) {
      countEl.classList.add("pulse");
      setTimeout(function () { countEl.classList.remove("pulse"); }, 70);
    }
  }

  function ripple(x, y) {
    var r = document.createElement("span");
    r.className = "ripple";
    r.style.left = x + "px";
    r.style.top = y + "px";
    r.addEventListener("animationend", function () { r.remove(); });
    document.body.appendChild(r);
  }

  function add(x, y) {
    var item = current();
    if (!item) return;
    item.count += 1;
    render(true);
    save();
    ripple(x != null ? x : window.innerWidth / 2, y != null ? y : window.innerHeight / 2);
    if (item.count === item.target) {
      announce.textContent = item.target + " ✓";
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
    } else if (navigator.vibrate) {
      navigator.vibrate(8);
    }
  }

  function undo() {
    var item = current();
    if (item && item.count > 0) { item.count -= 1; render(false); save(); }
  }

  function reset() {
    var item = current();
    if (!item || item.count === 0) return;
    resetDialog.showModal();
    $("resetCancel").focus();
  }

  $("resetCancel").addEventListener("click", function () { resetDialog.close(); });
  $("resetConfirm").addEventListener("click", function () {
    resetDialog.close();
    var item = current();
    if (!item) return;
    item.count = 0;
    render(false);
    save();
  });
  resetDialog.addEventListener("click", function (e) { if (e.target === resetDialog) resetDialog.close(); });

  /* ---------- remove a recitation ---------- */
  function askDelete(id) {
    pendingDeleteId = id;
    deleteDialog.showModal();
    $("deleteCancel").focus();
  }
  $("deleteCancel").addEventListener("click", function () { deleteDialog.close(); });
  $("deleteConfirm").addEventListener("click", function () {
    deleteDialog.close();
    state.items = state.items.filter(function (i) { return i.id !== pendingDeleteId; });
    if (state.currentId === pendingDeleteId) state.currentId = null;
    if (editingId === pendingDeleteId) editingId = null;
    pendingDeleteId = null;
    showList();
  });
  deleteDialog.addEventListener("click", function (e) { if (e.target === deleteDialog) deleteDialog.close(); });

  /* ---------- tap anywhere ---------- */
  var IGNORE = "button, a, input, textarea, select, label, nav, dialog";

  document.addEventListener("click", function (e) {
    if (state.mode !== "recite" || reciteScreen.hidden) return;
    if (e.target.closest(IGNORE)) return;
    add(e.clientX, e.clientY);
  });

  document.addEventListener("keydown", function (e) {
    if (state.mode !== "recite" || reciteScreen.hidden) return;
    if (e.key !== " " && e.key !== "Enter") return;
    if (e.target.closest(IGNORE)) return;   // let focused buttons behave normally
    e.preventDefault();
    add();
  });

  $("undo").addEventListener("click", undo);
  $("reset").addEventListener("click", reset);
  $("back").addEventListener("click", showList);

  /* ---------- init ---------- */
  load();
  if (state.mode === "recite" && current()) {
    openItem(state.currentId);
  } else {
    showList();
  }
})();