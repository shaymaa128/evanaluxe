// extras.js — separate file. Does not change script.js or any old function.
// It is loaded at the end of index.html and collection.html:
//   <script src="extras.js"></script>

(function () {
  // ---------- 1) First "Add to cart" popup (once per visit) ----------
  var SEEN_KEY = "evana_price_note_seen";

  // For testing: open any page with ?resetpopup in the address to see the popup again
  try {
    if (location.search.indexOf("resetpopup") !== -1) sessionStorage.removeItem(SEEN_KEY);
  } catch (e) {}

  function alreadySeen() {
    try { return sessionStorage.getItem(SEEN_KEY) === "1"; } catch (e) { return false; }
  }
  function markSeen() {
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch (e) {}
  }

  function showPriceNote() {
    var overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;" +
      "display:flex;align-items:center;justify-content:center;padding:16px;";
    overlay.innerHTML =
      '<div style="background:#fff;max-width:340px;width:100%;padding:24px;border-radius:12px;' +
      'text-align:left;direction:ltr;font-family:inherit;box-shadow:0 10px 30px rgba(0,0,0,.4);">' +
      '<h3 style="margin:0 0 10px;color:#b8860b;">Please note</h3>' +
      '<p style="margin:0 0 18px;line-height:1.5;color:#000;font-weight:bold;">The price shown is for 1 item - option 1 from left to right</p>' +
      '<button id="evanaOk" style="background:#111;color:#d4af37;border:0;padding:10px 28px;' +
      'border-radius:6px;font-size:1rem;cursor:pointer;float:right;">OK</button>' +
      '<div style="clear:both"></div></div>';
    document.body.appendChild(overlay);
    // Closes ONLY when OK is clicked (clicking outside does nothing)
    overlay.querySelector("#evanaOk").addEventListener("click", function () {
      overlay.remove();
    });
  }

  // Runs alongside your existing add-to-cart code (does not replace it)
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".add-button, .add-to-cart, [data-add-to-cart]");
    if (btn && !alreadySeen()) {
      markSeen();
      showPriceNote();
    }
  }, true);

  // ---------- 2) "Discover collection" -> collection.html ----------
  // Matches a link/button by its text OR its aria-label (your hero picture link
  // has aria-label="Discover New collection" and no text).
  document.addEventListener("click", function (e) {
    var el = e.target.closest("a, button");
    if (!el) return;
    var label = ((el.getAttribute("aria-label") || "") + " " + (el.textContent || "")).toLowerCase();
    if (label.indexOf("discover") !== -1 && label.indexOf("collection") !== -1) {
      e.preventDefault();
      window.location.href = "collection.html";
    }
  }, true);
})();
