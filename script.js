/* EVANA LUXE — shared header, navigation, search, cart and checkout for EVERY page. */
(() => {
    "use strict";

    const CART_KEY = "evanaLuxeCart";
    const CUSTOMER_KEY = "evanaLuxeCustomer";
    const ORDERS_KEY = "evanaLuxeOrders";
    const WHATSAPP_NUMBER = "96171102868";
    const DELIVERY_FEE = 4;
    const JSPDF_URL = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

    /* Pages the search looks through when the word is not on the current page.
       Add any new page file name here. */
    const SEARCH_PAGES = [
        "index.html", "showroom.html", "products.html"
    ];

    const money = (value) => new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD"
    }).format(value);

    const $ = (id) => document.getElementById(id);
    const currentPage = () => location.pathname.split("/").pop() || "index.html";

    /* ---------- cart storage ---------- */
    let cart = new Map();
    try {
        cart = new Map(JSON.parse(localStorage.getItem(CART_KEY) || "[]"));
    } catch (error) {
        cart = new Map();
    }

    function saveCart() {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify([...cart.entries()]));
        } catch (error) {
            console.warn("Could not save the cart:", error);
        }
    }

    function cartTotals() {
        const subtotal = [...cart.values()].reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );
        const delivery = cart.size > 0 ? DELIVERY_FEE : 0;
        return { subtotal, delivery, total: subtotal + delivery };
    }

    /* ---------- header + search + cart drawer + checkout form ---------- */
    const NAV_LINKS = [
        { label: "About",    href: "index.html#about" },
        { label: "Home",     href: "index.html" },
        { label: "Products", href: "index.html#shop" },
        { label: "Showroom", href: "showroom.html" }
    ];

    function buildLayout() {
        const page = currentPage();

        if (!document.querySelector(".site-header")) {
            const header = document.createElement("header");
            header.className = "site-header";
            header.innerHTML = `
                
                <nav class="main-navigation" id="mainNavigation" aria-label="Main navigation">
                    ${NAV_LINKS.map((link) => {
                        const current = link.href === page ? ' aria-current="page"' : "";
                        return `<a href="${link.href}"${current}>${link.label}</a>`;
                    }).join("")}
                </nav>
                <div class="header-actions">
                    <button type="button" class="header-icon-button" id="searchToggle" aria-label="Search the website" aria-expanded="false" aria-controls="searchPanel">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>
                    </button>
                    <button type="button" class="header-icon-button header-cart-button" id="headerCartButton" aria-label="Open shopping cart">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 9H6"></path><circle cx="10" cy="20" r="1"></circle><circle cx="18" cy="20" r="1"></circle></svg>
                        <span class="header-cart-count" id="headerCartCount">0</span>
                    </button>
                    <button type="button" class="header-icon-button menu-toggle" id="menuToggle" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mainNavigation">
                        <span></span><span></span><span></span>
                    </button>
                </div>
                <div class="search-panel" id="searchPanel" hidden>
                    <form id="searchForm" role="search">
                        <input type="search" id="searchInput" placeholder="Search any word on the website…" aria-label="Search the website" autocomplete="off">
                        <button type="submit" class="search-go">SEARCH</button>
                        <button type="button" class="search-step" id="searchPrev" aria-label="Previous result">↑</button>
                        <button type="button" class="search-step" id="searchNext" aria-label="Next result">↓</button>
                        <button type="button" class="search-step" id="searchClose" aria-label="Close search">×</button>
                    </form>
                    <p id="searchStatus" role="status"></p>
                </div>`;

            const announcement = document.querySelector(".announcement");
            if (announcement) announcement.after(header);
            else document.body.prepend(header);
        }

        document.body.insertAdjacentHTML("beforeend", `
    <div class="cart-backdrop" id="cartBackdrop" hidden></div>

    <aside class="cart-drawer" id="cartDrawer"
        aria-label="Shopping cart"
        aria-hidden="true" inert>

        <div class="cart-drawer-heading">
            <div>
                <p class="eyebrow">EVANA LUXE</p>
                <h2>Your Shopping Bag</h2>
            </div>
            <button type="button" class="close-cart"
                id="closeCartButton" aria-label="Close cart">×</button>
        </div>

        <div id="cartItems" class="cart-items">
            <p class="empty-cart">Your bag is empty.</p>
        </div>

        <div class="cart-summary">

            <p>
                <span>Subtotal</span>
                <strong id="cartSubtotal">$0.00</strong>
            </p>

            <p>
                <span>Delivery</span>
                <strong id="cartDelivery">$0.00</strong>
            </p>

            <p class="cart-total">
                <span>TOTAL</span>
                <strong id="cartTotal">$0.00</strong>
            </p>

            <button type="button" id="clearCartButton"
                class="clear-cart-button">
                CLEAR BAG ×
            </button>

            <button type="button" id="checkoutButton"
                class="checkout-button">
                CHECKOUT &amp; SEND RECEIPT
            </button>

            <div class="payment-details">
                <strong>Payment method: Whish</strong>
                <p>Send your Whish payment to
                    <a href="https://wa.me/${WHATSAPP_NUMBER}"
                       target="_blank"
                       rel="noopener noreferrer">
                       +961 71 102 868
                    </a>.
                </p>
                <p>After checkout, enter your details so that your order receipt (PDF) is sent to us on WhatsApp.</p>
            </div>

        </div>
    </aside>

    <div class="checkout-modal" id="checkoutModal" hidden>
        <div class="checkout-box" role="dialog" aria-modal="true" aria-labelledby="checkoutTitle">
            <button type="button" class="close-cart checkout-close" id="checkoutClose" aria-label="Close">×</button>
            <p class="eyebrow">EVANA LUXE</p>
            <h2 id="checkoutTitle">Delivery Details</h2>
            <p class="checkout-intro">Please enter your details so we can prepare your order.</p>

            <form id="checkoutForm" novalidate>
                <label for="customerName">Full name</label>
                <input type="text" id="customerName" name="name" autocomplete="name" required>

                <label for="customerAddress">Delivery address</label>
                <input type="text" id="customerAddress" name="address" autocomplete="street-address" required>

                <label for="customerPhone">Phone number</label>
                <input type="tel" id="customerPhone" name="phone" autocomplete="tel" inputmode="tel" required>

                <p class="checkout-error" id="checkoutError" role="alert"></p>

                <button type="submit" class="checkout-button" id="checkoutSubmit">SEND ORDER ON WHATSAPP</button>
                <p class="checkout-note">A PDF receipt with your details and bag is created. On a phone, choose WhatsApp to send it. On a computer the PDF downloads and WhatsApp opens — attach the PDF there.</p>
            </form>
        </div>
    </div>
`);
    }

    /* ---------- menu + drawer open/close ---------- */
    function setMenu(open) {
        const navigation = $("mainNavigation");
        const menuToggle = $("menuToggle");
        if (!navigation || !menuToggle) return;
        navigation.classList.toggle("is-open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    }

    function setCartOpen(open) {
        const drawer = $("cartDrawer");
        const backdrop = $("cartBackdrop");
        if (!drawer || !backdrop) return;
        drawer.classList.toggle("is-open", open);
        drawer.setAttribute("aria-hidden", String(!open));
        drawer.inert = !open;
        backdrop.hidden = !open;
        document.body.classList.toggle("cart-open", open);
        if (open) {
            setMenu(false);
            setSearchOpen(false);
            $("closeCartButton")?.focus();
        }
    }

    /* ---------- render the cart ---------- */
    function renderCart() {
        saveCart();

        const cartItems = $("cartItems");
        const cartSubtotal = $("cartSubtotal");
        if (!cartItems || !cartSubtotal) return;

        cartItems.replaceChildren();

        if (cart.size === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-cart";
            empty.textContent = "Your bag is empty.";
            cartItems.append(empty);
        } else {
            cart.forEach((item, key) => {
                const row = document.createElement("article");
                row.className = "cart-item";

                const thumb = document.createElement("div");
                thumb.className = "cart-item-thumb";
                if (item.image) {
                    const img = document.createElement("img");
                    img.src = item.image;
                    img.alt = item.name;
                    img.addEventListener("error", () => img.remove());
                    thumb.append(img);
                }

                const details = document.createElement("div");
                const name = document.createElement("h3");
                name.textContent = item.name;
                const price = document.createElement("p");
                price.textContent = `${money(item.price)} each`;

                const actions = document.createElement("div");
                actions.className = "cart-item-actions";

                const minus = document.createElement("button");
                minus.type = "button";
                minus.textContent = "−";
                minus.setAttribute("aria-label", `Remove one ${item.name}`);
                minus.addEventListener("click", () => changeQuantity(key, -1));

                const quantity = document.createElement("span");
                quantity.textContent = String(item.quantity);
                quantity.setAttribute("aria-label", "Quantity");

                const plus = document.createElement("button");
                plus.type = "button";
                plus.textContent = "+";
                plus.setAttribute("aria-label", `Add one ${item.name}`);
                plus.addEventListener("click", () => changeQuantity(key, 1));

                actions.append(minus, quantity, plus);
                details.append(name, price, actions);

                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "remove-cart-item";
                remove.textContent = "Remove";
                remove.addEventListener("click", () => {
                    cart.delete(key);
                    renderCart();
                });

                row.append(thumb, details, remove);
                cartItems.append(row);
            });
        }

        const { subtotal, delivery, total } = cartTotals();
        cartSubtotal.textContent = money(subtotal);
        $("cartDelivery").textContent = money(delivery);
        $("cartTotal").textContent = money(total);

        const count = [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
        const badge = $("headerCartCount");
        if (badge) badge.textContent = String(count);
    }

    function changeQuantity(key, amount) {
        const item = cart.get(key);
        if (!item) return;
        item.quantity += amount;
        if (item.quantity <= 0) cart.delete(key);
        renderCart();
    }

    /* ---------- find the product picture for a button ---------- */
    function getProductImage(button) {
        if (button.dataset.image) return button.dataset.image;

        const card = button.closest(".product-card, .saved-product-card, article");
        const img = card?.querySelector("img");
        if (!img) return "";

        const src = img.currentSrc || img.src;

        if (src.startsWith("blob:")) {
            try {
                const max = 160;
                const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
                canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                return canvas.toDataURL("image/jpeg", 0.8);
            } catch (error) {
                return "";
            }
        }
        return img.getAttribute("src") || "";
    }

    /* ---------- add to cart (with the chosen ring/option) ---------- */
    function addToCart(button) {
        const card = button.closest(".product-card, .saved-product-card, article");
        const baseName = button.dataset.name ||
            card?.querySelector("h3")?.textContent.trim();
        const select = card?.querySelector(".option-select");
        const choice = select ? select.value : "";
        const name = choice ? `${baseName} - ${choice}` : baseName;
        const price = Number.parseFloat(button.dataset.price);

        if (!name || !Number.isFinite(price) || price < 0) {
            window.alert("This product has an invalid price. Please check its product details.");
            return;
        }

        const image = getProductImage(button);
        const key = name.toLowerCase();
        const existing = cart.get(key);

        if (existing) {
            existing.quantity += 1;
            if (!existing.image && image) existing.image = image;
        } else {
            cart.set(key, { name, price, quantity: 1, image });
        }
        renderCart();

        const originalText = button.dataset.originalText || button.textContent;
        button.dataset.originalText = originalText;
        button.textContent = "Added to Bag ✓";
        window.setTimeout(() => { button.textContent = originalText; }, 1200);
    }
    window.addToCart = addToCart;

    /* =====================================================
       CHECKOUT: customer details → PDF → WhatsApp
    ===================================================== */
    let jsPdfPromise = null;
    function loadJsPdf() {
        if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(true);
        if (!jsPdfPromise) {
            jsPdfPromise = new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = JSPDF_URL;
                script.onload = () => resolve(Boolean(window.jspdf && window.jspdf.jsPDF));
                script.onerror = () => { jsPdfPromise = null; resolve(false); };
                document.head.append(script);
            });
        }
        return jsPdfPromise;
    }

    function readCustomer() {
        try {
            return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "{}");
        } catch (error) {
            return {};
        }
    }

    function openCheckoutForm() {
        if (cart.size === 0) {
            window.alert("Your shopping bag is empty. Add a product before ordering.");
            return;
        }
        const saved = readCustomer();
        $("customerName").value = saved.name || "";
        $("customerAddress").value = saved.address || "";
        $("customerPhone").value = saved.phone || "";
        $("checkoutError").textContent = "";
        $("checkoutModal").hidden = false;
        loadJsPdf();                       // load the PDF tool now so sending is instant
        $("customerName").focus();
    }

    function closeCheckoutForm() {
        const modal = $("checkoutModal");
        if (modal) modal.hidden = true;
    }

    function buildOrder(customer) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const number = `EL-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-` +
            `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const items = [...cart.values()].map((item) => ({
            name: item.name, price: item.price, quantity: item.quantity
        }));
        return {
            number,
            date: now.toLocaleString("en-GB"),
            customer,
            items,
            ...cartTotals()
        };
    }

    function saveOrder(order) {
        try {
            localStorage.setItem(CUSTOMER_KEY, JSON.stringify(order.customer));
            const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
            orders.push(order);
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(-30)));
        } catch (error) {
            console.warn("Could not save the order:", error);
        }
    }

    function buildMessage(order) {
        const lines = [
            "EVANA LUXE — NEW ORDER",
            `Order no: ${order.number}`,
            `Date: ${order.date}`,
            "",
            "CUSTOMER",
            `Name: ${order.customer.name}`,
            `Address: ${order.customer.address}`,
            `Phone: ${order.customer.phone}`,
            "",
            "ORDER DETAILS"
        ];
        order.items.forEach((item, index) => {
            lines.push(
                `${index + 1}. ${item.name}`,
                `   ${item.quantity} x ${money(item.price)} = ${money(item.price * item.quantity)}`
            );
        });
        lines.push(
            "",
            `SUBTOTAL: ${money(order.subtotal)}`,
            `DELIVERY: ${money(order.delivery)}`,
            `TOTAL: ${money(order.total)}`,
            "",
            "PAYMENT METHOD: Whish application",
            "Whish payment number: +961 71 102 868",
            "Please confirm the order and delivery details."
        );
        return lines.join("\n");
    }

    function createPdf(order) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: "mm", format: "a4" });
        const W = 210, M = 15, BOTTOM = 270;
        let y = 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("EVANA LUXE", M, y);
        doc.setFontSize(12);
        doc.text("ORDER RECEIPT", W - M, y, { align: "right" });
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Order no: ${order.number}`, W - M, y, { align: "right" });
        y += 5;
        doc.text(`Date: ${order.date}`, W - M, y, { align: "right" });
        y += 5;
        doc.setDrawColor(180, 150, 80);
        doc.line(M, y, W - M, y);
        y += 8;

        // customer block
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("CUSTOMER DETAILS", M, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        [["Name", order.customer.name],
         ["Address", order.customer.address],
         ["Phone", order.customer.phone]].forEach(([label, value]) => {
            const wrapped = doc.splitTextToSize(String(value), W - M * 2 - 25);
            doc.setFont("helvetica", "bold");
            doc.text(`${label}:`, M, y);
            doc.setFont("helvetica", "normal");
            doc.text(wrapped, M + 25, y);
            y += wrapped.length * 5 + 1;
        });
        y += 5;

        // table
        const drawTableHeader = () => {
            doc.setFillColor(235, 225, 195);
            doc.rect(M, y - 5, W - M * 2, 8, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.text("#", M + 2, y);
            doc.text("ITEM", M + 10, y);
            doc.text("QTY", 135, y, { align: "right" });
            doc.text("PRICE", 163, y, { align: "right" });
            doc.text("TOTAL", W - M - 2, y, { align: "right" });
            y += 8;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
        };

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("ORDER DETAILS", M, y);
        y += 8;
        drawTableHeader();

        order.items.forEach((item, index) => {
            const nameLines = doc.splitTextToSize(item.name, 95);
            const rowHeight = nameLines.length * 5 + 3;
            if (y + rowHeight > BOTTOM) {
                doc.addPage();
                y = 20;
                drawTableHeader();
            }
            doc.text(String(index + 1), M + 2, y);
            doc.text(nameLines, M + 10, y);
            doc.text(String(item.quantity), 135, y, { align: "right" });
            doc.text(money(item.price), 163, y, { align: "right" });
            doc.text(money(item.price * item.quantity), W - M - 2, y, { align: "right" });
            y += rowHeight;
            doc.setDrawColor(220, 210, 185);
            doc.line(M, y - 3, W - M, y - 3);
        });

        // totals
        if (y + 40 > BOTTOM) { doc.addPage(); y = 20; }
        y += 4;
        const totalRow = (label, value, bold) => {
            doc.setFont("helvetica", bold ? "bold" : "normal");
            doc.setFontSize(bold ? 12 : 10);
            doc.text(label, 140, y, { align: "right" });
            doc.text(value, W - M - 2, y, { align: "right" });
            y += bold ? 8 : 6;
        };
        totalRow("Subtotal:", money(order.subtotal));
        totalRow("Delivery:", money(order.delivery));
        totalRow("TOTAL:", money(order.total), true);

        // payment
        y += 6;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("PAYMENT METHOD: Whish application", M, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.text("Whish payment number: +961 71 102 868", M, y);
        y += 10;
        doc.setFontSize(9);
        doc.text("Thank you for shopping with EVANA LUXE.", M, y);

        return {
            doc,
            blob: doc.output("blob"),
            filename: `EvanaLuxe-${order.number}.pdf`
        };
    }

    function downloadFile(file) {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    async function deliverOrder(order) {
        const message = buildMessage(order);
        let file = null;

        if (window.jspdf && window.jspdf.jsPDF) {
            try {
                const pdf = createPdf(order);
                file = new File([pdf.blob], pdf.filename, { type: "application/pdf" });
            } catch (error) {
                console.error("PDF could not be created:", error);
            }
        }

        // Phones: open the share sheet with the PDF so the customer picks WhatsApp.
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file], text: message, title: "EVANA LUXE order" });
                return "shared";
            } catch (error) {
                if (error && error.name === "AbortError") return "cancelled";
            }
        }

        // Computers: download the PDF and open WhatsApp with the full order text.
        if (file) downloadFile(file);
        window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
            "_blank", "noopener,noreferrer"
        );
        return file ? "downloaded" : "text-only";
    }

    async function submitCheckout(event) {
        event.preventDefault();
        const error = $("checkoutError");
        const name = $("customerName").value.trim();
        const address = $("customerAddress").value.trim();
        const phone = $("customerPhone").value.trim();

        if (name.length < 2) { error.textContent = "Please enter your full name."; return; }
        if (address.length < 5) { error.textContent = "Please enter your delivery address."; return; }
        if (phone.replace(/\D/g, "").length < 7) { error.textContent = "Please enter a valid phone number."; return; }
        if (cart.size === 0) { error.textContent = "Your bag is empty."; return; }

        error.textContent = "";
        const button = $("checkoutSubmit");
        button.disabled = true;

        const order = buildOrder({ name, address, phone });
        saveOrder(order);
        const result = await deliverOrder(order);

        button.disabled = false;
        if (result === "cancelled") return;

        closeCheckoutForm();
        if (result === "downloaded") {
            window.alert("Your PDF receipt was downloaded and WhatsApp is opening.\nPlease attach the PDF in the chat and tap Send.");
        } else if (result === "text-only") {
            window.alert("WhatsApp is opening with your full order. Please tap Send.");
        }
    }

    /* =====================================================
       SEARCH: finds a word on this page, or jumps to the page that has it
    ===================================================== */
    const SKIP_SELECTOR =
        "script,style,noscript,select,option,textarea,input,button,mark,[hidden]," +
        ".site-header,.cart-drawer,.cart-backdrop,.checkout-modal";
    let marks = [];
    let currentMark = -1;

    function clearHighlights() {
        document.querySelectorAll("mark.search-hit").forEach((mark) => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
        marks = [];
        currentMark = -1;
    }

    function highlight(term) {
        clearHighlights();
        const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                const parent = node.parentElement;
                if (!parent || parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);

        nodes.forEach((node) => {
            const text = node.nodeValue;
            pattern.lastIndex = 0;
            if (!pattern.test(text)) return;
            pattern.lastIndex = 0;

            const fragment = document.createDocumentFragment();
            let last = 0;
            let match;
            while ((match = pattern.exec(text))) {
                if (match.index > last) fragment.append(text.slice(last, match.index));
                const mark = document.createElement("mark");
                mark.className = "search-hit";
                mark.textContent = match[0];
                fragment.append(mark);
                marks.push(mark);
                last = match.index + match[0].length;
                if (match[0].length === 0) pattern.lastIndex++;
            }
            if (last < text.length) fragment.append(text.slice(last));
            node.parentNode.replaceChild(fragment, node);
        });
        return marks.length;
    }

    function showMark(index) {
        if (!marks.length) return;
        currentMark = (index + marks.length) % marks.length;
        marks.forEach((mark) => mark.classList.remove("current"));
        const mark = marks[currentMark];
        mark.classList.add("current");
        mark.scrollIntoView({ behavior: "smooth", block: "center" });
        $("searchStatus").textContent = `Result ${currentMark + 1} of ${marks.length} on this page`;
    }

    async function findOnOtherPages(term) {
        const lower = term.toLowerCase();
        const here = currentPage();
        for (const page of SEARCH_PAGES) {
            if (page === here) continue;
            try {
                const response = await fetch(page, { cache: "no-store" });
                if (!response.ok) continue;
                const doc = new DOMParser().parseFromString(await response.text(), "text/html");
                doc.querySelectorAll("script,style,noscript,select,option").forEach((n) => n.remove());
                if ((doc.body.textContent || "").toLowerCase().includes(lower)) return page;
            } catch (error) {
                /* page missing or the site was opened as a plain file: skip it */
            }
        }
        return null;
    }

    function setSearchOpen(open) {
        const panel = $("searchPanel");
        const toggle = $("searchToggle");
        if (!panel || !toggle) return;
        panel.hidden = !open;
        toggle.setAttribute("aria-expanded", String(open));
        if (open) {
            setMenu(false);
            $("searchInput").focus();
            $("searchInput").select();
        } else {
            clearHighlights();
            $("searchStatus").textContent = "";
        }
    }

    function searchHere(term) {
        const count = highlight(term);
        if (count > 0) showMark(0);
        return count;
    }

    async function runSearch(term) {
        const status = $("searchStatus");
        term = term.trim();
        if (!term) {
            status.textContent = "Type a word to search.";
            return;
        }
        status.textContent = "Searching…";

        if (searchHere(term) > 0) return;

        const page = await findOnOtherPages(term);
        if (page) {
            status.textContent = `Found on ${page}. Opening…`;
            window.location.href = `${page}?find=${encodeURIComponent(term)}`;
        } else {
            status.textContent = `No results for “${term}”.`;
        }
    }

    function applySearchFromUrl() {
        const term = new URLSearchParams(location.search).get("find");
        if (!term) return;
        setSearchOpen(true);
        $("searchInput").value = term;
        // products added from the admin page appear a moment after the page loads
        const attempt = (tries) => {
            if (searchHere(term) > 0) return;
            if (tries > 0) window.setTimeout(() => attempt(tries - 1), 600);
            else $("searchStatus").textContent = `No results for “${term}” on this page.`;
        };
        attempt(3);
    }
    /* =====================================================
       PHOTO ZOOM: small magnifier icon; the picture zooms on hover
    ===================================================== */
    const MAGNIFIER_SVG =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle>' +
        '<path d="M20 20l-3.5-3.5"></path><path d="M11 8v6M8 11h6"></path></svg>';

    function enhanceZoom(img) {
        if (img.dataset.zoomReady) return;
        img.dataset.zoomReady = "1";

        let frame = img.parentElement;
        if (!frame.classList.contains("product-image")) {
            frame = document.createElement("div");
            frame.className = "zoom-frame";
            img.replaceWith(frame);
            frame.append(img);
        }
        frame.classList.add("zoomable");

        const icon = document.createElement("button");
        icon.type = "button";
        icon.className = "zoom-icon";
        icon.setAttribute("aria-label", "Zoom picture");
        icon.innerHTML = MAGNIFIER_SVG;
        frame.append(icon);

        const setOrigin = (event) => {
            const box = frame.getBoundingClientRect();
            const x = ((event.clientX - box.left) / box.width) * 100;
            const y = ((event.clientY - box.top) / box.height) * 100;
            img.style.transformOrigin = `${x}% ${y}%`;
        };

        // Mouse: zoom while the pointer is over the picture and follow it
        frame.addEventListener("pointerenter", (event) => {
            if (event.pointerType !== "mouse") return;
            setOrigin(event);
            frame.classList.add("is-zoomed");
        });
        frame.addEventListener("pointermove", (event) => {
            if (event.pointerType === "mouse" && frame.classList.contains("is-zoomed")) {
                setOrigin(event);
            }
        });
        frame.addEventListener("pointerleave", () => {
            frame.classList.remove("is-zoomed");
            img.style.transformOrigin = "";
        });

        // Touch screens: tap the magnifier to zoom in and out
        icon.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (event.pointerType === "mouse") return;
            const zoomed = frame.classList.toggle("is-zoomed");
            if (!zoomed) img.style.transformOrigin = "";
        });
    }

    function initZoom() {
        const selector = ".product-image > img, .saved-product-card > img";
        const scan = (root) => root.querySelectorAll(selector).forEach(enhanceZoom);
        scan(document);

        // Products added from the manager appear after the page loads
        new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType !== 1) return;
                    if (node.matches(selector)) enhanceZoom(node);
                    scan(node);
                });
            });
        }).observe(document.body, { childList: true, subtree: true });
    }
    /* ---------- start ---------- */
    function init() {
        buildLayout();

        $("menuToggle")?.addEventListener("click", () => {
            setMenu($("menuToggle").getAttribute("aria-expanded") !== "true");
        });
        $("mainNavigation")?.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => setMenu(false));
        });
        $("closeCartButton")?.addEventListener("click", () => setCartOpen(false));
        $("cartBackdrop")?.addEventListener("click", () => setCartOpen(false));
        $("checkoutButton")?.addEventListener("click", openCheckoutForm);
        $("checkoutClose")?.addEventListener("click", closeCheckoutForm);
        $("checkoutForm")?.addEventListener("submit", submitCheckout);
        $("clearCartButton")?.addEventListener("click", () => {
            if (cart.size === 0) return;
            cart.clear();
            renderCart();
        });

        $("searchToggle")?.addEventListener("click", () => {
            setSearchOpen($("searchPanel").hidden);
        });
        $("searchClose")?.addEventListener("click", () => setSearchOpen(false));
        $("searchPrev")?.addEventListener("click", () => showMark(currentMark - 1));
        $("searchNext")?.addEventListener("click", () => showMark(currentMark + 1));
        $("searchForm")?.addEventListener("submit", (event) => {
            event.preventDefault();
            runSearch($("searchInput").value);
        });

        document.addEventListener("click", (event) => {
            if (event.target.closest("#headerCartButton, #doneButton, [data-open-cart]")) {
                setCartOpen(true);
                return;
            }
            const addButton = event.target.closest(".add-button, .add-to-cart");
            if (addButton) addToCart(addButton);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeCheckoutForm();
                setCartOpen(false);
                setMenu(false);
                setSearchOpen(false);
            }
        });

        window.addEventListener("storage", (event) => {
            if (event.key !== CART_KEY) return;
            try {
                cart = new Map(JSON.parse(event.newValue || "[]"));
            } catch (error) {
                cart = new Map();
            }
            renderCart();
        });

        renderCart();
        initZoom();
        applySearchFromUrl();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
