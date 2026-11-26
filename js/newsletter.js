"use strict";

(() => {
  const newsletterForm = document.querySelector("#form-newsletter");

  // Guard agar file aman bila dimuat di halaman lain.
  if (!newsletterForm) return;

  const emailInput = document.querySelector("#newsletter-email");
  const errorEl = document.querySelector("#newsletter-error");
  const statusEl = document.querySelector("#newsletter-status");
  const tombolHapus = document.querySelector("#hapus-newsletter");

  const STORAGE_KEY = "kopi-nusa-newsletter";

  function getPesanEmail() {
    if (!emailInput) return "";

    if (emailInput.validity.valueMissing) {
      return "Email wajib diisi.";
    }

    if (emailInput.validity.typeMismatch) {
      return "Format email belum sesuai (contoh: nama@email.com).";
    }

    return "";
  }

  function tampilkanError(pesan) {
    if (!emailInput) return;

    emailInput.setCustomValidity(pesan);
    emailInput.setAttribute("aria-invalid", pesan ? "true" : "false");

    if (errorEl) {
      errorEl.textContent = pesan;
    }
  }

  function validasiEmail() {
    if (!emailInput) return false;

    // Reset custom validity 
    emailInput.setCustomValidity("");

    const pesan = getPesanEmail();
    tampilkanError(pesan);

    return pesan === "";
  }

  function perbaruiPesanSaatMengetik() {
    if (!emailInput) return;

    const sudahDitandai = emailInput.getAttribute("aria-invalid") === "true";
    const adaIsi = emailInput.value.trim() !== "";

    // Tidak memindahkan fokus saat pengguna mengetik.
    if (sudahDitandai || adaIsi) {
      validasiEmail();
    }
  }

  if (emailInput) {
    emailInput.addEventListener("input", perbaruiPesanSaatMengetik);
    emailInput.addEventListener("change", perbaruiPesanSaatMengetik);
    emailInput.addEventListener("blur", perbaruiPesanSaatMengetik);
  }

  function tampilkanStatus(pesan, sukses = false) {
    if (!statusEl) return;

    statusEl.textContent = pesan;
    statusEl.classList.toggle("success", sukses);
  }

  function muatNewsletter() {
    try {
      const teksTersimpan = localStorage.getItem(STORAGE_KEY);

      if (!teksTersimpan) return;

      const data = JSON.parse(teksTersimpan);

      if (
        !data ||
        typeof data !== "object" ||
        typeof data.email !== "string" ||
        data.email.trim() === ""
      ) {
        throw new Error("Data newsletter tidak dikenali.");
      }

      if (emailInput) {
        emailInput.value = data.email;
      }

      tampilkanStatus("Email Anda sudah tersimpan di perangkat ini.");
    } catch (error) {
      console.warn("Data newsletter tidak valid.", error);

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (penyimpananError) {
        console.warn("Data newsletter gagal dibersihkan.", penyimpananError);
      }
    }
  }

  function hapusNewsletter() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Data newsletter tidak dapat dihapus.", error);
    }

    newsletterForm.reset();
    tampilkanError("");
    tampilkanStatus("Data newsletter berhasil dihapus.", true);
  }

  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailValid = validasiEmail();

    if (!emailValid || !newsletterForm.checkValidity()) {
      tampilkanStatus("Periksa kembali alamat email Anda.");

      newsletterForm.reportValidity();

      if (emailInput) {
        emailInput.focus();
      }

      return;
    }

    const data = {
      email: emailInput.value.trim(),
      subscribedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      tampilkanStatus("Berlangganan berhasil. Email tersimpan.", true);
      tampilkanError("");
    } catch (error) {
      console.warn("Data newsletter tidak dapat disimpan.", error);
      tampilkanStatus(
        "Langganan gagal disimpan karena penyimpanan lokal tidak tersedia."
      );
    }
  });

  if (tombolHapus) {
    tombolHapus.addEventListener("click", hapusNewsletter);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", muatNewsletter);
  } else {
    muatNewsletter();
  }
})();
