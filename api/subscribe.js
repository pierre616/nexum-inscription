export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const API_KEY = process.env.PIPEDRIVE_API_TOKEN;
  const PIPELINE_ID = parseInt(process.env.PIPEDRIVE_PIPELINE_ID);
  const STAGE_ID = parseInt(process.env.PIPEDRIVE_STAGE_ID);
  const COMPANY_DOMAIN = process.env.PIPEDRIVE_DOMAIN;
  const CUSTOM_FIELD_SIREN = process.env.PIPEDRIVE_FIELD_SIREN || "";

  if (!API_KEY || !COMPANY_DOMAIN) {
    return res.status(500).json({ error: "Pipedrive non configure" });
  }

  const BASE_URL = `https://${COMPANY_DOMAIN}.pipedrive.com/api/v1`;

  try {
    const { civility, name, pharmacy, email, phone, address, siren, source } = req.body;

    if (!name || !pharmacy || !email) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const fullAddress = `${address.street}, ${address.zipcode} ${address.city}`;

    const orgBody = { name: pharmacy, address: fullAddress };
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

    const civilityPrefix = civility === "madame" ? "Mme" : "M.";
    const personBody = {
      name: `${civilityPrefix} ${name}`,
      email: [{ value: email, primary: true, label: "work" }],
      phone: [{ value: phone, primary: true, label: "work" }],
      org_id: orgId,
      "3b3316675da629b525e8d5817fbddddb0e89be1c": civility === "madame" ? "Madame" : "Monsieur",
    };

    const personRes = await fetch(`${BASE_URL}/persons?api_token=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(personBody),
    });
    const personData = await personRes.json();
    if (!personData.success) throw new Error(`Person error: ${JSON.stringify(personData)}`);
    const personId = personData.data.id;

    const dealBody = {
      title: `Livraison - ${pharmacy}`,
      person_id: personId,
      org_id: orgId,
      "3b3316675da629b525e8d5817fbddddb0e89be1c": civility === "madame" ? "Madame" : "Monsieur",
      pipeline_id: PIPELINE_ID,
      stage_id: STAGE_ID,
      visible_to: 3,
    };

    const dealRes = await fetch(`${BASE_URL}/deals?api_token=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dealBody),
    });
    const dealData = await dealRes.json();
    if (!dealData.success) throw new Error(`Deal error: ${JSON.stringify(dealData)}`);

    return res.status(200).json({
      success: true,
      dealId: dealData.data.id,
      message: `Deal cree : ${dealData.data.title}`,
    });

  } catch (error) {
    console.error("Pipedrive API error:", error);
    return res.status(500).json({
      error: "Erreur lors de la creation dans Pipedrive",
      details: error.message,
    });
  }
}
