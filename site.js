/* Locks interactives that the teacher hasn't opened yet (settings in availability.json).
   Missing or unreadable settings mean everything stays open. */
(function () {
  var url = "availability.json?t=" + Date.now();
  fetch(url, { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (cfg) {
      if (!cfg || !cfg.labs) return;
      var links = document.querySelectorAll('a[href^="interactives/"]');
      var cards = [];
      Array.prototype.forEach.call(links, function (a) {
        var id = a.getAttribute("href").replace("interactives/", "").replace(".html", "");
        if (cfg.labs[id] !== false) return;
        var card = a.closest(".card");
        if (card && cards.indexOf(card) < 0) cards.push(card);
      });
      cards.forEach(function (card) {
        card.classList.add("locked");
        Array.prototype.forEach.call(card.querySelectorAll("a"), function (a) {
          a.removeAttribute("href"); a.setAttribute("aria-disabled", "true"); a.setAttribute("tabindex", "-1");
        });
        var btn = card.querySelector(".btn");
        var note = document.createElement("span");
        note.className = "lockmsg";
        note.textContent = "Locked · opens after the class activity";
        if (btn) btn.replaceWith(note);
        else { var body = card.querySelector(".body"); if (body) body.appendChild(note); }
      });
    })
    .catch(function () {});
})();
