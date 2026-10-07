/* ==========================================================
   IOL Lifestyle Recommender
   Scoring, filtering and rendering engine
   ========================================================== */

// ---------- LANGUAGE-AWARE LABELS ----------
const uspLabel = {
    en: "Why this one",
    as: "এইটো কিয়",
    bn: "এটি কেন"
};

const toricLabels = {
    en: ["Not Required", "Required (Moderate)", "Required (High)", "Required (Critical)"],
    as: ["প্ৰয়োজন নাই", "প্ৰয়োজন (মজলীয়া)", "প্ৰয়োজন (বেছি)", "প্ৰয়োজন (অতি বেছি)"],
    bn: ["প্রয়োজন নেই", "প্রয়োজন (মাঝারি)", "প্রয়োজন (বেশি)", "প্রয়োজন (অতি বেশি)"]
};

const contraMsg = {
    en: "ALL LENSES IN THIS TIER CONTRAINDICATED",
    as: "এই শ্ৰেণীৰ সকলো লেন্স ৰোগৰ বাবে অনুপযুক্ত",
    bn: "এই শ্রেণীর সব লেন্স রোগের জন্য অনুপযুক্ত"
};

const economyNote = {
    en: "Note: Toric lenses start from the Standard tier. Entry-level lenses do not correct astigmatism.",
    as: "টোকা: টৰিক লেন্স মধ্যম শ্ৰেণীৰ পৰা আৰম্ভ হয়। প্ৰাথমিক শ্ৰেণীৰ লেন্সে এষ্টিগমেটিজম সংশোধন নকৰে।",
    bn: "নোট: টরিক লেন্স মধ্যবর্তী শ্রেণী থেকে শুরু। প্রাথমিক শ্রেণীর লেন্স অ্যাস্টিগমাটিজম সংশোধন করে না।"
};

const flagMsg = {
    en: "NOT RECOMMENDED DUE TO PATHOLOGY",
    as: "ৰোগৰ বাবে পৰামৰ্শ কৰা নহয়",
    bn: "রোগের কারণে প্রস্তাবিত নয়"
};

// ---------- CLINICAL SAFETY MAP ----------
const safeTypes = {
    none:     ["Mono", "Enhanced", "EDOF", "Multifocal"],
    corneal:  ["Mono", "Enhanced"],
    retinal:  ["Mono"],
    glaucoma: ["Mono"]
};

// ---------- LIFESTYLE WEIGHTS BY LENS TYPE ----------
const weights = {
    "Mono":       { night: 10,  near: -10, inter: -5,  out: 10,  indep: -10 },
    "Enhanced":   { night: 5,   near: -5,  inter: 10,  out: 10,  indep: -5  },
    "EDOF":       { night: -5,  near: 5,   inter: 15,  out: 5,   indep: 10  },
    "Multifocal": { night: -15, near: 15,  inter: 10,  out: -5,  indep: 15  }
};

// ---------- INVENTORY ----------
const inventory = [
    // ECONOMY
    { name: "Appaswamy SupraPhob", cat: "Economy", type: "Mono", isToric: false, base: 48, modifiers: { night: 3 },
      usp: {
        en: "Hydrophobic surface improves biocompatibility while staying budget-friendly.",
        as: "হাইড্ৰ'ফ'বিক পৃষ্ঠই বাজেট-বান্ধৱ হৈ জৈৱ-সামঞ্জস্য উন্নত কৰে।",
        bn: "হাইড্রোফোবিক পৃষ্ঠ বাজেট-বান্ধব থেকে জৈব-সামঞ্জস্য উন্নত করে।"
      } },
    { name: "Aurolab Aurovue", cat: "Economy", type: "Mono", isToric: false, base: 46,
      usp: {
        en: "Excellent value with proven biocompatibility.",
        as: "প্ৰমাণিত জৈৱ-সামঞ্জস্যৰ সৈতে উৎকৃষ্ট মূল্য।",
        bn: "প্রমাণিত জৈব-সামঞ্জস্যের সাথে দুর্দান্ত মূল্য।"
      } },
    { name: "Care Group Acriol EC", cat: "Economy", type: "Mono", isToric: false, base: 46,
      usp: {
        en: "Budget hydrophobic acrylic with good uveal biocompatibility.",
        as: "ভাল ইউভিয়েল জৈৱ-সামঞ্জস্যৰ সৈতে বাজেট হাইড্ৰ'ফ'বিক এক্ৰিলিক।",
        bn: "ভাল ইউভিয়াল জৈব-সামঞ্জস্যের সাথে বাজেট হাইড্রোফোবিক অ্যাক্রিলিক।"
      } },

    // STANDARD
    { name: "Aurolab Truedge", cat: "Standard", type: "Mono", isToric: false, base: 52, modifiers: { night: 5 },
      usp: {
        en: "Square-edge optic reduces PCO — fewer YAG lasers later.",
        as: "বৰ্গাকাৰ কাষৰ অপটিকে PCO কমায়।",
        bn: "বর্গাকার প্রান্তের অপটিক PCO কমায়।"
      } },
    { name: "J&J TECNIS ZCB00", cat: "Standard", type: "Mono", isToric: false, base: 55, modifiers: { night: 8 },
      usp: {
        en: "Global benchmark. Proven long-term clarity, excellent night vision.",
        as: "বিশ্বমানৰ। দীৰ্ঘম্যাদী স্পষ্টতা, উৎকৃষ্ট ৰাতিৰ দৃষ্টি।",
        bn: "বিশ্বমানের। দীর্ঘমেয়াদী স্পষ্টতা, দুর্দান্ত রাতের দৃষ্টি।"
      } },
    { name: "J&J TECNIS Eyhance", cat: "Standard", type: "Enhanced", isToric: false, base: 60, modifiers: { inter: 10, out: 5 },
      usp: {
        en: "Extends intermediate vision without halos.",
        as: "হেল' নোহোৱাকৈ মজলীয়া দৃষ্টি বঢ়ায়।",
        bn: "হ্যালো ছাড়াই মধ্যবর্তী দৃষ্টি বাড়ায়।"
      } },
    { name: "Alcon Clareon Monofocal", cat: "Standard", type: "Mono", isToric: false, base: 58, modifiers: { night: 10 },
      usp: {
        en: "Lowest glistenings in its class — very stable long-term.",
        as: "শ্ৰেণীত আটাইতকৈ কম গ্লিছটেনিং।",
        bn: "শ্রেণীতে সবচেয়ে কম গ্লিস্টেনিং।"
      } },

    // PREMIUM
    { name: "J&J TECNIS Symfony", cat: "Premium", type: "EDOF", isToric: false, base: 65, modifiers: { inter: 10, indep: 10 },
      usp: {
        en: "Smooth extended range. Great for active night drivers.",
        as: "মসৃণ বিস্তৃত পৰিসৰ। ৰাতি গাড়ী চলোৱা ৰোগীৰ বাবে উত্তম।",
        bn: "মসৃণ বিস্তৃত পরিসর। রাতে গাড়ি চালানো রোগীদের জন্য উত্তম।"
      } },
    { name: "J&J TECNIS Odyssey", cat: "Premium", type: "Multifocal", isToric: false, base: 70, modifiers: { near: 15, inter: 10, indep: 15 },
      usp: {
        en: "Latest trifocal. Best-in-class near and intermediate.",
        as: "সৰ্বশেষ ট্ৰাইফ'কেল। শ্ৰেণীত শ্ৰেষ্ঠ ওচৰ আৰু মজলীয়া।",
        bn: "সর্বশেষ ট্রাইফোকাল। শ্রেণীতে সেরা কাছ এবং মধ্যবর্তী।"
      } },
    { name: "Alcon Clareon Vivity", cat: "Premium", type: "EDOF", isToric: false, base: 66, modifiers: { inter: 12, indep: 10 },
      usp: {
        en: "Non-diffractive EDOF. Very low glare and halos.",
        as: "অ-ডিফ্ৰেক্টিভ EDOF। অতি কম গ্লেয়াৰ।",
        bn: "অ-ডিফ্র্যাক্টিভ EDOF। খুব কম গ্লেয়ার।"
      } },
    { name: "Alcon Clareon PanOptix", cat: "Premium", type: "Multifocal", isToric: false, base: 70, modifiers: { near: 15, indep: 15 },
      usp: {
        en: "Quadrifocal design. Top-tier spectacle independence.",
        as: "কোৱাড্ৰিফ'কেল ডিজাইন। শীৰ্ষ শ্ৰেণীৰ চশমা-স্বাধীনতা।",
        bn: "কোয়াড্রিফোকাল ডিজাইন। শীর্ষ শ্রেণীর চশমা-স্বাধীনতা।"
      } },

    // TORIC MONOFOCALS
    { name: "Aurolab EvToric", cat: "Standard", type: "Mono", isToric: true, base: 52, modifiers: { night: 5 },
      usp: {
        en: "Good axis stability at an accessible price.",
        as: "সুলভ মূল্যত ভাল অক্ষ স্থিৰতা।",
        bn: "সুলভ মূল্যে ভাল অক্ষ স্থিরতা।"
      } },
    { name: "J&J TECNIS Toric II", cat: "Standard", type: "Mono", isToric: true, base: 56, modifiers: { out: 8, night: 5 },
      usp: {
        en: "Proven rotational stability. Excellent for active patients.",
        as: "প্ৰমাণিত ঘূৰ্ণন স্থিৰতা।",
        bn: "প্রমাণিত ঘূর্ণন স্থিরতা।"
      } },
    { name: "J&J TECNIS Eyhance Toric", cat: "Standard", type: "Enhanced", isToric: true, base: 61, modifiers: { out: 5, inter: 8 },
      usp: {
        en: "Astigmatism correction + extended intermediate vision.",
        as: "এষ্টিগমেটিজিম সংশোধন + বিস্তৃত মজলীয়া দৃষ্টি।",
        bn: "অ্যাস্টিগমাটিজম সংশোধন + বিস্তৃত মধ্যবর্তী দৃষ্টি।"
      } },
    { name: "Alcon Clareon Toric", cat: "Standard", type: "Mono", isToric: true, base: 59, modifiers: { night: 8 },
      usp: {
        en: "Very stable axis and low glistenings.",
        as: "অতি স্থিৰ অক্ষ আৰু কম গ্লিছটেনিং।",
        bn: "খুব স্থির অক্ষ এবং কম গ্লিস্টেনিং।"
      } },

    // TORIC PREMIUM
    { name: "J&J TECNIS Symfony Toric", cat: "Premium", type: "EDOF", isToric: true, base: 66, modifiers: { inter: 8, indep: 8 },
      usp: {
        en: "Smooth extended range with astigmatism correction.",
        as: "এষ্টিগমেটিজম সংশোধনৰ সৈতে মসৃণ বিস্তৃত পৰিসৰ।",
        bn: "অ্যাস্টিগমাটিজম সংশোধনের সাথে মসৃণ বিস্তৃত পরিসর।"
      } },
    { name: "Alcon Clareon PanOptix Toric", cat: "Premium", type: "Multifocal", isToric: true, base: 71, modifiers: { near: 12, indep: 12 },
      usp: {
        en: "Maximum spectacle independence plus astigmatism correction.",
        as: "সৰ্বাধিক চশমা-স্বাধীনতা আৰু এষ্টিগমেটিজম সংশোধন।",
        bn: "সর্বাধিক চশমা-স্বাধীনতা এবং অ্যাস্টিগমাটিজম সংশোধন।"
      } }
];

// ---------- LENS TYPE DESCRIPTIONS ----------
const descriptions = {
    "Mono": {
        en: "Monofocal: Crisp distance vision. Glasses needed for reading.",
        as: "মন'ফ'কেল: স্পষ্ট দূৰৈৰ দৃষ্টি। পঢ়িবলৈ চশমা লাগিব।",
        bn: "মনোফোকাল: স্পষ্ট দূরত্বের দৃষ্টি। পড়ার জন্য চশমা লাগবে।"
    },
    "Enhanced": {
        en: "Enhanced: Sharp distance + improved intermediate (PC/Dash).",
        as: "উন্নত: স্পষ্ট দূৰৈ + উন্নত মজলীয়া দৃষ্টি।",
        bn: "উন্নত: স্পষ্ট দূরত্ব + উন্নত মধ্যবর্তী দৃষ্টি।"
    },
    "EDOF": {
        en: "EDOF: Continuous range from distance to intermediate. Low glare.",
        as: "EDOF: দূৰৈৰ পৰা মজলীয়ালৈ একেৰাহে দৃষ্টি। কম গ্লেয়াৰ।",
        bn: "EDOF: দূরত্ব থেকে মধ্যবর্তী পর্যন্ত একটানা দৃষ্টি। কম গ্লেয়ার।"
    },
    "Multifocal": {
        en: "Multifocal: Full range (near, intermediate, distance). Maximum independence.",
        as: "মাল্টিফ'কেল: সম্পূৰ্ণ পৰিসৰ। সৰ্বাধিক চশমা-স্বাধীনতা।",
        bn: "মাল্টিফোকাল: সম্পূর্ণ পরিসর। সর্বাধিক চশমা-স্বাধীনতা।"
    }
};

// ---------- TORIC BENEFIT ----------
const toric_benefits = {
    en: "<br><b style='color:#d35400;'>TORIC:</b> Corrects astigmatism for sharper uncorrected vision.",
    as: "<br><b style='color:#d35400;'>টৰিক:</b> স্পষ্ট দৃষ্টিৰ বাবে এষ্টিগমেটিজম ঠিক কৰে।",
    bn: "<br><b style='color:#d35400;'>টরিক:</b> স্পষ্ট দৃষ্টির জন্য অ্যাস্টিগমাটিজম ঠিক করে।"
};

// ---------- HANDOUT HEADER ----------
function updateHeader() {
    document.getElementById('dispName').innerText = document.getElementById('ptName').value || "________________";
    document.getElementById('dispId').innerText   = document.getElementById('ptId').value   || "________";
    document.getElementById('dispEye').innerText  = document.getElementById('eyeSelect').value;
}

// ---------- MAIN ENGINE ----------
function runAlgorithm() {
    const lang = document.getElementById('lang').value;
    const path = document.getElementById('patho').value;
    const astigLevel = parseInt(document.getElementById('astigmatism').value);

    const needsToric = astigLevel > 0;

    // Toric status indicator
    const toricColors = ["#7f8c8d", "#f39c12", "#d35400", "#c0392b"];
    document.getElementById('dispToric').innerText = toricLabels[lang][astigLevel];
    document.getElementById('dispToric').style.color = toricColors[astigLevel];

    // Lifestyle grades
    const g_night = parseInt(document.getElementById('g_night').value);
    const g_near  = parseInt(document.getElementById('g_near').value);
    const g_inter = parseInt(document.getElementById('g_inter').value);
    const g_out   = parseInt(document.getElementById('g_out').value);
    const g_indep = parseInt(document.getElementById('g_indep').value);

    // Score inventory
    const scoredInventory = inventory
        .filter(lens => lens.isToric === needsToric)
        .map(lens => {
            let score = lens.base;
            const w = weights[lens.type];

            score += (g_night * w.night)
                   + (g_near  * w.near)
                   + (g_inter * w.inter)
                   + (g_out   * w.out)
                   + (g_indep * w.indep);

            if (lens.modifiers) {
                if (lens.modifiers.night) score += (g_night * lens.modifiers.night);
                if (lens.modifiers.near)  score += (g_near  * lens.modifiers.near);
                if (lens.modifiers.inter) score += (g_inter * lens.modifiers.inter);
            }

            if (lens.isToric) score += (astigLevel * 10);

            return { ...lens, score };
        });

    // Filter by pathology
    const hasPathology = path !== 'none';
    const allowedTypes = safeTypes[path] || ["Mono"];
    const clinicallySafeInventory = scoredInventory.filter(lens => allowedTypes.includes(lens.type));

    // Renderer
    const renderCategory = (cat, gridId, borderClass) => {
        const top3 = clinicallySafeInventory
            .filter(l => l.cat === cat)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        const grid = document.getElementById(gridId);
        grid.innerHTML = "";

        if (top3.length === 0 && hasPathology) {
            grid.innerHTML = `<div style="grid-column: span 3; text-align: center; padding: 20px; color: #e74c3c; font-weight: bold;">${contraMsg[lang]}</div>`;
            return;
        }

        top3.forEach(lens => {
            let desc = descriptions[lens.type][lang];
            if (lens.isToric) desc += toric_benefits[lang];

            const uspText = typeof lens.usp === "object"
                ? (lens.usp[lang] || lens.usp.en)
                : (lens.usp || "");

            grid.innerHTML += `
                <div class="card ${borderClass}">
                    <div class="score-badge">${lens.score} pts</div>
                    <div class="card-type">${lens.type} Lens</div>
                    <b>${lens.name}</b>
                    <div class="card-usp">
                        <b>${uspLabel[lang]}:</b> ${uspText}
                    </div>
                    <span>${desc}</span>
                </div>
            `;
        });
    };

    renderCategory("Economy", "gridEconomy", "economy-border");
    renderCategory("Standard", "gridStandard", "standard-border");
    renderCategory("Premium", "gridPremium", "premium-border");

    // Hide Economy for toric cases
    document.getElementById('segEconomy').style.display = needsToric ? 'none' : 'block';

    // Add/remove explanatory note above Standard
    const stdSegment = document.getElementById('gridStandard').parentElement;
    const existingNote = stdSegment.querySelector('.toric-note');
    if (existingNote) existingNote.remove();

    if (needsToric) {
        const note = document.createElement('div');
        note.className = 'toric-note';
        note.innerText = economyNote[lang];
        stdSegment.insertBefore(note, document.getElementById('gridStandard'));
    }

    // Pathology badges
    document.querySelectorAll('.patho-alert').forEach(el => {
        el.style.display = hasPathology ? 'block' : 'none';
        el.innerText = flagMsg[lang];
    });
}

// ---------- BOOT ----------
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fDate').innerText = new Date().toLocaleDateString('en-IN');
    runAlgorithm();
});