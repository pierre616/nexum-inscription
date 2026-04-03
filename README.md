# 🚀 Nexum Pharma — Formulaire d'Inscription Livraison

Formulaire self-service connecté à Pipedrive.
Le pharmacien s'inscrit → le deal est créé automatiquement → tu envoies le Smart Doc.

---

## 📦 Structure du projet

```
nexum-form/
├── api/
│   └── subscribe.js        ← Serverless function (Pipedrive API)
├── src/
│   ├── main.jsx             ← Point d'entrée React
│   └── NexumForm.jsx        ← Le formulaire (tout le frontend)
├── index.html               ← Page HTML
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example             ← Variables d'environnement à remplir
└── README.md                ← Ce fichier
```

---

## 🛠️ Déploiement étape par étape

### Étape 1 — Préparer Pipedrive (5 min)

1. **Créer le pipeline** "Inscription Livraison" avec les étapes :
   - Nouveau — Contrat envoyé
   - Contrat signé
   - Onboarding en cours
   - Actif

2. **Créer les champs personnalisés** :
   - Sur Organisation : "SIRET" (type texte)
   - Sur Deal : "Source" (type texte ou liste)

3. **Récupérer les IDs** dont tu as besoin :
   - API Token : Pipedrive > ton Profil > Paramètres > API
   - Pipeline ID : dans l'URL quand tu ouvres le pipeline
   - Stage ID : via Paramètres > Pipelines, ou l'API `GET /stages`
   - Owner ID : Paramètres > Utilisateurs > ton profil
   - Clés des champs custom : Paramètres > Champs de données

### Étape 2 — Créer un repo GitHub (3 min)

1. Va sur github.com > New Repository
2. Nom : `nexum-inscription`
3. Dézippe ce projet et push le code :

```bash
cd nexum-form
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TON_USER/nexum-inscription.git
git push -u origin main
```

### Étape 3 — Déployer sur Vercel (5 min)

1. Va sur [vercel.com](https://vercel.com) et connecte-toi avec GitHub
2. Clique "Add New Project"
3. Sélectionne le repo `nexum-inscription`
4. Framework preset : **Vite**
5. **IMPORTANT** — Ajoute les variables d'environnement :
   - Clique "Environment Variables"
   - Ajoute chaque variable du fichier `.env.example` avec tes vraies valeurs
   - ⚠️ Ne committe JAMAIS le fichier `.env` avec tes vraies clés
6. Clique "Deploy"

### Étape 4 — (Optionnel) Brancher ton domaine

1. Dans Vercel > Settings > Domains
2. Ajoute `inscription.nexum-pharma.fr` (ou ce que tu veux)
3. Configure le DNS chez ton registrar (Vercel te donne les instructions)

### Étape 5 — Créer les automations Pipedrive

**Automation 1 — Notification + tâche**
- Déclencheur : Deal créé dans pipeline "Inscription Livraison"
- Action 1 : Créer activité "📄 Envoyer Smart Doc contrat livraison"
- Action 2 : Envoyer email d'accueil au pharmacien

**Automation 2 — Post-signature**
- Déclencheur : Deal déplacé vers "Contrat signé"
- Action : Envoyer email de bienvenue

**Automation 3 — Relance**
- Déclencheur : Deal dans "Contrat envoyé" depuis 48h
- Action : Envoyer email de relance

---

## 🧪 Tester en local

```bash
cd nexum-form
npm install
npm run dev
```

Le formulaire sera sur `http://localhost:5173`.

Pour tester l'API en local, crée un fichier `.env` (copie de `.env.example`) et lance :
```bash
npx vercel dev
```

---

## 🔒 Sécurité

- La clé API Pipedrive est côté serveur (dans la serverless function), jamais exposée au navigateur
- Les variables d'environnement sont dans Vercel, pas dans le code
- Le fichier `.env` est dans `.gitignore`

---

## 📝 Personnalisation

Pour modifier les textes, emojis, ou ajouter des champs :
→ Édite le fichier `src/NexumForm.jsx`, section `STEPS` en haut du fichier.

Pour modifier l'email de contact sur l'écran de confirmation :
→ Édite `CONFIG.contactEmail` dans `src/NexumForm.jsx`.
