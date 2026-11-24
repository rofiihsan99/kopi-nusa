const formatRupiah = (nilai) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(nilai);

const kotakNotifikasi = document.querySelector("#notifikasi");
let timerNotifikasi;

function tampilkanNotifikasi(pesan) {
  if (!kotakNotifikasi) return;

  kotakNotifikasi.textContent = pesan;
  kotakNotifikasi.classList.add("show");

  clearTimeout(timerNotifikasi);
  timerNotifikasi = setTimeout(() => {
    kotakNotifikasi.classList.remove("show");
  }, 4000);
}

const ringkasanPesanan = document.querySelector("#ringkasanPesanan");
const daftarPesanan = document.querySelector("#daftarPesanan");
const subtotalPesanan = document.querySelector("#subtotalPesanan");
const totalPesanan = document.querySelector("#totalPesanan");
const infoDiskon = document.querySelector("#infoDiskon");
const tombolKosongkan = document.querySelector("#kosongkanPesanan");
const productList = document.querySelector(".product-list");

const pesanan = new Map();
const DISKON_PROMO = 0.2;
const KODE_PROMO = "KOPINUSA20";
const NOMOR_WHATSAPP = "6281234567890";
let promoAktif = false;

function hitungRingkasan() {
  let subtotal = 0;
  const baris = [];

  pesanan.forEach(({ harga, jumlah }, nama) => {
    const totalItem = harga * jumlah;
    subtotal += totalItem;
    baris.push({ nama, jumlah, totalItem });
  });

  const diskon = promoAktif ? Math.round(subtotal * DISKON_PROMO) : 0;

  return { baris, subtotal, diskon, total: subtotal - diskon };
}

function renderRingkasan() {
  if (!ringkasanPesanan) return;

  daftarPesanan.innerHTML = "";

  if (pesanan.size === 0) {
    ringkasanPesanan.hidden = true;
    infoDiskon.hidden = true;
    return;
  }

  const { baris, subtotal, diskon } = hitungRingkasan();

  baris.forEach(({ nama, jumlah, totalItem }) => {
    const item = document.createElement("li");

    const namaItem = document.createElement("span");
    namaItem.className = "item-name";
    namaItem.textContent = `${jumlah}x ${nama}`;

    const hargaItem = document.createElement("span");
    hargaItem.textContent = formatRupiah(totalItem);

    const tombolHapus = document.createElement("button");
    tombolHapus.type = "button";
    tombolHapus.className = "remove-button";
    tombolHapus.textContent = "Hapus";
    tombolHapus.dataset.nama = nama;
    tombolHapus.setAttribute("aria-label", `Hapus ${nama} dari pesanan`);

    item.append(namaItem, hargaItem, tombolHapus);
    daftarPesanan.append(item);
  });

  subtotalPesanan.textContent = formatRupiah(subtotal);
  totalPesanan.textContent = formatRupiah(subtotal - diskon);

  infoDiskon.hidden = !promoAktif;
  infoDiskon.textContent = promoAktif
    ? `Diskon promo 20%: -${formatRupiah(diskon)}`
    : "";

  ringkasanPesanan.hidden = false;
}

function tambahPesanan(card) {
  const nama = card.querySelector("h3").textContent.trim();
  const harga = Number(card.querySelector(".price").textContent.replace(/\D/g, ""));

  const item = pesanan.get(nama) ?? { harga, jumlah: 0 };
  item.jumlah += 1;
  pesanan.set(nama, item);

  renderRingkasan();
  tampilkanNotifikasi(`${nama} ditambahkan ke pesanan.`);
}

// Klik pada kartu menu atau tombol "Tambah ke Pesanan"
if (productList) {
  productList.addEventListener("click", (event) => {
    const card = event.target.closest(".product-card");
    if (card) tambahPesanan(card);
  });
}

// Hapus satu item dari ringkasan
if (daftarPesanan) {
  daftarPesanan.addEventListener("click", (event) => {
    const tombolHapus = event.target.closest(".remove-button");
    if (!tombolHapus) return;

    const nama = tombolHapus.dataset.nama;
    pesanan.delete(nama);
    renderRingkasan();
    tampilkanNotifikasi(`${nama} dihapus dari pesanan.`);
  });
}

// Kosongkan seluruh pesanan
if (tombolKosongkan) {
  tombolKosongkan.addEventListener("click", () => {
    pesanan.clear();
    renderRingkasan();
    tampilkanNotifikasi("Pesanan dikosongkan.");
  });
}

function susunPesanWhatsApp() {
  const { baris, subtotal, diskon, total } = hitungRingkasan();

  const rincian = baris
    .map(
      ({ nama, jumlah, totalItem }, indeks) =>
        `${indeks + 1}. ${jumlah}x ${nama} - ${formatRupiah(totalItem)}`
    )
    .join("\n");

  const barisPromo = promoAktif
    ? `Kode Promo: ${KODE_PROMO} (diskon 20%)\nDiskon: -${formatRupiah(diskon)}`
    : "Kode Promo: -";

  return [
    "Halo Kopi Nusa, saya ingin memesan:",
    "",
    rincian,
    "",
    `Subtotal: ${formatRupiah(subtotal)}`,
    barisPromo,
    `Total: ${formatRupiah(total)}`,
    "",
    "Terima kasih.",
  ].join("\n");
}

const tombolWhatsApp = document.querySelector("#pesanWhatsApp");

if (tombolWhatsApp) {
  tombolWhatsApp.addEventListener("click", () => {
    if (pesanan.size === 0) {
      tampilkanNotifikasi("Pesanan masih kosong. Tambahkan menu terlebih dahulu.");
      return;
    }

    const teks = encodeURIComponent(susunPesanWhatsApp());
    const url = `https://wa.me/${NOMOR_WHATSAPP}?text=${teks}`;

    window.open(url, "_blank", "noopener,noreferrer");
    tampilkanNotifikasi("Membuka WhatsApp dengan rincian pesanan.");
  });
}

const promoButton = document.querySelector("#promoButton");

if (promoButton) {
  promoButton.addEventListener("click", () => {
    promoAktif = true;
    promoButton.textContent = `Kode Promo: ${KODE_PROMO} (Diskon 20% semua menu!)`;

    renderRingkasan();
    tampilkanNotifikasi(`Promo aktif: ${KODE_PROMO} - diskon 20% untuk semua menu.`);
    console.log("Promo spesial Kopi Nusa berhasil ditampilkan.");
  });
}

const tombolTema = document.querySelector("#toggle-tema");
const KUNCI_TEMA = "temaKopiNusa";

function perbaruiTombolTema() {
  if (!tombolTema) return;

  const gelap = document.body.classList.contains("dark-mode");

  // Ikon saja: matahari saat mode gelap aktif, bulan saat mode terang.
  tombolTema.textContent = gelap ? "☀️" : "🌙";
  tombolTema.setAttribute(
    "aria-label",
    gelap ? "Aktifkan mode terang" : "Aktifkan mode gelap"
  );
}

try {
  if (localStorage.getItem(KUNCI_TEMA) === "gelap") {
    document.body.classList.add("dark-mode");
  }
} catch (error) {
  console.log("Preferensi tema tidak dapat dibaca.");
}

perbaruiTombolTema();

if (tombolTema) {
  tombolTema.addEventListener("click", () => {
    // Pasang atau lepas class dark-mode
    const gelap = document.body.classList.toggle("dark-mode");
    perbaruiTombolTema();

    try {
      localStorage.setItem(KUNCI_TEMA, gelap ? "gelap" : "terang");
    } catch (error) {
      console.log("Preferensi tema tidak dapat disimpan.");
    }

    console.log(gelap ? "Mode Gelap diaktifkan." : "Mode Terang diaktifkan.");
  });
}

// Jam real-time Indonesia dengan pilihan zona waktu WIB, WITA, atau WIT.
const clockText = document.querySelector("#live-clock-text");
const timezoneSelect = document.querySelector("#timezone-select");
const LABEL_ZONA_WAKTU = {
  "Asia/Jakarta": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
};

function perbaruiWaktuRealtime() {
  if (!clockText || !timezoneSelect) return;

  const zonaWaktu = timezoneSelect.value || "Asia/Jakarta";
  const opsiAktif = timezoneSelect.selectedOptions[0];
  const labelZona =
    (opsiAktif && opsiAktif.dataset.label) ||
    LABEL_ZONA_WAKTU[zonaWaktu] ||
    "WIB";
  const sekarang = new Date();

  const formatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: zonaWaktu,
  });

  const bagian = formatter.formatToParts(sekarang);
  const ambilBagian = (tipe) => {
    const bagianDicari = bagian.find((item) => item.type === tipe);
    return bagianDicari ? bagianDicari.value : "";
  };

  const jamAwal = ambilBagian("hour");
  const jam = jamAwal === "24" ? "00" : jamAwal;
  const tanggal = `${ambilBagian("weekday")}, ${ambilBagian("day")} ${ambilBagian("month")} ${ambilBagian("year")}`;
  const waktu = `${jam}:${ambilBagian("minute")}:${ambilBagian("second")}`;

  clockText.textContent = `${tanggal} • ${waktu} ${labelZona}`;
  clockText.setAttribute("datetime", sekarang.toISOString());
}

function pilihZonaWaktuAwal() {
  if (!timezoneSelect) return;

  try {
    const zonaPerangkat = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (LABEL_ZONA_WAKTU[zonaPerangkat]) {
      timezoneSelect.value = zonaPerangkat;
    }
  } catch (error) {
    // Biarkan pilihan default WIB jika zona perangkat tidak terbaca.
  }
}

function mulaiJamRealtime() {
  pilihZonaWaktuAwal();
  perbaruiWaktuRealtime();
  setInterval(perbaruiWaktuRealtime, 1000);
}

if (clockText && timezoneSelect) {
  timezoneSelect.addEventListener("change", perbaruiWaktuRealtime);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mulaiJamRealtime);
  } else {
    mulaiJamRealtime();
  }
}
