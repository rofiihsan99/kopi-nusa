const formKontak = document.querySelector("#form-kontak");
const previewForm = document.querySelector("#preview-form");

if (formKontak && previewForm) {
  formKontak.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(formKontak);

    const nama = data.get("nama");
    const email = data.get("email");
    const whatsapp = data.get("whatsapp");
    const paket = data.get("paket");
    const topik = data.get("topik");
    const waktu = data.get("waktu");
    const pesan = data.get("pesan");

    previewForm.textContent = [
      `Nama: ${nama}`,
      `Email: ${email}`,
      `WhatsApp: ${whatsapp}`,
      `Paket: ${paket}`,
      `Topik: ${topik}`,
      `Waktu Kontak: ${waktu}`,
      `Pesan: ${pesan}`,
    ].join("\n");
  });
}
