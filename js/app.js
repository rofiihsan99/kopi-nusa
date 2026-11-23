"use strict";

(() => {
  // 1. Sumber data lokal Kopi Nusa.
  const produkUmkm = [
    {
      nama: "Americano Kopi Nusa",
      kategori: "Kopi",
      harga: 18000,
      stok: 15,
      unggulan: true,
      diskonPersen: 0,
      deskripsi:
        "Espresso pilihan dengan air mineral segar, karakter bersih dan aromatik.",
    },
    {
      nama: "Kopi Duren Spesial",
      kategori: "Kopi",
      harga: 25000,
      stok: 4,
      unggulan: true,
      diskonPersen: 10,
      deskripsi:
        "Perpaduan espresso robusta dan daging durian asli yang legit.",
    },
    {
      nama: "Kopi Matcha Nusantara",
      kategori: "Kopi",
      harga: 23000,
      stok: 8,
      unggulan: false,
      diskonPersen: 0,
      deskripsi:
        "Matcha premium berpadu espresso lembut dalam sajian dingin 250 ml.",
    },
    {
      nama: "Paket Seduh Rumahan",
      kategori: "Bundling",
      harga: 85000,
      stok: 0,
      unggulan: false,
      diskonPersen: 0,
      deskripsi:
        "Biji kopi pilihan 250 gram lengkap dengan V60 dripper dan kertas filter.",
    },
  ];

  // 2. Pure function teks ke rupiah
  function formatRupiah(nilai) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nilai);
  }

  // 3. Pure function hitung harga setelah diskon
  function hitungHargaPromo(produk) {
    if (produk.diskonPersen > 0) {
      return produk.harga - (produk.harga * produk.diskonPersen) / 100;
    }

    return produk.harga;
  }

  // 4. Pure function, jml stok jd label & rp
  function statusStok(stok) {
    if (stok <= 0) {
      return { label: "Habis", className: "empty" };
    }

    if (stok <= 5) {
      return { label: "Stok terbatas", className: "warning" };
    }

    return { label: "Tersedia", className: "" };
  }

  // 5. Challengejumlah produk per kategori dg forEach.
  function hitungRingkasanKategori(daftarProduk) {
    let jumlahKopi = 0;
    let jumlahBundling = 0;

    daftarProduk.forEach((produk) => {
      if (produk.kategori === "Kopi") {
        jumlahKopi += 1;
      }

      if (produk.kategori === "Bundling") {
        jumlahBundling += 1;
      }
    });

    return `Kopi: ${jumlahKopi} produk, Bundling: ${jumlahBundling} produk`;
  }

  // 6. Pure function: menyusun satu kartu produk sbg string HTML.
  function buatKartuProduk(produk) {
    const status = statusStok(produk.stok);
    const hargaFinal = hitungHargaPromo(produk);
    const badgeUnggulan =
      produk.unggulan === true
        ? '<span class="featured-badge">Produk unggulan</span>'
        : "";
    const hargaMarkup =
      produk.diskonPersen > 0
        ? `<span class="price-old">${formatRupiah(produk.harga)}</span>
           <span class="price-promo">${formatRupiah(hargaFinal)}</span>`
        : `<span class="price-promo">${formatRupiah(hargaFinal)}</span>`;

    return `
      <article class="js-product-card">
        ${badgeUnggulan}
        <p class="product-category">${produk.kategori}</p>
        <h3>${produk.nama}</h3>
        <p>${produk.deskripsi}</p>
        <p class="js-product-price">${hargaMarkup}</p>
        <span class="stock-badge ${status.className}">${status.label}</span>
      </article>
    `;
  }

  // 7. Render katalog dinamis dg DOM agar aman di semua halaman.
  function renderProduk() {
    const grid = document.querySelector("#produk-dinamis");
    const ringkasan = document.querySelector("#produk-ringkasan");
    const unggulan = document.querySelector("#produk-unggulan");
    const ringkasanKategori = document.querySelector("#ringkasan-kategori");

    if (!grid || !ringkasan || !unggulan) {
      // Halaman ini tidak memiliki target render produk, hentikan tanpa warning.
      return;
    }

    produkUmkm.forEach((produk) => {
      console.log("Debug produk:", produk.nama, "stok:", produk.stok);
    });
    console.table(produkUmkm);

    const produkTersedia = produkUmkm.filter((produk) => produk.stok > 0);
    const produkUnggulan = produkUmkm.find((produk) => produk.unggulan === true);
    const markupProduk = produkTersedia.map(buatKartuProduk).join("");

    grid.innerHTML = markupProduk;
    ringkasan.textContent = `${produkTersedia.length} produk tersedia dari ${produkUmkm.length} data.`;
    unggulan.textContent = produkUnggulan
      ? `Produk unggulan: ${produkUnggulan.nama}`
      : "Belum ada produk unggulan.";

    if (ringkasanKategori) {
      ringkasanKategori.textContent = hitungRingkasanKategori(produkUmkm);
    }
  }

  document.addEventListener("DOMContentLoaded", renderProduk);
})();
