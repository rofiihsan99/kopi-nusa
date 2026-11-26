"use strict";

(() => {
  const form = document.querySelector("#form-kontak");

  // Guard agar file aman bila dimuat di halaman lain.
  if (!form) return;

  const preview = document.querySelector("#preview-form");
  const previewWrapper = document.querySelector("#preview-wrapper");
  const feedback = document.querySelector("#form-feedback");
  const paketSelect = document.querySelector("#paket");
  const topikError = document.querySelector("#topik-error");
  const preferensiStatus = document.querySelector("#preferensi-status");
  const tombolSimpan = document.querySelector("#simpan-preferensi");
  const tombolHapus = document.querySelector("#hapus-preferensi");

  const STORAGE_KEY = "kopi-nusa-preferensi-kontak";
  const PAKET_VALID = ["rumahan", "kantor", "reseller"];

  const fieldWajib = ["nama", "email", "telepon", "paket", "pesan", "setuju"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const radioTopik = Array.from(form.querySelectorAll('input[name="topik"]'));

  function getFieldError(field) {
    if (field.validity.valueMissing) {
      return "Bagian ini wajib diisi.";
    }

    if (field.validity.typeMismatch) {
      return "Format data belum sesuai (contoh: nama@email.com).";
    }

    if (field.validity.tooShort) {
      return `Isi minimal ${field.minLength} karakter.`;
    }

    if (field.validity.patternMismatch) {
      return "Format nomor telepon harus diawali 08 dan terdiri dari 10-13 digit angka.";
    }

    return "";
  }

  function tampilkanError(field, pesan) {
    field.setCustomValidity(pesan);
    field.setAttribute("aria-invalid", pesan ? "true" : "false");

    const wadahError = document.getElementById(`${field.id}-error`);

    if (wadahError) {
      wadahError.textContent = pesan;
    }
  }

  function validasiField(field) {
    if (!field) return true;

    // Selalu bersihkan custom validity sebelum mengecek ulang constraint.
    field.setCustomValidity("");

    const pesan = getFieldError(field);
    tampilkanError(field, pesan);

    return pesan === "";
  }

  function validasiTopik() {
    const dipilih = radioTopik.find((radio) => radio.checked);
    const pesan = dipilih ? "" : "Pilih salah satu topik pertanyaan.";

    radioTopik.forEach((radio) => {
      radio.setCustomValidity(pesan);
      radio.setAttribute("aria-invalid", pesan ? "true" : "false");
    });

    if (topikError) {
      topikError.textContent = pesan;
    }

    return pesan === "";
  }

  function pasangListenerField(field) {
    const perbarui = () => {
      const sudahDitandai = field.getAttribute("aria-invalid") === "true";
      const adaIsi =
        field.type === "checkbox" ? field.checked : field.value.trim() !== "";

      // Jangan memindahkan fokus, perbarui pesan saat user memperbaiki isi
      if (sudahDitandai || adaIsi) {
        validasiField(field);
      }
    };

    field.addEventListener("input", perbarui);
    field.addEventListener("change", perbarui);
    field.addEventListener("blur", perbarui);
  }

  fieldWajib.forEach(pasangListenerField);

  radioTopik.forEach((radio) => {
    radio.addEventListener("change", validasiTopik);
    radio.addEventListener("blur", () => {
      if (topikError && topikError.textContent) {
        validasiTopik();
      }
    });
  });

  function ambilTopikTerpilih() {
    const radioTerpilih = radioTopik.find((radio) => radio.checked);
    return radioTerpilih ? radioTerpilih.value : "";
  }

  function tampilkanStatusPreferensi(pesan, sukses = false) {
    if (!preferensiStatus) return;

    preferensiStatus.textContent = pesan;
    preferensiStatus.classList.toggle("success", sukses);
  }

  function sembunyikanPreview() {
    if (previewWrapper) {
      previewWrapper.hidden = true;
    }

    if (preview) {
      preview.textContent = "";
      preview.hidden = true;
    }
  }

  function tampilkanPreview(teks) {
    if (preview) {
      preview.textContent = teks;
      preview.hidden = false;
    }

    if (previewWrapper) {
      previewWrapper.hidden = false;
    }
  }

  function simpanPreferensi() {
    const paket = paketSelect ? paketSelect.value : "";
    const topik = ambilTopikTerpilih();

    if (!paket || !topik) {
      tampilkanStatusPreferensi(
        "Pilih paket dan topik terlebih dahulu sebelum menyimpan preferensi."
      );

      if (!paket) validasiField(paketSelect);
      if (!topik) validasiTopik();

      return false;
    }

    const preferensi = {
      paket,
      topik,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferensi));
      tampilkanStatusPreferensi(
        "Preferensi paket dan topik berhasil disimpan.",
        true
      );

      return true;
    } catch (error) {
      console.warn("Preferensi tidak dapat disimpan.", error);
      tampilkanStatusPreferensi(
        "Preferensi tidak dapat disimpan karena penyimpanan lokal tidak tersedia."
      );

      return false;
    }
  }

  function muatPreferensi() {
    try {
      const teksTersimpan = localStorage.getItem(STORAGE_KEY);

      if (!teksTersimpan) return;

      const preferensi = JSON.parse(teksTersimpan);

      if (
        !preferensi ||
        typeof preferensi !== "object" ||
        Array.isArray(preferensi)
      ) {
        throw new Error("Struktur preferensi tidak dikenali.");
      }

      const paketValid =
        paketSelect && PAKET_VALID.includes(preferensi.paket);
      const radioTersimpan = radioTopik.find(
        (radio) => radio.value === preferensi.topik
      );

      if (!paketValid && !radioTersimpan) {
        throw new Error("Preferensi tidak memiliki data yang dapat dimuat.");
      }

      if (paketValid) {
        paketSelect.value = preferensi.paket;
      }

      if (radioTersimpan) {
        radioTersimpan.checked = true;
        validasiTopik();
      }

      tampilkanStatusPreferensi("Preferensi terakhir dimuat otomatis.", true);
    } catch (error) {
      console.warn("Preferensi tidak valid.", error);

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (penyimpananError) {
        console.warn("Preferensi gagal dibersihkan.", penyimpananError);
      }

      tampilkanStatusPreferensi(
        "Preferensi tersimpan tidak valid dan telah dibersihkan."
      );
    }
  }

  function hapusPreferensi() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Preferensi tidak dapat dihapus.", error);
    }

    if (paketSelect) {
      paketSelect.value = "";
      tampilkanError(paketSelect, "");
    }

    radioTopik.forEach((radio) => {
      radio.checked = false;
      radio.setCustomValidity("");
      radio.setAttribute("aria-invalid", "false");
    });

    if (topikError) {
      topikError.textContent = "";
    }

    tampilkanStatusPreferensi("Preferensi berhasil dihapus.", true);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const semuaValid = fieldWajib
      .map((field) => validasiField(field))
      .every(Boolean);
    const topikValid = validasiTopik();
    const formValid = form.checkValidity();

    if (!semuaValid || !topikValid || !formValid) {
      sembunyikanPreview();

      if (feedback) {
        feedback.textContent = "Periksa kembali bagian yang ditandai.";
        feedback.classList.remove("success");
      }

      form.reportValidity();

      const fieldInvalid = form.querySelector(":invalid");

      if (fieldInvalid) {
        fieldInvalid.focus();
      } else if (!topikValid && radioTopik[0]) {
        radioTopik[0].focus();
      }

      return;
    }

    const data = new FormData(form);
    const topik = ambilTopikTerpilih();

    const ringkasan = [
      `Nama: ${data.get("nama")}`,
      `Email: ${data.get("email")}`,
      `Telepon: ${data.get("telepon")}`,
      `Paket: ${data.get("paket")}`,
      `Topik: ${topik}`,
      `Pesan: ${data.get("pesan")}`,
      `Persetujuan: ${data.get("setuju") ? "Ya" : "Tidak"}`,
    ].join("\n");

    tampilkanPreview(ringkasan);

    const preferensiTersimpan = simpanPreferensi();

    if (feedback) {
      if (preferensiTersimpan) {
        feedback.textContent =
          "Pesan valid. Ringkasan pesan ditampilkan dan preferensi tersimpan.";
        feedback.classList.add("success");
      } else {
        feedback.textContent =
          "Pesan valid. Ringkasan pesan ditampilkan, tetapi preferensi belum tersimpan.";
        feedback.classList.remove("success");
      }
    }
  });

  if (tombolSimpan) {
    tombolSimpan.addEventListener("click", simpanPreferensi);
  }

  if (tombolHapus) {
    tombolHapus.addEventListener("click", hapusPreferensi);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", muatPreferensi);
  } else {
    muatPreferensi();
  }
})();
