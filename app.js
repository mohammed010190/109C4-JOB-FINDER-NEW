const $ = id => document.getElementById(id);
const SAVED_KEY = "109c4_saved_jobs_v1";
const LANG_KEY = "109c4_language";
let currentJobs = [];
let currentLanguage = localStorage.getItem(LANG_KEY) || "ar";

const TEXT = {
  ar: {
    navSearch:"البحث", navSaved:"المحفوظات", heroEyebrow:"منصة البحث عن الفرص الوظيفية",
    heroTitleA:"وظيفتك القادمة", heroTitleB:"تبدأ من هنا.",
    heroDescription:"ابحث عن إعلانات الوظائف، صفِّ النتائج، واحفظ الفرص المناسبة لك في مكان واحد.",
    heroButton:"ابدأ البحث", searchEyebrow:"اكتشف الفرص", searchTitle:"ابحث عن وظيفة",
    liveSource:"مصدر مباشر", keywordLabel:"المسمى الوظيفي أو كلمة مفتاحية",
    filtersTitle:"تصفية النتائج", filtersHint:"يمكنك الجمع بين أكثر من فلتر",
    countryLabel:"الدولة", regionLabel:"المنطقة", cityLabel:"المدينة (اختياري)",
    dateLabel:"تاريخ النشر", sortLabel:"ترتيب النتائج", workLabel:"نمط العمل",
    searchButton:"ابحث عن الوظائف", resetButton:"مسح الفلاتر",
    initialStatus:"اكتب المسمى الوظيفي واضغط بحث لعرض الإعلانات المتاحة.",
    savedEyebrow:"قائمة المتابعة", savedTitle:"وظائفي المحفوظة",
    savedEmpty:"لم تحفظ وظائف بعد.", storageNote:"المحفوظات في هذه النسخة تُحفظ على هذا المتصفح والجهاز فقط.",
    sourceCredit:"مصدر بيانات الوظائف:", sourceNote:"افتح الإعلان الأصلي للتحقق من التفاصيل والتقديم.",
    footerText:"بحث أوضح عن فرصتك القادمة", loading:"جارٍ الاتصال بمصدر الوظائف…",
    error:"تعذّر الاتصال بمصدر الوظائف: ", retry:"تحقق من اتصال الإنترنت ثم أعد المحاولة.",
    received:"وصلت {received} نتيجة من المصدر؛ بعد تطبيق الفلاتر بقيت {count} وظيفة.",
    unknownDates:" ({count} دون تاريخ نشر موثّق)", noResults:"لم يعثر المصدر على إعلانات تطابق هذه الخيارات.",
    broaden:"جرّب اختيار «كل الدول»، وامسح المنطقة والمدينة، واجعل تاريخ النشر «كل التواريخ».",
    notProvided:"غير محدد", noDate:"تاريخ النشر غير متاح من المصدر",
    published:"تاريخ النشر: ", location:"الموقع: ", apply:"عرض الإعلان والتقديم ↗",
    email:"مراسلة الشركة ✉", save:"حفظ ♡", saved:"تم الحفظ ✓", remove:"حذف",
    connectionError:"تحقق من الإنترنت. إذا استمرت المشكلة فقد يكون المصدر متوقفًا مؤقتًا.",
    regionEastern:"المنطقة الشرقية"
  },
  en: {
    navSearch:"Search", navSaved:"Saved jobs", heroEyebrow:"Your job search workspace",
    heroTitleA:"Your next job", heroTitleB:"starts here.",
    heroDescription:"Find job listings, filter results, and save opportunities that match your goals in one place.",
    heroButton:"Start searching", searchEyebrow:"Discover opportunities", searchTitle:"Find a job",
    liveSource:"Live source", keywordLabel:"Job title or keyword",
    filtersTitle:"Filter results", filtersHint:"Combine multiple filters",
    countryLabel:"Country", regionLabel:"Region", cityLabel:"City (optional)",
    dateLabel:"Date posted", sortLabel:"Sort results", workLabel:"Work mode",
    searchButton:"Search jobs", resetButton:"Clear filters",
    initialStatus:"Enter a job title and select Search to view available listings.",
    savedEyebrow:"Your shortlist", savedTitle:"Saved jobs",
    savedEmpty:"You have not saved any jobs yet.", storageNote:"Saved jobs in this version are stored only in this browser on this device.",
    sourceCredit:"Job data source:", sourceNote:"Open the original listing to verify details and apply.",
    footerText:"A clearer way to find your next opportunity", loading:"Connecting to the job source…",
    error:"Could not connect to the job source: ", retry:"Check your internet connection and try again.",
    received:"Received {received} results from the source; {count} remain after filters.",
    unknownDates:" ({count} without a verified posting date)", noResults:"The source returned no listings matching these filters.",
    broaden:"Try All countries, clear the region and city, and set Date posted to Any time.",
    notProvided:"Not specified", noDate:"Posting date unavailable from source",
    published:"Posted: ", location:"Location: ", apply:"View listing & apply ↗",
    email:"Email employer ✉", save:"Save ♡", saved:"Saved ✓", remove:"Remove",
    connectionError:"Check your connection. The source may also be temporarily unavailable.",
    regionEastern:"Eastern Province"
  }
};

const CITY_ALIASES = {
  "الرياض":["riyadh"],"جدة":["jeddah","jidda"],"الدمام":["dammam"],
  "الخبر":["khobar","al khobar","al-khobar"],"الظهران":["dhahran"],
  "مكة":["makkah","mecca"],"مكة المكرمة":["makkah","mecca"],
  "المدينة":["medina","madinah","al madinah"],"المدينة المنورة":["medina","madinah","al madinah"],
  "الطائف":["taif","ta'if"],"تبوك":["tabuk"],"أبها":["abha"],
  "جازان":["jazan","jizan"],"حائل":["hail"],"بريدة":["buraydah","buraidah"],
  "القصيم":["qassim","buraydah","unaizah"],"ينبع":["yanbu"],"الجبيل":["jubail","al jubail"],
  "الأحساء":["al ahsa","al-ahsa","hofuf","al hofuf"],"الهفوف":["hofuf","al hofuf"],
  "القطيف":["qatif","al qatif"],"نجران":["najran"],"الباحة":["al baha","al-baha"]
};
const REGION_ALIASES = {
  riyadh:["riyadh"], eastern:["eastern province","eastern region","dammam","khobar","dhahran","jubail","qatif","al ahsa","hofuf"],
  makkah:["makkah","mecca","jeddah","taif"], madinah:["madinah","medina","yanbu"],
  qassim:["qassim","buraydah","buraidah","unaizah"], asir:["asir","abha","khamis mushait"],
  tabuk:["tabuk"], hail:["hail"], jazan:["jazan","jizan"], najran:["najran"],
  baha:["al baha","al-baha"], jouf:["al jouf","sakaka","skaka"], northern:["northern borders","arar","rafha"]
};
const $t = key => TEXT[currentLanguage][key] || key;
const normalize = value => String(value ?? "").toLocaleLowerCase("en").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[،,]/g, " ").replace(/\s+/g, " ").trim();
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));
const readSaved = () => {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); }
  catch { return []; }
};
function applyLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (TEXT[lang][key]) el.textContent = TEXT[lang][key];
  });
  document.querySelectorAll("option[data-ar][data-en]").forEach(option => {
    option.textContent = option.dataset[lang];
  });
  $("q").placeholder = lang === "ar"
    ? "مثال: Accountant, Data Entry, HR Specialist"
    : "e.g. Accountant, Data Entry, HR Specialist";
  $("city").placeholder = lang === "ar"
    ? "الدمام أو Dammam"
    : "e.g. Dammam, Khobar, Riyadh";
  $("languageToggle").textContent = lang === "ar" ? "EN" : "عربي";
  $("languageToggle").setAttribute("aria-label", lang === "ar" ? "Switch to English" : "التبديل إلى العربية");
  renderSaved();
  if (currentJobs.length) renderJobs(currentJobs);
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
    "posted_at","postedAt","posted_date","postedDate","posting_date","postingDate",
    "published_at","publishedAt","published_date","publication_date","date_posted",
    "datePosted","created_at","createdAt","created","date","published","timestamp"
  ]);
  if (!raw) return null;
  const date = typeof raw === "number" ? new Date(raw < 1e12 ? raw * 1000 : raw) : new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}
function extractEmail(job) {
  const explicit = firstValue(job, ["email","contact_email","contactEmail","application_email","applicationEmail","apply_email"]);
  if (explicit) return String(explicit);
  const body = [job.description,job.description_text,job.descriptionText,job.description_plain,job.summary].filter(Boolean).join(" ");
  return (body.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || "";
}
function normalizeJob(job) {
  const url = firstValue(job, ["url","job_url","jobUrl","job_link","jobLink","link","apply_url","applyUrl","application_url","canonical_url","source_url"]);
  const title = firstValue(job, ["title","job_title","jobTitle","position","name"]);
  if (!url || !title) return null;
  const loc = firstValue(job, ["location","job_location","jobLocation","city","locations","region"]);
  return {
    id:String(firstValue(job,["id","job_id","jobId"]) || url),
    title:String(title),
    company:String(firstValue(job,["company","company_name","companyName","organisation","organization","employer","employer_name","org_name"]) || $t("notProvided")),
    location:Array.isArray(loc) ? loc.join(", ") : String(loc || $t("notProvided")),
    country:String(firstValue(job,["country","country_name","countryName"]) || ""),
    url:String(url), email:extractEmail(job), date:parseDate(job)?.toISOString() || "",
    salary:String(firstValue(job,["salary","salary_text","salaryText","salary_range"]) || ""),
    description:String(firstValue(job,["description_text","descriptionText","description_plain","description","summary"]) || ""),
    remote:Boolean(firstValue(job,["remote","is_remote","isRemote"]) || false)
  };
}
function matchesLocation(job, city, region) {
  const location = normalize([job.location,job.country].join(" "));
  if (city) {
    const target = normalize(city);
    const aliases = CITY_ALIASES[city] || [];
    if (!location.includes(target) && !aliases.some(alias => location.includes(normalize(alias)))) return false;
  }
  if (region) {
    const aliases = REGION_ALIASES[region] || [];
    if (!aliases.some(alias => location.includes(normalize(alias)))) return false;
  }
  return true;
}
function dateMatches(job, days) {
  if (!days || !job.date) return true;
  const age = Date.now() - new Date(job.date).getTime();
  return age >= -86400000 && age <= days * 86400000;
}
function formatDate(date) {
  if (!date) return $t("noDate");
  return $t("published") + new Date(date).toLocaleDateString(currentLanguage === "ar" ? "ar-SA" : "en-GB");
}
function card(job, index, saved = false) {
  const description = job.description ? `<p class="muted">${esc(job.description).slice(0,240)}</p>` : "";
  const email = job.email ? `<p class="email">✉ ${esc(job.email)}</p>` : "";
  const salary = job.salary ? `<span>💰 ${esc(job.salary)}</span>` : "";
  return `<article class="job">
    <span class="date">${esc(formatDate(job.date))}</span>
    <h3>${esc(job.title)}</h3>
    <div class="company">${esc(job.company)}</div>
    <div class="meta"><span>⌖ ${esc(job.location)}</span>${salary}</div>
    ${email}${description}
    <div class="actions">
      <a class="apply" href="${esc(job.url)}" target="_blank" rel="noopener">${esc($t("apply"))}</a>
      ${job.email ? `<a href="mailto:${esc(job.email)}?subject=${encodeURIComponent("Application - " + job.title)}">${esc($t("email"))}</a>` : ""}
      ${saved ? `<button class="remove" data-remove="${index}">${esc($t("remove"))}</button>` : `<button data-save="${index}">${esc($t("save"))}</button>`}
    </div>
  </article>`;
}
function renderSaved() {
  const saved = readSaved();
  $("count").textContent = saved.length;
  $("savedList").className = "results" + (!saved.length ? " empty" : "");
  $("savedList").innerHTML = saved.length ? saved.map((job,index) => card(job,index,true)).join("") : esc($t("savedEmpty"));
  document.querySelectorAll("[data-remove]").forEach(button => {
    button.onclick = () => {
      const list = readSaved();
      list.splice(Number(button.dataset.remove),1);
      localStorage.setItem(SAVED_KEY,JSON.stringify(list));
      renderSaved();
    };
  });
}
function renderJobs(jobs) {
  $("results").innerHTML = jobs.length
    ? jobs.map((job,index) => card(job,index)).join("")
    : `<div class="none">${esc($t("noResults"))}<br>${esc($t("broaden"))}</div>`;
  document.querySelectorAll("[data-save]").forEach(button => {
    button.onclick = () => {
      const job = jobs[Number(button.dataset.save)];
      const list = readSaved();
      if (!list.some(item => item.url === job.url)) {
        list.unshift(job);
        localStorage.setItem(SAVED_KEY,JSON.stringify(list));
        renderSaved();
      }
      button.textContent = $t("saved");
      button.disabled = true;
    };
  });
}
async function fetchSourceJobs(keyword,country,remote) {
  const params = new URLSearchParams({limit:"100",offset:"0",search:keyword});
  if (country) params.set("country",country);
  if (remote) params.set("remote",remote);
  const response = await fetch("https://devglobaljobs.com/api/v1/jobs?" + params.toString(), {
    headers:{"Accept":"application/json"}
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  return extractRows(payload);
}
async function search(event) {
  event.preventDefault();
  const keyword = $("q").value.trim();
  if (!keyword) return;
  $("status").textContent = $t("loading");
  $("results").innerHTML = "";
  $("go").disabled = true;
  try {
    const country = $("country").value;
    const rows = await fetchSourceJobs(keyword,country,$("remote").value);
    const city = $("city").value.trim();
    const region = $("region").value;
    const days = Number($("age").value);
    let jobs = rows.map(normalizeJob).filter(Boolean)
      .filter(job => matchesLocation(job,city,region))
      .filter(job => dateMatches(job,days));
    jobs.sort((a,b) => {
      const da = a.date ? Date.parse(a.date) : 0;
      const db = b.date ? Date.parse(b.date) : 0;
      return $("sort").value === "old" ? da-db : db-da;
    });
    currentJobs = jobs;
    const unknownDates = jobs.filter(job => !job.date).length;
    $("status").textContent = $t("received")
      .replace("{received}",rows.length).replace("{count}",jobs.length)
      + (unknownDates ? $t("unknownDates").replace("{count}",unknownDates) : "");
    renderJobs(jobs);
  } catch(error) {
    $("status").textContent = $t("error") + error.message + ". " + $t("retry");
    $("results").innerHTML = `<div class="none">${esc($t("connectionError"))}</div>`;
  } finally {
    $("go").disabled = false;
  }
}
$("searchForm").addEventListener("submit",search);
$("languageToggle").addEventListener("click",() => applyLanguage(currentLanguage === "ar" ? "en" : "ar"));
$("resetFilters").addEventListener("click",() => {
  $("country").value = "sa"; $("region").value = ""; $("city").value = "";
  $("age").value = "0"; $("sort").value = "new"; $("remote").value = "";
  $("status").textContent = $t("initialStatus"); $("results").innerHTML = ""; currentJobs = [];
});
applyLanguage(currentLanguage);
