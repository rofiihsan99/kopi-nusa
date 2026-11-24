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

  // 6. DOM Selection untuk katalog dinamis.
  const produkGrid = document.querySelector("#produk-grid");
  const produkStatus = document.querySelector("#produk-status");
  const tombolFilter = document.querySelectorAll("[data-filter]");
  const tombolFilterStok = document.querySelectorAll("[data-stock-filter]");

  // 7. State filter aktif, dipakai sebagai nilai awal render.
  const stateFilter = {
    kategori: "Semua",
    stok: "Semua",
  };

  // 8. Membangun satu kartu produk memakai manipulasi node DOM eksplisit.
  function buatElemenProduk(produk) {
    const card = document.createElement("article");
    card.classList.add("product-card", "js-product-card");

    const judul = document.createElement("h3");
    judul.textContent = produk.nama;
    card.append(judul);

    if (produk.unggulan === true) {
      const badgeUnggulan = document.createElement("span");
      badgeUnggulan.classList.add("featured-badge");
      badgeUnggulan.textContent = "Produk unggulan";
      card.append(badgeUnggulan);
    }

    const catatanKategori = document.createElement("p");
    catatanKategori.classList.add("category-note");
    catatanKategori.textContent = produk.kategori;
    card.append(catatanKategori);

    const harga = document.createElement("p");
    harga.classList.add("price");

    if (produk.diskonPersen > 0) {
      const hargaNormal = document.createElement("span");
      hargaNormal.classList.add("price-old");
      hargaNormal.textContent = formatRupiah(produk.harga);

      const hargaPromo = document.createElement("span");
      hargaPromo.classList.add("price-promo");
      hargaPromo.textContent = formatRupiah(hitungHargaPromo(produk));

      harga.append(hargaNormal, hargaPromo);
    } else {
      const hargaPromo = document.createElement("span");
      hargaPromo.classList.add("price-promo");
      hargaPromo.textContent = formatRupiah(hitungHargaPromo(produk));
      harga.append(hargaPromo);
    }

    card.append(harga);

    const status = statusStok(produk.stok);
    const badgeStok = document.createElement("span");
    badgeStok.classList.add("stock-badge");

    if (status.className) {
      badgeStok.classList.add(status.className);
    }

    badgeStok.textContent = status.label;
    card.append(badgeStok);

    const deskripsi = document.createElement("p");
    deskripsi.classList.add("product-description");
    deskripsi.textContent = produk.deskripsi;
    card.append(deskripsi);

    const tombolSembunyikan = document.createElement("button");
    tombolSembunyikan.type = "button";
    tombolSembunyikan.classList.add("ghost-button");
    tombolSembunyikan.textContent = "Sembunyikan";
    tombolSembunyikan.addEventListener("click", () => {
      card.remove();

      if (produkStatus) {
        produkStatus.textContent =
          "Satu kartu disembunyikan dari tampilan sementara.";
      }
    });

    card.append(tombolSembunyikan);

    return card;
  }

  // 9. Empty state ketika kombinasi filter tidak menemukan produk.
  function buatEmptyState(kategori, stokAktif) {
    const pesan = document.createElement("p");
    pesan.classList.add("empty-state");

    if (stokAktif === "Semua") {
      pesan.textContent = `Belum ada produk yang cocok dengan filter kategori ${kategori}. Silakan pilih kategori lain.`;
    } else {
      pesan.textContent = `Belum ada produk kategori ${kategori} dengan status stok ${stokAktif}. Silakan ubah kombinasi filter.`;
    }

    return pesan;
  }

  // 10. Ringkasan katalog dari P10 tetap diperbarui setiap render.
  function perbaruiRingkasanKatalog() {
    const ringkasan = document.querySelector("#produk-ringkasan");
    const unggulan = document.querySelector("#produk-unggulan");
    const ringkasanKategori = document.querySelector("#ringkasan-kategori");
    const produkTersedia = produkUmkm.filter((produk) => produk.stok > 0);
    const produkUnggulan = produkUmkm.find((produk) => produk.unggulan === true);

    if (ringkasan) {
      ringkasan.textContent = `${produkTersedia.length} produk tersedia dari ${produkUmkm.length} data.`;
    }

    if (unggulan) {
      unggulan.textContent = produkUnggulan
        ? `Produk unggulan: ${produkUnggulan.nama}`
        : "Belum ada produk unggulan.";
    }

    if (ringkasanKategori) {
      ringkasanKategori.textContent = hitungRingkasanKategori(produkUmkm);
    }
  }

  // 11. Render katalog sesuai state filter kategori dan stok.
  function renderProduk(
    kategoriAktif = stateFilter.kategori,
    stokAktif = stateFilter.stok
  ) {
    if (!produkGrid || !produkStatus) return;

    const produkTampil = produkUmkm.filter((produk) => {
      const cocokKategori =
        kategoriAktif === "Semua" || produk.kategori === kategoriAktif;
      const cocokStok =
        stokAktif === "Semua" ||
        statusStok(produk.stok).label === stokAktif;

      return cocokKategori && cocokStok;
    });

    produkGrid.replaceChildren();

    if (produkTampil.length === 0) {
      produkGrid.append(buatEmptyState(kategoriAktif, stokAktif));
      produkStatus.textContent = `Kategori ${kategoriAktif} menampilkan 0 produk dari ${produkUmkm.length} total produk.`;
    } else {
      produkTampil.forEach((produk) => {
        produkGrid.append(buatElemenProduk(produk));
      });

      produkStatus.textContent = `Kategori ${kategoriAktif} menampilkan ${produkTampil.length} produk dari ${produkUmkm.length} total produk.`;
    }

    perbaruiRingkasanKatalog();
  }

  // 12. Event filter kategori.
  tombolFilter.forEach((tombol) => {
    tombol.addEventListener("click", (event) => {
      tombolFilter.forEach((item) => item.classList.remove("is-active"));
      event.currentTarget.classList.add("is-active");

      stateFilter.kategori = event.currentTarget.dataset.filter;
      renderProduk();
    });
  });

  // 13. Event filter status stok (Pengayaan P11-04).
  tombolFilterStok.forEach((tombol) => {
    tombol.addEventListener("click", (event) => {
      tombolFilterStok.forEach((item) => item.classList.remove("is-active"));
      event.currentTarget.classList.add("is-active");

      stateFilter.stok = event.currentTarget.dataset.stockFilter;
      renderProduk();
    });
  });

  // 14. Jalankan render setelah DOM siap.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => renderProduk());
  } else {
    renderProduk();
  }
})();
