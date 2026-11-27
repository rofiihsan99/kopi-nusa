"use strict";

const DATA_URL = "data/products.json";

const catalogStatus = document.querySelector("#catalog-status");
const produkGrid = document.querySelector("#produk-dinamis");
const produkRingkasan = document.querySelector("#produk-ringkasan");
const produkUnggulan = document.querySelector("#produk-unggulan");
const ringkasanKategori = document.querySelector("#ringkasan-kategori");
const tombolFilter = document.querySelectorAll("[data-filter]");
const tombolFilterStok = document.querySelectorAll("[data-stock-filter]");
const tombolReset = document.querySelector("#reset-filter");

const stateFilter = {
  kategori: "Semua",
  stok: "Semua",
};

let products = [];
let katalogSiap = false;
let pesanError = "";

const formatterRupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatRupiah(nilai) {
  return formatterRupiah.format(Number(nilai) || 0);
}

function setStatus(state, message) {
  if (!catalogStatus) return;

  catalogStatus.classList.remove("loading", "success", "empty", "error");
  catalogStatus.classList.add("catalog-status");

  if (state) {
    catalogStatus.classList.add(state);
    catalogStatus.dataset.state = state;
  }

  catalogStatus.textContent = message;
}

function statusStok(stok) {
  const jumlah = Number(stok) || 0;

  if (jumlah <= 0) {
    return { label: "Habis", className: "empty" };
  }

  if (jumlah <= 5) {
    return { label: "Stok terbatas", className: "warning" };
  }

  return { label: "Tersedia", className: "" };
}

function perbaruiProdukUnggulan() {
  if (!produkUnggulan) return;

  if (pesanError) {
    produkUnggulan.textContent =
      "Produk unggulan belum tersedia karena data gagal dimuat.";
    return;
  }

  const unggulan = products.filter((produk) => produk.featured === true);

  if (products.length === 0) {
    produkUnggulan.textContent = "Belum ada produk unggulan.";
    return;
  }

  produkUnggulan.textContent = unggulan.length
    ? `Produk unggulan: ${unggulan.map((produk) => produk.name).join(", ")}`
    : "Belum ada produk unggulan.";
}

function perbaruiRingkasan(items) {
  const daftar = Array.isArray(items) ? items : [];

  if (pesanError) {
    if (produkRingkasan) {
      produkRingkasan.textContent = "Data produk gagal dimuat dari JSON.";
    }

    if (ringkasanKategori) {
      ringkasanKategori.textContent = "Ringkasan kategori tidak tersedia.";
    }

    return;
  }

  if (!katalogSiap) {
    if (produkRingkasan) {
      produkRingkasan.textContent = "Data produk sedang dimuat dari JSON...";
    }

    if (ringkasanKategori) {
      ringkasanKategori.textContent =
        "Ringkasan kategori akan dimuat dari data JSON.";
    }

    return;
  }

  const total = products.length;
  const tersedia = products.filter((produk) => Number(produk.stock) > 0).length;

  if (total === 0) {
    if (produkRingkasan) {
      produkRingkasan.textContent = "Belum ada produk pada data JSON.";
    }

    if (ringkasanKategori) {
      ringkasanKategori.textContent = "Belum ada kategori untuk diringkas.";
    }

    return;
  }

  if (produkRingkasan) {
    produkRingkasan.textContent =
      daftar.length === total
        ? `${tersedia} produk tersedia dari ${total} data JSON.`
        : `Menampilkan ${daftar.length} dari ${total} produk · ${tersedia} produk tersedia.`;
  }

  if (ringkasanKategori) {
    const hitungKategori = new Map();

    products.forEach((produk) => {
      const kategori = produk.category || "Tanpa kategori";
      hitungKategori.set(kategori, (hitungKategori.get(kategori) || 0) + 1);
    });

    ringkasanKategori.textContent = [...hitungKategori.entries()]
      .map(([kategori, jumlah]) => `${kategori}: ${jumlah} produk`)
      .join(" · ");
  }
}

function buatKartuProduk(produk) {
  const card = document.createElement("article");
  card.classList.add("product-card", "js-product-card");
  card.dataset.productId = produk.id || "";

  if (produk.featured === true) {
    const badgeUnggulan = document.createElement("span");
    badgeUnggulan.classList.add("featured-badge");
    badgeUnggulan.textContent = "Produk unggulan";
    card.append(badgeUnggulan);
  }

  const namaProduk = produk.name || "Produk tanpa nama";

  const judul = document.createElement("h3");
  judul.textContent = namaProduk;
  card.append(judul);

  const catatanKategori = document.createElement("p");
  catatanKategori.classList.add("category-note");
  catatanKategori.textContent =
    produk.categoryNote || produk.category || "Tanpa kategori";
  card.append(catatanKategori);

  const harga = document.createElement("p");
  harga.classList.add("price");

  const hargaNormal = Number(produk.price) || 0;
  const hargaPromo = Number(produk.promoPrice);
  const adaPromo =
    Number.isFinite(hargaPromo) && hargaPromo > 0 && hargaPromo < hargaNormal;

  if (adaPromo) {
    const hargaCoret = document.createElement("span");
    hargaCoret.classList.add("price-old");
    hargaCoret.textContent = formatRupiah(hargaNormal);

    const hargaDiskon = document.createElement("span");
    hargaDiskon.classList.add("price-promo");
    hargaDiskon.textContent = formatRupiah(hargaPromo);

    harga.append(hargaCoret, hargaDiskon);
  } else {
    const hargaSatuan = document.createElement("span");
    hargaSatuan.classList.add("price-promo");
    hargaSatuan.textContent = formatRupiah(hargaNormal);
    harga.append(hargaSatuan);
  }

  card.append(harga);

  const stok = statusStok(produk.stock);
  const badgeStok = document.createElement("span");
  badgeStok.classList.add("stock-badge");

  if (stok.className) {
    badgeStok.classList.add(stok.className);
  }

  badgeStok.textContent = stok.label;
  card.append(badgeStok);

  const deskripsi = document.createElement("p");
  deskripsi.classList.add("product-description");
  deskripsi.textContent = produk.description || "Deskripsi produk belum tersedia.";
  card.append(deskripsi);

  const tautanKontak = document.createElement("a");
  tautanKontak.classList.add("product-action");
  tautanKontak.href = "kontak.html";
  tautanKontak.textContent = "Tanya produk";
  tautanKontak.setAttribute("aria-label", `Tanya produk ${namaProduk}`);
  card.append(tautanKontak);

  return card;
}

function renderProducts(items) {
  if (!produkGrid) return;

  const daftar = Array.isArray(items) ? items : [];
  produkGrid.replaceChildren();

  if (daftar.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.classList.add("empty-state");

    if (pesanError) {
      emptyState.textContent = pesanError;
    } else if (!katalogSiap) {
      emptyState.textContent = "Katalog produk sedang dimuat...";
    } else if (products.length === 0) {
      emptyState.textContent = "Belum ada produk pada data JSON.";
    } else {
      emptyState.textContent = `Tidak ada produk yang cocok dengan filter kategori ${stateFilter.kategori} dan status stok ${stateFilter.stok}. Silakan ubah filter.`;
    }

    produkGrid.append(emptyState);
  } else {
    const fragment = document.createDocumentFragment();

    daftar.forEach((produk) => {
      fragment.append(buatKartuProduk(produk));
    });

    produkGrid.append(fragment);
  }

  perbaruiRingkasan(daftar);
}

function produkSesuaiFilter() {
  return products.filter((produk) => {
    const cocokKategori =
      stateFilter.kategori === "Semua" ||
      produk.category === stateFilter.kategori;
    const cocokStok =
      stateFilter.stok === "Semua" ||
      statusStok(produk.stock).label === stateFilter.stok;

    return cocokKategori && cocokStok;
  });
}

async function loadProducts() {
  katalogSiap = false;
  pesanError = "";
  setStatus("loading", "Memuat data produk...");
  perbaruiRingkasan([]);

  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Format data JSON tidak valid.");
    }

    products = data;
    katalogSiap = true;
    perbaruiProdukUnggulan();
    renderProducts(products);

    if (products.length === 0) {
      setStatus("empty", "Belum ada produk pada data JSON.");
    } else {
      setStatus(
        "success",
        `${products.length} produk berhasil dimuat dari JSON.`
      );
    }
  } catch (error) {
    products = [];
    katalogSiap = true;
    pesanError =
      "Katalog produk belum dapat ditampilkan. Pastikan file data/products.json tersedia dan halaman dijalankan melalui server lokal.";

    setStatus("error", `Gagal memuat produk: ${error.message}`);
    renderProducts([]);
    perbaruiProdukUnggulan();
  }
}

tombolFilter.forEach((tombol) => {
  tombol.addEventListener("click", () => {
    tombolFilter.forEach((item) => item.classList.remove("is-active"));
    tombol.classList.add("is-active");

    stateFilter.kategori = tombol.dataset.filter || "Semua";
    renderProducts(produkSesuaiFilter());
  });
});

tombolFilterStok.forEach((tombol) => {
  tombol.addEventListener("click", () => {
    tombolFilterStok.forEach((item) => item.classList.remove("is-active"));
    tombol.classList.add("is-active");

    stateFilter.stok = tombol.dataset.stockFilter || "Semua";
    renderProducts(produkSesuaiFilter());
  });
});

if (tombolReset) {
  tombolReset.addEventListener("click", () => {
    stateFilter.kategori = "Semua";
    stateFilter.stok = "Semua";

    tombolFilter.forEach((item) => {
      item.classList.toggle("is-active", item.dataset.filter === "Semua");
    });

    tombolFilterStok.forEach((item) => {
      item.classList.toggle(
        "is-active",
        item.dataset.stockFilter === "Semua"
      );
    });

    renderProducts(produkSesuaiFilter());
  });
}

loadProducts();
