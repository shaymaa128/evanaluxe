/* EVANA LUXE — page numbers (15 items per page) instead of a "Load more" button.
   Usage: EvanaPager.mount(gridElement, arrayOfItems, (item) => cardElement) */
(function () {
    "use strict";
    const PAGE_SIZE = 15;

    function pageList(current, total) {
        // 1 … 4 5 6 … 20 (never more than ~7 buttons)
        const set = new Set([1, total, current, current - 1, current + 1]);
        const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
        const out = [];
        nums.forEach((n, i) => {
            if (i > 0 && n - nums[i - 1] > 1) out.push("…");
            out.push(n);
        });
        return out;
    }

    function mount(grid, items, buildCard, options) {
        const size = (options && options.pageSize) || PAGE_SIZE;
        const total = Math.max(1, Math.ceil(items.length / size));
        let page = 1;

        const nav = document.createElement("nav");
        nav.className = "pager";
        nav.setAttribute("aria-label", "Pages");
        grid.insertAdjacentElement("afterend", nav);

        function draw(scroll) {
            const start = (page - 1) * size;
            grid.replaceChildren(...items.slice(start, start + size).map(buildCard));

            nav.replaceChildren();
            nav.hidden = total <= 1;
            if (total > 1) {
                const mk = (label, target, cls, disabled, aria) => {
                    const b = document.createElement("button");
                    b.type = "button";
                    b.className = "pager-btn" + (cls ? " " + cls : "");
                    b.textContent = label;
                    if (aria) b.setAttribute("aria-label", aria);
                    b.disabled = !!disabled;
                    if (!disabled) b.addEventListener("click", () => go(target));
                    return b;
                };
                nav.append(mk("‹ Prev", page - 1, "", page === 1, "Previous page"));
                pageList(page, total).forEach((n) => {
                    if (n === "…") {
                        const gap = document.createElement("span");
                        gap.className = "pager-gap";
                        gap.textContent = "…";
                        nav.append(gap);
                    } else {
                        const b = mk(String(n), n, n === page ? "is-current" : "", false, "Page " + n);
                        if (n === page) b.setAttribute("aria-current", "page");
                        nav.append(b);
                    }
                });
                nav.append(mk("Next ›", page + 1, "", page === total, "Next page"));
                const info = document.createElement("p");
                info.className = "pager-info";
                info.textContent = "Showing " + (start + 1) + "–" + Math.min(start + size, items.length) +
                    " of " + items.length + " products";
                nav.append(info);
            }
            if (scroll) {
                grid.style.scrollMarginTop = "100px";
                grid.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
        function go(n) {
            page = Math.min(total, Math.max(1, n));
            draw(true);
        }
        draw(false);
    }

    window.EvanaPager = { mount, PAGE_SIZE };
})();
