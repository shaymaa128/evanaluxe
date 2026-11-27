/* EVANA LUXE — saves each order (customer details, items, total and the receipt PDF)
   on YOUR server. It uses the same Firebase cloud as your product manager (cloud.js).
   If the server cannot be reached, script.js sends the order to your WhatsApp instead,
   so an order is never lost. */
import * as cloud from "./cloud.js";

export async function saveOrder(order) {
    if (!cloud.configured) throw new Error("The cloud is not set up.");
    if (typeof cloud.saveOrder !== "function") throw new Error("cloud.js has no saveOrder yet.");
    await cloud.saveOrder(order);
}
