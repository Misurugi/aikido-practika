(function () {
  var S = window.SITE, $ = function (id) { return document.getElementById(id); };
  var DAYS = ["", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var tel = function (p) { return "tel:+" + String(p).replace(/\D/g, "").replace(/^8/, "7"); };
  var main = S.club.phone;

  // кнопки «Позвонить» → прямой набор
  document.querySelectorAll("[data-phone]").forEach(function (a) { a.href = tel(main); });
  if (!S.club.firstFree) {
    document.querySelectorAll("[data-free]").forEach(function (e) { e.hidden = true; });
    document.querySelectorAll("[data-free-text]").forEach(function (e) { e.textContent = e.getAttribute("data-free-text"); });
  }

  // легенда + расписание по дням
  $("legend").innerHTML = S.directions.map(function (d) {
    return '<span style="--c:' + d.color + '"><i></i>' + esc(d.title) + "</span>";
  }).join("");

  var byDay = {};
  S.directions.forEach(function (d) {
    d.slots.forEach(function (s) { (byDay[s.day] = byDay[s.day] || []).push({ s: s, d: d }); });
  });
  $("week").innerHTML = Object.keys(byDay).map(Number).sort().map(function (n) {
    var items = byDay[n].sort(function (a, b) { return a.s.time < b.s.time ? -1 : 1; }).map(function (x) {
      return '<div class="slot" style="--c:' + x.d.color + '"><b>' + esc(x.s.time) + "</b><span>" +
        esc(x.d.title) + " · " + esc(x.s.group) + "</span></div>";
    }).join("");
    return '<div class="day"><h3>' + DAYS[n] + "</h3>" + items + "</div>";
  }).join("");
  $("scheduleNote").textContent = "Дети — от 5 лет.";
  $("priceFree").hidden = !S.club.firstFree;

  // цены
  $("prices").innerHTML = S.prices.map(function (p) {
    return '<div class="price"><span>' + esc(p.title) + "</span><b>" + esc(p.value) + "</b><span>" + esc(p.note) + "</span></div>";
  }).join("");
  $("priceNote").textContent = S.priceNote || "";

  // тренеры
  var coaches = S.coaches.filter(function (c) { return c.name; });
  var stub = { name: "Тренер", role: "Скоро здесь появится информация", regalia: [], photo: "", stub: true };
  $("coachesList").innerHTML = (coaches.length ? coaches : [stub, stub, stub]).map(function (c) {
    var ph = c.photo ? '<img class="coach__ph" src="' + esc(c.photo) + '" alt="' + esc(c.name) + '" loading="lazy">' : '<div class="coach__ph">фото</div>';
    var reg = [].concat(c.regalia || []).map(function (r) { var o = typeof r === "string" ? { t: r } : r;
      return "<p>" + (o.b ? "<b>" + esc(o.t) + "</b>" : esc(o.t)) + "</p>"; }).join("");
    return '<article class="coach' + (c.stub ? " coach--stub" : "") + '">' + ph + '<div class="coach__b"><h3>' + esc(c.name) + "</h3>" +
      (c.role ? '<p class="coach__role">' + esc(c.role) + "</p>" : "") + reg + "</div></article>";
  }).join("");

  // иайдо — контакт из data.js
  var iaido = S.directions.filter(function (d) { return d.id === "iaido"; })[0];
  if (iaido) $("iaidoContact").innerHTML = esc(iaido.contact.name) + ' · <a href="' + tel(iaido.contact.phone) + '">' + esc(iaido.contact.phone) + "</a>";

  // адрес / карта
  $("address").textContent = (S.club.city ? S.club.city + ", " : "") + S.club.address;
  if (S.club.mapUrl) { var m = $("mapBtn"); m.href = S.club.mapUrl; m.hidden = false; }

  // фото: с src — картинка, без src — пунктирная заглушка
  var fig = function (g) {
    return g.src
      ? '<figure><img src="' + esc(g.src) + '" alt="' + esc(g.caption) + '" loading="lazy"><figcaption>' + esc(g.caption) + "</figcaption></figure>"
      : '<figure><div class="ph">фото скоро появится</div><figcaption>' + esc(g.caption) + "</figcaption></figure>";
  };
  $("gallery").innerHTML = (S.gallery || []).map(fig).join("");
  $("placePhotos").innerHTML = (S.placePhotos || []).map(fig).join("");
  if (S.teacherPhoto) $("teacherPhoto").innerHTML = S.teacherPhoto.src
    ? '<img src="' + esc(S.teacherPhoto.src) + '" alt="' + esc(S.teacherPhoto.caption) + '" loading="lazy"><figcaption>' + esc(S.teacherPhoto.caption) + "</figcaption>"
    : '<div class="ph ph--portrait">фото скоро появится</div><figcaption>' + esc(S.teacherPhoto.caption) + "</figcaption>";
  if (S.masterPhoto) $("masterPhoto").innerHTML = '<img src="' + esc(S.masterPhoto.src) + '" alt="' + esc(S.masterPhoto.caption) + '" loading="lazy"><figcaption>' + esc(S.masterPhoto.caption) + "</figcaption>";
  $("iaidoPhoto").innerHTML = (S.iaidoPhotos || []).map(fig).join("");

  // материалы и видео
  $("promo").innerHTML = S.promo.map(function (p) {
    return '<a href="' + esc(p.src) + '" target="_blank" rel="noopener"><img src="' + esc(p.src) + '" alt="' + esc(p.title) + '" loading="lazy">' + esc(p.title) + "</a>";
  }).join("");
  $("videos").innerHTML = S.videos.length
    ? S.videos.map(function (v) { return '<iframe src="' + esc(v) + '" allowfullscreen loading="lazy"></iframe>'; }).join("")
    : '<figure><div class="ph">видео скоро появится</div><figcaption>Видео с тренировок</figcaption></figure>';

  // контакты
  var boxes = [{ small: "Айкидо · " + S.club.phoneContact, a: main, href: tel(main) }];
  if (iaido) boxes.push({ small: "Иайдо · " + iaido.contact.name, a: iaido.contact.phone, href: tel(iaido.contact.phone) });
  boxes.push({ small: "ВКонтакте", a: "Группа клуба", href: S.club.vk });
  if (S.club.tg) boxes.push({ small: "Telegram", a: "Написать в Telegram", href: S.club.tg });
  $("contactsBox").innerHTML = boxes.map(function (b) {
    return '<div class="ct"><small>' + esc(b.small) + '</small><a href="' + esc(b.href) + '">' + esc(b.a) + "</a></div>";
  }).join("") + '<div class="ct"><small>Адрес</small><p>' + esc((S.club.city ? S.club.city + ", " : "") + S.club.address) + "</p></div>";

  // лайтбокс: клик по фото открывает его крупно; ‹ › и Esc, свайп на телефоне
  var lb = document.createElement("div");
  lb.className = "lb"; lb.hidden = true; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
  lb.innerHTML = '<button class="lb__x" aria-label="Закрыть">×</button><button class="lb__n lb__n--prev" aria-label="Назад">‹</button>' +
    '<figure class="lb__f"><img alt=""><figcaption></figcaption></figure><button class="lb__n lb__n--next" aria-label="Вперёд">›</button>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption");
  var group = [], cur = 0;

  function show(i) {
    cur = (i + group.length) % group.length;
    var im = group[cur];
    lbImg.src = im.currentSrc || im.src;
    lbImg.alt = im.alt;
    lbCap.textContent = im.alt;
    lb.classList.toggle("lb--single", group.length < 2);
  }
  function open(im) {
    var box = im.closest(".gallery, .portrait, .coach");
    group = [].slice.call((box && box.classList.contains("gallery") ? box : im.parentNode).querySelectorAll("img"));
    if (!group.length) group = [im];
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    show(group.indexOf(im));
    lb.querySelector(".lb__x").focus();
  }
  function close() { lb.hidden = true; lbImg.removeAttribute("src"); document.body.style.overflow = ""; }

  document.addEventListener("click", function (e) {
    var im = e.target.closest(".gallery img, .portrait img, .coach img");
    if (im) { open(im); return; }
    if (lb.hidden) return;
    if (e.target === lb || e.target.closest(".lb__x")) close();
    else if (e.target.closest(".lb__n--prev")) show(cur - 1);
    else if (e.target.closest(".lb__n--next")) show(cur + 1);
  });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "ArrowRight") show(cur + 1);
  });
  var x0 = null;
  lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (x0 == null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50 && group.length > 1) show(cur + (dx < 0 ? 1 : -1));
  });
})();
