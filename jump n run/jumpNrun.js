const canvas = document.getElementById("spiel");
const ctx = canvas.getContext("2d");

const bodenY = 1000;
const scrollTempo = 2.5;

const hintergrundBilder = {
    sky: new Image(),
    mountains: new Image(),
    midTrees: new Image(),
    frontTrees: new Image(),
    foreground: new Image()
};

hintergrundBilder.sky.src = "bilder/00 - Sky.png";
hintergrundBilder.mountains.src = "bilder/01 - Mountains.png";
hintergrundBilder.midTrees.src = "bilder/02 - Mid Trees.png";
hintergrundBilder.frontTrees.src = "bilder/03 - Front Trees.png";
hintergrundBilder.foreground.src = "bilder/04 - Foreground.png";

let hintergrundStartet = false;

const hintergrundEbenen = [
    { bild: hintergrundBilder.mountains, x: 0, tempo: 0.5 },
    { bild: hintergrundBilder.midTrees, x: 0, tempo: 1 },
    { bild: hintergrundBilder.frontTrees, x: 0, tempo: 2 },
    { bild: hintergrundBilder.foreground, x: 0, tempo: 2.5 }
];

function zeichneHintergrund() {
    const sky = hintergrundBilder.sky;

    if (sky.complete && sky.naturalWidth > 0) {
        ctx.drawImage(sky, 0, 0, canvas.width, canvas.height);
    }

    for (const ebene of hintergrundEbenen) {
        const bild = ebene.bild;

        if (!bild.complete || bild.naturalWidth === 0) continue;

        if (hintergrundStartet) {
            ebene.x -= ebene.tempo;
        }

        if (ebene.x <= -canvas.width) {
            ebene.x += canvas.width;
        }

        ctx.drawImage(bild, ebene.x, 0, canvas.width, canvas.height);
        ctx.drawImage(bild, ebene.x + canvas.width, 0, canvas.width, canvas.height);
    }
}

function boden() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, bodenY, canvas.width, canvas.height - bodenY);
}

function bodenLinie() {
    ctx.beginPath();
    ctx.strokeStyle = "deeppink";
    ctx.lineWidth = 6;
    ctx.moveTo(0, bodenY + 3);
    ctx.lineTo(canvas.width, bodenY);
    ctx.stroke();
}

function ladeBilder(name, anzahl) {
    const bilder = [];

    for (let i = 1; i <= anzahl; i++) {
        const bild = new Image();
        bild.src = "bilder/" + name + i + ".png";
        bilder.push(bild);
    }

    return bilder;
}

const animationen = {
    springen: ladeBilder("springen", 8),
    fallen: ladeBilder("fallen", 8),
    landen: ladeBilder("landen", 8),
    laufen: ladeBilder("laufen", 11)
};

let aktuelleAnimation = "stehen";
let bildIndex = 0;
let bildZaehler = 0;
let landenZaehler = 0;

let playerX = 950;
let playerY = 0;
let playerWidth = 90;
let playerHeight = 120;

let geschwindigkeitY = 0;
let schwerkraft = 0.5;

const figur = new Image();
figur.src = "bilder/figur_idle.png";

function player() {
    if (aktuelleAnimation === "stehen") {
        if (figur.complete && figur.naturalWidth > 0) {
            ctx.drawImage(figur, playerX, playerY, playerWidth, playerHeight);
        }
        return;
    }

    const bilder = animationen[aktuelleAnimation];

    if (!bilder) return;

    bildZaehler++;

    const animationsGeschwindigkeit =
        aktuelleAnimation === "laufen" ? 8 : 4;

    if (bildZaehler >= animationsGeschwindigkeit) {
        bildZaehler = 0;

        if (aktuelleAnimation === "landen") {
            bildIndex = Math.min(bildIndex + 1, bilder.length - 1);
        } else {
            bildIndex = (bildIndex + 1) % bilder.length;
        }
    }

    const bild = bilder[bildIndex];

    if (bild && bild.complete && bild.naturalWidth > 0) {
        ctx.drawImage(
            bild,
            16, 38, 87, 117,
            playerX, playerY, playerWidth, playerHeight
        );
    }
}

const plattformBilder = {
    baumstamm: {
        sehrklein: new Image(),
        klein: new Image(),
        gross: new Image()
    },
    baumstumpf: {
        sehrklein: new Image(),
        klein: new Image(),
        gross: new Image()
    },
    pilz: {
        sehrklein: new Image(),
        klein: new Image(),
        gross: new Image()
    }
};

for (const typ in plattformBilder) {
    for (const groesse in plattformBilder[typ]) {
        plattformBilder[typ][groesse].src =
            "bilder/" + typ + groesse + ".png";
    }
}

const plattformVorlagen = [
    { typ: "baumstamm", groesse: "sehrklein", breite: 190, hoehe: 65, y: 935 },
    { typ: "baumstumpf", groesse: "sehrklein", breite: 150, hoehe: 135, y: 865 },
    { typ: "pilz", groesse: "sehrklein", breite: 175, hoehe: 175, y: 825 },

    { typ: "baumstamm", groesse: "klein", breite: 230, hoehe: 70, y: 930 },
    { typ: "baumstumpf", groesse: "klein", breite: 175, hoehe: 160, y: 840 },
    { typ: "pilz", groesse: "klein", breite: 220, hoehe: 215, y: 785 },

    { typ: "baumstamm", groesse: "gross", breite: 300, hoehe: 80, y: 920 },
    { typ: "baumstumpf", groesse: "gross", breite: 230, hoehe: 200, y: 800 },
    { typ: "pilz", groesse: "gross", breite: 290, hoehe: 270, y: 730 }
];

function zufall(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function erstellePlattform(x, vorlage) {
    return {
        typ: vorlage.typ,
        groesse: vorlage.groesse,
        x: x,
        y: vorlage.y,
        breite: vorlage.breite,
        hoehe: vorlage.hoehe
    };
}

let plattformen = [
    erstellePlattform(1500, plattformVorlagen[0]),
    erstellePlattform(1700, plattformVorlagen[1]),
    erstellePlattform(1880, plattformVorlagen[2])
];

let naechsteVorlage = 3;
let bodenAbschnitt = false;
let bodenAbschnittLaenge = 0;
let plattformenBisBoden = 0;

function zeichnePlattformen() {
    for (const plattform of plattformen) {
        const bild =
            plattformBilder[plattform.typ][plattform.groesse];

        if (bild.complete && bild.naturalWidth > 0) {
            ctx.drawImage(
                bild,
                plattform.x,
                plattform.y,
                plattform.breite,
                plattform.hoehe
            );
        }
    }
}

function bewegePlattformen() {
    if (!hintergrundStartet) return;

    for (const plattform of plattformen) {
        plattform.x -= scrollTempo;
    }

    plattformen = plattformen.filter(
        plattform => plattform.x + plattform.breite > 0
    );

    if (bodenAbschnitt) {
        bodenAbschnittLaenge -= scrollTempo;

        if (bodenAbschnittLaenge <= 0) {
            bodenAbschnitt = false;
            plattformenBisBoden = zufall(3, 6);

            const vorlage =
                plattformVorlagen[
                naechsteVorlage % plattformVorlagen.length
                    ];

            plattformen.push(
                erstellePlattform(
                    canvas.width + zufall(80, 140),
                    vorlage
                )
            );

            naechsteVorlage++;
            plattformenBisBoden--;
        }

        return;
    }

    const letzte = plattformen[plattformen.length - 1];

    if (!letzte) return;

    if (letzte.x + letzte.breite >= canvas.width) return;

    if (plattformenBisBoden <= 0) {
        bodenAbschnitt = true;
        bodenAbschnittLaenge = zufall(700, 1100);
        return;
    }

    const vorlage =
        plattformVorlagen[
        naechsteVorlage % plattformVorlagen.length
            ];

    const abstand = zufall(30, 60);

    plattformen.push(
        erstellePlattform(
            letzte.x + letzte.breite + abstand,
            vorlage
        )
    );

    naechsteVorlage++;
    plattformenBisBoden--;
}

let stehtAufPlattform = false;
let aktuellePlattform = null;
let standZaehler = 0;
const standDauer = 5;

document.addEventListener("keydown", function(event) {
    if (event.code === "Space" && !event.repeat) {
        geschwindigkeitY = -12;
        stehtAufPlattform = false;
        aktuellePlattform = null;
        landenZaehler = 0;
        aktuelleAnimation = "springen";
        bildIndex = 0;
        bildZaehler = 0;
        hintergrundStartet = true;
        event.preventDefault();
    }
});

function playerFalling() {
    const alteUnterkante = playerY + playerHeight;
    const warAmBoden = playerY + playerHeight >= bodenY;
    const warAufPlattform = stehtAufPlattform;
    const vorherigePlattform = aktuellePlattform;

    geschwindigkeitY += schwerkraft;
    playerY += geschwindigkeitY;

    stehtAufPlattform = false;
    aktuellePlattform = null;

    if (geschwindigkeitY >= 0) {
        for (const plattform of plattformen) {
            const oberkante = plattform.y + 15;
            const neueUnterkante = playerY + playerHeight;

            const horizontalerKontakt =
                playerX + playerWidth > plattform.x + 8 &&
                playerX < plattform.x + plattform.breite - 8;

            const vertikalerKontakt =
                alteUnterkante <= oberkante &&
                neueUnterkante >= oberkante;

            const standKontakt =
                warAufPlattform &&
                vorherigePlattform === plattform &&
                horizontalerKontakt &&
                neueUnterkante >= oberkante - 3 &&
                neueUnterkante <= oberkante + 20;

            if (
                horizontalerKontakt &&
                (vertikalerKontakt || standKontakt)
            ) {
                playerY = oberkante - playerHeight;
                geschwindigkeitY = 0;
                stehtAufPlattform = true;
                aktuellePlattform = plattform;
                break;
            }
        }
    }

    if (!stehtAufPlattform && playerY + playerHeight >= bodenY) {
        playerY = bodenY - playerHeight;
        geschwindigkeitY = 0;

        if (!warAmBoden) {
            standZaehler = 0;
            aktuelleAnimation = "landen";
            bildIndex = 0;
            bildZaehler = 0;
            landenZaehler = 12;
        }
    } else if (stehtAufPlattform && !warAufPlattform) {
        standZaehler = 0;
        aktuelleAnimation = "landen";
        bildIndex = 0;
        bildZaehler = 0;
        landenZaehler = 12;
    }

    if (landenZaehler > 0) {
        landenZaehler--;
        aktuelleAnimation = "landen";
    } else if (
        playerY + playerHeight < bodenY &&
        !stehtAufPlattform
    ) {
        if (geschwindigkeitY < 0) {
            if (aktuelleAnimation !== "springen") {
                bildIndex = 0;
                bildZaehler = 0;
            }

            aktuelleAnimation = "springen";
        } else {
            if (aktuelleAnimation !== "fallen") {
                bildIndex = 0;
                bildZaehler = 0;
            }

            aktuelleAnimation = "fallen";
        }
    } else {
        standZaehler++;

        if (standZaehler >= standDauer) {
            aktuelleAnimation = "laufen";
        } else {
            aktuelleAnimation = "stehen";
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (
        aktuelleAnimation === "laufen" ||
        aktuelleAnimation === "springen"
    ) {
        hintergrundStartet = true;
    }

    bewegePlattformen();
    zeichneHintergrund();
    boden();
    bodenLinie();
    playerFalling();
    zeichnePlattformen();
    player();

    requestAnimationFrame(gameLoop);
}

gameLoop();