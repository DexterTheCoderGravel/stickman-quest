
// ============================================
// STICKMAN QUEST ULTIMATE EDITION
// PART 1/10 - SETUP AND PLAYER
// ============================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SAVE_KEY = "stickmanQuestUltimate";

const gameState = {
    level: 1,
    gold: 0,
    isPaused: false,
    gameOver: false,
    victory: false,
    frame: 0
};


// ============================================
// DIFFICULTY SYSTEM
// ============================================

let selectedDifficulty = null;

const difficultySettings = {
    veryEasy: {
        enemyHealth: 0.2,
        enemyDamage: 0.2,
        bossHealth: 0.2
    },

    easy: {
        enemyHealth: 0.5,
        enemyDamage: 0.5,
        bossHealth: 0.5
    },

    medium: {
        enemyHealth: 1,
        enemyDamage: 1,
        bossHealth: 1
    },

    hard: {
        enemyHealth: 1.35,
        enemyDamage: 1.35,
        bossHealth: 1.35
    },

    veryHard: {
        enemyHealth: 1.8,
        enemyDamage: 1.8,
        bossHealth: 1.8
    }
};


// =============================================
// STICKMAN QUEST - ANIMATED MONSTER ENGINE
// =============================================

function drawAnimatedMonster(ctx, monster) {

    const x = monster.x;
    const y = monster.y;
    const w = monster.width || 45;
    const h = monster.height || 55;

    const type = monster.type || "goblin";

    const time = performance.now() / 180;

    const moving = monster.moving !== false;
    const attacking = monster.attacking === true;

    const walk = moving ? Math.sin(time) * 5 : 0;
    const bounce = moving ? Math.abs(Math.sin(time)) * 3 : 0;
    const breathing = Math.sin(time * 0.5) * 1.5;

    const attack = attacking ? Math.sin(time * 3) * 0.7 : 0;

    const hp = monster.hp ?? 100;
    const maxHp = monster.maxHp ?? 100;

    ctx.save();

    ctx.translate(
        x + w / 2,
        y + h / 2 - bounce
    );

    if (monster.direction === -1) {
        ctx.scale(-1, 1);
    }

    // Damage flash
    if (
        monster.damageFlash &&
        performance.now() - monster.damageFlash < 150
    ) {
        ctx.globalAlpha = 0.5;
    }

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(0, h * 0.48, w * 0.45, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated legs
    const legSwing = walk + attack * 5;

    function drawLegs(color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 7;
        ctx.lineCap = "round";

        ctx.beginPath();

        ctx.moveTo(-w * 0.15, h * 0.3);
        ctx.lineTo(-w * 0.2 + legSwing, h * 0.48);

        ctx.moveTo(w * 0.15, h * 0.3);
        ctx.lineTo(w * 0.2 - legSwing, h * 0.48);

        ctx.stroke();
    }

    // Animated arms
    function drawArms(color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 8;
        ctx.lineCap = "round";

        ctx.beginPath();

        ctx.moveTo(-w * 0.3, -h * 0.05);
        ctx.lineTo(-w * 0.55, h * 0.15 + walk);

        ctx.moveTo(w * 0.3, -h * 0.05);
        ctx.lineTo(
            w * 0.55,
            h * 0.15 - walk - attack * 15
        );

        ctx.stroke();
    }

    function drawHead(color, radius = w * 0.38) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
            0,
            -h * 0.3 + breathing,
            radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    function drawEyes(color = "#ffffff") {
        const eyeY = -h * 0.32 + breathing;

        ctx.fillStyle = "#111";

        ctx.beginPath();
        ctx.arc(-w * 0.15, eyeY, 5, 0, Math.PI * 2);
        ctx.arc(w * 0.15, eyeY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = color;
        ctx.shadowBlur = 12 + Math.sin(time) * 5;

        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.arc(-w * 0.15, eyeY, 2.5, 0, Math.PI * 2);
        ctx.arc(w * 0.15, eyeY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    // =========================================
    // GOBLIN
    // =========================================

    if (type === "goblin") {

        drawLegs("#267b35");
        drawArms("#267b35");

        // Body
        ctx.fillStyle = "#36a848";
        ctx.fillRect(
            -w * 0.35,
            -h * 0.05,
            w * 0.7,
            h * 0.5
        );

        // Ears
        ctx.fillStyle = "#267b35";

        ctx.beginPath();
        ctx.moveTo(-w * 0.3, -h * 0.3);
        ctx.lineTo(-w * 0.8, -h * 0.5);
        ctx.lineTo(-w * 0.3, -h * 0.1);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(w * 0.3, -h * 0.3);
        ctx.lineTo(w * 0.8, -h * 0.5);
        ctx.lineTo(w * 0.3, -h * 0.1);
        ctx.fill();

        drawHead("#52c75e");
        drawEyes("#ffff00");

        // Mouth and teeth
        ctx.fillStyle = "#210b0b";
        ctx.fillRect(-w * 0.18, -h * 0.12, w * 0.36, 6);

        ctx.fillStyle = "white";
        ctx.fillRect(-w * 0.12, -h * 0.12, 4, 6);
        ctx.fillRect(w * 0.08, -h * 0.12, 4, 6);
    }

    // =========================================
    // DEMON
    // =========================================

    else if (type === "demon") {

        drawLegs("#7c1010");
        drawArms("#a81717");

        // Horns
        ctx.fillStyle = "#222";

        ctx.beginPath();
        ctx.moveTo(-w * 0.3, -h * 0.45);
        ctx.lineTo(-w * 0.55, -h * 0.85);
        ctx.lineTo(-w * 0.05, -h * 0.4);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(w * 0.3, -h * 0.45);
        ctx.lineTo(w * 0.55, -h * 0.85);
        ctx.lineTo(w * 0.05, -h * 0.4);
        ctx.fill();

        // Body
        ctx.fillStyle = "#a81717";
        ctx.fillRect(-w * 0.35, -h * 0.05, w * 0.7, h * 0.5);

        drawHead("#e52d20");
        drawEyes("#ffff00");

        // Mouth
        ctx.fillStyle = "#250000";
        ctx.fillRect(-w * 0.2, -h * 0.12, w * 0.4, 7);

        // Animated tail
        ctx.strokeStyle = "#a81717";
        ctx.lineWidth = 6;

        ctx.beginPath();
        ctx.moveTo(w * 0.25, h * 0.3);
        ctx.quadraticCurveTo(
            w * 0.8,
            h * 0.6 + Math.sin(time) * 10,
            w * 0.65,
            h * 0.05
        );
        ctx.stroke();

        // Fire aura
        ctx.strokeStyle = "rgba(255,90,0,0.45)";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(
            0,
            0,
            w * 0.65 + Math.sin(time) * 4,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }

    // =========================================
    // SKELETON
    // =========================================

    else if (type === "skeleton") {

        drawLegs("#eeeecc");
        drawArms("#eeeecc");

        // Ribcage
        ctx.strokeStyle = "#eeeecc";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(0, -h * 0.05);
        ctx.lineTo(0, h * 0.35);

        for (let i = 0; i < 4; i++) {
            ctx.moveTo(-w * 0.3, h * (i * 0.09));
            ctx.quadraticCurveTo(
                0,
                h * (i * 0.09) + 8,
                w * 0.3,
                h * (i * 0.09)
            );
        }

        ctx.stroke();

        // Skull
        drawHead("#eeeecc");

        // Eye sockets
        ctx.fillStyle = "#111";

        ctx.beginPath();
        ctx.arc(-w * 0.15, -h * 0.32 + breathing, 5, 0, Math.PI * 2);
        ctx.arc(w * 0.15, -h * 0.32 + breathing, 5, 0, Math.PI * 2);
        ctx.fill();

        drawEyes("#ff2222");

        // Jaw
        ctx.strokeStyle = "#aaaa99";
        ctx.lineWidth = 3;
        ctx.strokeRect(-w * 0.15, -h * 0.12, w * 0.3, 7);
    }

    // =========================================
    // OGRE
    // =========================================

    else if (type === "ogre") {

        drawLegs("#536b20");
        drawArms("#637d26");

        // Huge muscular body
        ctx.fillStyle = "#637d26";

        ctx.beginPath();
        ctx.ellipse(
            0,
            h * 0.15,
            w * 0.52,
            h * 0.42 + breathing,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Head
        drawHead("#829d32", w * 0.46);

        // Tusks
        ctx.fillStyle = "#fff2c9";

        ctx.beginPath();
        ctx.moveTo(-w * 0.23, -h * 0.12);
        ctx.lineTo(-w * 0.12, h * 0.05);
        ctx.lineTo(-w * 0.05, -h * 0.12);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(w * 0.23, -h * 0.12);
        ctx.lineTo(w * 0.12, h * 0.05);
        ctx.lineTo(w * 0.05, -h * 0.12);
        ctx.fill();

        drawEyes("#ff3300");
    }

    // =========================================
    // SHADOW BEAST
    // =========================================

    else if (type === "shadow") {

        // Floating animation
        ctx.shadowColor = "#9900ff";
        ctx.shadowBlur = 20 + Math.sin(time) * 8;

        ctx.fillStyle = "#171020";

        ctx.beginPath();
        ctx.moveTo(-w * 0.4, h * 0.5);
        ctx.lineTo(-w * 0.4, -h * 0.25);
        ctx.lineTo(0, -h * 0.6 + breathing);
        ctx.lineTo(w * 0.4, -h * 0.25);
        ctx.lineTo(w * 0.4, h * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;

        // Glowing eyes
        drawEyes("#cc44ff");

        // Claws
        ctx.strokeStyle = "#9900cc";
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(-w * 0.3, h * 0.1);
        ctx.lineTo(-w * 0.55, h * 0.4 + walk);

        ctx.moveTo(w * 0.3, h * 0.1);
        ctx.lineTo(w * 0.55, h * 0.4 - walk);

        ctx.stroke();
    }

    // =========================================
    // HEALTH BAR
    // =========================================

    if (monster.showHealth !== false) {

        const percent = Math.max(
            0,
            Math.min(1, hp / maxHp)
        );

        const barY = -h * 0.6 - 12;

        ctx.fillStyle = "#440000";
        ctx.fillRect(-w / 2, barY, w, 6);

        ctx.fillStyle =
            percent > 0.5 ? "#22dd22" :
            percent > 0.25 ? "#ffaa00" :
            "#ff2222";

        ctx.fillRect(-w / 2, barY, w * percent, 6);
    }

    ctx.restore();
}



// ========================================
// STICKMAN QUEST - MONSTER DESIGNS
// ========================================



// ========================================
// MONSTER EYES
// ========================================

function drawMonsterEyes(ctx, w, eyeColor = "#ffffff") {

    ctx.fillStyle = "#111";

    ctx.beginPath();
    ctx.arc(-w * 0.15, -18, 5, 0, Math.PI * 2);
    ctx.arc(w * 0.15, -18, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = eyeColor;

    ctx.beginPath();
    ctx.arc(-w * 0.15, -18, 2.5, 0, Math.PI * 2);
    ctx.arc(w * 0.15, -18, 2.5, 0, Math.PI * 2);
    ctx.fill();
}


function getDifficulty() {
    return difficultySettings[selectedDifficulty] ||
        difficultySettings.medium;
}


const keys = { left: false, right: false };

const player = {
    character: "Knight",
    characterOwned: ["Knight"],

    x: 40, y: 400,
    width: 20, height: 46,
    vx: 0, vy: 0,

    speed: 1.5,
    jumpForce: 8,
    grounded: false,
    jumpsUsed: 0,
    maxJumps: 2,

    hp: 100,
    maxHp: 100,
    damage: 25,

    hasBow: false,
    hasPickedUpSword: false,
    equippedWeapon: "melee",

    facing: "right",
    animCycle: 0,

    isAttacking: false,
    attackTimer: 0,
    shootCooldown: 0,

    abilityCooldown: 0,
    abilityActive: 0,
    shieldActive: false,
    isDashing: false,

    invulnerability: 0,
};

// ============================================
// CHARACTER INFORMATION
// ============================================

const characterShop = {
    Knight: {
        price: 0,
        speed: 0.8,
        damage: 25,
        maxHp: 100,
        description: "A balanced warrior wearing silver armor and a blue cape.",
        ability: "Shield Bash: Blocks incoming damage temporarily.",
        body: "#2677cc",
        head: "#dddddd",
        accent: "#ffcc00"
    },

    Rogue: {
        price: 100,
        speed: 1.1,
        damage: 35,
        maxHp: 100,
        description: "A mysterious assassin wearing a dark hood and red scarf.",
        ability: "Shadow Dash: Dashes quickly through enemies.",
        body: "#222222",
        head: "#991111",
        accent: "#ff3333"
    },

    Mage: {
        price: 175,
        speed: 0.8,
        damage: 45,
        maxHp: 110,
        description: "A powerful wizard wearing purple robes and carrying a magical staff.",
        ability: "Arcane Blast: Fires a powerful magical projectile.",
        body: "#7722cc",
        head: "#bb99ff",
        accent: "#00ccff"
    },

    Robot: {
        price: 250,
        speed: 0.6,
        damage: 35,
        maxHp: 200,
        description: "A heavily armored machine built to survive dangerous battles.",
        ability: "Repair Mode: Restores health and activates a protective shield.",
        body: "#888888",
        head: "#cccccc",
        accent: "#00ffff"
    },

    "Shadow Ninja": {
        price: 400,
        speed: 1.2,
        damage: 60,
        maxHp: 130,
        description: "A legendary ninja surrounded by mysterious purple energy.",
        ability: "Shadow Clone: Damages nearby enemies with shadow attacks.",
        body: "#171020",
        head: "#440088",
        accent: "#cc00ff"
    }
};

// ============================================
// WORLD OBJECTS
// ============================================

let platforms = [];
let movingPlatforms = [];
let spikes = [];
let monsters = [];
let arrows = [];
let hazards = [];
let specialObstacles = [];
let lasers = [];
let crushers = [];

let boss = null;
let swordPickup = null;

const portal = {
    x: 730, y: 470,
    width: 45, height: 70
};

let checkpoint = null;

// ============================================
// HELPER FUNCTIONS
// ============================================

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function checkOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function getCharacter() {
    return characterShop[player.character] || characterShop.Knight;
}

// ============================================
// PART 2/10 - SAVING AND SHOP
// ============================================

function saveGame() {
    const data = {
        level: gameState.level,
        gold: gameState.gold,

        player: {
            character: player.character,
            characterOwned: [...player.characterOwned],
            speed: player.speed,
            damage: player.damage,
            hp: player.hp,
            maxHp: player.maxHp,
            maxJumps: player.maxJumps,
            hasBow: player.hasBow,
            hasPickedUpSword: player.hasPickedUpSword,
            equippedWeapon: player.equippedWeapon
        }
    };

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("Could not save game:", e);
    }
}

function loadSavedGame() {
    try {
        const saved = localStorage.getItem(SAVE_KEY);

        if (!saved) return;

        const data = JSON.parse(saved);

        if (!data || typeof data !== "object") return;

        gameState.level = clamp(data.level || 1, 1, 250);
        gameState.gold = data.gold ?? 200;

        const p = data.player;

        if (!p) return;

        player.characterOwned = Array.isArray(p.characterOwned)
            ? [...new Set(["Knight", ...p.characterOwned.filter(
                name => characterShop[name]
            )])]
            : ["Knight"];

        player.character = player.characterOwned.includes(p.character)
            ? p.character
            : "Knight";

        player.speed = characterShop[player.character].speed;

        player.damage = p.damage ?? 25;
        player.hp = p.hp ?? 100;
        player.maxHp = p.maxHp ?? 100;

        player.maxJumps = p.maxJumps === 3 ? 3 : 2;

        player.hasBow = p.hasBow === true;

        player.hasPickedUpSword =
            p.hasPickedUpSword === true;

        player.equippedWeapon =
            player.hasBow && p.equippedWeapon === "bow"
                ? "bow"
                : "melee";

    } catch (e) {
        console.warn("Save could not be loaded:", e);
    }
}

function purchaseItem(price, callback) {
    if (gameState.gold < price) {
        alert("Not enough gold!");
        return false;
    }

    gameState.gold -= price;
    callback();

    updateHUD();
    updateShopButtons();
    saveGame();

    return true;
}

function equipCharacter(name) {
    const c = characterShop[name];

    if (!c || !player.characterOwned.includes(name)) return;

    player.character = name;
    player.speed = c.speed;
    player.damage = c.damage;
    player.maxHp = c.maxHp;
    player.hp = Math.min(player.hp, player.maxHp);

    updateHUD();
    updateShopButtons();
    updateCharacterDescription();
    saveGame();
}

function purchaseCharacter(name) {
    const c = characterShop[name];
    if (!c) return;

    if (player.characterOwned.includes(name)) {
        equipCharacter(name);
        return;
    }

    purchaseItem(c.price, () => {
        player.characterOwned.push(name);
        equipCharacter(name);
    });
}

// Character purchase buttons
[
    ["buy-rogue", "Rogue"],
    ["buy-mage", "Mage"],
    ["buy-robot", "Robot"],
    ["buy-shadow", "Shadow Ninja"]
].forEach(([id, name]) => {
    document.getElementById(id)?.addEventListener("click", () => {
        purchaseCharacter(name);
    });
});

// Heal
document.getElementById("buy-heal")?.addEventListener("click", () => {
    if (player.hp >= player.maxHp) return;

    purchaseItem(25, () => {
        player.hp = player.maxHp;
    });
});

// Damage upgrade
document.getElementById("buy-damage")?.addEventListener("click", () => {
    purchaseItem(30, () => {
        player.damage += 15;
    });
});

// Maximum health
document.getElementById("buy-maxhp")?.addEventListener("click", () => {
    purchaseItem(40, () => {
        player.maxHp += 25;
        player.hp += 25;
    });
});

// Armor
document.getElementById("buy-armor")?.addEventListener("click", () => {
    if (player.maxHp >= 300) return;

    purchaseItem(75, () => {
        player.maxHp = 300;
        player.hp = 300;
    });
});

// Triple jump
document.getElementById("buy-triplejump")?.addEventListener("click", () => {

    if (player.maxJumps >= 3) {
        updateShopButtons();
        return;
    }

    purchaseItem(125, () => {
        player.maxJumps = 3;
    });
});


// Bow
document.getElementById("buy-archer")?.addEventListener("click", () => {

    if (player.hasBow) {
        updateShopButtons();
        return;
    }

    purchaseItem(75, () => {
        player.hasBow = true;
        player.equippedWeapon = "bow";
    });
});

// ============================================
// SHOP DISPLAY
// ============================================

function updateCharacterDescription() {
    const c = getCharacter();

    const name = document.getElementById("character-name");
    const info = document.getElementById("character-info");
    const ability = document.getElementById("character-ability");

    if (name) name.textContent = player.character;
    if (info) info.textContent = c.description;
    if (ability) ability.textContent = c.ability;
}

function updateShopButtons() {
    const upgrades = {
        "buy-triplejump": {
            owned: player.maxJumps >= 3,
            text: "Triple Jump Owned"
        },
        "buy-archer": {
            owned: player.hasBow,
            text: "Bow Owned (Press Q)"
        }
    };

    Object.entries(upgrades).forEach(([id, item]) => {
        const button = document.getElementById(id);
        if (!button) return;

        button.disabled = item.owned;

        if (item.owned) {
            button.textContent = item.text;
        }
    });

    Object.entries(characterShop).forEach(([name, c]) => {
        if (name === "Knight") return;

        const id = {
            Rogue: "buy-rogue",
            Mage: "buy-mage",
            Robot: "buy-robot",
            "Shadow Ninja": "buy-shadow"
        }[name];

        const button = document.getElementById(id);
        if (!button) return;

        const owned = player.characterOwned.includes(name);

        button.textContent = !owned
            ? `Buy ($${c.price})`
            : player.character === name
                ? "Equipped"
                : "Equip";

        button.disabled = player.character === name;
    });

    updateCharacterDescription();
}

// ============================================
// PART 3/10 - CONTROLS AND ABILITIES
// ============================================

function updateHUD() {
    const values = {
        "hud-level": gameState.level,
        "hud-hp": Math.max(0, player.hp),
        "hud-max-hp": player.maxHp,
        "hud-gold": gameState.gold,
        "shop-gold": gameState.gold,
        "hud-weapon": player.equippedWeapon === "bow" ? "Bow" : "Melee",
        "hud-character": player.character
    };

    Object.entries(values).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
}

function toggleShop() {
    if (gameState.gameOver) return;

    gameState.isPaused = !gameState.isPaused;

    document.getElementById("shop-modal")?.classList.toggle(
        "hidden",
        !gameState.isPaused
    );

    keys.left = false;
    keys.right = false;

    updateHUD();
    updateShopButtons();
}

function mobileHold(id, callback) {
    const button = document.getElementById(id);

    if (!button) return;

    button.addEventListener("pointerdown", e => {
        e.preventDefault();
        callback(true);
    });

    button.addEventListener("pointerup", e => {
        e.preventDefault();
        callback(false);
    });

    button.addEventListener("pointercancel", () => {
        callback(false);
    });

    button.addEventListener("pointerleave", () => {
        callback(false);
    });
}

mobileHold("left-btn", value => keys.left = value);
mobileHold("right-btn", value => keys.right = value);

document.getElementById("jump-btn")?.addEventListener("pointerdown", e => {
    e.preventDefault();

    if (player.jumpsUsed < player.maxJumps) {
        player.vy = -player.jumpForce;
        player.jumpsUsed++;
        player.grounded = false;
    }
});

document.getElementById("attack-btn")?.addEventListener("pointerdown", e => {
    e.preventDefault();
    triggerAttack();
});

document.getElementById("bow-btn")?.addEventListener("pointerdown", e => {
    e.preventDefault();

    if (player.hasBow) {
        player.equippedWeapon = "bow";
        triggerBowShot();
    }
});

document.getElementById("ability-btn")?.addEventListener("pointerdown", e => {
    e.preventDefault();
    activateCharacterAbility();
});

document.getElementById("shop-btn")?.addEventListener("click", toggleShop);
document.getElementById("close-shop-btn")?.addEventListener("click", toggleShop);

window.addEventListener("keydown", e => {
    if (gameState.isPaused || gameState.gameOver) return;

    if ([
        "Space", "ArrowUp", "ArrowDown",
        "ArrowLeft", "ArrowRight"
    ].includes(e.code)) {
        e.preventDefault();
    }

    if (e.code === "KeyD" || e.code === "ArrowRight") {
        keys.right = true;
        player.facing = "right";
    }

    if (e.code === "KeyA" || e.code === "ArrowLeft") {
        keys.left = true;
        player.facing = "left";
    }

    if (e.repeat) return;

    if (
        e.code === "KeyW" ||
        e.code === "Space" ||
        e.code === "ArrowUp"
    ) {
        if (player.jumpsUsed < player.maxJumps) {
    player.vy = -player.jumpForce;
    player.jumpsUsed++;
    player.grounded = false;
}
    }

    if (e.code === "KeyF" || e.code === "KeyE") {
        player.equippedWeapon = "melee";
        triggerAttack();
    }

    if (
        e.code === "KeyQ" ||
        e.code === "ShiftLeft" ||
        e.code === "ShiftRight"
    ) {
        if (player.hasBow) {
            player.equippedWeapon = "bow";
            triggerBowShot();
        }
    }

    if (e.code === "KeyR") {
        activateCharacterAbility();
    }

    updateHUD();
});

window.addEventListener("keyup", e => {
    if (e.code === "KeyD" || e.code === "ArrowRight") {
        keys.right = false;
    }

    if (e.code === "KeyA" || e.code === "ArrowLeft") {
        keys.left = false;
    }
});

window.addEventListener("blur", () => {
    keys.left = false;
    keys.right = false;
});

// ============================================
// CHARACTER SPECIAL ABILITIES
// ============================================

function activateCharacterAbility() {
    if (
        player.abilityCooldown > 0 ||
        gameState.isPaused ||
        gameState.gameOver
    ) return;

    player.abilityCooldown = 300;

    if (player.character === "Knight") {
        player.shieldActive = true;
        player.abilityActive = 120;
    }

    if (player.character === "Rogue") {
        player.isDashing = true;
        player.vx = player.facing === "right" ? 16 : -16;
        player.abilityActive = 15;
    }

    if (player.character === "Mage") {
        arrows.push({
            x: player.x + (player.facing === "right" ? 20 : -35),
            y: player.y + 18,
            width: 35,
            height: 20,
            vx: player.facing === "right" ? 15 : -15,
            damage: player.damage * 3,
            magic: true
        });
    }

    if (player.character === "Robot") {
        player.hp = Math.min(player.maxHp, player.hp + 50);
        player.shieldActive = true;
        player.abilityActive = 120;
    }

    if (player.character === "Shadow Ninja") {
        player.isDashing = true;
        player.vx = player.facing === "right" ? 18 : -18;
        player.abilityActive = 15;

        monsters.forEach(m => {
            if (Math.abs(m.x - player.x) < 160) {
                m.hp -= player.damage * 2;
            }
        });

        removeDefeatedEnemies();
    }

    updateHUD();
    saveGame();
}

function updateAbilityTimers() {
    if (player.abilityCooldown > 0) {
        player.abilityCooldown--;
    }

    if (player.abilityActive > 0) {
        player.abilityActive--;
    } else {
        player.shieldActive = false;
        player.isDashing = false;
    }
}

// ============================================
// PART 4/10 - LEVEL GENERATION
// ============================================

const environments = [
    {
        name: "Enchanted Forest",
        sky: "#315c66",
        ground: "#315b32",
        accent: "#77dd77"
    },
    {
        name: "Volcano",
        sky: "#461b24",
        ground: "#402323",
        accent: "#ff5500"
    },
    {
        name: "Ice Castle",
        sky: "#8bcce8",
        ground: "#b8eaff",
        accent: "#ffffff"
    },
    {
        name: "Robot Factory",
        sky: "#202c42",
        ground: "#454e5c",
        accent: "#00eeff"
    },
    {
        name: "Shadow Realm",
        sky: "#180e2b",
        ground: "#28143c",
        accent: "#aa44ff"
    }
];

function getEnvironment(lvl) {
    return environments[Math.floor((lvl - 1) / 50) % 5];
}

function createBoss(lvl) {
    const bosses = [
        {
            name: "Fire Demon",
            color: "#ff3300",
            hp: 1000,
            damage: 20,
            attack: "fire"
        },
        {
            name: "Skeleton King",
            color: "#dddddd",
            hp: 1300,
            damage: 25,
            attack: "skeleton"
        },
        {
            name: "Frost Titan",
            color: "#00ccff",
            hp: 1600,
            damage: 30,
            attack: "ice"
        },
        {
            name: "War Machine",
            color: "#888888",
            hp: 2300,
            damage: 35,
            attack: "laser"
        },
        {
            name: "Shadow Lord",
            color: "#9900dd",
            hp: 3000,
            damage: 65,
            attack: "shadow"
        }
    ];

    if (lvl === 250) {
        return {
            name: "THE FINAL DESTROYER",
            color: "#ff00ff",
            hp: 12000,
            maxHp: 12000,
            damage: 100,
            attack: "final",
            x: 520,
            y: 300,
            width: 100,
            height: 250,
            attackClock: 0
        };
    }

    const type = bosses[(Math.floor(lvl / 5) - 1) % 5];
    const hp = type.hp + lvl * 30;

    return {
        ...type,
        hp,
        maxHp: hp,
        x: 520,
        y: 350,
        width: 70,
        height: 200,
        attackClock: 0
    };
}

function loadLevel(lvl, respawn = false) {
    gameState.level = clamp(lvl, 1, 250);

    player.x = 40;
    player.y = 400;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
    player.jumpsUsed = 0;
    player.isAttacking = false;
    player.attackTimer = 0;
    player.abilityActive = 0;
    player.shieldActive = false;
    player.isDashing = false;

    if (respawn) {
        player.hp = player.maxHp;
    }

    keys.left = false;
    keys.right = false;

    platforms = [];
    movingPlatforms = [];
    spikes = [];
    monsters = [];
    arrows = [];
    hazards = [];
    specialObstacles = [];
    lasers = [];
    crushers = [];

    boss = null;
    swordPickup = null;

    const style = lvl % 4;
    const difficulty = Math.floor(lvl / 10);
    const bossLevel = lvl % 5 === 0;
    
    // BOSS ARENA
    if (bossLevel) {
        platforms.push(
            { x: 0, y: 550, width: 800, height: 50 },
            { x: 100, y: 410, width: 150, height: 15 },
            { x: 550, y: 410, width: 150, height: 15 }
        );

        boss = createBoss(lvl);

boss.hp = Math.round(
    boss.hp * getDifficulty().bossHealth
);

boss.maxHp = boss.hp;

        portal.x = 730;
        portal.y = 470;
    }

    // NORMAL LEVELS
    else if (style === 1) {
        platforms.push(
            { x: 0, y: 550, width: 160, height: 50 },
            { x: 260, y: 500, width: 240, height: 60 },
            { x: 590, y: 540, width: 210, height: 60 }
        );

        movingPlatforms.push({
            x: 165, y: 450,
            width: 85, height: 15,
            startX: 165, endX: 255,
            speed: 1.2 + difficulty * .05,
            dir: 1, axis: "X"
        });

        spikes.push(
            { x: 320, y: 484, width: 20, height: 16 },
            { x: 350, y: 484, width: 20, height: 16 }
        );

        portal.y = 470;

        if (lvl === 1 && !player.hasPickedUpSword) {
            swordPickup = {
                x: 110, y: 525,
                width: 25, height: 25
            };
        }
    }

    else if (style === 2) {
        platforms.push(
            { x: 0, y: 550, width: 140, height: 50 },
            { x: 200, y: 430, width: 160, height: 20 },
            { x: 440, y: 320, width: 160, height: 20 },
            { x: 660, y: 450, width: 140, height: 150 }
        );

        movingPlatforms.push({
            x: 375, y: 350,
            width: 60, height: 15,
            startY: 280, endY: 480,
            speed: 1.5, axis: "Y", dir: 1
        });

        spikes.push({
            x: 230, y: 414,
            width: 20, height: 16
        });

        portal.y = 380;
    }

    else if (style === 3) {
        platforms.push(
            { x: 0, y: 550, width: 200, height: 50 },
            { x: 280, y: 470, width: 250, height: 30 },
            { x: 280, y: 280, width: 250, height: 20 },
            { x: 610, y: 550, width: 190, height: 50 }
        );

        movingPlatforms.push({
            x: 210, y: 510,
            width: 65, height: 15,
            startX: 205, endX: 275,
            speed: 1.3, dir: 1, axis: "X"
        });

        spikes.push(
            { x: 350, y: 454, width: 20, height: 16 },
            { x: 440, y: 454, width: 20, height: 16 }
        );

        portal.y = 480;
    }

    else {
        platforms.push(
            { x: 0, y: 550, width: 120, height: 50 },
            { x: 180, y: 510, width: 120, height: 40 },
            { x: 360, y: 460, width: 120, height: 40 },
            { x: 540, y: 410, width: 120, height: 40 },
            { x: 700, y: 470, width: 100, height: 130 }
        );

        spikes.push(
            { x: 210, y: 494, width: 20, height: 16 },
            { x: 390, y: 444, width: 20, height: 16 },
            { x: 570, y: 394, width: 20, height: 16 }
        );

        portal.y = 400;
    }

    portal.x = 730;

    if (!bossLevel) {
        generateEnemies(lvl);
        generateObstacles(lvl);
    }

    if (lvl >= 6 && !bossLevel && platforms.length > 1) {
        const p = platforms[1];

        lasers.push({
            x: p.x + 10,
            y: p.y - 65,
            width: p.width - 20,
            height: 6,
            timer: 0,
            active: true
        });
    }

    if (lvl >= 11 && !bossLevel && platforms.length > 1) {
        const p = platforms[1];

        crushers.push({
            x: p.x + p.width / 2 - 22,
            y: 80,
            width: 44,
            height: 44,
            startY: 80,
            targetY: p.y - 44,
            state: "idle",
            timer: 0
        });
    }

    checkpoint = {
        level: lvl,
        gold: gameState.gold
    };

    updateHUD();
    updateShopButtons();
    saveGame();
}

// ============================================
// PART 5/10 - ENEMY SYSTEM
// ============================================

const enemyTypes = {
    slime: {
        hp: 35, speed: 1.2, damage: 8,
        reward: 10, color: "#72e34b"
    },
    skeleton: {
        hp: 65, speed: 1.7, damage: 15,
        reward: 20, color: "#eeeecc"
    },
    bat: {
        hp: 25, speed: 2.5, damage: 8,
        reward: 15, color: "#9933cc"
    },
    archer: {
        hp: 40, speed: .8, damage: 12,
        reward: 20, color: "#aa6622"
    },
    ghost: {
        hp: 50, speed: 1.8, damage: 15,
        reward: 25, color: "#99ddff"
    },
    demon: {
        hp: 100, speed: 1.4, damage: 25,
        reward: 35, color: "#ff4422"
    },
    golem: {
        hp: 180, speed: .6, damage: 30,
        reward: 50, color: "#777777"
    },
    darkKnight: {
        hp: 140, speed: 1.5, damage: 25,
        reward: 45, color: "#552277"
    }
};

function createEnemy(type, x, y) {
    const d = enemyTypes[type];
    const hp = Math.round(
    (d.hp + gameState.level * 2) *
    getDifficulty().enemyHealth
);

    return {
        type,
        x, y,
        width: type === "golem" ? 38 : 26,
        height: type === "golem" ? 48 : 32,
        hp,
        maxHp: hp,
        speed: d.speed + gameState.level * .003,
        damage: Math.round(
    d.damage * getDifficulty().enemyDamage
),
        reward: d.reward,
        minX: Math.max(0, x - 60),
        maxX: Math.min(770, x + 60),
        dir: 1,
        attackCooldown: random(20, 90),
        floatOffset: random(0, 6),
        flash: 0
    };
}

function generateEnemies(lvl) {
    const types = Object.keys(enemyTypes);
    const count = Math.min(5, 1 + Math.floor(lvl / 8));

    for (let i = 0; i < count; i++) {
        const type = types[(lvl + i * 3) % types.length];

        const x = 300 + i * 85;
        monsters.push(createEnemy(type, x, 500 - (i % 2) * 25));
    }
}

function removeDefeatedEnemies() {
    for (let i = monsters.length - 1; i >= 0; i--) {
        if (monsters[i].hp <= 0) {
            gameState.gold += monsters[i].reward;
            monsters.splice(i, 1);
        }
    }

    updateHUD();
}

function updateMonsters() {
    for (const m of monsters) {
        const distance = player.x - m.x;

        if (m.type === "bat") {
            m.floatOffset += .07;
            m.y += Math.sin(m.floatOffset) * 1.5;
            m.x += Math.sign(distance) * m.speed;
        }

        else if (
            ["skeleton", "darkKnight", "ghost", "demon"].includes(m.type)
        ) {
            m.dir = distance >= 0 ? 1 : -1;

            if (Math.abs(distance) > 32) {
                m.x += m.speed * m.dir;
            }
        }

        else {
            m.x += m.speed * m.dir;

            if (m.x < m.minX || m.x > m.maxX) {
                m.dir *= -1;
            }
        }

        if (m.type === "archer" && m.attackCooldown <= 0) {
            if (Math.abs(distance) < 350) {
                arrows.push({
                    x: m.x,
                    y: m.y + 15,
                    width: 12,
                    height: 5,
                    vx: distance > 0 ? 5 : -5,
                    damage: m.damage,
                    enemyArrow: true
                });

                m.attackCooldown = 100;
            }
        }

        if (m.attackCooldown > 0) {
            m.attackCooldown--;
        }

        if (m.flash > 0) m.flash--;

        if (checkOverlap(player, m)) {
            damagePlayer(m.damage);

            if (!gameState.gameOver) {
                player.vy = -4.5;
                player.vx = m.dir * 3.5;
            }
        }
    }

    removeDefeatedEnemies();
}

// ============================================
// ENEMY RENDERING
// ============================================

function drawEnemies() {
    monsters.forEach(m => {
        const data = enemyTypes[m.type];

        ctx.fillStyle = m.flash > 0 ? "#ffffff" : data.color;

        ctx.fillRect(m.x, m.y, m.width, m.height);

        ctx.fillStyle = "#111111";
        ctx.fillRect(m.x + 5, m.y + 8, 4, 4);
        ctx.fillRect(m.x + m.width - 9, m.y + 8, 4, 4);

        if (m.type === "skeleton") {
            ctx.fillStyle = "#333333";
            ctx.fillRect(m.x + 5, m.y + 19, 16, 3);
        }

        if (m.type === "demon") {
            ctx.fillStyle = "#ffcc00";
            ctx.fillRect(m.x + 4, m.y - 5, 5, 8);
            ctx.fillRect(m.x + 18, m.y - 5, 5, 8);
        }

        if (m.type === "golem") {
            ctx.strokeStyle = "#444444";
            ctx.lineWidth = 3;
            ctx.strokeRect(m.x, m.y, m.width, m.height);
        }

        // Enemy health bar
        ctx.fillStyle = "#222222";
        ctx.fillRect(m.x - 2, m.y - 8, m.width + 4, 4);

        ctx.fillStyle = "#ff3333";
        ctx.fillRect(
            m.x - 2,
            m.y - 8,
            (m.width + 4) * clamp(m.hp / m.maxHp, 0, 1),
            4
        );
    });
}

// ============================================
// PART 6/10 - OBSTACLE SYSTEM
// ============================================

function generateObstacles(lvl) {

    // Find a suitable platform for an obstacle
    function findObstaclePosition(width, height, preferredX = 300) {

        const candidates = platforms.filter(p => {
            return (
                p.width >= width + 20 &&
                p.y >= height + 20 &&
                p.y <= 550
            );
        });

        if (candidates.length === 0) return null;

        candidates.sort((a, b) => {
            return (
                Math.abs((a.x + a.width / 2) - preferredX) -
                Math.abs((b.x + b.width / 2) - preferredX)
            );
        });

        const p = candidates[0];

        return {
            x: clamp(
                preferredX - width / 2,
                p.x + 5,
                p.x + p.width - width - 5
            ),
            y: p.y - height,
            width,
            height
        };
    }

    // Level 6+: Moving saw
    if (lvl >= 6) {
        const pos = findObstaclePosition(35, 35, 380);

        if (pos) {
            specialObstacles.push({
                type: "saw",
                ...pos,
                startX: pos.x - 35,
                endX: pos.x + 65,
                speed: 2,
                dir: 1,
                damage: 20
            });
        }
    }

    // Level 12+: Fire
    if (lvl >= 12) {
        const pos = findObstaclePosition(55, 20, 450);

        if (pos) {
            specialObstacles.push({
                type: "fire",
                ...pos,
                timer: 0,
                active: true,
                damage: 15
            });
        }
    }

    // Level 18+: Acid
    if (lvl >= 18) {
        const pos = findObstaclePosition(65, 10, 520);

        if (pos) {
            specialObstacles.push({
                type: "acid",
                ...pos,
                damage: 20
            });
        }
    }

    // Level 25+: Falling boulder
    if (lvl >= 25) {
        const pos = findObstaclePosition(40, 40, 620);

        if (pos) {
            specialObstacles.push({
                type: "boulder",
                ...pos,
                y: -60,
                startY: -60,
                speed: 4,
                triggered: false,
                damage: 25
            });
        }
    }

    // Level 35+: Electric trap
    if (lvl >= 35) {
        const pos = findObstaclePosition(100, 10, 180);

        if (pos) {
            specialObstacles.push({
                type: "electric",
                ...pos,
                timer: 0,
                active: false,
                damage: 20
            });
        }
    }

    // Level 50+: Disappearing platform
    if (lvl >= 50) {
        const pos = findObstaclePosition(100, 15, 360);

        if (pos) {
            specialObstacles.push({
                type: "disappear",
                ...pos,
                timer: 0,
                active: true,
                damage: 0
            });
        }
    }
}


function updateSpecialObstacles() {
    for (const o of specialObstacles) {
        if (o.type === "saw") {
            o.x += o.speed * o.dir;

            if (o.x >= o.endX || o.x <= o.startX) {
                o.dir *= -1;
            }
        }

        if (o.type === "fire" || o.type === "electric") {
            o.timer++;

            if (o.timer >= 100) {
                o.active = !o.active;
                o.timer = 0;
            }
        }

        if (o.type === "boulder") {
            if (!o.triggered && Math.abs(player.x - o.x) < 80) {
                o.triggered = true;
            }

            if (o.triggered) {
                o.y += o.speed;

                if (o.y > canvas.height) {
                    o.y = o.startY;
                    o.triggered = false;
                }
            }
        }

        if (o.type === "disappear") {
            o.timer++;

            if (o.timer > 120) {
                o.active = !o.active;
                o.timer = 0;
            }
        }

        const dangerous =
            o.type === "saw" ||
            o.type === "acid" ||
            (o.type === "fire" && o.active) ||
            (o.type === "electric" && o.active) ||
            (o.type === "boulder" && o.triggered);

        if (dangerous && checkOverlap(player, o)) {
            damagePlayer(o.damage);
            if (gameState.gameOver) return;
        }
    }
}

function drawSpecialObstacles() {
    specialObstacles.forEach(o => {
        if (o.type === "saw") {
            ctx.fillStyle = "#999999";
            ctx.beginPath();
            ctx.arc(o.x + 17, o.y + 17, 17, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#eeeeee";
            ctx.lineWidth = 3;

            for (let i = 0; i < 8; i++) {
                const a = i * Math.PI / 4;

                ctx.beginPath();
                ctx.moveTo(o.x + 17, o.y + 17);
                ctx.lineTo(
                    o.x + 17 + Math.cos(a) * 17,
                    o.y + 17 + Math.sin(a) * 17
                );
                ctx.stroke();
            }
        }

        if (o.type === "fire") {
            ctx.fillStyle = o.active ? "#ff4400" : "#553322";
            ctx.fillRect(o.x, o.y, o.width, o.height);
        }

        if (o.type === "acid") {
            ctx.fillStyle = "#66ff00";
            ctx.fillRect(o.x, o.y, o.width, o.height);
        }

        if (o.type === "boulder" && o.triggered) {
            ctx.fillStyle = "#777777";
            ctx.beginPath();
            ctx.arc(o.x + 20, o.y + 20, 20, 0, Math.PI * 2);
            ctx.fill();
        }

        if (o.type === "electric") {
            ctx.fillStyle = o.active ? "#00ffff" : "#334455";
            ctx.fillRect(o.x, o.y, o.width, o.height);
        }

        if (o.type === "disappear" && o.active) {
            ctx.fillStyle = "#bb66ff";
            ctx.fillRect(o.x, o.y, o.width, o.height);
        }
    });
}

// ============================================
// LASERS AND CRUSHERS
// ============================================

function updateLasers() {
    lasers.forEach(l => {
        l.timer++;

        if (l.timer > 90) {
            l.active = !l.active;
            l.timer = 0;
        }

        if (l.active && checkOverlap(player, l)) {
            executeRespawnReset();
        }
    });
}

function updateCrushers() {
    crushers.forEach(c => {
        if (c.state === "idle") {
            c.timer++;

            if (c.timer > 80) {
                c.state = "dropping";
            }
        }

        else if (c.state === "dropping") {
            c.y += 5;

            if (c.y >= c.targetY) {
                c.y = c.targetY;
                c.state = "grounded";
                c.timer = 0;
            }
        }

        else if (c.state === "grounded") {
            c.timer++;

            if (c.timer > 40) {
                c.state = "rising";
            }
        }

        else if (c.state === "rising") {
            c.y -= 1.5;

            if (c.y <= c.startY) {
                c.y = c.startY;
                c.state = "idle";
                c.timer = 0;
            }
        }

        if (c.state !== "dropping") {
            matchPlatformCollision(player, c);
        }

        if (
            c.state === "dropping" &&
            checkOverlap(player, c)
        ) {
            executeRespawnReset();
        }
    });
}

// ============================================
// PART 7/10 - COMBAT SYSTEM
// ============================================

function matchPlatformCollision(actor, box) {
    if (!checkOverlap(actor, box)) return;

    const dx = Math.min(
        actor.x + actor.width,
        box.x + box.width
    ) - Math.max(actor.x, box.x);

    const dy = Math.min(
        actor.y + actor.height,
        box.y + box.height
    ) - Math.max(actor.y, box.y);

    if (dx < dy) {
        if (actor.x + actor.width / 2 < box.x + box.width / 2) {
            actor.x -= dx;
        } else {
            actor.x += dx;
        }
    } else {
        if (actor.y + actor.height / 2 < box.y + box.height / 2) {
            actor.y -= dy;
            actor.vy = 0;

            if (actor === player) {
                player.grounded = true;
                player.jumpsUsed = 0;
            }
        } else {
            actor.y += dy;
            actor.vy = 0;
        }
    }
}

function triggerAttack() {
    if (player.isAttacking) return;

    player.isAttacking = true;
    player.attackTimer = 12;

    const reach = player.hasPickedUpSword ? 80 : 45;

    const hitbox = {
        x: player.facing === "right"
            ? player.x + player.width
            : player.x - reach,
        y: player.y,
        width: reach,
        height: player.height
    };

    monsters.forEach(m => {
        if (checkOverlap(hitbox, m)) {
            m.hp -= player.damage;
            m.flash = 5;
        }
    });

    if (boss && checkOverlap(hitbox, boss)) {
        boss.hp -= player.damage;

        if (boss.hp <= 0) {
            defeatBoss();
        }
    }

    removeDefeatedEnemies();
    updateHUD();
    saveGame();
}

function triggerBowShot() {
    if (!player.hasBow || player.shootCooldown > 0) return;

    player.shootCooldown = 22;

    const direction = player.facing === "right" ? 1 : -1;

    arrows.push({
        x: player.x + (direction > 0 ? 20 : -18),
        y: player.y + 18,
        width: 18,
        height: 5,
        vx: direction * 11,
        damage: Math.max(20, Math.round(player.damage * .8)),
        enemyArrow: false
    });
}

function updateArrows() {
    for (let i = arrows.length - 1; i >= 0; i--) {
        const a = arrows[i];

        a.x += a.vx;

        let hit = false;

        if (a.x < -30 || a.x > canvas.width + 30) {
            hit = true;
        }

        for (const p of platforms) {
            if (checkOverlap(a, p)) {
                hit = true;
                break;
            }
        }

        if (!hit && a.enemyArrow) {
            if (checkOverlap(a, player)) {
                damagePlayer(a.damage);
                hit = true;
            }
        }

        else if (!hit) {
            for (const m of monsters) {
                if (checkOverlap(a, m)) {
                    m.hp -= a.damage;
                    m.flash = 5;
                    hit = true;
                    break;
                }
            }

            if (!hit && boss && checkOverlap(a, boss)) {
                boss.hp -= a.damage;
                hit = true;

                if (boss.hp <= 0) {
                    defeatBoss();
                }
            }
        }

        if (hit) arrows.splice(i, 1);
    }

    removeDefeatedEnemies();
}

function updateSwordPickup() {
    if (!swordPickup) return;

    if (checkOverlap(player, swordPickup)) {
        player.hasPickedUpSword = true;
        player.damage += 50;
        player.equippedWeapon = "melee";

        swordPickup = null;

        updateHUD();
        saveGame();
    }
}

// ============================================
// PLAYER DAMAGE
// ============================================

function damagePlayer(amount) {

    if (
        gameState.gameOver ||
        player.shieldActive ||
        player.invulnerability > 0
    ) return;

    player.hp -= Math.round(
        amount * getDifficulty().enemyDamage
    );

    player.damageFlashTimer = 15;

    // Temporary invulnerability
    player.invulnerability = 45;

    if (player.hp <= 0) {
        player.hp = 0;
        triggerDefeat();
    }

    updateHUD();
    saveGame();
}

// ============================================
// MOVING PLATFORMS
// ============================================

function updateMovingPlatforms() {
    movingPlatforms.forEach(mp => {
        const step = mp.speed * mp.dir;

        if (mp.axis === "X") {
            mp.x += step;

            if (mp.x > mp.endX || mp.x < mp.startX) {
                mp.dir *= -1;
            }
        } else {
            mp.y += step;

            if (mp.y > mp.endY || mp.y < mp.startY) {
                mp.dir *= -1;
            }
        }

        if (
            player.x + player.width > mp.x &&
            player.x < mp.x + mp.width &&
            player.y + player.height <= mp.y + 14 &&
            player.y + player.height >= mp.y &&
            player.vy >= 0
        ) {
            player.y = mp.y - player.height;
            player.vy = 0;
            player.grounded = true;
            player.jumpsUsed = 0;

            if (mp.axis === "X") {
                player.x += step;
            }
        }
    });
}

// ============================================
// PART 8/10 - BOSS SYSTEM
// ============================================

function defeatBoss() {
    if (!boss) return;

    gameState.gold += boss.attack === "final" ? 1000 : 50;
    boss = null;
    hazards = [];

    updateHUD();
    saveGame();
}

function updateBoss() {
    if (!boss) return;

    boss.attackClock++;

    if (checkOverlap(player, boss)) {
        damagePlayer(2);
    }

    const clock = boss.attackClock;

    if (clock % 110 === 0) {
        hazards.push({
            type: boss.attack === "ice" ? "ice" : "fire",
            x: clamp(player.x, 0, 760),
            y: 520,
            width: 35,
            height: 30,
            delay: 40,
            damage: boss.damage
        });
    }

    if (clock % 170 === 0) {
        hazards.push({
            type: "anvil",
            x: clamp(player.x, 0, 750),
            y: -40,
            width: 40,
            height: 40,
            vy: 5,
            damage: boss.damage
        });
    }

    if (boss.attack === "laser" && clock % 140 === 0) {
        hazards.push({
            type: "laser",
            x: 0,
            y: 400,
            width: 800,
            height: 8,
            delay: 35,
            damage: boss.damage
        });
    }

    if (boss.attack === "shadow" && clock % 200 === 0) {
        hazards.push({
            type: "shadow",
            x: random(0, 760),
            y: 500,
            width: 40,
            height: 50,
            delay: 20,
            damage: boss.damage
        });
    }

    if (boss.attack === "final" && clock % 90 === 0) {
        hazards.push({
            type: "anvil",
            x: random(0, 760),
            y: -50,
            width: 50,
            height: 50,
            vy: 7,
            damage: 45
        });
    }

    updateBossHazards();
}

function updateBossHazards() {
    for (let i = hazards.length - 1; i >= 0; i--) {
        const h = hazards[i];

        if (h.type === "anvil") {
            h.y += h.vy;
        } else if (h.delay > 0) {
            h.delay--;
        }

        if (h.delay === 0 || h.type === "anvil") {
            if (checkOverlap(player, h)) {
                damagePlayer(h.damage);
                hazards.splice(i, 1);

                if (gameState.gameOver) return;
                continue;
            }
        }

        if (h.y > canvas.height + 50) {
            hazards.splice(i, 1);
        }
    }
}

// ============================================
// BOSS RENDERING
// ============================================

function drawBoss() {
    if (!boss) return;

    const bx = boss.x + boss.width / 2;
    const by = boss.y;

    ctx.fillStyle = boss.color;
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(bx, by + 30, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(bx - 12, by + 25, 7, 7);
    ctx.fillRect(bx + 5, by + 25, 7, 7);

    // Body
    ctx.strokeStyle = boss.color;
    ctx.lineWidth = 12;

    ctx.beginPath();
    ctx.moveTo(bx, by + 55);
    ctx.lineTo(bx, by + 135);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(bx, by + 75);
    ctx.lineTo(bx - 35, by + 115);
    ctx.moveTo(bx, by + 75);
    ctx.lineTo(bx + 35, by + 115);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(bx, by + 135);
    ctx.lineTo(bx - 25, by + 195);
    ctx.moveTo(bx, by + 135);
    ctx.lineTo(bx + 25, by + 195);
    ctx.stroke();

    // Boss name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(boss.name, bx, by - 28);

    // Boss health
    ctx.fillStyle = "#111111";
    ctx.fillRect(340, 65, 350, 12);

    ctx.fillStyle = "#ff0033";
    ctx.fillRect(
        340, 65,
        350 * clamp(boss.hp / boss.maxHp, 0, 1),
        12
    );

    ctx.textAlign = "left";
}

// ============================================
// HAZARD RENDERING
// ============================================

function drawBossHazards() {
    hazards.forEach(h => {
        ctx.fillStyle =
            h.type === "ice" ? "#00ddff" :
            h.type === "laser" ? "#ff0000" :
            h.type === "shadow" ? "#9900ff" :
            h.type === "anvil" ? "#777777" :
            "#ff4400";

        ctx.fillRect(h.x, h.y, h.width, h.height);
    });
}

// ============================================
// PORTAL AND LEVEL COMPLETION
// ============================================

function updatePortal() {
    if (boss || !checkOverlap(player, portal)) return;

    if (gameState.level >= 250) {
        triggerGameVictory();
        return;
    }

    gameState.level++;
    loadLevel(gameState.level);
}

function triggerDefeat() {
    gameState.gameOver = true;
    saveGame();

    const title = document.getElementById("overlay-title");
    const desc = document.getElementById("overlay-desc");

    if (title) title.textContent = "GAME OVER";
    if (desc) desc.textContent = "Haha you died";

    document.getElementById("screen-overlay")?.classList.remove("hidden");
}

function triggerGameVictory() {
    gameState.gameOver = true;
    gameState.victory = true;

    saveGame();

    const title = document.getElementById("overlay-title");
    const desc = document.getElementById("overlay-desc");

    if (title) title.textContent = "VICTORY!";
    if (desc) desc.textContent =
        "You defeated the Final Destroyer and conquered all 250 levels!";

    document.getElementById("screen-overlay")?.classList.remove("hidden");
}

function resetToCheckpoint() {
    gameState.gameOver = false;
    gameState.victory = false;

    document.getElementById("screen-overlay")?.classList.add("hidden");

    loadLevel(gameState.level, true);
    updateHUD();
}

document.getElementById("restart-btn")?.addEventListener(
    "click",
    resetToCheckpoint
);
loadLevel(1);

updateHUD();
updateShopButtons();

saveGame();
// ============================================
// RESTART GAME BUTTON
// ============================================

document.getElementById("restart-game-btn")?.addEventListener("click", () => {
    if (!confirm("Are you sure you want to restart? All progress will be lost.")) {
        return;
    }

    // Reset saved progress
    localStorage.removeItem(SAVE_KEY);

    // Reset game state
    gameState.level = 1;
    gameState.gold = 200;
    gameState.isPaused = false;
    gameState.gameOver = false;
    gameState.victory = false;
    gameState.frame = 0;

    // Reset player
    Object.assign(player, {
        character: "Knight",
        characterOwned: ["Knight"],
        x: 40,
        y: 400,
        vx: 0,
        vy: 0,
        speed: 0.8,
        jumpForce: 8,
        grounded: false,
        jumpsUsed: 0,
        maxJumps: 2,
        hp: 100,
        maxHp: 100,
        damage: 25,
        hasBow: false,
        hasPickedUpSword: false,
        equippedWeapon: "melee",
        facing: "right",
        animCycle: 0,
        isAttacking: false,
        attackTimer: 0,
        shootCooldown: 0,
        abilityCooldown: 0,
        abilityActive: 0,
        shieldActive: false,
        isDashing: false,
        damageFlashTimer: 0
    });

    // Close shop and game-over screens
    document.getElementById("shop-modal")?.classList.add("hidden");
    document.getElementById("screen-overlay")?.classList.add("hidden");

    keys.left = false;
    keys.right = false;

    // Start a fresh game
    loadLevel(1);

    updateHUD();
    updateShopButtons();
    
    saveGame();
});

// ============================================
// PART 9/10 - PHYSICS AND GAME UPDATE
// ============================================

function updateMovingMonsters() {
    monsters.forEach(m => {
        // Keep enemies inside the game world
        m.x = clamp(m.x, 0, canvas.width - m.width);
    });
}

function updatePhysics() {
    if (gameState.isPaused || gameState.gameOver) return;

    gameState.frame++;
    if (player.invulnerability > 0) {
    player.invulnerability--;
}

    // Horizontal movement
    if (player.isDashing) {
        player.x += player.vx;
    }

    else if (keys.right) {
    player.vx = player.speed * 2.5;
    player.facing = "right";
    player.animCycle += 0.08;
}

else if (keys.left) {
    player.vx = -player.speed * 2.5;
    player.facing = "left";
    player.animCycle += 0.08;
}

    else {
        player.vx = 0;
    }

    if (!player.isDashing) {
        player.x += player.vx;
    }

// ============================================
// SMOOTH JUMPING PHYSICS
// ============================================

const gravity = 0.22;
const maxFallSpeed = 5.5;

// Apply gravity smoothly
player.vy += gravity;

// Limit falling speed
player.vy = Math.min(player.vy, maxFallSpeed);

// Move player vertically
player.y += player.vy;

    // Screen boundaries
    player.x = clamp(
        player.x,
        0,
        canvas.width - player.width
    );

    // Grounding
    player.grounded = false;

    // Static platforms
    platforms.forEach(p => {

    const disappearing = specialObstacles.some(o =>
        o.type === "disappear" &&
        o.active &&
        checkOverlap(o, p)
    );

    if (!disappearing) {
        matchPlatformCollision(player, p);
    }
});

    // Moving platforms
    updateMovingPlatforms();

    // Pickups and projectiles
    updateSwordPickup();
    updateArrows();

    // Environmental hazards
    updateLasers();

    if (gameState.gameOver) return;

    updateCrushers();

    if (gameState.gameOver) return;

    updateSpecialObstacles();

    if (gameState.gameOver) return;

    // Falling out of world
    if (player.y > canvas.height) {
        executeRespawnReset();
        return;
    }

    // Static spikes
    for (const s of spikes) {
        if (checkOverlap(player, s)) {
            executeRespawnReset();
            return;
        }
    }

    // Enemies
    updateMonsters();
    updateMovingMonsters();

    if (gameState.gameOver) return;

    // Boss
    updateBoss();

    if (gameState.gameOver) return;

    // Portal
    updatePortal();

    // Timers
    updateAbilityTimers();

    if (player.attackTimer > 0) {
        player.attackTimer--;
    } else {
        player.isAttacking = false;
    }

    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    }

    if (player.damageFlashTimer > 0) {
        player.damageFlashTimer--;
    }
}

// ============================================
// RESPAWNING
// ============================================

function executeRespawnReset() {
    if (gameState.gameOver) return;

    player.hp--;

    if (player.hp <= 0) {
        player.hp = 0;
        triggerDefeat();
        return;
    }

    saveGame();
    loadLevel(gameState.level, true);
}

// ============================================
// PLATFORM RENDERING
// ============================================

function drawPlatforms() {
    const env = getEnvironment(gameState.level);

    platforms.forEach(p => {
        ctx.fillStyle = env.ground;
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.fillStyle = env.accent;
        ctx.fillRect(p.x, p.y, p.width, 5);

        ctx.strokeStyle = "rgba(0,0,0,.3)";
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.width, p.height);
    });

    movingPlatforms.forEach(p => {
        ctx.fillStyle = "#3366cc";
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.fillStyle = "#77ccff";
        ctx.fillRect(p.x, p.y, p.width, 4);
    });
}

// ============================================
// ENVIRONMENT BACKGROUND
// ============================================

function drawBackground() {
    ctx.fillStyle = "#4fbbfa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSpikes() {
    ctx.fillStyle = "#cc0000";

    spikes.forEach(s => {
        ctx.beginPath();

        ctx.moveTo(s.x, s.y + s.height);
        ctx.lineTo(s.x + s.width / 2, s.y);
        ctx.lineTo(s.x + s.width, s.y + s.height);

        ctx.closePath();
        ctx.fill();
    });
}

function drawPortal() {
    if (boss) return;

    ctx.fillStyle = "#00cc99";
    ctx.fillRect(
        portal.x, portal.y,
        portal.width, portal.height
    );

    ctx.strokeStyle = "#aaffee";
    ctx.lineWidth = 3;
    ctx.strokeRect(
        portal.x + 5,
        portal.y + 5,
        portal.width - 10,
        portal.height - 10
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("EXIT", portal.x + 22, portal.y - 8);
    ctx.textAlign = "left";
}

// ============================================
// LASER AND CRUSHER DRAWING
// ============================================

function drawLasersAndCrushers() {
    lasers.forEach(l => {
        if (!l.active) return;

        ctx.fillStyle = "#ff3300";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 12;

        ctx.fillRect(l.x, l.y, l.width, l.height);

        ctx.shadowBlur = 0;
    });

    crushers.forEach(c => {
        ctx.fillStyle = "#775588";
        ctx.fillRect(c.x, c.y, c.width, c.height);

        ctx.strokeStyle = "#cc99ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(c.x, c.y, c.width, c.height);
    });
}

// ============================================
// SWORD PICKUP AND ARROWS
// ============================================

function drawPickupsAndArrows() {
    if (swordPickup) {
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(
            swordPickup.x,
            swordPickup.y,
            swordPickup.width,
            swordPickup.height
        );

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
            swordPickup.x + 11,
            swordPickup.y + 4,
            3, 18
        );
    }

    arrows.forEach(a => {
        ctx.fillStyle = a.magic ? "#00ccff" : "#8b4513";
        ctx.fillRect(a.x, a.y, a.width, a.height);

        ctx.fillStyle = a.magic ? "#ffffff" : "#cccccc";
        ctx.fillRect(
            a.vx > 0 ? a.x + a.width - 3 : a.x - 2,
            a.y - 2,
            5, 8
        );
    });
}

// ============================================
// PART 10/10 - CHARACTER GRAPHICS AND STARTUP
// ============================================

// ============================================
// CHARACTER DRAWING
// ============================================

function drawPlayer() {
    const look = getCharacter();

    const midX = player.x + player.width / 2;
    const topY = player.y;

    ctx.save();

    ctx.strokeStyle =
        player.damageFlashTimer > 0
            ? "#ff0000"
            : look.body;

    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";

    // Character aura
    if (
        player.character === "Shadow Ninja" ||
        player.character === "Mage"
    ) {
        ctx.shadowColor = look.accent;
        ctx.shadowBlur = 12;
    }

    // Head
    ctx.fillStyle = look.head;

    ctx.beginPath();
    ctx.arc(midX, topY + 8, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.stroke();

    // Eyes
    ctx.fillStyle = look.accent;
    ctx.fillRect(midX - 4, topY + 6, 2, 2);
    ctx.fillRect(midX + 2, topY + 6, 2, 2);

    // Helmet
    if (player.character === "Knight") {
        ctx.fillStyle = "#aaaaaa";
        ctx.fillRect(midX - 8, topY + 1, 16, 5);

        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(midX - 3, topY - 2, 6, 3);
    }

    // Body
    ctx.shadowBlur = 0;

    ctx.strokeStyle = look.body;
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(midX, topY + 15);
    ctx.lineTo(midX, topY + 32);
    ctx.stroke();

    // Arms
    ctx.lineWidth = 3.5;

    ctx.beginPath();

    const swing = player.grounded
        ? Math.sin(player.animCycle) * 10
        : 0;

    ctx.moveTo(midX, topY + 20);
    ctx.lineTo(midX + swing, topY + 28);

    ctx.moveTo(midX, topY + 20);
    ctx.lineTo(midX - swing, topY + 28);

    ctx.stroke();

    // Legs
    ctx.beginPath();

    ctx.moveTo(midX, topY + 32);
    ctx.lineTo(midX + swing, topY + 46);

    ctx.moveTo(midX, topY + 32);
    ctx.lineTo(midX - swing, topY + 46);

    ctx.stroke();

    // Rogue scarf
    if (player.character === "Rogue") {
        ctx.strokeStyle = "#ff2222";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(midX, topY + 16);
        ctx.lineTo(midX - 15, topY + 25);
        ctx.stroke();
    }

    // Mage staff
    if (player.character === "Mage") {
        ctx.strokeStyle = "#00ccff";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(midX - 13, topY + 5);
        ctx.lineTo(midX - 13, topY + 45);
        ctx.stroke();

        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(midX - 13, topY + 4, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Robot armor
    if (player.character === "Robot") {
        ctx.fillStyle = "#555555";
        ctx.fillRect(midX - 8, topY + 17, 16, 15);

        ctx.fillStyle = "#00ffff";
        ctx.fillRect(midX - 3, topY + 21, 6, 3);
    }

    // Shadow Ninja aura
    if (player.character === "Shadow Ninja") {
        ctx.strokeStyle = "#bb00ff";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            player.x - 4,
            player.y - 4,
            player.width + 8,
            player.height + 8
        );
    }

    // Knight cape
    if (player.character === "Knight") {
        ctx.fillStyle = "#174b9c";

        ctx.beginPath();
        ctx.moveTo(midX - 4, topY + 17);
        ctx.lineTo(midX - 12, topY + 39);
        ctx.lineTo(midX + 2, topY + 34);
        ctx.fill();
    }

    // Weapon
    if (player.hasBow && player.equippedWeapon === "bow") {
        ctx.strokeStyle = "#a66a31";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(
            midX + (player.facing === "right" ? 8 : -8),
            topY + 22,
            12,
            -Math.PI / 2,
            Math.PI / 2
        );
        ctx.stroke();
    }

    else if (player.hasPickedUpSword && !player.isAttacking) {
        ctx.strokeStyle = "#ffcc00";
        ctx.lineWidth = 3;

        ctx.beginPath();

        if (player.facing === "right") {
            ctx.moveTo(midX + 8, topY + 25);
            ctx.lineTo(midX + 23, topY + 7);
        } else {
            ctx.moveTo(midX - 8, topY + 25);
            ctx.lineTo(midX - 23, topY + 7);
        }

        ctx.stroke();
    }

    // Melee attack
    if (player.isAttacking) {
        ctx.strokeStyle = "#ffcc00";
        ctx.lineWidth = 6;

        ctx.beginPath();

        ctx.moveTo(midX, topY + 20);

        ctx.lineTo(
            midX + (player.facing === "right" ? 55 : -55),
            topY + 20
        );

        ctx.stroke();
    }

    // Shield
    if (player.shieldActive) {
        ctx.strokeStyle = "#00ccff";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(midX, topY + 23, 28, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}

// ============================================
// MAIN RENDER FUNCTION
// ============================================

function renderFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawPlatforms();
    drawSpikes();

    drawSpecialObstacles();
    drawLasersAndCrushers();

    drawPickupsAndArrows();

    drawEnemies();
    drawBoss();
    drawBossHazards();

    drawPortal();
    drawPlayer();

    // Pause message
    if (gameState.isPaused) {
        ctx.fillStyle = "rgba(0,0,0,.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffcc00";
        ctx.font = "bold 32px Courier New";
        ctx.textAlign = "center";

        ctx.fillText(
            "GAME PAUSED",
            canvas.width / 2,
            canvas.height / 2
        );

        ctx.textAlign = "left";
    }

    // Ability cooldown
    if (player.abilityCooldown > 0) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Courier New";

        ctx.fillText(
            "Ability: " +
            Math.ceil(player.abilityCooldown / 60) + "s",
            15,
            canvas.height - 35
        );
    } else {
        ctx.fillStyle = "#00ff99";
        ctx.font = "bold 12px Courier New";

        ctx.fillText(
            "ABILITY READY [R]",
            15,
            canvas.height - 35
        );
    }
}

// ============================================
// GAME LOOP
// ============================================

function gameLoop() {
    updatePhysics();
    renderFrame();

    requestAnimationFrame(gameLoop);
}


// ============================================
// FIXED GAME STARTUP - SINGLE INITIALIZATION
// ============================================

// Load saved progress
loadSavedGame();

// Update interface
updateHUD();
updateShopButtons();

// Wait for the player to select difficulty
gameState.isPaused = true;

// Prepare the current level
loadLevel(gameState.level);

// Get start screen elements
const difficultySelect =
    document.getElementById("difficulty-select");

const startGameButton =
    document.getElementById("start-game-btn");

const startScreen =
    document.getElementById("start-screen");

// Difficulty selection
if (difficultySelect && startGameButton && startScreen) {

    // Keep start button disabled until difficulty is selected
    startGameButton.disabled = !difficultySelect.value;

    difficultySelect.addEventListener("change", () => {
        startGameButton.disabled =
            !difficultySettings[difficultySelect.value];
    });

    // Start game
    startGameButton.addEventListener("click", () => {

        const difficulty = difficultySelect.value;

        if (!difficultySettings[difficulty]) {
            alert("Please select a valid difficulty!");
            return;
        }

        selectedDifficulty = difficulty;

        gameState.isPaused = false;
        gameState.gameOver = false;
        gameState.victory = false;

        startScreen.classList.add("hidden");

        // Load the saved level
        loadLevel(gameState.level);

        updateHUD();
        updateShopButtons();
        saveGame();
    });

} else {
    console.error("Missing game startup HTML elements.");
}

// ============================================
// START ONLY ONE GAME LOOP
// ============================================

gameLoop();

// ============================================
// AUTOSAVE
// ============================================

setInterval(() => {
    if (!gameState.gameOver) {
        saveGame();
    }
}, 5000);

// Save when leaving
window.addEventListener("beforeunload", saveGame);

// ============================================
// END OF STICKMAN QUEST
// ============================================
