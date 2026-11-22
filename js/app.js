"use strict";

(() => {
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

  console.log("P09 JavaScript aktif");
  console.table(produkUmkm);

  const formatRupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  function statusStok(stok) {
    if (stok === 0) {
      return { label: "Habis", className: "empty" };
    }

    if (stok <= 5) {
      return { label: "Stok terbatas", className: "warning" };
    }

    return { label: "Tersedia", className: "" };
  }

  function labelKategori(kategori) {
    switch (kategori) {
      case "Kopi":
        return "Produk kopi pilihan";
      case "Bundling":
        return "Paket hemat";
      default:
        return "Produk UMKM";
    }
  }

  function renderProduk() {
    const grid = document.querySelector("#produk-dinamis");
    const ringkasan = document.querySelector("#produk-ringkasan");

    if (!grid || !ringkasan) {
      return;
    }

    let jumlahTersedia = 0;
    let markup = "";

    for (const produk of produkUmkm) {
      if (produk.stok > 0) {
        jumlahTersedia += 1;
      }

      const hargaFinal =
        produk.diskonPersen > 0
          ? produk.harga - (produk.harga * produk.diskonPersen) / 100
          : produk.harga;
      const status = statusStok(produk.stok);
      const labelAksi = produk.stok > 0 ? "Siap dipesan" : "Hubungi admin";
      const badgeUnggulan = produk.unggulan
        ? '<span class="featured-badge">Produk unggulan</span>'
        : "";
      const kelasStok = status.className
        ? `stock-badge ${status.className}`
        : "stock-badge";
      const hargaMarkup =
        produk.diskonPersen > 0
          ? `<span class="price-old">${formatRupiah.format(produk.harga)}</span>
             <span class="price-promo">${formatRupiah.format(hargaFinal)}</span>`
          : `<span class="price-promo">${formatRupiah.format(hargaFinal)}</span>`;

      markup += `
        <article class="js-product-card">
          ${badgeUnggulan}
          <p class="product-category">${labelKategori(produk.kategori)}</p>
          <h3>${produk.nama}</h3>
          <p>${produk.deskripsi}</p>
          <p class="js-product-price">${hargaMarkup}</p>
          <p class="${kelasStok}">${status.label}</p>
          <p class="product-action">${labelAksi}</p>
        </article>
      `;
    }

    grid.innerHTML = markup;
    ringkasan.textContent = `${jumlahTersedia} produk tersedia dari ${produkUmkm.length} data.`;
  }

  document.addEventListener("DOMContentLoaded", renderProduk);
})();
