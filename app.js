const $ = id => document.getElementById(id);
const KEY = "109c4_saved_jobs_v1";

const readSaved = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
};

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
}[c]));

const CITY_ALIASES = {
  "الرياض":["riyadh"],
  "جدة":["jeddah","jidda"],
  "الدمام":["dammam"],
  "الخبر":["khobar","al khobar","al-khobar"],
  "الظهران":["dhahran"],
  "مكة":["makkah","mecca"],
  "مكة المكرمة":["makkah","mecca"],
  "المدينة":["medina","madinah","al madinah"],
  "المدينة المنورة":["medina","madinah","al madinah"],
  "الطائف":["taif","ta'if"],
  "تبوك":["tabuk"],
  "أبها":["abha"],
  "جازان":["jazan","jizan"],
  "حائل":["hail"],
  "بريدة":["buraydah","buraidah"],
  "القصيم":["qassim","buraydah","unaizah"],
  "ينبع":["yanbu"],
  "الجبيل":["jubail","al jubail"],
  "الأحساء":["al ahsa","al-ahsa","hofuf","al hofuf"],
  "الهفوف":["hofuf","al hofuf"],
  "القطيف":["qatif","al qatif"],
  "نجران":["najran"],
  "الباحة":["al baha","al-baha"]
};

function norm(value) {
  return String(value ?? "").toLocaleLowerCase("en").normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[،,]/g, " ").replace(/\s+/g, " ").trim();
}

function firstValue(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function extractRows(payload) {
  if (Array.isArray(payload)) return payload;
  const candidates = [
    payload?.jobs, payload?.results, payload?.items, payload?.data,
    payload?.data?.jobs, payload?.data?.results, payload?.data?.items,
    payload?.data?.data, payload?.results?.jobs
  ];
  for (const item of candidates) if (Array.isArray(item)) return item;
  return [];
}

function parseDate(job) {
  const raw = firstValue(job, [
    "posted_at","postedAt","posted_date","postedDate","posting_date",
    "published_at","publishedAt","published_date","publication_date",
    "date_posted","datePosted","created_at","createdAt","created",
    "date","published","timestamp"
  ]);
  if (!raw) return null;
  const parsed = typeof raw === "number"
    ? new Date(raw < 1e12 ? raw * 1000 : raw)
    : new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function findEmail(job) {
  const explicit = firstValue(job, [
    "email","contact_email","contactEmail","application_email","applicationEmail","apply_email"
  ]);
  if (explicit) return String(explicit);
  const text = [
    job.description, job.description_text, job.descriptionText,
    job.description_plain, job.summary, job.content
  ].filter(Boolean).join(" ");
  return (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || "";
}

function normalizeJob(job) {
  const url = firstValue(job, [
    "url","job_url","jobUrl","job_link","jobLink","link",
    "apply_url","applyUrl","application_url","canonical_url","source_url"
  ]);
  const title = firstValue(job, [
    "title","job_title","jobTitle","position","name"
  ]);
  if (!url || !title) return null;

  const locationValue = firstValue(job, [
    "location","job_location","jobLocation","city","locations","region"
  ]);
  const location = Array.isArray(locationValue)
    ? locationValue.join(", ")
    : String(locationValue || "الموقع غير محدد");

  return {
    id: String(firstValue(job, ["id","job_id","jobId"]) || url),
    title: String(title),
    company: String(firstValue(job, [
      "company","company_name","companyName","organisation","organization",
      "employer","employer_name","org_name"
    ]) || "الشركة غير محددة"),
    location,
    url: String(url),
    email: findEmail(job),
    date: parseDate(job)?.toISOString() || "",
    salary: String(firstValue(job, ["salary","salary_text","salaryText","salary_range"]) || ""),
    description: String(firstValue(job, [
      "description_text","descriptionText","description_plain","description","summary"
    ]) || "")
  };
}

function cityMatches(location, city) {
  if (!city) return true;
  const loc = norm(location);
  const wanted = norm(city);
  if (loc.includes(wanted)) return true;
  const aliases = CITY_ALIASES[city] || CITY_ALIASES[String(city).trim()] || [];
  return aliases.some(alias => loc.includes(norm(alias)));
}

function dateMatches(job, days) {
  if (!days || !job.date) return true; // لا نستبعد إعلانًا لم يوفّر المصدر تاريخ نشره
  const age = Date.now() - new Date(job.date).getTime();
  return age >= -86400000 && age <= days * 86400000;
}

function renderSaved() {
  const jobs = readSaved();
  $("count").textContent = jobs.length;
  $("savedList").className = "results" + (!jobs.length ? " empty" : "");
  $("savedList").innerHTML = jobs.length
    ? jobs.map((job, index) => card(job, index, true)).join("")
    : "لم تحفظ وظائف بعد.";
  document.querySelectorAll("[data-remove]").forEach(button => {
    button.onclick = () => {
      const current = readSaved();
      current.splice(Number(button.dataset.remove), 1);
      localStorage.setItem(KEY, JSON.stringify(current));
      renderSaved();
    };
  });
}

function card(job, index, saved = false) {
  const published = job.date
    ? "تاريخ النشر: " + new Date(job.date).toLocaleDateString("ar-SA")
    : "تاريخ النشر غير متاح من المصدر";
  return `<article class="job">
    <span class="date">${esc(published)}</span>
    <h3>${esc(job.title)}</h3>
    <div class="company">${esc(job.company)}</div>
    <div class="meta"><span>⌖ ${esc(job.location)}</span>${job.salary ? `<span>💰 ${esc(job.salary)}</span>` : ""}</div>
    ${job.email ? `<p class="email">✉ ${esc(job.email)}</p>` : ""}
    ${job.description ? `<p class="muted">${esc(job.description).slice(0,230)}</p>` : ""}
    <div class="actions">
      <a class="apply" href="${esc(job.url)}" target="_blank" rel="noopener">عرض الإعلان والتقديم ↗</a>
      ${job.email ? `<a href="mailto:${esc(job.email)}?subject=${encodeURIComponent("Application - " + job.title)}">مراسلة الشركة ✉</a>` : ""}
      ${saved ? `<button class="remove" data-remove="${index}">حذف</button>` : `<button data-save="${index}">حفظ ♡</button>`}
    </div>
  </article>`;
}

async function fetchJobs(params) {
  const base = "https://devglobaljobs.com/api/v1/jobs";
  // توثيق المصدر يذكر search، والأسئلة الشائعة تذكر q؛ نجرب الاسمين عند الحاجة.
  for (const keywordName of ["search", "q"]) {
    const query = new URLSearchParams(params);
    query.set(keywordName, params.keyword);
    query.delete("keyword");
    const response = await fetch(`${base}?${query.toString()}`, {
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) throw new Error(`المصدر أعاد رمز ${response.status}`);
    const payload = await response.json();
    const rows = extractRows(payload);
    if (rows.length) return rows;
  }
  return [];
}

async function search(event) {
  event.preventDefault();
  const keyword = $("q").value.trim();
  if (!keyword) return;

  const country = $("country").value;
  const city = $("city").value.trim();
  const days = Number($("age").value);
  const remote = $("remote").value;

  $("status").textContent = "جارٍ الاتصال بمصدر الوظائف…";
  $("results").innerHTML = "";
  $("go").disabled = true;

  try {
    const params = { limit: "100", offset: "0", keyword };
    if (country) params.country = country;
    if (remote) params.remote = remote;

    const rows = await fetchJobs(params);
    const jobs = rows.map(normalizeJob).filter(Boolean)
      .filter(job => cityMatches(job.location, city))
      .filter(job => dateMatches(job, days));

    jobs.sort((a, b) => {
      const da = a.date ? Date.parse(a.date) : 0;
      const db = b.date ? Date.parse(b.date) : 0;
      return $("sort").value === "old" ? da - db : db - da;
    });

    const unknownDates = jobs.filter(job => !job.date).length;
    $("status").textContent = `وصلت ${rows.length} نتيجة من المصدر؛ بعد تطبيق فلاترك بقيت ${jobs.length} وظيفة.`
      + (unknownDates ? ` (${unknownDates} دون تاريخ نشر موثّق)` : "");

    $("results").innerHTML = jobs.length
      ? jobs.map((job, index) => card(job, index)).join("")
      : `<div class="none">لم يعثر المصدر على إعلان يطابق هذه الخيارات. جرّب اختيار «كل الدول»، وامسح المدينة، واجعل تاريخ النشر «كل التواريخ». قد لا يحتوي المصدر على وظائف كافية في السعودية لهذا المسمى.</div>`;

    document.querySelectorAll("[data-save]").forEach(button => {
      button.onclick = () => {
        const job = jobs[Number(button.dataset.save)];
        const saved = readSaved();
        if (!saved.some(item => item.url === job.url)) {
          saved.unshift(job);
          localStorage.setItem(KEY, JSON.stringify(saved));
          renderSaved();
        }
        button.textContent = "تم الحفظ ✓";
        button.disabled = true;
      };
    });
  } catch (error) {
    $("status").textContent = "تعذّر الاتصال بمصدر الوظائف: " + error.message;
    $("results").innerHTML = `<div class="none">تحقق من اتصال الإنترنت ثم أعد المحاولة. إذا استمرت المشكلة فقد يكون المصدر متوقفًا مؤقتًا.</div>`;
  } finally {
    $("go").disabled = false;
  }
}

$("searchForm").addEventListener("submit", search);
renderSaved();
