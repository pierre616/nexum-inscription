import { useState, useEffect, useRef } from "react";

const CONFIG = {
  brandName: "Nexum Pharma",
  badgeText: "Prix de l'Innovation 2026",
  contactEmail: "pierre@nexum-technologies.fr",
};

const C = {
  primary: "#06B6D4",
  primaryDark: "#0891B2",
  primaryLight: "#22D3EE",
  accent: "#0E7490",
  glow: "rgba(6,182,212,0.15)",
  glowStrong: "rgba(6,182,212,0.25)",
  gradient: "linear-gradient(135deg, #06B6D4, #0EA5E9)",
  gradientBg: "linear-gradient(135deg, #ecfeff 0%, #f0f9ff 40%, #f8fafc 100%)",
  gradientBtn: "linear-gradient(135deg, #06B6D4, #0284C7)",
  success: "#00D26A",
};

const STEPS = [
  {
    id: "civility", emoji: "👋",
    question: "Bienvenue ! Comment devons-nous vous appeler ?",
    subtitle: "Le début d'une belle aventure",
    type: "select", field: "civility",
    options: [
      { value: "madame", label: "Madame" },
      { value: "monsieur", label: "Monsieur" },
    ],
    validation: (v) => v && v.length > 0,
    error: "Merci de choisir une civilité",
  },
  {
    id: "name", emoji: "✨",
    question: "Quel est votre nom ?",
    subtitle: "Nom et prénom du titulaire",
    placeholder: "Jean Dupont", type: "text", field: "name",
    validation: (v) => v.trim().length > 2,
    error: "On a besoin de votre nom complet",
  },
  {
    id: "pharmacy", emoji: "🏥",
    question: "Quelle est votre pharmacie ?",
    subtitle: "Celle qui va bientôt livrer en 30 min",
    placeholder: "Pharmacie du Centre", type: "text", field: "pharmacy",
    validation: (v) => v.trim().length > 2,
    error: "Le nom de votre pharmacie est nécessaire",
  },
  {
    id: "email", emoji: "✉️",
    question: "Votre email professionnel ?",
    subtitle: "Pour recevoir votre contrat en 5 minutes",
    placeholder: "contact@pharmacie.fr", type: "email", field: "email",
    validation: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    error: "L'adresse email ne semble pas valide",
  },
  {
    id: "phone", emoji: "📱",
    question: "Votre numéro de téléphone ?",
    subtitle: "Promis, pas de spam — juste pour l'activation",
    placeholder: "06 12 34 56 78", type: "tel", field: "phone",
    validation: (v) => v.replace(/\s/g, "").length >= 10,
    error: "Le numéro doit contenir au moins 10 chiffres",
  },
  {
    id: "address", emoji: "📍",
    question: "L'adresse de la pharmacie ?",
    subtitle: "Pour configurer votre zone de livraison",
    fields: [
      { key: "street", placeholder: "12 rue de la Santé", label: "Adresse" },
      { key: "zipcode", placeholder: "75013", label: "Code postal" },
      { key: "city", placeholder: "Paris", label: "Ville" },
    ],
    type: "address",
    validation: (v) => v.street?.trim() && v.zipcode?.trim() && v.city?.trim(),
    error: "Tous les champs d'adresse sont nécessaires",
  },
  {
    id: "siren", emoji: "🔢",
    question: "Votre numéro SIREN ?",
    subtitle: "9 chiffres — on en a besoin pour le contrat",
    placeholder: "123 456 789", type: "text", field: "siren",
    validation: (v) => v.replace(/\s/g, "").length === 9,
    error: "Le SIREN doit contenir exactement 9 chiffres",
  },
  {
    id: "source", emoji: "🤔",
    question: "Comment avez-vous entendu parler de nous ?",
    subtitle: "Simple curiosité de notre part",
    type: "select", field: "source",
    options: [
      { value: "pharmagora", label: "🏆 PharmagoraPlus 2026", tag: "Le prix, c'était nous !" },
      { value: "linkedin", label: "💼 LinkedIn" },
      { value: "bfmtv", label: "📺 BFMTV / Les Échos" },
      { value: "recommandation", label: "🗣️ Recommandation d'un confrère", tag: "Le bouche-à-oreille, ça marche" },
      { value: "lemlist", label: "📧 Email de prospection" },
      { value: "uber", label: "🚗 Uber Eats directement" },
      { value: "autre", label: "🔍 Autre" },
    ],
    validation: (v) => v && v.length > 0,
    error: "Choisissez une option",
  },
];

const CONFETTI_COLORS = [C.primary, C.primaryLight, C.success, "#F59E0B", "#8B5CF6", "#EC4899"];

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360, size: 6 + Math.random() * 6,
  }));
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999 }}>
      {pieces.map((p) => (
        <div key={p.id} style={{ position: "absolute", left: `${p.left}%`, top: "-10px", width: `${p.size}px`, height: `${p.size * 1.5}px`, backgroundColor: p.color, borderRadius: "2px", transform: `rotate(${p.rotation}deg)`, animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards` }} />
      ))}
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div style={{ width: "100%", marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", fontWeight: 500 }}>Étape {current + 1} sur {total}</span>
        <span style={{ fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: C.primary, fontWeight: 600 }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ width: "100%", height: "6px", backgroundColor: "#e0f2fe", borderRadius: "100px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: C.gradient, borderRadius: "100px", transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
      </div>
    </div>
  );
}

export default function NexumForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ civility: "", name: "", pharmacy: "", email: "", phone: "", address: { street: "", zipcode: "", city: "" }, siren: "", source: "" });
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const inputRef = useRef(null);
  const current = STEPS[step];

  useEffect(() => { if (!done && !submitting && inputRef.current) setTimeout(() => inputRef.current?.focus(), 350); }, [step, done, submitting]);

  const getValue = () => current.type === "address" ? data.address : (data[current.field] || "");
  const setValue = (val) => { setError(""); current.type === "address" ? setData((d) => ({ ...d, address: val })) : setData((d) => ({ ...d, [current.field]: val })); };

  const submitToPipedrive = async (formData) => {
    setSubmitting(true); setSubmitError("");
    try {
      const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erreur serveur");
      setDone(true); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000);
    } catch (err) { console.error("Submit error:", err); setSubmitError("Une erreur est survenue. Réessayez ou contactez-nous directement."); }
    finally { setSubmitting(false); }
  };

  const handleSelectAndNext = (fieldVal, formDataOverride) => {
    setTimeout(() => {
      if (step === STEPS.length - 1) submitToPipedrive(formDataOverride || { ...data, [current.field]: fieldVal });
      else { setDirection(1); setAnimating(true); setTimeout(() => { setStep((s) => s + 1); setAnimating(false); }, 300); }
    }, 200);
  };

  const goNext = () => {
    const val = getValue();
    if (!current.validation(val)) { setError(current.error); return; }
    setError(""); setDirection(1); setAnimating(true);
    setTimeout(() => { if (step < STEPS.length - 1) { setStep((s) => s + 1); setAnimating(false); } else { setAnimating(false); submitToPipedrive(data); } }, 300);
  };

  const goBack = () => { if (step === 0) return; setError(""); setDirection(-1); setAnimating(true); setTimeout(() => { setStep((s) => s - 1); setAnimating(false); }, 300); };
  const handleKeyDown = (e) => { if (e.key === "Enter" && current.type !== "address") { e.preventDefault(); goNext(); } };

  const slideStyle = { opacity: animating ? 0 : 1, transform: animating ? `translateY(${direction * 30}px)` : "translateY(0)", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" };
  const getDisplayQuestion = () => { if (current.id === "name" && data.civility) return data.civility === "madame" ? "Quel est votre nom, Madame ?" : "Quel est votre nom, Monsieur ?"; return current.question; };
  const getFirstName = () => data.name.trim().split(" ")[0] || "";
  const getCivilityPrefix = () => data.civility === "madame" ? "Madame" : "Monsieur";

  if (done) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "1.5rem", background: C.gradientBg }}>
      {showConfetti && <Confetti />}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap'); @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } } @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } } @keyframes checkDraw { 0% { stroke-dashoffset: 50; } 100% { stroke-dashoffset: 0; } }`}</style>
      <div style={{ textAlign: "center", maxWidth: "500px", animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", boxShadow: `0 8px 30px ${C.glowStrong}` }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" style={{ strokeDasharray: 50, animation: "checkDraw 0.6s ease 0.3s forwards" }} /></svg>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#0f172a", marginBottom: "0.75rem" }}>C'est tout bon, {getCivilityPrefix()} {getFirstName()} !</h1>
        <p style={{ fontSize: "1.1rem", color: "#475569", lineHeight: 1.6, marginBottom: "0.5rem" }}>Votre contrat arrive dans votre boîte mail dans quelques minutes.</p>
        <p style={{ fontSize: "0.95rem", color: "#94a3b8", lineHeight: 1.6 }}><strong style={{ color: C.primary }}>{data.pharmacy}</strong> sera bientôt visible sur Uber Eats.<br />Bienvenue parmi les 400+ pharmacies Nexum Pharma 🎉</p>
        <div style={{ marginTop: "2rem", padding: "1rem 1.5rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e0f2fe", display: "inline-block", boxShadow: `0 2px 8px ${C.glow}` }}>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>Une question ? </span>
          <span style={{ fontSize: "13px", color: "#0f172a", fontWeight: 600 }}>{CONFIG.contactEmail}</span>
        </div>
      </div>
    </div>
  );

  if (submitting) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", background: C.gradientBg }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #e0f2fe", borderTopColor: C.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Activation en cours...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", background: C.gradientBg }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap'); @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } } input::placeholder { color: #cbd5e1; } input:focus { outline: none; border-color: ${C.primary} !important; box-shadow: 0 0 0 3px ${C.glow} !important; } .select-option { cursor: pointer; transition: all 0.2s ease; } .select-option:hover { transform: translateX(4px); border-color: ${C.primary} !important; background: #ecfeff !important; } .back-btn { cursor: pointer; transition: all 0.2s; } .back-btn:hover { background: #f0f9ff !important; } .next-btn { cursor: pointer; transition: all 0.2s; } .next-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px ${C.glowStrong} !important; } .next-btn:active { transform: translateY(0); } .civility-card { cursor: pointer; transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); } .civility-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px ${C.glow} !important; border-color: ${C.primary} !important; }`}</style>

      <div style={{ padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${C.glow}` }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>N</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>{CONFIG.brandName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", backgroundColor: "rgba(245,158,11,0.1)", borderRadius: "100px" }}>
          <span style={{ fontSize: "12px" }}>🏆</span>
          <span style={{ fontSize: "12px", color: "#d97706", fontWeight: 600 }}>{CONFIG.badgeText}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ width: "100%", maxWidth: "520px" }}>
          <ProgressBar current={step} total={STEPS.length} />
          <div style={slideStyle}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem", animation: "float 3s ease-in-out infinite" }}>{current.emoji}</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", color: "#0f172a", marginBottom: "0.5rem", lineHeight: 1.3 }}>{getDisplayQuestion()}</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: "1.75rem" }}>{current.subtitle}</p>

            {current.id === "civility" ? (
              <div style={{ display: "flex", gap: "16px" }}>
                {current.options.map((opt) => {
                  const selected = data.civility === opt.value;
                  return (
                    <div key={opt.value} className="civility-card" onClick={() => { setData((d) => ({ ...d, civility: opt.value })); handleSelectAndNext(opt.value, { ...data, civility: opt.value }); }}
                      style={{ flex: 1, padding: "2rem 1.5rem", borderRadius: "16px", border: `2px solid ${selected ? C.primary : "#e0f2fe"}`, backgroundColor: selected ? "#ecfeff" : "white", textAlign: "center", boxShadow: selected ? `0 4px 16px ${C.glow}` : "0 2px 8px rgba(0,0,0,0.04)" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{opt.value === "madame" ? "👩‍⚕️" : "👨‍⚕️"}</div>
                      <span style={{ fontSize: "1.1rem", fontWeight: 600, color: selected ? C.accent : "#0f172a" }}>{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : current.type === "select" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {current.options.map((opt) => (
                  <div key={opt.value} className="select-option" onClick={() => { setData((d) => ({ ...d, [current.field]: opt.value })); handleSelectAndNext(opt.value, { ...data, [current.field]: opt.value }); }}
                    style={{ padding: "14px 18px", borderRadius: "12px", border: `2px solid ${data[current.field] === opt.value ? C.primary : "#e2e8f0"}`, backgroundColor: data[current.field] === opt.value ? "#ecfeff" : "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>{opt.label}</span>
                    {opt.tag && <span style={{ fontSize: "12px", color: C.primary, fontWeight: 500 }}>{opt.tag}</span>}
                  </div>
                ))}
              </div>
            ) : current.type === "address" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {current.fields.map((f, i) => (
                  <div key={f.key}>
                    <label style={{ fontSize: "13px", color: "#64748b", fontWeight: 500, marginBottom: "4px", display: "block" }}>{f.label}</label>
                    <input ref={i === 0 ? inputRef : undefined} type="text" placeholder={f.placeholder} value={data.address[f.key] || ""}
                      onChange={(e) => setValue({ ...data.address, [f.key]: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter" && f.key === "city") { e.preventDefault(); goNext(); } }}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "1rem", color: "#0f172a", backgroundColor: "white", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
            ) : (
              <input ref={inputRef} type={current.type} placeholder={current.placeholder} value={data[current.field] || ""} onChange={(e) => setValue(e.target.value)} onKeyDown={handleKeyDown}
                style={{ width: "100%", padding: "16px 18px", borderRadius: "14px", border: "2px solid #e2e8f0", fontSize: "1.1rem", color: "#0f172a", backgroundColor: "white", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
            )}

            {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "8px", fontWeight: 500 }}>⚠️ {error}</p>}
            {submitError && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "8px", fontWeight: 500 }}>⚠️ {submitError}</p>}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2rem" }}>
            <div>{step > 0 && <button className="back-btn" onClick={goBack} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #e0f2fe", backgroundColor: "white", color: "#64748b", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>← Retour</button>}</div>
            {current.type !== "select" && current.id !== "civility" && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "#cbd5e1" }}>Appuyez sur Entrée ↵</span>
                <button className="next-btn" onClick={goNext} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: C.gradientBtn, color: "white", fontSize: "15px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, boxShadow: `0 4px 12px ${C.glow}` }}>
                  {step === STEPS.length - 1 ? "Activer la livraison 🚀" : "Continuer →"}
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: "3rem", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
              {["Sans engagement", "Contrat transparent", "Données en France 🇫🇷"].map((t) => (
                <span key={t} style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>{t}</span>
              ))}
            </div>
            <p style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "12px" }}>Vu sur BFMTV · Les Échos · PharmagoraPlus 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
