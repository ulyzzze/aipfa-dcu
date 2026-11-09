# AIPFA · Group G · DCU

Frontend Next.js App Router, TypeScript, Tailwind CSS 4 et shadcn Base UI (Nova).
Typographie Helvetica depuis le système, avec Helvetica Neue puis Arial en remplacement.

## Démarrage

Node.js 24 recommandé (également utilisé par les tests).

```sh
npm install
npm run dev
```

Ouvrir http://localhost:3000.

Si l'installation Homebrew de Node 25 échoue avec une erreur `simdjson` :

```sh
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
npm run dev
```

```sh
npm run typecheck
npm test
npm run build
npm start
```

## Démonstration frontend

Le workspace contient **144 transactions fictives**, de juin à novembre 2026,
en euros. Le mois initial est novembre 2026. Les mois sont des jeux de données
complets, indépendants de la date réelle du jour.

- **Overview** : solde, revenus, dépenses, épargne, courbe quotidienne, répartition
  par catégorie, comparaison mensuelle et dernières transactions.
- **Transactions** : recherche, filtre par catégorie/mois, pagination, ajout,
  modification, suppression avec confirmation, export CSV.
- **Budgets** : limites par catégorie et par mois, anneaux de progression,
  alertes à 80 % et 100 %, modification des limites.
- **AI insights** : textes déterministes calculés depuis les données de démo,
  questions prédéfinies et réponses simulées. Aucun LLM n'est connecté.
- **Import data** : exemple interactif ou fichier CSV local, aperçu, validation,
  détection des doublons et import. Maximum 1 MB / 1 000 lignes par fichier.
- **Settings** : profil local, activation des insights simulés, export complet
  et réinitialisation des données avec confirmation.

Les montants sont stockés en **centimes entiers**. Les statistiques sont calculées
à partir des transactions, y compris après une modification ou un import.
Le solde cumule un solde initial fictif de 3 250 € et les transactions jusqu'au
mois sélectionné. Les budgets restent propres à chaque mois.

L'état est enregistré sous la clé `aipfa-demo-v1` de `localStorage`.
Aucun backend, compte réel, email, connexion bancaire, endpoint API ou service IA
n'est nécessaire. Les fichiers importés sont traités dans le navigateur.
Le bouton **Reset demo** restaure les données initiales, le profil et les budgets.
Si le stockage du navigateur n'est pas disponible, la démo fonctionne en mémoire
et affiche un message explicatif.

## Graphiques Bklit

Les quatre familles de graphiques proviennent du
[registre officiel Bklit](https://bklit.com/docs/components) :
`area-chart`, `bar-chart`, `pie-chart` et `ring-chart`.
Leur code source et leurs dépendances sont installés par le CLI shadcn dans
`src/components/charts/`. Les compositions de l'application sont dans
`src/components/finance-charts.tsx`. Palette centralisée via les variables
`--chart-*` de `src/app/globals.css`, animations respectant les préférences de
mouvement réduit et infobulles Bklit.

```sh
npx shadcn@latest add @bklit/line-chart
npx shadcn@latest add @shadcn/button
```

La navigation utilise la sidebar officielle shadcn (repliable sur ordinateur,
panneau sur mobile), avec ses providers et ses infobulles. Cmd+B / Ctrl+B ouvre
ou replie la navigation.

## CSV

Colonnes obligatoires : `date,description,amount,category`.
Dates : `YYYY-MM-DD`. Montants en euros avec point décimal ; négatifs pour une
 dépense, positifs pour un revenu de catégorie `Income`.
Catégories : Housing, Groceries, Transport, Shopping, Leisure, Bills, Income.
Le lecteur Papa Parse supporte les champs entre guillemets et les virgules dans
les descriptions. Le fichier entier est validé avant l'import. Les doublons
sont identifiés par date, description normalisée, montant et catégorie.
L'export protège les champs pouvant être interprétés comme des formules.

## Organisation

- `src/lib/demo-data.ts` : données initiales, modèles, validation et calculs.
- `src/lib/csv.ts` : lecture, validation, export et dédoublonnage CSV.
- `src/components/demo-provider.tsx` : état partagé et persistance locale.
- `src/components/finance-screen.tsx` : pages de l'application.
- `tests/demo-data.test.mjs` : cohérence des montants, catégories, soldes et données.

Les spécifications scolaires se trouvent dans `PDF/`.
[Maquette Figma d'origine](https://www.figma.com/design/vF4GAseAlfzfe4JD1H8Dqz/?node-id=2-187).
Le frontend a évolué vers Helvetica, shadcn et Bklit à la demande de l'utilisateur.
Les icônes originales dans `public/figma/` sont locales ; aucune URL temporaire
Figma n'est utilisée à l'exécution.
