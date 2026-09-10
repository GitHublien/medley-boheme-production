# LES PROMPTS — l'image d'ouverture, et les portraits animés

*10 septembre 2026, au soir.*

---

## 1. L'IMAGE D'OUVERTURE DU SITE — « MEDLEY BOHÈME » devient « LE MEDLEY DES LÉGENDES »

**Deux images à refaire**, l'horizontale et la verticale. Le site en choisit une selon la
façon dont on tient le téléphone.

| Fichier | Format | Ce qu'il faut y lire |
|---|---|---|
| `site-images\01-scene.jpg` | 1382 × 768 (paysage) | LE MEDLEY DES LÉGENDES · CANNES · 4 OCTOBRE 2026 |
| `site-images\01-scene-portrait.jpg` | 768 × 1382 (portrait) | idem |

**Méthode : on redonne l'image existante à Nano Banana et on ne change QUE le texte.**
Le décor, les six douches de lumière, la fumée, le plancher, le médaillon doré : tout
doit rester **identique au pixel près**. C'est le principe des retouches Nano Banana —
on décrit ce qui change, et on interdit explicitement le reste.

### Prompt (à coller dans Flow, avec l'image de départ déposée)

```
Keep this image exactly as it is. Change ONLY the engraved golden text at the bottom.

Replace the words "MEDLEY BOHÈME" with "LE MEDLEY DES LÉGENDES", in the SAME elegant
golden serif capitals, the SAME warm gold colour, the SAME soft glow and the SAME
engraved-on-the-stage-floor look. Keep the line below unchanged: "CANNES · 4 OCTOBRE 2026".

Because the new title is longer, set it slightly smaller so it fits comfortably on one
single line, perfectly centred, with the same margins on both sides. Keep the accent on
the É of LÉGENDES.

Do NOT change anything else: the golden circular Bohème Production medallion and its
text stay exactly the same, the six warm spotlight beams stay the same, the haze, the
reflections on the wooden stage floor, the black curtains, the framing and the colours
all stay identical. Photorealistic, cinematic, warm gold on deep black.
```

**Le piège à surveiller :** l'accent de **LÉGENDES**. Les modèles d'image le mangent une
fois sur deux. Si l'image revient avec « LEGENDES », relancer en ajoutant en fin de
prompt : `The É in LÉGENDES must carry its acute accent.`

---

## 2. LES PORTRAITS ANIMÉS — « à la Harry Potter »

*Un plaisir, pas une urgence. Les photos vivantes du journal des sorciers : ils respirent,
ils clignent des yeux, ils sourient, et ça recommence sans fin.*

Photos de départ : `site-assets\adrien.jpg`, `stephanie.jpg`, `candice.jpg`,
`mickael.jpg`, `bry.jpg`, `elie.jpg`.

### Le prompt Kling (image → vidéo, 5 s, un par chanteur)

```
The person stays exactly where they are, framed the same way, looking at the camera.
Subtle living-portrait motion only: they breathe slowly, their chest rises once and
falls, they blink twice at a natural pace, a soft warm smile grows and settles, and a
strand of hair moves very slightly as if from a faint draught. Their head turns no more
than two or three degrees, then returns to the starting position.

The camera does not move at all. No zoom, no pan, no cut. The background stays perfectly
still. Lighting stays warm and unchanged throughout.

The last frame must match the first frame as closely as possible, so the clip can loop
seamlessly.
```

**Pourquoi ce prompt est écrit comme ça :**
- **des actions, pas une ambiance** — chaque geste est nommé et minuté, sinon l'IA invente ;
- **le retour à la position de départ**, sinon la boucle saute visiblement toutes les 5 s ;
- **la caméra immobile** : dès qu'elle bouge, ce n'est plus un portrait, c'est un plan ;
- **deux clignements** : un seul passe inaperçu, trois font un tic.

### La page journal, si tu veux aller au bout

L'idée est belle et elle est faisable : une page « **La Gazette du Medley** » — fond
papier vieilli, gros titre, colonnes de texte serrées, et **les six portraits animés
encadrés dedans**, chacun avec son nom en légende. Sur téléphone, on fait défiler le
journal et les visages bougent au passage.

Techniquement c'est simple : les vidéos remplacent les photos, en lecture automatique,
muettes, en boucle. **À faire après le 4 octobre**, ou un soir où tout le reste est prêt.
