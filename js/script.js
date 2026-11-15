const promoButton = document.querySelector("#promoButton");

promoButton.addEventListener("click", () => {
  promoButton.textContent = "Kode Promo: KOPINUSA20 (Diskon 20% semua menu!)";
  console.log("Promo spesial Kopi Nusa berhasil ditampilkan.");
});

// Logika Mode Gelap dan Terang
const themeButton = document.querySelector("#themeButton");

themeButton.addEventListener("click", () => {
  // Pasang atau lepas class dark-mode
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    themeButton.textContent = "Mode Terang";
    console.log("Mode Gelap diaktifkan.");
  } else {
    themeButton.textContent = "Mode Gelap";
    console.log("Mode Terang diaktifkan.");
  }
});