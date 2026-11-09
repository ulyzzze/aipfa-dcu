# AIPFA · Group G · DCU

Frontend Next.js (App Router), TypeScript et Tailwind CSS 4.

## Démarrage

Node.js 20.9 ou supérieur.

```sh
npm install
npm run dev
```

Ouvrir http://localhost:3000.

```sh
npm run typecheck
npm run build
npm start
```

## État de l'intégration

Les spécifications fonctionnelles et techniques se trouvent dans `PDF/`.
La maquette est référencée dans `PDF/Part2_G 1.pdf` :
[AIPFA — Personal Finance · Group G](https://www.figma.com/design/vF4GAseAlfzfe4JD1H8Dqz/?node-id=2-187).

La navigation correspond au nœud Figma `2:187` (largeur 232 px, espacements, couleurs et icônes d'origine). Une adaptation mobile permet le défilement horizontal des liens.

**Intégration partielle :** le quota MCP du forfait Figma Starter a été atteint après la récupération de la navigation. Les contenus des écrans Overview, Transactions, Budgets, AI insights, Import data et Settings ne sont pas encore intégrés : leurs routes affichent uniquement un titre provisoire. Aucun backend, authentification ou appel LLM n'est implémenté.

Pour poursuivre fidèlement la maquette, fournir l'accès Figma avec un quota disponible ou les exports des écrans avec les styles et assets. La police Inter est distribuée localement via `@fontsource/inter`.

Les icônes dans `public/figma/` proviennent de Figma. Aucune URL temporaire Figma n'est utilisée à l'exécution.
