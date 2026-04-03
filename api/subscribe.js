// ═══════════════════════════════════════════════════════════════
// API Route: /api/subscribe
// Reçoit les données du formulaire et crée dans Pipedrive :
//   1. Une Organisation (la pharmacie)
//   2. Un Contact (le titulaire)
//   3. Un Deal (dans le pipeline Inscription Livraison)
// ═══════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ─── Config Pipedrive ───
  const API_KEY = process.env.PIPEDRIVE_API_TOKEN;
  const PIPELINE_ID = parseInt(process.env.PIPEDRIVE_PIPELINE_ID);
  const STAGE_ID = parseInt(process.env.PIPEDRIVE_STAGE_ID);
  const OWNER_ID = parseInt(process.env.PIPEDRIVE_OWNER_ID || "0");
  const COMPANY_DOMAIN = process.env.PIPEDRIVE_DOMAIN; // ex: "nexum" → nexum.pipedrive.com

  // ─── Champs personnalisés Pipedrive ───
  // Remplace ces clés par les vraies clés de tes champs custom
  // Tu les trouves dans Pipedrive > Paramètres > Champs de données
  // Le format est une hash comme "abc123def456..."
  const CUSTOM_FIELD_SIREN = process.env.PIPEDRIVE_FIELD_SIREN || "";        // champ custom "SIREN" sur l'organisation
  const CUSTOM_FIELD_SOURCE = process.env.PIPEDRIVE_FIELD_SOURCE || "";      // champ custom "Source" sur le deal

  if (!API_KEY || !COMPANY_DOMAIN) {
    return res.status(500).json({ error: "Pipedrive non configuré" });
  }

  const BASE_URL = `https://${COMPANY_DOMAIN}.pipedrive.com/api/v1`;

  try {
    const { civility, name, pharmacy, email, phone, address, siren, source } = req.body;

    // Validation basique
    if (!name || !pharmacy || !email) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const fullAddress = `${address.street}, ${address.zipcode} ${address.city}`;

    // ─── 1. Créer l'Organisation (la pharmacie) ───
    const orgBody = {
      name: pharmacy,
      address: fullAddress,
      owner_id: OWNER_ID || undefined,
    };
    // Ajouter le SIRET en champ custom si configuré
    if (CUSTOM_FIELD_SIREN) {
      orgBody[CUSTOM_FIELD_SIREN] = siren.replace(/\s/g, "");
    }

    const orgRes = await fetch(`${BASE_URL}/organizations?api_token=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orgBody),
    });
    const orgData = await orgRes.json();
    if (!orgData.success) throw new Error(`Org error: ${JSON.stringify(orgData)}`);
    const orgId = orgData.data.id;

    // ─── 2. Créer le Contact (le titulaire) ───
    const civilityPrefix = civility === "madame" ? "Mme" : "M.";
    const personBody = {
      name: `${civilityPrefix} ${name}`,
      email: [{ value: email, primary: true, label: "work" }],
      phone: [{ value: phone, primary: true, label: "work" }],
      org_id: orgId,
      owner_id: OWNER_ID || undefined,
    };

    const personRes = await fetch(`${BASE_URL}/persons?api_token=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(personBody),
    });
    const personData = await personRes.json();
    if (!personData.success) throw new Error(`Person error: ${JSON.stringify(personData)}`);
    const personId = personData.data.id;

    // ─── 3. Créer le Deal ───
    const dealBody = {
      title: `Livraison — ${pharmacy}`,
      person_id: personId,
      org_id: orgId,
      pipeline_id: PIPELINE_ID,
      stage_id: STAGE_ID,
      owner_id: OWNER_ID || undefined,
      visible_to: 3, // visible à toute l'équipe
    };
    // Ajouter la source en champ custom si configuré
    if (CUSTOM_FIELD_SOURCE) {
      dealBody[CUSTOM_FIELD_SOURCE] = source;
    }

    const dealRes = await fetch(`${BASE_URL}/deals?api_token=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dealBody),
    });
    const dealData = await dealRes.json();
    if (!dealData.success) throw new Error(`Deal error: ${JSON.stringify(dealData)}`);

    // ─── Succès ───
    return res.status(200).json({
      success: true,
      dealId: dealData.data.id,
      message: `Deal créé : ${dealData.data.title}`,
    });

  } catch (error) {
    console.error("Pipedrive API error:", error);
    return res.status(500).json({
      error: "Erreur lors de la création dans Pipedrive",
      details: error.message,
    });
  }
}
