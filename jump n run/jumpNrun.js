
const canvas = document.getElementById("spiel");
const ctx = canvas.getContext("2d");

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
        ctx.drawImage(
            sky,
            0, 0,
            canvas.width, canvas.height
        );
    }

    for (const ebene of hintergrundEbenen) {
        const bild = ebene.bild;

        if (!bild.complete || bild.naturalWidth === 0) {
            continue;
        }

        if (hintergrundStartet) {
            ebene.x -= ebene.tempo;
        }

        if (ebene.x <= -canvas.width) {
            ebene.x += canvas.width;
        }

        ctx.drawImage(
            bild,
            ebene.x,
            0,
            canvas.width,
            canvas.height
        );

        ctx.drawImage(
            bild,
            ebene.x + canvas.width,
            0,
            canvas.width,
            canvas.height
        );
    }
}

function boden() {
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 1000, 2000, 100);
    ctx.closePath();
}

function bodenLinie() {
    ctx.beginPath();
    ctx.strokeStyle = "deeppink";
    ctx.lineWidth = 6;
    ctx.moveTo(0, 1003);
    ctx.lineTo(2000, 1000);
    ctx.stroke();
}

function ladeBilder(name, anzahl) {
    let bilder = [];

    for (let i = 1; i <= anzahl; i++) {
        let bild = new Image();
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
            ctx.drawImage(
                figur,
                playerX,
                playerY,
                playerWidth,
                playerHeight
            );
        }

        return;
    }

    const bilder = animationen[aktuelleAnimation];

    if (!bilder || bilder.length === 0) {
        return;
    }

    bildZaehler++;

    const animationsGeschwindigkeit =
        aktuelleAnimation === "laufen" ? 8:4;

    if (bildZaehler >= animationsGeschwindigkeit) {
        bildZaehler = 0;

        if (aktuelleAnimation === "landen") {
            bildIndex = Math.min(
                bildIndex + 1,
                bilder.length - 1
            );
        } else {
            bildIndex = (bildIndex + 1) % bilder.length;
        }
    }

    const bild = bilder[bildIndex];

    if (bild && bild.complete && bild.naturalWidth > 0) {
        ctx.drawImage(
            bild,
            16, 38, 87, 117,
            playerX,
            playerY,
            playerWidth,
            playerHeight
        );
    }
}

document.addEventListener("keydown", function(event) {
    if (
        event.code === "Space" &&
        playerY + playerHeight >= 1000 &&
        landenZaehler <= 0
    ) {
        geschwindigkeitY = -15;
        event.preventDefault();
    }
});

let standZaehler = 0;
const standDauer = 5;

function playerFalling() {
    const warAmBoden =
        playerY + playerHeight >= 1000;

    geschwindigkeitY += schwerkraft;
    playerY += geschwindigkeitY;

    if (playerY + playerHeight >= 1000) {
        playerY = 1000 - playerHeight;
        geschwindigkeitY = 0;

        if (!warAmBoden) {
            standZaehler = 0;
            aktuelleAnimation = "landen";
            bildIndex = 0;
            bildZaehler = 0;
            landenZaehler = 8 * 6;
        }
    }

    if (landenZaehler > 0) {
        landenZaehler--;
        aktuelleAnimation = "landen";
    } else if (playerY + playerHeight < 1000) {
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

    zeichneHintergrund();
    playerFalling();
    boden();
    bodenLinie();
    player();

    requestAnimationFrame(gameLoop);
}

gameLoop();
