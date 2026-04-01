onst photoboxConfig = {
  recipientName: "Alya",
  senderName: "Teman yang bangga banget sama kamu",
  graduationYear: "2026",
  messageLines: [
    "Selamat ya. Semua tugas, revisi, dan hari-hari capek itu akhirnya terbayar manis di momen ini.",
    "Semoga langkah setelah wisuda ini tetap penuh cahaya, orang baik, dan kesempatan yang bikin kamu makin berkembang.",
    "Nikmati tepuk tangannya, simpan bangganya, lalu jalan terus. Kamu pantas banget ada di titik ini."
  ],
  stripMoments: [
    {
      label: "Frame 01 / before the call",
      title: "Senyum tegang yang diam-diam bangga.",
      text: "Detik sebelum nama dipanggil selalu campur aduk: gugup, lega, dan rasanya ingin waktu berhenti sebentar.",
      tags: ["deep breath", "robe on point", "lights ready"]
    },
    {
      label: "Frame 02 / right on stage",
      title: "Saat semua perjuangan terasa nyata.",
      text: "Begitu langkahmu sampai di atas panggung, semua proses panjang itu berubah jadi satu momen yang layak dirayakan.",
      tags: ["main character", "name called", "camera flash"]
    },
    {
      label: "Frame 03 / the afterglow",
      title: "Lega, hangat, dan siap untuk bab berikutnya.",
      text: "Ini bukan cuma akhir studi. Ini juga awal dari banyak kemungkinan baru yang sudah menunggu di depan.",
      tags: ["future unlocked", "happy tears", "print this forever"]
    }
  ]
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const layers = [...document.querySelectorAll(".layer")];
const dots = [...document.querySelectorAll(".dot")];
const shotButtons = [...document.querySelectorAll(".shot")];
const nextButtons = [...document.querySelectorAll("[data-next]")];
const targetButtons = [...document.querySelectorAll(".action[data-target]")];
const experience = document.querySelector(".experience");
const body = document.body;

let currentLayer = 0;
let currentShot = 0;
let shotTimer = null;

function fillText() {
  document.querySelectorAll("[data-recipient]").forEach((node) => {
    node.textContent = photoboxConfig.recipientName;
  });

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = photoboxConfig.graduationYear;
  });

  document.querySelectorAll("[data-sender]").forEach((node) => {
    node.textContent = photoboxConfig.senderName;
  });

  document.querySelectorAll("[data-line]").forEach((node) => {
    const index = Number(node.dataset.line);
    node.textContent = photoboxConfig.messageLines[index] || "";
  });
}

function flashTransition() {
  body.classList.add("is-flashing");
  window.setTimeout(() => body.classList.remove("is-flashing"), 260);
}

function renderLayer(index) {
  currentLayer = index;
  experience.dataset.layer = String(index);

  layers.forEach((layer, layerIndex) => {
    const isActive = layerIndex === index;
    layer.classList.toggle("is-active", isActive);
    layer.classList.toggle("is-past", layerIndex < index);
    layer.classList.toggle("is-future", layerIndex > index);
    layer.setAttribute("aria-hidden", String(!isActive));
  });

  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === index;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-current", isActive ? "true" : "false");
  });

  if (index === 1) {
    startShotRotation();
  } else {
    stopShotRotation();
  }
}

function renderShot(index) {
  currentShot = index;
  const shot = photoboxConfig.stripMoments[index];
  if (!shot) {
    return;
  }

  const label = document.querySelector("[data-shot-label]");
  const title = document.querySelector("[data-shot-title]");
  const text = document.querySelector("[data-shot-text]");
  const [tagA, tagB, tagC] = document.querySelectorAll("[data-shot-tag-a], [data-shot-tag-b], [data-shot-tag-c]");

  label.textContent = shot.label;
  title.textContent = shot.title;
  text.textContent = shot.text;
  tagA.textContent = shot.tags[0] || "";
  tagB.textContent = shot.tags[1] || "";
  tagC.textContent = shot.tags[2] || "";

  shotButtons.forEach((button, buttonIndex) => {
    const isSelected = buttonIndex === index;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
  });
}

function stopShotRotation() {
  if (shotTimer) {
    window.clearInterval(shotTimer);
    shotTimer = null;
  }
}

function startShotRotation() {
  if (reduceMotion || shotTimer) {
    return;
  }

  shotTimer = window.setInterval(() => {
    const nextShot = (currentShot + 1) % photoboxConfig.stripMoments.length;
    renderShot(nextShot);
  }, 3200);
}

function goToLayer(index) {
  if (index < 0 || index >= layers.length) {
    return;
  }

  flashTransition();
  renderLayer(index);
}

fillText();
renderLayer(0);
renderShot(0);

nextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    goToLayer(Math.min(currentLayer + 1, layers.length - 1));
  });
});

targetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = Number(button.dataset.target);
    goToLayer(target);
  });
});

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const target = Number(dot.dataset.target);
    goToLayer(target);
  });
});

shotButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = Number(button.dataset.shot);
    renderShot(target);
    stopShotRotation();
    startShotRotation();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    goToLayer(Math.min(currentLayer + 1, layers.length - 1));
  }

  if (event.key === "ArrowLeft") {
    goToLayer(Math.max(currentLayer - 1, 0));
  }
});

if (!reduceMotion) {
  experience.addEventListener("pointermove", (event) => {
    const bounds = experience.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    experience.style.setProperty("--tilt-x", offsetX.toFixed(3));
    experience.style.setProperty("--tilt-y", offsetY.toFixed(3));
  });

  experience.addEventListener("pointerleave", () => {
    experience.style.setProperty("--tilt-x", "0");
    experience.style.setProperty("--tilt-y", "0");
  });
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopShotRotation();
  } else if (currentLayer === 1) {
    startShotRotation();
  }
});
