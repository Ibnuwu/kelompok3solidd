// === Data Produk ===
const PRODUCTS = [
  { id: "kopi", name: "Kopi", price: 10000, img: "kopi.png" },
  { id: "teh", name: "Teh", price: 8000, img: "teh.png" },
  { id: "gula", name: "Gula", price: 12000, img: "gula.png" },
  { id: "susu", name: "Susu", price: 15000, img: "susu.png" },
  { id: "roti", name: "Roti", price: 7000, img: "roti.png" },
  { id: "mie", name: "Mie Instan", price: 5000, img: "mie.png" },
  { id: "air", name: "Air Mineral", price: 4000, img: "air.png" },
  { id: "telur", name: "Telur", price: 20000, img: "telur.png" },
];

const cart = {};
function formatRp(n) {
  return "Rp" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// === Rendering Produk & Keranjang ===
function renderProducts() {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";
  PRODUCTS.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-thumb"><img src="${p.img}" alt="${p.name}" /></div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">${formatRp(p.price)}</div>
      <button class="add-btn" data-id="${p.id}">Tambah ke Keranjang</button>`;
    grid.appendChild(card);
  });
  grid
    .querySelectorAll(".add-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => addToCart(btn.dataset.id))
    );
}

function renderCart() {
  const list = document.getElementById("cart-list");
  list.innerHTML = "";
  const ids = Object.keys(cart);
  if (ids.length === 0) {
    list.innerHTML = '<p class="empty">Keranjang kosong — tambahkan produk</p>';
  } else {
    ids.forEach((id) => {
      const entry = cart[id];
      const item = document.createElement("div");
      item.className = "cart-item";
      item.innerHTML = `
        <div class="item-info">
          <div class="item-name">${entry.product.name}</div>
          <div class="item-meta">${formatRp(entry.product.price)} x ${
        entry.qty
      } = <strong>${formatRp(entry.product.price * entry.qty)}</strong></div>
        </div>
        <div class="qty-controls">
          <button class="dec" data-id="${id}">-</button>
          <span>${entry.qty}</span>
          <button class="inc" data-id="${id}">+</button>
          <button class="remove" data-id="${id}" title="Hapus">🗑️</button>
        </div>`;
      list.appendChild(item);
    });
    list
      .querySelectorAll(".inc")
      .forEach((b) =>
        b.addEventListener("click", () => changeQty(b.dataset.id, 1))
      );
    list
      .querySelectorAll(".dec")
      .forEach((b) =>
        b.addEventListener("click", () => changeQty(b.dataset.id, -1))
      );
    list
      .querySelectorAll(".remove")
      .forEach((b) =>
        b.addEventListener("click", () => removeItem(b.dataset.id))
      );
  }
  updateTotal();
}

function addToCart(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;
  if (cart[id]) cart[id].qty += 1;
  else cart[id] = { product, qty: 1 };
  renderCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  renderCart();
}

function removeItem(id) {
  delete cart[id];
  renderCart();
}

function clearCart() {
  for (const k of Object.keys(cart)) delete cart[k];
  renderCart();
}

function getTotal() {
  return Object.values(cart).reduce((s, e) => s + e.product.price * e.qty, 0);
}

function updateTotal() {
  document.getElementById("total-display").textContent = formatRp(getTotal());
}

// === Popup RPG Style ===
let typingInterval;

function showPopup(text, type = "ok") {
  const overlay = document.getElementById("popup-overlay");
  const popupText = document.getElementById("popup-text");
  const buttons = document.getElementById("popup-buttons");

  overlay.classList.remove("hidden");
  popupText.textContent = "";
  buttons.innerHTML = "";

  let i = 0;
  clearInterval(typingInterval);
  typingInterval = setInterval(() => {
    popupText.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(typingInterval);
  }, 25);

  if (type === "confirm") {
    createPopupButton("OK", () => {
      overlay.classList.add("hidden");
      clearCart();
    });
    createPopupButton("Cancel", () => overlay.classList.add("hidden"));
  } else {
    createPopupButton("OK", () => overlay.classList.add("hidden"));
  }
}

function createPopupButton(label, onClick) {
  const btn = document.createElement("button");
  btn.classList.add("popup-btn");
  btn.textContent = label;
  btn.onclick = onClick;
  document.getElementById("popup-buttons").appendChild(btn);
}

function closePopup(event) {
  if (event.target.id === "popup-overlay") {
    document.getElementById("popup-overlay").classList.add("hidden");
  }
}

// === Pembayaran ===
function showReceipt() {
  const ids = Object.keys(cart);
  if (ids.length === 0) {
    showPopup("Ehh~ keranjangnya masih kosong nih, senpai~ isi dulu ya~");
    return;
  }
  const body = document.getElementById("receipt-body");
  body.innerHTML = "";
  const now = new Date().toLocaleString("id-ID");
  body.innerHTML += `<div><strong>Kasir Sederhana</strong><br><small>${now}</small></div><hr>`;
  ids.forEach((id) => {
    const e = cart[id];
    body.innerHTML += `<div class="receipt-line"><span>${e.product.name} x${
      e.qty
    }</span><span>${formatRp(e.product.price * e.qty)}</span></div>`;
  });
  body.innerHTML += `<div class="receipt-line" style="margin-top:12px"><strong>Total</strong><strong>${formatRp(
    getTotal()
  )}</strong></div>`;
  document.getElementById("receipt-modal").setAttribute("aria-hidden", "false");
}

function closeReceipt() {
  document.getElementById("receipt-modal").setAttribute("aria-hidden", "true");
  clearCart();
  showPopup("💕 Arigatou nii~ oniichan~!");
}

// === Init ===
function init() {
  renderProducts();
  renderCart();
  document
    .getElementById("clear-btn")
    .addEventListener("click", () =>
      showPopup("Ehh~ beneran mau dikosongkan semuanya?", "confirm")
    );
  document.getElementById("pay-btn").addEventListener("click", showReceipt);
  document.getElementById("close-btn").addEventListener("click", closeReceipt);
  document
    .getElementById("close-receipt")
    .addEventListener("click", closeReceipt);
  document
    .getElementById("print-btn")
    .addEventListener("click", () => window.print());
}

window.addEventListener("DOMContentLoaded", init);
