
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
    gems: 0,
    gemOwned: {},
    gemBoosts: {
        maxHp: 0,
        damage: 0,
        speed: 0,
        abilityCooldownReduction: 0,
        shopDiscount: 0
    },
    indexDiscovered: {},
    indexClaimed: {},
    defeatedInLevel: [],
    finalCutsceneShown: false,
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

// ============================================
// ORIGINAL SYNTHESIZED GAME MUSIC
// ============================================

const gameMusic = {
    context: null,
    musicVolume: 100,
    musicSpeed: 100,
    sfxVolume: 100,
    sfxEnabled: true,
    master: null,
    timer: null,
    step: 0,
    track: "exploration",
    muted: localStorage.getItem("stickmanQuestMusicMuted") === "true"
};

try {
    gameMusic.musicVolume = clamp(Number(localStorage.getItem("stickmanQuestMusicVolume") ?? 100), 0, 100);
    gameMusic.musicSpeed = clamp(Number(localStorage.getItem("stickmanQuestMusicSpeed") ?? 100), 50, 150);
    gameMusic.sfxVolume = clamp(Number(localStorage.getItem("stickmanQuestSfxVolume") ?? 100), 0, 100);
    gameMusic.sfxEnabled = localStorage.getItem("stickmanQuestSfxEnabled") !== "false";
} catch (e) {}

const musicPatterns = {
    menu: {
        tempo: 210,
        bass: [45, 45, 52, 45, 48, 48, 55, 48, 45, 45, 57, 52, 48, 55, 60, 55],
        lead: [69, 72, 76, 72, 67, 69, 72, 76, 64, 67, 69, 72, 67, 64, 60, 64],
        chord: [57, 60, 64]
    },
    exploration: {
        tempo: 185,
        bass: [36, 36, 43, 36, 34, 34, 41, 34, 36, 43, 48, 43, 39, 41, 46, 43],
        lead: [60, 64, 67, 71, 64, 67, 72, 67, 62, 65, 69, 72, 67, 69, 74, 72],
        chord: [48, 55, 60]
    },
    boss: {
        tempo: 150,
        bass: [30, 30, 37, 30, 30, 30, 41, 37, 30, 30, 34, 30, 42, 37, 34, 30],
        lead: [54, 57, 61, 66, 57, 61, 64, 61, 54, 57, 63, 66, 61, 64, 69, 66],
        chord: [42, 49, 54]
    },
    victory: {
        tempo: 170,
        bass: [48, 55, 60, 55, 53, 60, 64, 60, 48, 55, 67, 64, 60, 64, 67, 72],
        lead: [72, 76, 79, 76, 74, 79, 83, 79, 76, 81, 84, 81, 79, 83, 88, 91],
        chord: [60, 64, 67]
    },
    defeat: {
        tempo: 230,
        bass: [45, 43, 41, 38, 45, 43, 41, 36],
        lead: [57, 55, 53, 50, 53, 50, 48, 45],
        chord: [57, 53, 50]
    }
};

function midiToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
}

function initGameMusic() {
    if (gameMusic.context) {
        if (gameMusic.context.state === "suspended") {
            gameMusic.context.resume();
        }
        return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    gameMusic.context = new AudioContextClass();
    gameMusic.master = gameMusic.context.createGain();
    gameMusic.master.gain.value = gameMusic.muted ? 0 : 0.16 * (gameMusic.musicVolume / 100);
    gameMusic.master.connect(gameMusic.context.destination);

    setMusicTrack(gameMusic.track);
}

function playMusicTone(frequency, duration, type, volume, delay = 0) {
    if (!gameMusic.context || !gameMusic.master || gameMusic.muted) return;

    const start = gameMusic.context.currentTime + delay;
    const oscillator = gameMusic.context.createOscillator();
    const gain = gameMusic.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(gameMusic.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
}

function playSoundEffect(kind) {
    if (!gameMusic.context || !gameMusic.master || gameMusic.muted || !gameMusic.sfxEnabled) return;

    const effects = {
        jump: [260, 0.09, "sine", 0.12, 420],
        sword: [180, 0.10, "triangle", 0.13, 80],
        bow: [520, 0.09, "triangle", 0.10, 280],
        hit: [90, 0.08, "square", 0.10, 55],
        damage: [110, 0.16, "triangle", 0.16, 45],
        coin: [880, 0.10, "sine", 0.10, 1320],
        pickup: [440, 0.18, "sine", 0.12, 880],
        heal: [330, 0.22, "sine", 0.11, 660],
        ability: [220, 0.28, "triangle", 0.13, 660],
        victory: [523, 0.45, "triangle", 0.14, 1046],
        defeat: [220, 0.50, "triangle", 0.14, 55]
    };

    const effect = effects[kind] || effects.hit;
    const [startFrequency, duration, type, volume, endFrequency] = effect;
    const start = gameMusic.context.currentTime;
    const oscillator = gameMusic.context.createOscillator();
    const gain = gameMusic.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume * (gameMusic.sfxVolume / 100), start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(gameMusic.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
}

function playMusicDrum(kind, delay = 0) {
    if (!gameMusic.context || !gameMusic.master || gameMusic.muted) return;

    const start = gameMusic.context.currentTime + delay;
    const oscillator = gameMusic.context.createOscillator();
    const gain = gameMusic.context.createGain();

    if (kind === "kick") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(150, start);
        oscillator.frequency.exponentialRampToValueAtTime(48, start + 0.12);
        gain.gain.setValueAtTime(0.28, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
    } else {
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(kind === "snare" ? 140 : 260, start);
        gain.gain.setValueAtTime(kind === "snare" ? 0.055 : 0.035, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);
    }

    oscillator.connect(gain);
    gain.connect(gameMusic.master);
    oscillator.start(start);
    oscillator.stop(start + 0.16);
}

function setMusicTrack(track) {
    if (!musicPatterns[track]) track = "exploration";

    if (gameMusic.track === track && gameMusic.timer) return;
    gameMusic.track = track;
    gameMusic.step = 0;

    if (gameMusic.timer) {
        clearInterval(gameMusic.timer);
        gameMusic.timer = null;
    }

    if (!gameMusic.context) return;

    const pattern = musicPatterns[track];
    const interval = track === "defeat" || track === "victory"
        ? pattern.tempo
        : pattern.tempo;

    const tick = () => {
        if (gameMusic.muted) return;

        const index = gameMusic.step % pattern.bass.length;
        const beat = gameMusic.step % 4;
        const sectionStep = gameMusic.step % 32;
        const isDropBuild = sectionStep >= 12 && sectionStep <= 15;
        const isBeatDrop = sectionStep === 16;

        if (isDropBuild && track === "boss") {
            playMusicTone(midiToFrequency(pattern.lead[index]), 0.12, "triangle", 0.025);
        }

        if (isBeatDrop && track === "boss") {
            playMusicTone(midiToFrequency(pattern.bass[index] - 12), 0.30, "triangle", 0.07);
        }

        playMusicTone(midiToFrequency(pattern.bass[index]), 0.24, "triangle", track === "boss" ? 0.18 : 0.14);

        if (beat === 0 && track === "boss") {
            playMusicDrum("kick");
        } else if (beat === 2 && track === "boss") {
            playMusicDrum("snare");
        }

        playMusicTone(midiToFrequency(pattern.lead[index]), 0.18, "sine", track === "boss" ? 0.10 : 0.07);

        if (gameMusic.step % 2 === 1) {
            playMusicTone(midiToFrequency(pattern.lead[(index + 3) % pattern.lead.length]), 0.12, "triangle", 0.08);
        }

        if (gameMusic.step % 4 === 0) {
            pattern.chord.forEach((note, chordIndex) => {
                playMusicTone(midiToFrequency(note), 0.38, "triangle", 0.035, chordIndex * 0.012);
            });
        }

        if (track === "boss" && gameMusic.step % 8 === 0) {
            playMusicTone(midiToFrequency(pattern.bass[index] - 12), 0.24, "triangle", 0.07);
        }

        if (track === "victory" && gameMusic.step % 8 === 6) {
            playMusicTone(midiToFrequency(pattern.lead[index] + 12), 0.34, "sine", 0.18);
        }

        gameMusic.step++;
    };

    tick();
    const adjustedInterval = interval * (100 / gameMusic.musicSpeed);
    gameMusic.timer = setInterval(tick, adjustedInterval);
}

function applyMusicSettings() {
    if (gameMusic.context && gameMusic.master) {
        gameMusic.master.gain.setTargetAtTime(
            gameMusic.muted ? 0 : 0.16 * (gameMusic.musicVolume / 100),
            gameMusic.context.currentTime,
            0.03
        );
    }

    if (gameMusic.timer) {
        const activeTrack = gameMusic.track;
        clearInterval(gameMusic.timer);
        gameMusic.timer = null;
        setMusicTrack("__restart__");
        gameMusic.track = "__restart__";
        setMusicTrack(activeTrack);
    }
}

function setupSettingsControls() {
    const musicVolume = document.getElementById("music-volume");
    const musicVolumeValue = document.getElementById("music-volume-value");
    const musicSpeed = document.getElementById("music-speed");
    const musicSpeedValue = document.getElementById("music-speed-value");
    const sfxVolume = document.getElementById("sfx-volume");
    const sfxVolumeValue = document.getElementById("sfx-volume-value");
    const sfxToggle = document.getElementById("sfx-toggle");

    if (musicVolume) {
        musicVolume.value = gameMusic.musicVolume;
        if (musicVolumeValue) musicVolumeValue.textContent = `${gameMusic.musicVolume}%`;
        musicVolume.addEventListener("input", () => {
            gameMusic.musicVolume = Number(musicVolume.value);
            if (musicVolumeValue) musicVolumeValue.textContent = `${gameMusic.musicVolume}%`;
            localStorage.setItem("stickmanQuestMusicVolume", String(gameMusic.musicVolume));
            applyMusicSettings();
        });
    }

    if (musicSpeed) {
        musicSpeed.value = gameMusic.musicSpeed;
        if (musicSpeedValue) musicSpeedValue.textContent = `${gameMusic.musicSpeed}%`;
        musicSpeed.addEventListener("input", () => {
            gameMusic.musicSpeed = Number(musicSpeed.value);
            if (musicSpeedValue) musicSpeedValue.textContent = `${gameMusic.musicSpeed}%`;
            localStorage.setItem("stickmanQuestMusicSpeed", String(gameMusic.musicSpeed));
            applyMusicSettings();
        });
    }

    if (sfxVolume) {
        sfxVolume.value = gameMusic.sfxVolume;
        if (sfxVolumeValue) sfxVolumeValue.textContent = `${gameMusic.sfxVolume}%`;
        sfxVolume.addEventListener("input", () => {
            gameMusic.sfxVolume = Number(sfxVolume.value);
            if (sfxVolumeValue) sfxVolumeValue.textContent = `${gameMusic.sfxVolume}%`;
            localStorage.setItem("stickmanQuestSfxVolume", String(gameMusic.sfxVolume));
        });
    }

    if (sfxToggle) {
        sfxToggle.textContent = gameMusic.sfxEnabled ? "On" : "Off";
        sfxToggle.addEventListener("click", () => {
            gameMusic.sfxEnabled = !gameMusic.sfxEnabled;
            sfxToggle.textContent = gameMusic.sfxEnabled ? "On" : "Off";
            localStorage.setItem("stickmanQuestSfxEnabled", String(gameMusic.sfxEnabled));
        });
    }
}

function toggleGameMusic() {
    gameMusic.muted = !gameMusic.muted;
    localStorage.setItem("stickmanQuestMusicMuted", String(gameMusic.muted));

    if (gameMusic.context && gameMusic.master) {
        gameMusic.master.gain.setTargetAtTime(gameMusic.muted ? 0 : 0.16 * (gameMusic.musicVolume / 100), gameMusic.context.currentTime, 0.03);
    }

    const button = document.getElementById("music-toggle-btn");
    if (button) {
        button.textContent = gameMusic.muted ? "Music: Off" : "Music: On";
        button.classList.toggle("muted", gameMusic.muted);
    }
}


const keys = { left: false, right: false };

const player = {
    character: "Knight",
    characterOwned: ["Knight"],

    x: 40, y: 400,
    width: 20, height: 46,
    vx: 0, vy: 0,

    speed: 1.5,
    jumpForce: 9,
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

    
    hasHoverBoots: false,
    isHovering: false,
    hoverFuel: 100,
    maxHoverFuel: 100,
    damageFlashTimer: 0,
    landingTimer: 0

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

    Archer: {
        price: 225,
        speed: 1.0,
        damage: 38,
        maxHp: 105,
        description: "A skilled ranger wearing layered leather armor with a longbow and quiver.",
        ability: "Rapid Shot: Fires three powerful arrows in quick succession.",
        body: "#70462d",
        head: "#bd9271",
        accent: "#d8b56a"
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
    },

    Doctor: {
        price: 325,
        speed: 0.85,
        damage: 30,
        maxHp: 120,
        description: "A medical specialist in a white coat who can recover in the heat of battle.",
        ability: "Medical Pulse: Restores 40 HP and grants a temporary shield.",
        body: "#e8edf2",
        head: "#d8c3ac",
        accent: "#39d98a"
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
        gems: gameState.gems,
        gemOwned: { ...gameState.gemOwned },
        gemBoosts: { ...gameState.gemBoosts },
        indexDiscovered: { ...gameState.indexDiscovered },
        indexClaimed: { ...gameState.indexClaimed },
        defeatedInLevel: [...gameState.defeatedInLevel],
        finalCutsceneShown: gameState.finalCutsceneShown,

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
        gameState.gems = data.gems ?? 0;
        gameState.gemOwned = data.gemOwned && typeof data.gemOwned === "object"
            ? { ...data.gemOwned }
            : {};
        gameState.gemBoosts = data.gemBoosts && typeof data.gemBoosts === "object"
            ? { ...gameState.gemBoosts, ...data.gemBoosts }
            : gameState.gemBoosts;
        gameState.indexDiscovered = data.indexDiscovered && typeof data.indexDiscovered === "object"
            ? { ...data.indexDiscovered }
            : {};
        gameState.indexClaimed = data.indexClaimed && typeof data.indexClaimed === "object"
            ? { ...data.indexClaimed }
            : {};
        gameState.finalCutsceneShown = data.finalCutsceneShown === true;
        gameState.defeatedInLevel = Array.isArray(data.defeatedInLevel)
            ? [...new Set(data.defeatedInLevel)]
            : [];

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

        
        player.hasHoverBoots = p.hasHoverBoots === true;

        player.maxHoverFuel = 100;

        player.hoverFuel = clamp(
            p.hoverFuel ?? 100,
            0,
            player.maxHoverFuel
        );

        player.isHovering = false;


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
        initGameMusic();
        playSoundEffect("coin");
        player.characterOwned.push(name);
        equipCharacter(name);
    });
}

// Hover Boots
document.getElementById("buy-hoverboots")?.addEventListener("click", () => {

    if (player.hasHoverBoots) {
        updateShopButtons();
        return;
    }

    purchaseItem(200, () => {
        player.hasHoverBoots = true;
    });

});

// Character purchase buttons
[
    ["buy-rogue", "Rogue"],
    ["buy-archer-character", "Archer"],
    ["buy-mage", "Mage"],
    ["buy-robot", "Robot"],
    ["buy-shadow", "Shadow Ninja"],
    ["buy-doctor", "Doctor"]
].forEach(([id, name]) => {
    document.getElementById(id)?.addEventListener("click", () => {
        purchaseCharacter(name);
    });
});

// Heal
document.getElementById("buy-heal")?.addEventListener("click", () => {
    if (player.hp >= player.maxHp) return;

    purchaseItem(25, () => {
        initGameMusic();
        playSoundEffect("heal");
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

const gemShopItems = [
    { id: "gem-vitality-1", name: "Vitality I", price: 3, type: "Stat", description: "+25 maximum HP", effect: "maxHp" },
    { id: "gem-vitality-2", name: "Vitality II", price: 6, type: "Stat", description: "+25 maximum HP", effect: "maxHp" },
    { id: "gem-vitality-3", name: "Vitality III", price: 10, type: "Stat", description: "+50 maximum HP", effect: "maxHpLarge" },
    { id: "gem-power-1", name: "Power I", price: 3, type: "Stat", description: "+10 attack damage", effect: "damage" },
    { id: "gem-power-2", name: "Power II", price: 6, type: "Stat", description: "+15 attack damage", effect: "damageLarge" },
    { id: "gem-power-3", name: "Power III", price: 12, type: "Stat", description: "+25 attack damage", effect: "damageHuge" },
    { id: "gem-swift-1", name: "Swift Boots I", price: 4, type: "Movement", description: "+8% movement speed", effect: "speed" },
    { id: "gem-swift-2", name: "Swift Boots II", price: 8, type: "Movement", description: "+12% movement speed", effect: "speedLarge" },
    { id: "gem-hover-1", name: "Gem Hover Core", price: 10, type: "Movement", description: "+25 hover fuel", effect: "hoverFuel" },
    { id: "gem-jump-1", name: "Air Step", price: 8, type: "Movement", description: "Gain a fourth jump", effect: "extraJump" },
    { id: "gem-arc-1", name: "Ability Surge I", price: 5, type: "Ability", description: "Reduce ability cooldown by 60 frames", effect: "abilityCooldown" },
    { id: "gem-arc-2", name: "Ability Surge II", price: 10, type: "Ability", description: "Reduce ability cooldown by 90 frames", effect: "abilityCooldownLarge" },
    { id: "gem-bargain-1", name: "Merchant's Favor", price: 12, type: "Utility", description: "Lower future shop prices by 10%", effect: "shopDiscount" },
    { id: "gem-bargain-2", name: "Merchant's Blessing", price: 20, type: "Utility", description: "Lower future shop prices by 15%", effect: "shopDiscountLarge" },
    { id: "gem-revive-1", name: "Ember Heart", price: 15, type: "Defense", description: "Restore 50 HP after respawning", effect: "respawnHeal" },
    { id: "gem-shield-1", name: "Starlight Barrier", price: 9, type: "Defense", description: "+45 frames of shield duration", effect: "shieldDuration" },
    { id: "gem-armor-1", name: "Crimson Plate", price: 14, type: "Defense", description: "Reduce incoming damage by 5%", effect: "damageReduction" },
    { id: "gem-armor-2", name: "Void Plate", price: 22, type: "Defense", description: "Reduce incoming damage by 10%", effect: "damageReductionLarge" },
    { id: "gem-gold-1", name: "Golden Touch", price: 8, type: "Utility", description: "+15% gold from enemies", effect: "goldBoost" },
    { id: "gem-gold-2", name: "Treasure Sense", price: 14, type: "Utility", description: "+25% gold from enemies", effect: "goldBoostLarge" },
    { id: "gem-index-1", name: "Index Amplifier", price: 7, type: "Utility", description: "+1 gem from every Index claim", effect: "indexGemBonus" },
    { id: "gem-bow-1", name: "Quiver Expansion", price: 6, type: "Combat", description: "Arrows deal 10 more damage", effect: "bowDamage" },
    { id: "gem-bow-2", name: "Piercing Arrows", price: 13, type: "Combat", description: "Arrows pierce one extra enemy", effect: "bowPiercing" },
    { id: "gem-sword-1", name: "Swordfire", price: 8, type: "Combat", description: "Sword attacks leave a flame trail", effect: "swordFire" },
    { id: "gem-sword-2", name: "Moon Blade", price: 16, type: "Combat", description: "Sword attacks hit 20% wider", effect: "swordRange" },
    { id: "gem-heal-1", name: "Healing Spark", price: 9, type: "Ability", description: "Healing effects restore 10 extra HP", effect: "healBonus" },
    { id: "gem-magnet-1", name: "Gem Magnet", price: 11, type: "Utility", description: "Automatically attract nearby pickups", effect: "pickupMagnet" },
    { id: "gem-night-1", name: "Night Eyes", price: 5, type: "Visual", description: "Enemies reveal faint outlines", effect: "enemyOutline" },
    { id: "gem-aura-1", name: "Azure Aura", price: 4, type: "Cosmetic", description: "Adds an azure aura to your character", effect: "auraBlue" },
    { id: "gem-aura-2", name: "Crimson Aura", price: 4, type: "Cosmetic", description: "Adds a crimson aura to your character", effect: "auraRed" },
    { id: "gem-aura-3", name: "Golden Aura", price: 6, type: "Cosmetic", description: "Adds a golden aura to your character", effect: "auraGold" },
    { id: "gem-trail-1", name: "Shadow Trail", price: 7, type: "Cosmetic", description: "Adds a shadow trail while moving", effect: "trailShadow" },
    { id: "gem-trail-2", name: "Star Trail", price: 9, type: "Cosmetic", description: "Adds a star trail while moving", effect: "trailStars" },
    { id: "gem-crown-1", name: "Gem Crown", price: 18, type: "Cosmetic", description: "Adds a royal crown to your character", effect: "crown" },
    { id: "gem-wings-1", name: "Celestial Wings", price: 24, type: "Cosmetic", description: "Adds celestial wings to your character", effect: "wings" },
    { id: "gem-legend-1", name: "Legendary Banner", price: 30, type: "Cosmetic", description: "Adds a legend banner behind you", effect: "banner" },
    { id: "gem-legend-2", name: "Endless Fortune", price: 40, type: "Ultimate", description: "Greatly boosts gold and gem rewards", effect: "fortune" }
];

function applyGemEffect(effect) {
    if (effect === "maxHp") { player.maxHp += 25; player.hp += 25; gameState.gemBoosts.maxHp += 25; }
    else if (effect === "maxHpLarge") { player.maxHp += 50; player.hp += 50; gameState.gemBoosts.maxHp += 50; }
    else if (effect === "damage") { player.damage += 10; gameState.gemBoosts.damage += 10; }
    else if (effect === "damageLarge") { player.damage += 15; gameState.gemBoosts.damage += 15; }
    else if (effect === "damageHuge") { player.damage += 25; gameState.gemBoosts.damage += 25; }
    else if (effect === "speed") { player.speed *= 1.08; gameState.gemBoosts.speed += 8; }
    else if (effect === "speedLarge") { player.speed *= 1.12; gameState.gemBoosts.speed += 12; }
    else if (effect === "hoverFuel") { player.maxHoverFuel += 25; player.hoverFuel = player.maxHoverFuel; }
    else if (effect === "extraJump") { player.maxJumps = Math.max(player.maxJumps, 4); }
    else if (effect === "abilityCooldown") { gameState.gemBoosts.abilityCooldownReduction += 60; }
    else if (effect === "abilityCooldownLarge") { gameState.gemBoosts.abilityCooldownReduction += 90; }
    else if (effect === "shopDiscount") { gameState.gemBoosts.shopDiscount += 10; }
    else if (effect === "shopDiscountLarge") { gameState.gemBoosts.shopDiscount += 15; }
}

function purchaseGemItem(id) {
    const item = gemShopItems.find(entry => entry.id === id);
    if (!item || gameState.gemOwned[id]) return;
    if (gameState.gems < item.price) return;

    gameState.gems -= item.price;
    gameState.gemOwned[id] = true;
    applyGemEffect(item.effect);
    initGameMusic();
    playSoundEffect("coin");
    updateHUD();
    renderGemShop();
    saveGame();
}

function renderGemShop() {
    const list = document.getElementById("gem-shop-list");
    if (!list) return;

    list.innerHTML = gemShopItems.map(item => {
        const owned = gameState.gemOwned[item.id] === true;
        return `<div class="gem-shop-item">
            <div><strong>${item.name}</strong><small>${item.type}</small><p>${item.description}</p></div>
            <button data-gem-id="${item.id}" ${owned ? "disabled" : ""}>${owned ? "Owned" : `${item.price} Gems`}</button>
        </div>`;
    }).join("");

    list.querySelectorAll("[data-gem-id]").forEach(button => {
        button.addEventListener("click", () => purchaseGemItem(button.dataset.gemId));
    });
}

function updateGemShopButtons() {
    renderGemShop();
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
        },
        "buy-hoverboots": {
            owned: player.hasHoverBoots,
            text: "Hover Boots Owned"
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
            Archer: "buy-archer-character",
            Mage: "buy-mage",
            Robot: "buy-robot",
            "Shadow Ninja": "buy-shadow",
            Doctor: "buy-doctor"
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
        "hud-gems": gameState.gems,
        "shop-gold": gameState.gold,
        "index-gems": gameState.gems,
        "gem-shop-gems": gameState.gems,
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

    if (gameState.isPaused) {
        initGameMusic();
        setMusicTrack("menu");
        switchShopTab("characters");
    } else {
        setMusicTrack(boss ? "boss" : "exploration");
    }

    keys.left = false;
    keys.right = false;

    updateHUD();
    updateShopButtons();
}

document.getElementById("menu-btn")?.addEventListener("click", toggleShop);
document.getElementById("close-shop-btn")?.addEventListener("click", toggleShop);

function switchShopTab(category) {
    const charactersPanel = document.getElementById("characters-panel");
    const upgradesPanel = document.getElementById("upgrades-panel");
    const restartPanel = document.getElementById("restart-panel");
    const indexPanel = document.getElementById("index-panel");
    const settingsPanel = document.getElementById("settings-panel");
    const gemShopPanel = document.getElementById("gem-shop-panel");
    const charactersTab = document.getElementById("characters-tab");
    const upgradesTab = document.getElementById("upgrades-tab");
    const restartTab = document.getElementById("restart-tab");
    const indexTab = document.getElementById("index-tab");
    const settingsTab = document.getElementById("settings-tab");
    const gemShopTab = document.getElementById("gem-shop-tab");

    charactersPanel?.classList.toggle("hidden", category !== "characters");
    upgradesPanel?.classList.toggle("hidden", category !== "upgrades");
    restartPanel?.classList.toggle("hidden", category !== "restart");
    indexPanel?.classList.toggle("hidden", category !== "index");
    settingsPanel?.classList.toggle("hidden", category !== "settings");
    gemShopPanel?.classList.toggle("hidden", category !== "gemshop");
    charactersTab?.classList.toggle("active", category === "characters");
    upgradesTab?.classList.toggle("active", category === "upgrades");
    restartTab?.classList.toggle("active", category === "restart");
    indexTab?.classList.toggle("active", category === "index");
    settingsTab?.classList.toggle("active", category === "settings");
    gemShopTab?.classList.toggle("active", category === "gemshop");

    if (category === "index") renderIndex();
    if (category === "gemshop") renderGemShop();
}

document.getElementById("characters-tab")?.addEventListener("click", () => {
    switchShopTab("characters");
});

document.getElementById("upgrades-tab")?.addEventListener("click", () => {
    switchShopTab("upgrades");
});

document.getElementById("restart-tab")?.addEventListener("click", () => {
    switchShopTab("restart");
});

document.getElementById("index-tab")?.addEventListener("click", () => {
    switchShopTab("index");
});

document.getElementById("settings-tab")?.addEventListener("click", () => {
    switchShopTab("settings");
});

document.getElementById("gem-shop-tab")?.addEventListener("click", () => {
    switchShopTab("gemshop");
});

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
    initGameMusic();
    playSoundEffect("jump");
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

    if (e.code === "KeyH" && player.hasHoverBoots) {
    player.isHovering = true;
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

    if (e.code === "KeyH") {
    player.isHovering = false;
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
    initGameMusic();
    playSoundEffect("ability");

    if (
        player.abilityCooldown > 0 ||
        gameState.isPaused ||
        gameState.gameOver
    ) return;

    player.abilityCooldown = Math.max(60, 300 - (gameState.gemBoosts?.abilityCooldownReduction || 0));

    if (player.character === "Knight") {
        player.shieldActive = true;
        player.abilityActive = 120;
    }

    if (player.character === "Rogue") {
        player.isDashing = true;
        player.vx = player.facing === "right" ? 16 : -16;
        player.abilityActive = 15;
    }

    if (player.character === "Archer") {
        const direction = player.facing === "right" ? 1 : -1;

        for (let i = -1; i <= 1; i++) {
            arrows.push({
                x: player.x + (direction > 0 ? 20 : -18),
                y: player.y + 18 + i * 5,
                width: 18,
                height: 5,
                vx: direction * 13,
                damage: Math.round(player.damage * 1.25),
                enemyArrow: false
            });
        }
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

    if (player.character === "Doctor") {
        player.hp = Math.min(player.maxHp, player.hp + 40);
        player.shieldActive = true;
        player.abilityActive = 180;
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

    if (lvl % 50 === 0) {
        const destroyerPower = lvl === 250 ? 18000 : 8000 + lvl * 45;

        return {
            name: "THE FINAL DESTROYER",
            color: "#ff00ff",
            hp: destroyerPower,
            maxHp: destroyerPower,
            damage: 75 + Math.floor(lvl / 50) * 10,
            attack: "final",
            x: 520,
            y: 300,
            width: 100,
            height: 250,
            attackClock: 0,
            finalBoss: lvl === 250,
            vulnerable: lvl === 250 ? false : true,
            abilityName: lvl === 250 ? "Awakening" : ""
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

async function playFinalBossCutscene(onComplete) {
    const overlay = document.getElementById("cutscene-overlay");
    const stage = document.getElementById("cutscene-stage");
    const speaker = document.getElementById("cutscene-speaker");
    const text = document.getElementById("cutscene-text");
    const skip = document.getElementById("skip-cutscene-btn");

    if (!overlay || !stage || !text) {
        onComplete();
        return;
    }

    gameState.isPaused = true;
    document.getElementById("game-container")?.classList.add("cutscene-running");
    overlay.classList.remove("hidden");
    // if (speaker) speaker.textContent = "(Player)";

    stage.className = "final-cage-stage";
    stage.innerHTML = `
        <div class="family-cage"><span></span><span></span><span></span></div>
        <div class="ground-crack"></div>
        <div class="final-shadow-boss"></div>
    `;
    text.textContent = "I found you... Finally, it's all over...";

    let skipped = false;
    skip?.addEventListener("click", () => { skipped = true; }, { once: true });

    if (!skipped) await new Promise(resolve => setTimeout(resolve, 2200));

    if (!skipped) {
        stage.classList.add("ground-shaking");
        text.textContent = "";
        await new Promise(resolve => setTimeout(resolve, 1800));
    }

    if (!skipped) {
        stage.classList.remove("ground-shaking");
        stage.classList.add("cage-falls");
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    if (!skipped) {
        stage.className = "final-boss-entry";
        stage.innerHTML = `<div class="final-shadow-boss visible"></div>`;
        if (speaker) speaker.textContent = "THE FINAL DESTROYER";
        text.textContent = "";
        await new Promise(resolve => setTimeout(resolve, 2200));
    }

    overlay.classList.add("hidden");
    document.getElementById("game-container")?.classList.remove("cutscene-running");
    gameState.finalCutsceneShown = true;
    gameState.isPaused = false;
    saveGame();
    onComplete();
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
        discoverIndex(boss.name);
        setMusicTrack("boss");

        if (lvl === 250 && !gameState.finalCutsceneShown && !respawn) {
            playFinalBossCutscene(() => {});
        }

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
        setMusicTrack("exploration");
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

const indexRegistry = {
    slime: { name: "Slime", type: "Enemy", gems: 1 },
    skeleton: { name: "Skeleton", type: "Enemy", gems: 1 },
    bat: { name: "Bat", type: "Flying Enemy", gems: 1 },
    archer: { name: "Archer", type: "Enemy", gems: 2 },
    ghost: { name: "Ghost", type: "Flying Enemy", gems: 2 },
    demon: { name: "Demon", type: "Flying Enemy", gems: 2 },
    golem: { name: "Golem", type: "Enemy", gems: 3 },
    darkKnight: { name: "Dark Knight", type: "Enemy", gems: 3 },
    saw: { name: "Moving Saw", type: "Obstacle", gems: 2 },
    fire: { name: "Fire Trap", type: "Obstacle", gems: 2 },
    acid: { name: "Acid Pool", type: "Obstacle", gems: 2 },
    boulder: { name: "Falling Boulder", type: "Obstacle", gems: 3 },
    electric: { name: "Electric Trap", type: "Obstacle", gems: 3 },
    disappear: { name: "Disappearing Platform", type: "Obstacle", gems: 3 },
    "Fire Demon": { name: "Fire Demon Boss", type: "Boss", gems: 5 },
    "Skeleton King": { name: "Skeleton King", type: "Boss", gems: 5 },
    "Frost Titan": { name: "Frost Titan", type: "Boss", gems: 6 },
    "War Machine": { name: "War Machine", type: "Boss", gems: 7 },
    "Shadow Lord": { name: "Shadow Lord", type: "Boss", gems: 8 },
    "THE FINAL DESTROYER": { name: "The Final Destroyer", type: "Final Boss", gems: 25 }
};

function discoverIndex(id) {
    if (!indexRegistry[id]) return;
    if (gameState.indexDiscovered[id]) return;

    gameState.indexDiscovered[id] = true;
    updateIndexDisplay();
    saveGame();
}

function claimIndexEntry(id) {
    const entry = indexRegistry[id];
    if (!entry || !gameState.indexDiscovered[id] || gameState.indexClaimed[id]) return;

    gameState.indexClaimed[id] = true;
    gameState.gems += entry.gems;

    updateHUD();
    updateIndexDisplay();
    saveGame();
}

function updateIndexDisplay() {
    const list = document.getElementById("index-list");
    if (!list) return;

    list.innerHTML = Object.entries(indexRegistry).map(([id, entry]) => {
        const discovered = gameState.indexDiscovered[id] === true;
        const claimed = gameState.indexClaimed[id] === true;

        if (!discovered) {
            return `<div class="index-entry locked"><span>Unknown ${entry.type}</span><button disabled>Undiscovered</button></div>`;
        }

        const buttonText = claimed ? "Claimed" : `Claim ${entry.gems} Gem${entry.gems === 1 ? "" : "s"}`;
        return `<div class="index-entry"><span><strong>${entry.name}</strong><br>${entry.type}</span><button data-index-id="${id}" ${claimed ? "disabled" : ""}>${buttonText}</button></div>`;
    }).join("");

    list.querySelectorAll("[data-index-id]").forEach(button => {
        button.addEventListener("click", () => claimIndexEntry(button.dataset.indexId));
    });
}

function renderIndex() {
    updateIndexDisplay();
}

const enemyTypes = {
    slime: {
        hp: 35, speed: 0.55, damage: 8,
        reward: 3, color: "#72e34b"
    },
    skeleton: {
        hp: 65, speed: 0.75, damage: 15,
        reward: 7, color: "#eeeecc"
    },
    bat: {
        hp: 25, speed: 0.65, damage: 8,
        reward: 5, color: "#9933cc"
    },
    archer: {
        hp: 40, speed: 0.5, damage: 12,
        reward: 7, color: "#aa6622"
    },
    ghost: {
        hp: 50, speed: 0.8, damage: 15,
        reward: 8, color: "#99ddff"
    },
    demon: {
        hp: 100, speed: 0.65, damage: 25,
        reward: 10, color: "#ff4422"
    },
    golem: {
        hp: 180, speed: 0.35, damage: 30,
        reward: 20, color: "#777777"
    },
    darkKnight: {
        hp: 140, speed: 0.85, damage: 25,
        reward: 15, color: "#552277"
    }
};

function createEnemy(type, x, y) {
    const d = enemyTypes[type];
    const hp = Math.round(
    (d.hp + gameState.level * 2) *
    getDifficulty().enemyHealth
);

    const canFly = ["bat", "ghost", "demon"].includes(type);
    const flyingHeight = {
        bat: random(300, 390),
        ghost: random(330, 430),
        demon: random(360, 440)
    }[type];

    return {
        type,
        x,
        y: canFly ? flyingHeight : y,
        width: type === "golem" ? 38 : 26,
        height: type === "golem" ? 48 : 32,
        hp,
        maxHp: hp,
        speed: d.speed,
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
        const enemyId = `${lvl}:${i}:${type}`;

        if (!gameState.defeatedInLevel.includes(enemyId)) {
            const enemy = createEnemy(type, x, 500 - (i % 2) * 25);
            enemy.levelEnemyId = enemyId;
            monsters.push(enemy);
        }
    }
}

function removeDefeatedEnemies() {
    for (let i = monsters.length - 1; i >= 0; i--) {
        if (monsters[i].hp <= 0) {
            initGameMusic();
            playSoundEffect("coin");
            discoverIndex(monsters[i].type);
            if (monsters[i].levelEnemyId && !gameState.defeatedInLevel.includes(monsters[i].levelEnemyId)) {
                gameState.defeatedInLevel.push(monsters[i].levelEnemyId);
                saveGame();
            }
            gameState.gold += monsters[i].reward;
            monsters.splice(i, 1);
        }
    }

    updateHUD();
}

function updateMonsters() {
    for (const m of monsters) {
        const distance = player.x - m.x;

        if (["bat", "ghost", "demon"].includes(m.type)) {
            m.floatOffset += m.type === "bat" ? 0.07 : 0.04;

            m.dir = distance >= 0 ? 1 : -1;
            m.x += m.speed * m.dir;

            const targetY = m.type === "bat"
                ? player.y - 100
                : player.y - 80;
            const hoverY = Math.sin(m.floatOffset) * (m.type === "bat" ? 8 : 5);

            m.y += clamp(targetY + hoverY - m.y, -1.2, 1.2);
        }

        else if (
            ["skeleton", "darkKnight"].includes(m.type)
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
        }
    }

    removeDefeatedEnemies();
}

// ============================================
// ENEMY RENDERING
// ============================================

function drawEnemies() {
    monsters.forEach(m => {
        const cx = m.x + m.width / 2;
        const cy = m.y + m.height / 2;
        const flash = m.flash > 0;

        ctx.save();
        ctx.translate(cx, cy);

        if (m.dir === -1) {
            ctx.scale(-1, 1);
        }

        ctx.lineWidth = 3;
        ctx.lineCap = "round";

        // Slime: soft dripping body and rounded eyes.
        if (m.type === "slime") {
            ctx.fillStyle = flash ? "#ffffff" : "#72e34b";
            ctx.strokeStyle = "#3e902d";
            ctx.beginPath();
            ctx.moveTo(-13, 12);
            ctx.quadraticCurveTo(-16, -4, -9, -11);
            ctx.quadraticCurveTo(0, -18, 10, -10);
            ctx.quadraticCurveTo(16, -3, 13, 12);
            ctx.quadraticCurveTo(7, 16, 2, 12);
            ctx.quadraticCurveTo(-4, 18, -13, 12);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#111111";
            ctx.fillRect(-7, -4, 4, 5);
            ctx.fillRect(4, -4, 4, 5);
            ctx.fillStyle = "rgba(255,255,255,.55)";
            ctx.fillRect(-8, -9, 5, 3);
        }

        // Skeleton: skull, rib cage, arm bones, and jaw.
        else if (m.type === "skeleton") {
            ctx.strokeStyle = flash ? "#ffffff" : "#eeeecc";
            ctx.fillStyle = flash ? "#ffffff" : "#eeeecc";

            ctx.beginPath();
            ctx.arc(0, -8, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#333333";
            ctx.fillRect(-5, -11, 3, 4);
            ctx.fillRect(2, -11, 3, 4);

            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillRect(-4, -2, 8, 3);
            ctx.fillRect(-6, 1, 12, 2);

            ctx.strokeStyle = flash ? "#ffffff" : "#eeeecc";
            ctx.beginPath();
            ctx.moveTo(-8, 3); ctx.lineTo(-13, 11);
            ctx.moveTo(8, 3); ctx.lineTo(13, 11);
            ctx.moveTo(0, 3); ctx.lineTo(0, 14);
            ctx.moveTo(-7, 7); ctx.quadraticCurveTo(0, 11, 7, 7);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(-5, 14); ctx.lineTo(-7, 20);
            ctx.moveTo(5, 14); ctx.lineTo(7, 20);
            ctx.stroke();
        }

        // Bat: angular wings, ears, and hanging feet.
        else if (m.type === "bat") {
            const wingLift = Math.sin(gameState.frame * .25) * 3;
            ctx.fillStyle = flash ? "#ffffff" : "#9933cc";
            ctx.strokeStyle = "#552277";

            ctx.beginPath();
            ctx.moveTo(-5, -7);
            ctx.lineTo(-16, -12 - wingLift);
            ctx.lineTo(-13, -2);
            ctx.lineTo(-20, 5);
            ctx.lineTo(-7, 3);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(5, -7);
            ctx.lineTo(16, -12 - wingLift);
            ctx.lineTo(13, -2);
            ctx.lineTo(20, 5);
            ctx.lineTo(7, 3);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(0, 0, 7, 9, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffcc44";
            ctx.fillRect(-4, -3, 3, 3);
            ctx.fillRect(1, -3, 3, 3);

            ctx.strokeStyle = "#9933cc";
            ctx.beginPath();
            ctx.moveTo(-3, 8); ctx.lineTo(-5, 14);
            ctx.moveTo(3, 8); ctx.lineTo(5, 14);
            ctx.stroke();
        }

        // Archer: hood, tunic, quiver, bow, and bow arm.
        else if (m.type === "archer") {
            ctx.fillStyle = flash ? "#ffffff" : "#aa6622";
            ctx.fillRect(-7, -3, 14, 20);

            ctx.fillStyle = flash ? "#ffffff" : "#77441a";
            ctx.beginPath();
            ctx.arc(0, -8, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#111111";
            ctx.fillRect(-5, -9, 3, 3);
            ctx.fillRect(2, -9, 3, 3);

            ctx.strokeStyle = "#5a2e12";
            ctx.beginPath();
            ctx.arc(11, 1, 10, -Math.PI / 2, Math.PI / 2);
            ctx.moveTo(11, -9); ctx.lineTo(11, 11);
            ctx.moveTo(-7, 3); ctx.lineTo(11, 1);
            ctx.stroke();

            ctx.fillStyle = "#ddddaa";
            ctx.fillRect(-11, 2, 4, 14);
            ctx.fillRect(-13, 2, 8, 3);

            ctx.strokeStyle = "#333333";
            ctx.beginPath();
            ctx.moveTo(-4, 17); ctx.lineTo(-7, 22);
            ctx.moveTo(4, 17); ctx.lineTo(7, 22);
            ctx.stroke();
        }

        // Ghost: translucent floaty body with curling tail.
        else if (m.type === "ghost") {
            ctx.fillStyle = flash ? "#ffffff" : "rgba(153,221,255,.82)";
            ctx.strokeStyle = "#66aacc";
            ctx.beginPath();
            ctx.moveTo(-11, 12);
            ctx.lineTo(-11, -5);
            ctx.quadraticCurveTo(-11, -15, 0, -16);
            ctx.quadraticCurveTo(12, -15, 11, -5);
            ctx.lineTo(11, 12);
            ctx.quadraticCurveTo(5, 7, 2, 14);
            ctx.quadraticCurveTo(-4, 7, -11, 12);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#223344";
            ctx.fillRect(-6, -8, 4, 5);
            ctx.fillRect(3, -8, 4, 5);
            ctx.beginPath();
            ctx.ellipse(0, 1, 4, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Demon: red muscular body, horns, tail, and glowing eyes.
        else if (m.type === "demon") {
            ctx.fillStyle = flash ? "#ffffff" : "#c73524";
            ctx.beginPath();
            ctx.ellipse(0, 3, 10, 13, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(0, -10, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#3a1818";
            ctx.beginPath();
            ctx.moveTo(-6, -16); ctx.lineTo(-13, -23); ctx.lineTo(-8, -12);
            ctx.moveTo(6, -16); ctx.lineTo(13, -23); ctx.lineTo(8, -12);
            ctx.fill();

            ctx.fillStyle = "#ffcc00";
            ctx.fillRect(-5, -12, 3, 3);
            ctx.fillRect(2, -12, 3, 3);

            ctx.strokeStyle = "#ff4422";
            ctx.beginPath();
            ctx.moveTo(9, 8);
            ctx.quadraticCurveTo(20, 16, 15, 20);
            ctx.stroke();

            ctx.strokeStyle = "#88220f";
            ctx.beginPath();
            ctx.moveTo(-9, 4); ctx.lineTo(-16, 11);
            ctx.moveTo(9, 4); ctx.lineTo(16, 11);
            ctx.stroke();
        }

        // Golem: blocky stone form with seams and heavy arms.
        else if (m.type === "golem") {
            ctx.fillStyle = flash ? "#ffffff" : "#777777";
            ctx.strokeStyle = "#444444";

            ctx.beginPath();
            ctx.moveTo(-14, -14);
            ctx.lineTo(14, -14);
            ctx.lineTo(12, 18);
            ctx.lineTo(-12, 18);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#555555";
            ctx.fillRect(-19, -6, 7, 19);
            ctx.fillRect(12, -6, 7, 19);

            ctx.fillStyle = "#111111";
            ctx.fillRect(-7, -8, 4, 4);
            ctx.fillRect(3, -8, 4, 4);

            ctx.strokeStyle = "#555555";
            ctx.beginPath();
            ctx.moveTo(0, -14); ctx.lineTo(0, 18);
            ctx.moveTo(-12, 2); ctx.lineTo(12, 2);
            ctx.stroke();
        }

        // Dark Knight: armored helmet, cape, sword, and shield.
        else if (m.type === "darkKnight") {
            ctx.fillStyle = flash ? "#ffffff" : "#552277";
            ctx.beginPath();
            ctx.moveTo(-10, -14); ctx.lineTo(10, -14);
            ctx.lineTo(8, 18); ctx.lineTo(-8, 18);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = flash ? "#ffffff" : "#301447";
            ctx.fillRect(-8, -15, 16, 10);

            ctx.fillStyle = "#ff8844";
            ctx.fillRect(-5, -11, 3, 2);
            ctx.fillRect(2, -11, 3, 2);

            ctx.strokeStyle = "#c9b5d8";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(9, -4); ctx.lineTo(16, 16);
            ctx.stroke();

            ctx.fillStyle = "#3b2350";
            ctx.fillRect(-17, 0, 8, 12);

            ctx.strokeStyle = "#8c70a6";
            ctx.lineWidth = 2;
            ctx.strokeRect(-17, 0, 8, 12);

            ctx.fillStyle = "#240c35";
            ctx.beginPath();
            ctx.moveTo(-7, 8); ctx.lineTo(-14, 20); ctx.lineTo(5, 16);
            ctx.fill();
        }

        ctx.restore();

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
            discoverIndex("saw");
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
            discoverIndex("fire");
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
            discoverIndex("acid");
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
            discoverIndex("boulder");
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
            discoverIndex("electric");
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
            discoverIndex("disappear");
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
        ctx.save();

        if (o.type === "saw") {
            const cx = o.x + o.width / 2;
            const cy = o.y + o.height / 2;
            const radius = o.width / 2;
            const spin = gameState.frame * 0.18;

            ctx.translate(cx, cy);
            ctx.rotate(spin);

            ctx.fillStyle = "#777b80";
            ctx.beginPath();
            for (let i = 0; i < 16; i++) {
                const angle = i * Math.PI / 8;
                const tooth = i % 2 === 0 ? radius + 7 : radius;
                const px = Math.cos(angle) * tooth;
                const py = Math.sin(angle) * tooth;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#c8ccd0";
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.58, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#45484d";
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        else if (o.type === "fire") {
            if (o.active) {
                const time = gameState.frame * 0.3;
                ctx.shadowColor = "#ff5500";
                ctx.shadowBlur = 12;

                for (let i = 0; i < 5; i++) {
                    const baseX = o.x + (i + 0.5) * o.width / 5;
                    const flicker = Math.sin(time + i * 1.7) * 4;

                    ctx.fillStyle = i % 2 ? "#ffad33" : "#ff5a18";
                    ctx.beginPath();
                    ctx.moveTo(baseX - o.width / 10, o.y + o.height);
                    ctx.quadraticCurveTo(baseX - o.width / 8, o.y + 5, baseX + flicker, o.y - 10);
                    ctx.quadraticCurveTo(baseX + o.width / 7, o.y + 4, baseX + o.width / 10, o.y + o.height);
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.fillStyle = "#ffe56e";
                ctx.beginPath();
                ctx.ellipse(o.x + o.width / 2, o.y + o.height - 2, o.width * 0.18, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                ctx.fillStyle = "#553322";
                ctx.fillRect(o.x, o.y + o.height - 5, o.width, 5);
            }
        }

        else if (o.type === "acid") {
            ctx.fillStyle = "#58d900";
            ctx.beginPath();
            ctx.moveTo(o.x, o.y + o.height);
            ctx.quadraticCurveTo(o.x + o.width * 0.2, o.y - 4, o.x + o.width * 0.38, o.y + o.height);
            ctx.quadraticCurveTo(o.x + o.width * 0.52, o.y - 8, o.x + o.width * 0.72, o.y + o.height);
            ctx.quadraticCurveTo(o.x + o.width * 0.86, o.y - 3, o.x + o.width, o.y + o.height);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#baff64";
            ctx.beginPath();
            ctx.ellipse(o.x + o.width * 0.25, o.y + 2, 3, 5, 0, 0, Math.PI * 2);
            ctx.ellipse(o.x + o.width * 0.68, o.y - 1, 2.5, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        else if (o.type === "boulder" && o.triggered) {
            const cx = o.x + o.width / 2;
            const cy = o.y + o.height / 2;
            ctx.fillStyle = "#686865";
            ctx.strokeStyle = "#3f403e";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(o.x + 8, o.y + 3);
            ctx.lineTo(o.x + o.width - 4, o.y + 7);
            ctx.lineTo(o.x + o.width, o.y + o.height - 8);
            ctx.lineTo(o.x + 10, o.y + o.height);
            ctx.lineTo(o.x, o.y + 12);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = "#92928d";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 8, cy - 12); ctx.lineTo(cx + 2, cy - 4);
            ctx.lineTo(cx - 4, cy + 8);
            ctx.moveTo(cx + 9, cy - 8); ctx.lineTo(cx + 4, cy + 4);
            ctx.stroke();
        }

        else if (o.type === "electric") {
            if (o.active) {
                ctx.strokeStyle = "#aaffff";
                ctx.lineWidth = 5;
                ctx.shadowColor = "#00ffff";
                ctx.shadowBlur = 15;
                ctx.beginPath();
                let px = o.x;
                let py = o.y + o.height / 2;
                ctx.moveTo(px, py);
                for (let x = o.x + 12; x < o.x + o.width; x += 12) {
                    py = o.y + o.height / 2 + (gameState.frame % 4 === 0 ? 5 : -5) * ((x / 12) % 2);
                    ctx.lineTo(x, py);
                }
                ctx.lineTo(o.x + o.width, o.y + o.height / 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else {
                ctx.fillStyle = "#334455";
                ctx.fillRect(o.x, o.y, o.width, o.height);
            }
        }

        else if (o.type === "disappear" && o.active) {
            ctx.fillStyle = "#bb66ff";
            ctx.fillRect(o.x, o.y, o.width, o.height);
        }

        ctx.restore();
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

    initGameMusic();
    playSoundEffect("sword");

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

    if (boss && checkOverlap(hitbox, boss) && (!boss.finalBoss || boss.vulnerable)) {
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

    initGameMusic();
    playSoundEffect("bow");

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
                initGameMusic();
                playSoundEffect("hit");
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

            if (!hit && boss && checkOverlap(a, boss) && (!boss.finalBoss || boss.vulnerable)) {
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
        initGameMusic();
        playSoundEffect("pickup");
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

    initGameMusic();
    playSoundEffect("damage");

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

    if (boss.finalBoss) {
        const cycle = clock % 300;

        if (cycle === 0 || cycle === 60 || cycle === 140 || cycle === 180) {
            initGameMusic();
            playSoundEffect(cycle === 180 ? "ability" : "hit");
        }

        if (cycle < 180) {
            boss.vulnerable = false;

            if (cycle < 60) {
                boss.abilityName = "Razor Claw Slash";
                if (clock % 30 === 0) {
                    const side = player.x < boss.x ? -1 : 1;
                    hazards.push({
                        type: "claw", x: clamp(player.x + side * 20, 0, 720), y: 500,
                        width: 100, height: 50, delay: 20, damage: boss.damage
                    });
                }
            } else if (cycle < 140) {
                boss.abilityName = "Void Inhale";
                const bx = boss.x + boss.width / 2;
                const direction = bx > player.x ? 1 : -1;
                player.x += direction * 2.2;
                player.x = clamp(player.x, 0, canvas.width - player.width);

                if (clock % 35 === 0) {
                    hazards.push({ type: "inhale", x: boss.x - 60, y: boss.y + 50, width: 220, height: 140, delay: 0, damage: Math.round(boss.damage * 0.8) });
                }
            } else {
                boss.abilityName = "Shadow Burial";
                if (clock % 20 === 0) {
                    hazards.push({
                        type: "spike", x: random(20, 740), y: 520,
                        width: 60, height: 30, delay: 18, damage: boss.damage
                    });
                }

                if (clock % 45 === 0) {
                    hazards.push({
                        type: "teeth", x: random(40, 720), y: -30,
                        width: 40, height: 40, vy: 7, damage: Math.round(boss.damage * 1.1)
                    });
                }
            }
        } else {
            boss.vulnerable = true;
            boss.abilityName = "VULNERABLE";
        }

        updateBossHazards();
        return;
    }

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

        if (h.type === "anvil" || h.type === "teeth") {
            h.y += h.vy;
        } else if (h.type === "inhale") {
            h.delay = 0;
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

    if (boss.finalBoss) {
        ctx.save();

        const pulse = 1 + Math.sin(gameState.frame * 0.08) * 0.04;
        ctx.translate(bx, by + 125);
        ctx.scale(pulse, pulse);
        ctx.translate(-bx, -(by + 125));

        ctx.fillStyle = "#000000";
        ctx.strokeStyle = boss.vulnerable ? "#ffcc00" : "#22002b";
        ctx.lineWidth = boss.vulnerable ? 5 : 3;
        ctx.shadowColor = boss.vulnerable ? "#ffcc00" : "#330044";
        ctx.shadowBlur = boss.vulnerable ? 28 : 18;

        ctx.beginPath();
        ctx.moveTo(bx - 42, by + 80);
        ctx.lineTo(bx - 100, by + 38);
        ctx.lineTo(bx - 62, by + 130);
        ctx.lineTo(bx - 38, by + 105);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(bx + 42, by + 80);
        ctx.lineTo(bx + 100, by + 38);
        ctx.lineTo(bx + 62, by + 130);
        ctx.lineTo(bx + 38, by + 105);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(bx - 48, by + 65);
        ctx.quadraticCurveTo(bx - 58, by + 170, bx - 25, by + 225);
        ctx.lineTo(bx + 25, by + 225);
        ctx.quadraticCurveTo(bx + 58, by + 170, bx + 48, by + 65);
        ctx.quadraticCurveTo(bx, by + 35, bx - 48, by + 65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(bx, by + 70, 38, 48, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = boss.abilityName === "Void Inhale" ? "#3b003f" : "#050505";
        ctx.beginPath();
        ctx.ellipse(bx, by + 92, 27, boss.abilityName === "Void Inhale" ? 34 : 19, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#e5edf2";
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(bx + i * 7, by + 78);
            ctx.lineTo(bx + i * 7 - 4, by + 96);
            ctx.lineTo(bx + i * 7 + 4, by + 96);
            ctx.closePath();
            ctx.fill();
        }

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(bx - 38, by + 135);
        ctx.lineTo(bx - 62, by + 205);
        ctx.moveTo(bx + 38, by + 135);
        ctx.lineTo(bx + 62, by + 205);
        ctx.moveTo(bx - 18, by + 220);
        ctx.lineTo(bx - 38, by + 250);
        ctx.moveTo(bx + 18, by + 220);
        ctx.lineTo(bx + 38, by + 250);
        ctx.stroke();

        ctx.strokeStyle = "#777777";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bx - 62, by + 205); ctx.lineTo(bx - 72, by + 190);
        ctx.moveTo(bx + 62, by + 205); ctx.lineTo(bx + 72, by + 190);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();

        ctx.fillStyle = boss.vulnerable ? "#ffcc00" : "#ffffff";
        ctx.font = "bold 15px Courier New";
        ctx.textAlign = "center";
        ctx.fillText(boss.abilityName || boss.name, bx, by - 28);

        ctx.fillStyle = "#111111";
        ctx.fillRect(340, 65, 350, 12);
        ctx.fillStyle = boss.vulnerable ? "#ffcc00" : "#ff0033";
        ctx.fillRect(340, 65, 350 * clamp(boss.hp / boss.maxHp, 0, 1), 12);
        ctx.textAlign = "left";
        return;
    }

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
        ctx.save();

        if (h.type === "ice") {
            ctx.fillStyle = "#c6f5ff";
            ctx.strokeStyle = "#5fc9ff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(h.x + h.width / 2, h.y);
            ctx.lineTo(h.x + h.width, h.y + h.height);
            ctx.lineTo(h.x, h.y + h.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#effcff";
            ctx.beginPath();
            ctx.moveTo(h.x + h.width / 2, h.y + 4);
            ctx.lineTo(h.x + h.width * 0.65, h.y + h.height - 5);
            ctx.lineTo(h.x + h.width * 0.5, h.y + h.height * 0.55);
            ctx.closePath();
            ctx.fill();
        }

        else if (h.type === "laser") {
            ctx.fillStyle = "#ff4444";
            ctx.shadowColor = "#ff0000";
            ctx.shadowBlur = 18;
            ctx.fillRect(h.x, h.y, h.width, h.height);
            ctx.fillStyle = "#fff7a8";
            ctx.fillRect(h.x, h.y + h.height / 2 - 1, h.width, 2);
            ctx.shadowBlur = 0;
        }

        else if (h.type === "shadow") {
            ctx.fillStyle = "rgba(52,12,82,.92)";
            ctx.shadowColor = "#b533ff";
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.moveTo(h.x + h.width / 2, h.y);
            ctx.quadraticCurveTo(h.x + h.width, h.y + 8, h.x + h.width * 0.82, h.y + h.height);
            ctx.quadraticCurveTo(h.x + h.width / 2, h.y + h.height * 0.78, h.x + h.width * 0.18, h.y + h.height);
            ctx.quadraticCurveTo(h.x, h.y + 8, h.x + h.width / 2, h.y);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = "#cc66ff";
            ctx.fillRect(h.x + h.width * 0.30, h.y + h.height * 0.28, 5, 5);
            ctx.fillRect(h.x + h.width * 0.58, h.y + h.height * 0.28, 5, 5);
        }

        else if (h.type === "claw") {
            ctx.fillStyle = "#09090b";
            ctx.strokeStyle = "#e6edf2";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(h.x, h.y + h.height);
            ctx.lineTo(h.x + h.width * 0.18, h.y + 8);
            ctx.lineTo(h.x + h.width * 0.38, h.y + h.height);
            ctx.lineTo(h.x + h.width * 0.52, h.y + 2);
            ctx.lineTo(h.x + h.width * 0.68, h.y + h.height);
            ctx.lineTo(h.x + h.width * 0.82, h.y + 10);
            ctx.lineTo(h.x + h.width, h.y + h.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        else if (h.type === "inhale") {
            ctx.strokeStyle = "rgba(170,80,255,.9)";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.ellipse(h.x + h.width / 2, h.y + h.height / 2, h.width / 2, h.height / 2, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = "rgba(255,255,255,.55)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(h.x + h.width, h.y + h.height / 2);
            ctx.lineTo(h.x, h.y + h.height / 2);
            ctx.stroke();
        }

        else if (h.type === "spike") {
            ctx.fillStyle = "#09090b";
            ctx.strokeStyle = "#777788";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(h.x, h.y + h.height);
            ctx.lineTo(h.x + h.width * 0.20, h.y + 4);
            ctx.lineTo(h.x + h.width * 0.38, h.y + h.height);
            ctx.lineTo(h.x + h.width * 0.52, h.y);
            ctx.lineTo(h.x + h.width * 0.68, h.y + h.height);
            ctx.lineTo(h.x + h.width * 0.82, h.y + 8);
            ctx.lineTo(h.x + h.width, h.y + h.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        else if (h.type === "teeth") {
            ctx.fillStyle = "#dce4ea";
            ctx.strokeStyle = "#7b8791";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(h.x, h.y);
            ctx.lineTo(h.x + h.width * 0.5, h.y + h.height);
            ctx.lineTo(h.x + h.width, h.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        else if (h.type === "anvil") {
            ctx.fillStyle = "#777777";
            ctx.fillRect(h.x, h.y, h.width, 10);

            ctx.fillStyle = "#555555";
            ctx.fillRect(h.x + 8, h.y + 10, h.width - 16, 12);

            ctx.fillStyle = "#777777";
            ctx.fillRect(h.x + 14, h.y + 22, h.width - 28, 16);

            ctx.fillStyle = "#555555";
            ctx.fillRect(h.x + 10, h.y + h.height - 8, h.width - 20, 8);

            ctx.fillStyle = "#999999";
            ctx.fillRect(h.x + 4, h.y + 2, h.width - 8, 3);
        }

        else {
            const time = gameState.frame * 0.35;
            ctx.shadowColor = "#ff3300";
            ctx.shadowBlur = 12;
            ctx.fillStyle = "#ff5422";
            ctx.beginPath();
            ctx.moveTo(h.x, h.y + h.height);
            ctx.quadraticCurveTo(h.x + h.width * 0.2, h.y - 8 + Math.sin(time) * 3, h.x + h.width * 0.45, h.y + h.height);
            ctx.quadraticCurveTo(h.x + h.width * 0.68, h.y - 12 - Math.cos(time) * 3, h.x + h.width, h.y + h.height);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffd84a";
            ctx.beginPath();
            ctx.ellipse(h.x + h.width / 2, h.y + h.height - 5, h.width * 0.22, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    });
}

// ============================================
// PORTAL AND LEVEL COMPLETION
// ============================================

function updatePortal() {
    if (boss || !checkOverlap(player, portal)) return;

    if (gameState.level >= 250 && !gameState.victoryChoiceShown) {
        showEndLevelChoice();
        return;
    }

    gameState.level++;
    gameState.defeatedInLevel = [];
    loadLevel(gameState.level);
}

function showEndLevelChoice() {
    gameState.isPaused = true;
    gameState.victoryChoiceShown = true;

    initGameMusic();
    playSoundEffect("victory");
    setMusicTrack("victory");

    const title = document.getElementById("overlay-title");
    const desc = document.getElementById("overlay-desc");
    const respawnButton = document.getElementById("restart-btn");

    if (title) title.textContent = "FINAL LEVEL COMPLETE";
    if (desc) desc.textContent = "Continue the adventure or restart at level 1?";

    const finalActions = document.getElementById("final-level-actions");
    const continueButton = document.getElementById("continue-btn");
    const restartToOneButton = document.getElementById("restart-to-one-btn");

    if (respawnButton) respawnButton.classList.add("hidden");
    if (finalActions) finalActions.classList.remove("hidden");

    if (continueButton) {
        continueButton.onclick = () => {
            gameState.isPaused = false;
            gameState.victoryChoiceShown = false;
            gameState.level++;
            gameState.defeatedInLevel = [];
            document.getElementById("screen-overlay")?.classList.add("hidden");
            document.getElementById("final-level-actions")?.classList.add("hidden");
            loadLevel(gameState.level);
        };
    }

    if (restartToOneButton) {
        restartToOneButton.onclick = () => {
            if (!confirm("Restart from level 1? All progress will be lost.")) return;

            localStorage.removeItem(SAVE_KEY);
            gameState.level = 1;
            gameState.gold = 200;
            gameState.gems = 0;
            gameState.indexDiscovered = {};
            gameState.indexClaimed = {};
            gameState.defeatedInLevel = [];
            gameState.victoryChoiceShown = false;
            gameState.isPaused = false;
            gameState.gameOver = false;
            gameState.victory = false;

            document.getElementById("screen-overlay")?.classList.add("hidden");
            document.getElementById("final-level-actions")?.classList.add("hidden");
            if (respawnButton) respawnButton.classList.remove("hidden");

            Object.assign(player, {
                character: "Knight",
                characterOwned: ["Knight"],
                x: 40,
                y: 400,
                vx: 0,
                vy: 0,
                hp: 100,
                maxHp: 100,
                damage: 25,
                speed: 0.8,
                maxJumps: 2,
                hasBow: false,
                hasPickedUpSword: false,
                equippedWeapon: "melee",
                hasHoverBoots: false
            });

            loadLevel(1);
            updateHUD();
            updateShopButtons();
            updateIndexDisplay();
            saveGame();
        };
    }

    document.getElementById("screen-overlay")?.classList.remove("hidden");
}

function triggerDefeat() {
    initGameMusic();
    playSoundEffect("defeat");
    setMusicTrack("defeat");
    gameState.gameOver = true;
    saveGame();

    const title = document.getElementById("overlay-title");
    const desc = document.getElementById("overlay-desc");

    if (title) title.textContent = "GAME OVER";
    if (desc) desc.textContent = "Haha you died";

    document.getElementById("screen-overlay")?.classList.remove("hidden");
}

function triggerGameVictory() {
    initGameMusic();
    playSoundEffect("victory");
    setMusicTrack("victory");
    gameState.gameOver = true;
    gameState.victory = true;

    saveGame();

    const title = document.getElementById("overlay-title");
    const desc = document.getElementById("overlay-desc");

    if (title) title.textContent = "VICTORY!";
    if (desc) desc.textContent =
        "You defeated the Final Destroyer and conquered the final arena!";

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
updateIndexDisplay();

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
    gameState.defeatedInLevel = [];
    gameState.victoryChoiceShown = false;
    gameState.gems = 0;
    gameState.indexDiscovered = {};
    gameState.indexClaimed = {};

    // Reset player
    Object.assign(player, {
        character: "Knight",
        characterOwned: ["Knight"],
        x: 40,
        y: 400,
        vx: 0,
        vy: 0,
        speed: 0.8,
        jumpForce: 9,
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
        damageFlashTimer: 0,
        landingTimer: 0,
        hasHoverBoots: false,
        isHovering: false,
        hoverFuel: 100,
        maxHoverFuel: 100,
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
    updateIndexDisplay();

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

    const wasGrounded = player.grounded;
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


const gravity = 0.32;
const maxFallSpeed = 7;

if (
    player.isHovering &&
    player.hasHoverBoots &&
    !player.grounded &&
    player.hoverFuel > 0
) {
    player.vy += gravity * 0.15;
    player.vy = Math.min(player.vy, 0.8);
    player.hoverFuel--;
} else {
    player.vy += gravity;
    player.vy = Math.min(player.vy, maxFallSpeed);
}

// Apply vertical movement exactly once
player.y += player.vy;

// Recharge hover fuel when not hovering
if (!player.isHovering && player.hoverFuel < player.maxHoverFuel) {
    player.hoverFuel = Math.min(
        player.maxHoverFuel,
        player.hoverFuel + 0.4
    );
}

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

    if (player.grounded && !wasGrounded) {
        player.landingTimer = 8;
    }

    if (player.landingTimer > 0) {
        player.landingTimer--;
    }

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

        ctx.save();
        ctx.fillStyle = "#ff1f1f";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 16;
        ctx.fillRect(l.x, l.y, l.width, l.height);

        ctx.fillStyle = "#fff3a6";
        ctx.fillRect(l.x, l.y + l.height / 2 - 1, l.width, 2);

        ctx.strokeStyle = "rgba(255,255,255,.75)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let px = l.x; px < l.x + l.width; px += 10) {
            ctx.moveTo(px, l.y);
            ctx.lineTo(px + 5, l.y + l.height);
        }
        ctx.stroke();
        ctx.restore();
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
        ctx.save();
        const cx = swordPickup.x + swordPickup.width / 2;
        const cy = swordPickup.y + swordPickup.height / 2;

        ctx.translate(cx, cy);
        ctx.rotate(-Math.PI / 4 + Math.sin(gameState.frame * 0.08) * 0.12);
        ctx.fillStyle = "#d7e1e8";
        ctx.strokeStyle = "#72838e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(5, -5);
        ctx.lineTo(3, 9);
        ctx.lineTo(-3, 9);
        ctx.lineTo(-5, -5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(-8, 7, 16, 4);
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(-3, 11, 6, 8);
        ctx.restore();
    }

    arrows.forEach(a => {
        ctx.save();
        ctx.translate(a.x + a.width / 2, a.y + a.height / 2);

        if (a.vx < 0) ctx.scale(-1, 1);

        if (a.magic) {
            ctx.shadowColor = "#00ccff";
            ctx.shadowBlur = 14;
            ctx.fillStyle = "#72f0ff";
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(-4, -6);
            ctx.lineTo(12, 0);
            ctx.lineTo(-4, 6);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = "#9a5a32";
            ctx.fillRect(-10, -2, 20, 4);

            ctx.fillStyle = "#d7dde2";
            ctx.beginPath();
            ctx.moveTo(10, -7);
            ctx.lineTo(17, 0);
            ctx.lineTo(10, 7);
            ctx.lineTo(12, 0);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#c84a3a";
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-16, -6);
            ctx.lineTo(-13, 0);
            ctx.lineTo(-16, 6);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
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

    const characterAnimTime = performance.now() / 240;
    const isMoving = (keys.left || keys.right) && player.grounded;
    const retroFrame = Math.floor(characterAnimTime) % 4;
    const idleBob = player.grounded && !isMoving
        ? (retroFrame === 0 ? 0 : retroFrame === 3 ? -1 : 0)
        : 0;
    const walkBob = isMoving ? (Math.floor(player.animCycle * 2) % 2 === 0 ? 1 : 0) : 0;

    let jumpPose = "grounded";
    if (!player.grounded && player.vy < -1.2) jumpPose = "rising";
    else if (!player.grounded) jumpPose = "apex";

    const verticalStrength = player.grounded
        ? 0
        : clamp(Math.abs(player.vy) / 7, 0, 1);
    const jumpLean = jumpPose === "rising"
        ? (player.facing === "right" ? -2 - verticalStrength * 2 : 2 + verticalStrength * 2)
        : jumpPose === "apex"
            ? (player.facing === "right" ? 1 : -1)
            : 0;

    const jumpBob = jumpPose === "rising" ? -1 - verticalStrength : 0;

    ctx.translate(jumpLean, -(idleBob + walkBob) + jumpBob);

    ctx.strokeStyle =
        player.damageFlashTimer > 0
            ? "#ff0000"
            : look.body;

    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";

    // Character aura
    if (
        player.character === "Shadow Ninja" ||
        player.character === "Mage" ||
        player.character === "Doctor"
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

    // Knight helmet and face guard
    if (player.character === "Knight") {
        ctx.fillStyle = "#aeb6bc";
        ctx.strokeStyle = "#5f6870";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.arc(midX, topY + 8, 8.5, Math.PI, Math.PI * 2);
        ctx.lineTo(midX + 8.5, topY + 12);
        ctx.lineTo(midX - 8.5, topY + 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#747e86";
        ctx.fillRect(midX - 7, topY + 9, 14, 4);

        ctx.fillStyle = "#d8dde0";
        ctx.fillRect(midX - 1.5, topY - 1, 3, 7);

        ctx.fillStyle = "#ffcc00";
        ctx.beginPath();
        ctx.moveTo(midX - 3.5, topY - 1);
        ctx.lineTo(midX + 3.5, topY - 1);
        ctx.lineTo(midX, topY - 7);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#111111";
        ctx.fillRect(midX - 5, topY + 10, 3, 2);
        ctx.fillRect(midX + 2, topY + 10, 3, 2);
    }

    // Body
    ctx.shadowBlur = 0;

    if (player.character === "Knight") {
        ctx.fillStyle = "#2677cc";
        ctx.strokeStyle = "#174b9c";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(midX - 9, topY + 14);
        ctx.lineTo(midX + 9, topY + 14);
        ctx.lineTo(midX + 7, topY + 33);
        ctx.lineTo(midX - 7, topY + 33);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#bfc7cc";
        ctx.strokeStyle = "#69747b";
        ctx.beginPath();
        ctx.moveTo(midX - 7, topY + 17);
        ctx.lineTo(midX - 2, topY + 14);
        ctx.lineTo(midX + 2, topY + 14);
        ctx.lineTo(midX + 7, topY + 17);
        ctx.lineTo(midX + 5, topY + 27);
        ctx.lineTo(midX - 5, topY + 27);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(midX - 1.5, topY + 17, 3, 8);
        ctx.fillRect(midX - 4, topY + 19, 8, 3);
    } else {
        ctx.strokeStyle = look.body;
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(midX, topY + 15);
        ctx.lineTo(midX, topY + 32);
        ctx.stroke();
    }

    // Arms
    ctx.lineWidth = 3.5;

    const swing = player.grounded
        ? Math.sin(player.animCycle) * 10
        : 0;

    if (player.character === "Knight") {
        ctx.strokeStyle = "#9ea7ad";
        ctx.beginPath();

        if (jumpPose === "rising") {
            ctx.moveTo(midX - 8, topY + 20);
            ctx.lineTo(midX - 15, topY + 12);
            ctx.moveTo(midX + 8, topY + 20);
            ctx.lineTo(midX + 15, topY + 12);
        } else {
            ctx.moveTo(midX - 8, topY + 20);
            ctx.lineTo(midX - 15 + swing * 0.35, topY + 29);
            ctx.moveTo(midX + 8, topY + 20);
            ctx.lineTo(midX + 15 - swing * 0.35, topY + 29);
        }
        ctx.stroke();

        ctx.fillStyle = "#69747b";
        ctx.fillRect(midX - 17 + swing * 0.35, topY + 26, 5, 5);
        ctx.fillRect(midX + 12 - swing * 0.35, topY + 26, 5, 5);
    } else {
        ctx.beginPath();

        if (jumpPose === "rising") {
            ctx.moveTo(midX, topY + 20);
            ctx.lineTo(midX - 14, topY + 12);
            ctx.moveTo(midX, topY + 20);
            ctx.lineTo(midX + 14, topY + 12);
        } else {
            ctx.moveTo(midX, topY + 20);
            ctx.lineTo(midX + swing, topY + 28);
            ctx.moveTo(midX, topY + 20);
            ctx.lineTo(midX - swing, topY + 28);
        }
        ctx.stroke();
    }

    // Legs
    ctx.beginPath();

    if (jumpPose === "rising") {
        ctx.moveTo(midX - 2, topY + 32);
        ctx.lineTo(midX - 10, topY + 39);
        ctx.lineTo(midX - 13, topY + 36);

        ctx.moveTo(midX + 2, topY + 32);
        ctx.lineTo(midX + 10, topY + 39);
        ctx.lineTo(midX + 13, topY + 36);
    } else if (jumpPose === "apex") {
        ctx.moveTo(midX - 2, topY + 32);
        ctx.lineTo(midX - 8, topY + 43);
        ctx.lineTo(midX - 13, topY + 43);

        ctx.moveTo(midX + 2, topY + 32);
        ctx.lineTo(midX + 8, topY + 43);
        ctx.lineTo(midX + 13, topY + 43);
    } else {
        ctx.moveTo(midX, topY + 32);
        ctx.lineTo(midX + swing, topY + 46);

        ctx.moveTo(midX, topY + 32);
        ctx.lineTo(midX - swing, topY + 46);
    }

    ctx.stroke();

    if (player.character === "Knight") {
        ctx.fillStyle = "#b7bdc1";
        ctx.fillRect(midX + swing - 3, topY + 40, 7, 5);
        ctx.fillRect(midX - swing - 3, topY + 40, 7, 5);
    }

    // Rogue hood, layered coat, and scarf
    if (player.character === "Rogue") {
        ctx.fillStyle = "#191919";
        ctx.strokeStyle = "#080808";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(midX - 9, topY + 9);
        ctx.quadraticCurveTo(midX - 11, topY - 4, midX, topY - 6);
        ctx.quadraticCurveTo(midX + 11, topY - 4, midX + 9, topY + 9);
        ctx.lineTo(midX + 6, topY + 13);
        ctx.lineTo(midX - 6, topY + 13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#262626";
        ctx.beginPath();
        ctx.moveTo(midX - 8, topY + 15);
        ctx.lineTo(midX + 8, topY + 15);
        ctx.lineTo(midX + 10, topY + 34);
        ctx.lineTo(midX - 10, topY + 34);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#991111";
        ctx.beginPath();
        ctx.moveTo(midX - 5, topY + 14);
        ctx.lineTo(midX + 5, topY + 14);
        ctx.lineTo(midX + 13, topY + 24);
        ctx.lineTo(midX + 5, topY + 21);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#111111";
        ctx.fillRect(midX - 6, topY + 21, 12, 3);
        ctx.fillRect(midX - 6, topY + 27, 12, 3);
    }

    // Mage hood, robes, belt, and crystal staff
    if (player.character === "Mage") {
        ctx.fillStyle = "#55208f";
        ctx.strokeStyle = "#35105e";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(midX - 10, topY + 13);
        ctx.quadraticCurveTo(midX - 12, topY - 1, midX, topY - 5);
        ctx.quadraticCurveTo(midX + 12, topY - 1, midX + 10, topY + 13);
        ctx.lineTo(midX + 8, topY + 35);
        ctx.lineTo(midX - 8, topY + 35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#7733b8";
        ctx.beginPath();
        ctx.moveTo(midX - 8, topY + 16);
        ctx.lineTo(midX + 8, topY + 16);
        ctx.lineTo(midX + 11, topY + 34);
        ctx.lineTo(midX - 11, topY + 34);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#d8b86a";
        ctx.fillRect(midX - 8, topY + 28, 16, 3);

        ctx.strokeStyle = "#8b6333";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(midX - 13, topY + 6);
        ctx.lineTo(midX - 13, topY + 45);
        ctx.stroke();

        ctx.fillStyle = "#00eaff";
        ctx.shadowColor = "#00ccff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(midX - 13, topY - 2);
        ctx.lineTo(midX - 8, topY + 5);
        ctx.lineTo(midX - 13, topY + 10);
        ctx.lineTo(midX - 18, topY + 5);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Robot head, chest plating, joints, and reactor
    if (player.character === "Robot") {
        ctx.fillStyle = "#9da5aa";
        ctx.strokeStyle = "#50585d";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(midX - 8, topY + 1);
        ctx.lineTo(midX + 8, topY + 1);
        ctx.lineTo(midX + 9, topY + 13);
        ctx.lineTo(midX - 9, topY + 13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#20272b";
        ctx.fillRect(midX - 6, topY + 7, 12, 4);

        ctx.fillStyle = "#00ddea";
        ctx.fillRect(midX - 4, topY + 8, 3, 2);
        ctx.fillRect(midX + 1, topY + 8, 3, 2);

        ctx.fillStyle = "#777f84";
        ctx.beginPath();
        ctx.moveTo(midX - 10, topY + 15);
        ctx.lineTo(midX + 10, topY + 15);
        ctx.lineTo(midX + 8, topY + 34);
        ctx.lineTo(midX - 8, topY + 34);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#30383c";
        ctx.fillRect(midX - 6, topY + 20, 12, 8);

        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(midX, topY + 24, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#4d5559";
        ctx.fillRect(midX - 8, topY + 34, 6, 10);
        ctx.fillRect(midX + 2, topY + 34, 6, 10);
    }

    // Shadow Ninja hood, mask, sash, and trailing aura
    if (player.character === "Shadow Ninja") {
        ctx.fillStyle = "#171020";
        ctx.strokeStyle = "#09050d";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(midX - 9, topY + 10);
        ctx.lineTo(midX - 11, topY - 2);
        ctx.lineTo(midX, topY - 7);
        ctx.lineTo(midX + 11, topY - 2);
        ctx.lineTo(midX + 9, topY + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#4b1d72";
        ctx.fillRect(midX - 8, topY + 8, 16, 5);

        ctx.fillStyle = "#cc66ff";
        ctx.fillRect(midX - 5, topY + 8, 3, 2);
        ctx.fillRect(midX + 2, topY + 8, 3, 2);

        ctx.fillStyle = "#1b1326";
        ctx.beginPath();
        ctx.moveTo(midX - 8, topY + 15);
        ctx.lineTo(midX + 8, topY + 15);
        ctx.lineTo(midX + 10, topY + 35);
        ctx.lineTo(midX - 10, topY + 35);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#aa30e8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(midX - 8, topY + 31);
        ctx.quadraticCurveTo(midX - 16, topY + 38, midX - 12, topY + 46);
        ctx.moveTo(midX + 8, topY + 31);
        ctx.quadraticCurveTo(midX + 16, topY + 38, midX + 12, topY + 46);
        ctx.stroke();

        ctx.strokeStyle = "#bb00ff";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#bb00ff";
        ctx.shadowBlur = 10;
        ctx.strokeRect(player.x - 4, player.y - 4, player.width + 8, player.height + 8);
        ctx.shadowBlur = 0;
    }

    // Doctor coat, shirt, stethoscope, and medical cross
    if (player.character === "Doctor") {
        ctx.fillStyle = "#eef3f5";
        ctx.strokeStyle = "#aab7be";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(midX - 10, topY + 14);
        ctx.lineTo(midX + 10, topY + 14);
        ctx.lineTo(midX + 12, topY + 34);
        ctx.lineTo(midX - 12, topY + 34);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#dce5e8";
        ctx.fillRect(midX - 2, topY + 15, 4, 19);

        ctx.strokeStyle = "#72828a";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(midX - 5, topY + 15);
        ctx.quadraticCurveTo(midX - 7, topY + 24, midX - 2, topY + 27);
        ctx.quadraticCurveTo(midX, topY + 29, midX + 2, topY + 27);
        ctx.quadraticCurveTo(midX + 7, topY + 24, midX + 5, topY + 15);
        ctx.stroke();

        ctx.fillStyle = "#39d98a";
        ctx.fillRect(midX - 2.5, topY + 19, 5, 12);
        ctx.fillRect(midX - 6.5, topY + 22.5, 13, 5);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(midX - 9, topY + 17);
        ctx.lineTo(midX - 6, topY + 31);
        ctx.moveTo(midX + 9, topY + 17);
        ctx.lineTo(midX + 6, topY + 31);
        ctx.stroke();
    }

    // Knight cape
    if (player.character === "Knight") {
        ctx.fillStyle = "#174b9c";
        ctx.strokeStyle = "#0c2f68";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(midX - 7, topY + 16);
        ctx.quadraticCurveTo(midX - 16, topY + 27, midX - 12, topY + 43);
        ctx.quadraticCurveTo(midX - 5, topY + 37, midX - 1, topY + 31);
        ctx.lineTo(midX + 2, topY + 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "#ffcc66";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(midX - 11, topY + 38);
        ctx.lineTo(midX - 5, topY + 35);
        ctx.stroke();
    }

    // Archer hood and quiver
    if (player.character === "Archer") {
        ctx.fillStyle = "#4f3828";
        ctx.beginPath();
        ctx.moveTo(midX - 9, topY + 7);
        ctx.quadraticCurveTo(midX, topY - 4, midX + 9, topY + 7);
        ctx.lineTo(midX + 7, topY + 14);
        ctx.quadraticCurveTo(midX, topY + 10, midX - 7, topY + 14);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#70462d";
        ctx.fillRect(midX - 9, topY + 15, 18, 18);

        ctx.fillStyle = "#3f2a1d";
        ctx.fillRect(midX + 7, topY + 18, 6, 16);

        ctx.strokeStyle = "#d8b56a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(midX + 8, topY + 19);
        ctx.lineTo(midX + 12, topY + 7);
        ctx.moveTo(midX + 10, topY + 19);
        ctx.lineTo(midX + 15, topY + 9);
        ctx.stroke();

        ctx.fillStyle = "#6c4a31";
        ctx.fillRect(midX - 10, topY + 30, 20, 4);
    }

    // Realistic bow and aimed arrow
    if (player.character === "Archer" ||
        (player.hasBow && player.equippedWeapon === "bow")) {
        ctx.save();
        ctx.translate(
            midX + (player.facing === "right" ? 11 : -11),
            topY + 22
        );
        ctx.scale(player.facing === "right" ? 1 : -1, 1);

        ctx.strokeStyle = "#b37a43";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -13);
        ctx.quadraticCurveTo(13, 0, 0, 13);
        ctx.stroke();

        ctx.strokeStyle = "#d8d5c4";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -13);
        ctx.lineTo(0, 13);
        ctx.stroke();

        ctx.strokeStyle = "#8b5a32";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(13, 0);
        ctx.stroke();

        ctx.fillStyle = "#dce8ed";
        ctx.beginPath();
        ctx.moveTo(13, 0);
        ctx.lineTo(8, -3);
        ctx.lineTo(9, 0);
        ctx.lineTo(8, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    else if (player.hasPickedUpSword && !player.isAttacking) {
        ctx.save();
        ctx.translate(midX, topY + 20);

        const direction = player.facing === "right" ? 1 : -1;
        ctx.scale(direction, 1);
        ctx.rotate(-0.55);

        ctx.fillStyle = "#dce8ed";
        ctx.strokeStyle = "#728792";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(8, -2);
        ctx.lineTo(31, -5);
        ctx.lineTo(36, 0);
        ctx.lineTo(31, 5);
        ctx.lineTo(8, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(5, -7, 7, 14);
        ctx.fillStyle = "#70452a";
        ctx.fillRect(-3, -3, 10, 6);
        ctx.restore();
    }

    // Melee attack
    if (player.isAttacking) {
        ctx.save();
        ctx.translate(midX, topY + 20);

        const direction = player.facing === "right" ? 1 : -1;
        ctx.scale(direction, 1);

        ctx.strokeStyle = "rgba(255,255,210,.95)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, 42, -0.75, 0.75);
        ctx.stroke();

        ctx.strokeStyle = "#ffb84d";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 48, -0.55, 0.55);
        ctx.stroke();
        ctx.restore();
    }

    // Shield
    if (player.shieldActive) {
        ctx.save();

        if (player.character === "Knight") {
            const shieldX = midX + (player.facing === "right" ? 18 : -18);

            ctx.fillStyle = "#174b9c";
            ctx.strokeStyle = "#ffcc00";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(shieldX, topY + 10);
            ctx.quadraticCurveTo(shieldX + 10, topY + 13, shieldX + 10, topY + 25);
            ctx.quadraticCurveTo(shieldX + 8, topY + 37, shieldX, topY + 42);
            ctx.quadraticCurveTo(shieldX - 8, topY + 37, shieldX - 10, topY + 25);
            ctx.quadraticCurveTo(shieldX - 10, topY + 13, shieldX, topY + 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#dce8ed";
            ctx.fillRect(shieldX - 1.5, topY + 15, 3, 21);
            ctx.fillRect(shieldX - 6, topY + 23, 12, 3);
        } else {
            ctx.strokeStyle = "#00ccff";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(midX, topY + 23, 28, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    // =================================
    // SPECIALIZED CHARACTER ANIMATIONS
    // =================================

    const animTime = performance.now() / 100;

    ctx.save();

    if (player.character === "Knight") {
        // Cape flutter and shield glint.
        ctx.fillStyle = "rgba(255,204,0,.65)";
        const glint = 3 + Math.sin(animTime) * 3;
        ctx.fillRect(midX + 7, topY + 18 + glint * 0.15, 2, 2);

        if (player.isAttacking) {
            ctx.strokeStyle = "rgba(255,235,170,.9)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(midX, topY + 23, 38, -0.9, 0.75);
            ctx.stroke();
        }
    }

    else if (player.character === "Rogue") {
        // Hood shadow flicker and dash-afterimages.
        ctx.fillStyle = "rgba(255,40,40,.12)";
        ctx.beginPath();
        ctx.arc(midX, topY + 8, 10 + Math.sin(animTime) * 1.5, 0, Math.PI * 2);
        ctx.fill();

        if (player.isDashing) {
            const direction = player.facing === "right" ? 1 : -1;
            ctx.fillStyle = "rgba(210,30,30,.22)";
            for (let i = 1; i <= 3; i++) {
                ctx.beginPath();
                ctx.ellipse(midX - direction * i * 9, topY + 24, 7, 15 - i * 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    else if (player.character === "Archer") {
        // Nocked arrow pulse while ranged attacks are equipped.
        if (player.hasBow && player.equippedWeapon === "bow") {
            const draw = 4 + (player.shootCooldown > 0 ? 3 : 0);
            ctx.strokeStyle = "rgba(216,181,106,.9)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(midX - draw, topY + 22);
            ctx.lineTo(midX + (player.facing === "right" ? 15 : -15), topY + 22);
            ctx.stroke();
        }

        if (player.character === "Archer" && player.abilityActive > 0) {
            ctx.strokeStyle = "rgba(255,220,150,.75)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(midX, topY + 23, 18 + Math.sin(animTime) * 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    else if (player.character === "Mage") {
        // Orbiting runes around the raised crystal staff.
        ctx.save();
        ctx.translate(midX - 13, topY + 5);
        ctx.rotate(animTime * 0.09);
        ctx.fillStyle = "rgba(90,220,255,.8)";
        ctx.shadowColor = "#00ccff";
        ctx.shadowBlur = 8;
        for (let i = 0; i < 3; i++) {
            const angle = i * Math.PI * 2 / 3;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * 9, Math.sin(angle) * 9, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    else if (player.character === "Robot") {
        // Pulsing cyan reactor and venting steam.
        ctx.fillStyle = player.abilityActive > 0 ? "#ffffff" : "#00ffff";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 8 + Math.sin(animTime) * 5;
        ctx.beginPath();
        ctx.arc(midX, topY + 24, 3.5 + Math.sin(animTime) * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "rgba(180,240,255,.55)";
        ctx.beginPath();
        ctx.arc(midX - 6, topY + 5 - (gameState.frame % 18) * 0.3, 2, 0, Math.PI * 2);
        ctx.arc(midX + 6, topY + 3 - (gameState.frame % 18) * 0.25, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    else if (player.character === "Shadow Ninja") {
        // Purple afterimages, clone ring, and dash streaks.
        if (player.isDashing) {
            const direction = player.facing === "right" ? 1 : -1;

            ctx.fillStyle = "rgba(170,0,255,.20)";
            ctx.strokeStyle = "rgba(225,150,255,.68)";
            ctx.lineWidth = 2;

            for (let i = 1; i <= 4; i++) {
                const trailX = midX - direction * i * 12;
                ctx.beginPath();
                ctx.ellipse(trailX, topY + 23, 7 - i * 0.7, 18 - i, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }

            ctx.strokeStyle = "rgba(204,82,255,.85)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(midX - direction * 18, topY + 20);
            ctx.lineTo(midX - direction * 48, topY + 20);
            ctx.moveTo(midX - direction * 14, topY + 32);
            ctx.lineTo(midX - direction * 38, topY + 32);
            ctx.stroke();
        } else {
            ctx.fillStyle = `rgba(187,0,255,${0.08 + Math.sin(animTime) * 0.03})`;
            ctx.beginPath();
            ctx.ellipse(midX, topY + 24, 16, 24, 0, 0, Math.PI * 2);
            ctx.fill();

            if (player.abilityActive > 0) {
                ctx.strokeStyle = "rgba(225,150,255,.9)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(midX, topY + 23, 26 + Math.sin(animTime) * 4, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    else if (player.character === "Doctor") {
        // Green medical pulse and healing ring.
        if (player.abilityActive > 0) {
            const pulse = 24 + (180 - player.abilityActive) * 0.12;
            ctx.strokeStyle = "rgba(57,217,138,.75)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(midX, topY + 23, pulse, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "rgba(57,217,138,.18)";
            ctx.beginPath();
            ctx.arc(midX, topY + 23, 12 + Math.sin(animTime) * 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = "rgba(57,217,138,.55)";
            ctx.beginPath();
            ctx.arc(midX + 7, topY + 4 + Math.sin(animTime) * 2, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();

    // =================================
    // CHARACTER-SPECIFIC ACTION ANIMATIONS
    // =================================

    const actionTime = performance.now() / 90;
    ctx.save();

    if (player.character === "Knight") {
        ctx.strokeStyle = "#ffcc66";
        ctx.lineWidth = 2;

        if (!player.grounded) {
            ctx.beginPath();
            ctx.moveTo(midX - 8, topY + 43);
            ctx.lineTo(midX - 12 - Math.sin(actionTime) * 3, topY + 49);
            ctx.moveTo(midX + 8, topY + 43);
            ctx.lineTo(midX + 12 + Math.sin(actionTime) * 3, topY + 49);
            ctx.stroke();
        }

        if (player.isAttacking) {
            ctx.strokeStyle = "#fff0b3";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(midX, topY + 23, 42, -1.15, 0.85);
            ctx.stroke();
        }

        if (player.hasBow && player.equippedWeapon === "bow") {
            ctx.strokeStyle = "#caa15d";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(midX, topY + 22);
            ctx.lineTo(midX + (player.facing === "right" ? 24 : -24), topY + 22);
            ctx.stroke();
        }
    }

    else if (player.character === "Rogue") {
        if (!player.grounded) {
            ctx.strokeStyle = "rgba(255,60,60,.75)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(midX - 5, topY + 40);
            ctx.lineTo(midX - 13, topY + 50);
            ctx.moveTo(midX + 5, topY + 40);
            ctx.lineTo(midX + 13, topY + 50);
            ctx.stroke();
        }

        if (player.isAttacking) {
            ctx.strokeStyle = "rgba(255,70,70,.9)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(midX, topY + 24, 34, -1.2, 1.1);
            ctx.stroke();
        }

        if (player.isDashing) {
            ctx.fillStyle = "rgba(255,40,40,.28)";
            ctx.fillRect(midX - (player.facing === "right" ? 28 : -12), topY + 8, 16, 34);
        }

        if (player.hasBow && player.equippedWeapon === "bow") {
            ctx.strokeStyle = "#d84a4a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(midX + (player.facing === "right" ? 12 : -12), topY + 22, 11, -1.2, 1.2);
            ctx.stroke();
        }
    }

    else if (player.character === "Archer") {
        if (!player.grounded) {
            ctx.fillStyle = "rgba(216,181,106,.6)";
            ctx.beginPath();
            ctx.ellipse(midX - 8, topY + 44, 3, 7, 0, 0, Math.PI * 2);
            ctx.ellipse(midX + 8, topY + 44, 3, 7, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (player.isAttacking) {
            ctx.strokeStyle = "#f4d28b";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(midX, topY + 20);
            ctx.lineTo(midX + (player.facing === "right" ? 48 : -48), topY + 12);
            ctx.stroke();
        }

        if (player.shootCooldown > 0) {
            ctx.fillStyle = "rgba(255,234,169,.9)";
            ctx.beginPath();
            ctx.arc(midX + (player.facing === "right" ? 23 : -23), topY + 22, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        if (player.abilityActive > 0) {
            ctx.strokeStyle = "rgba(255,220,150,.8)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(midX, topY + 23, 20 + Math.sin(actionTime) * 4, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    else if (player.character === "Mage") {
        if (!player.grounded) {
            ctx.fillStyle = "rgba(90,220,255,.35)";
            ctx.beginPath();
            ctx.moveTo(midX - 10, topY + 38);
            ctx.lineTo(midX, topY + 55 + Math.sin(actionTime) * 4);
            ctx.lineTo(midX + 10, topY + 38);
            ctx.closePath();
            ctx.fill();
        }

        if (player.isAttacking) {
            ctx.strokeStyle = "rgba(255,255,255,.9)";
            ctx.shadowColor = "#00ccff";
            ctx.shadowBlur = 12;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(midX - 13, topY + 5, 17, -1.3, 1.3);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        if (player.shootCooldown > 0 || player.abilityActive > 0) {
            ctx.fillStyle = "rgba(0,220,255,.7)";
            ctx.beginPath();
            ctx.arc(midX - 13, topY + 4, 7 + Math.sin(actionTime) * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    else if (player.character === "Robot") {
        if (isMoving) {
            ctx.fillStyle = "rgba(160,230,255,.55)";
            ctx.beginPath();
            ctx.arc(midX - 8, topY + 48, 3, 0, Math.PI * 2);
            ctx.arc(midX + 8, topY + 48, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        if (!player.grounded) {
            ctx.fillStyle = "rgba(0,220,255,.55)";
            ctx.beginPath();
            ctx.moveTo(midX - 7, topY + 43);
            ctx.lineTo(midX - 4, topY + 54);
            ctx.lineTo(midX, topY + 43);
            ctx.closePath();
            ctx.fill();
        }

        if (player.isAttacking) {
            ctx.fillStyle = "rgba(0,238,255,.45)";
            ctx.beginPath();
            ctx.arc(midX + (player.facing === "right" ? 42 : -42), topY + 23, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        if (player.shootCooldown > 0) {
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(midX, topY + 24);
            ctx.lineTo(midX + (player.facing === "right" ? 28 : -28), topY + 24);
            ctx.stroke();
        }
    }

    else if (player.character === "Shadow Ninja") {

        if (isMoving) {
            ctx.fillStyle = "rgba(170,40,255,.18)";
            ctx.beginPath();
            ctx.ellipse(midX - (player.facing === "right" ? 12 : -12), topY + 43, 10, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (!player.grounded) {
            // Jump/fall shadows are intentionally omitted; only the circular spin rings remain.
        }

        if (player.isAttacking) {
            ctx.strokeStyle = "#d14cff";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(midX, topY + 24, 38, -1.2, 1.2);
            ctx.stroke();
        }

        if (player.isDashing) {
            ctx.fillStyle = "rgba(180,50,255,.22)";
            ctx.fillRect(midX - (player.facing === "right" ? 35 : -5), topY + 5, 30, 42);
        }

        if (player.hasBow && player.equippedWeapon === "bow") {
            ctx.strokeStyle = "#bb55ff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(midX + (player.facing === "right" ? 12 : -12), topY + 22, 12, -1.3, 1.3);
            ctx.stroke();
        }
    }

    else if (player.character === "Doctor") {
        if (!player.grounded) {
            ctx.strokeStyle = "rgba(57,217,138,.7)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(midX - 8, topY + 42);
            ctx.lineTo(midX - 12, topY + 50);
            ctx.moveTo(midX + 8, topY + 42);
            ctx.lineTo(midX + 12, topY + 50);
            ctx.stroke();
        }

        if (player.isAttacking) {
            ctx.fillStyle = "rgba(255,255,255,.7)";
            ctx.fillRect(midX + (player.facing === "right" ? 22 : -26), topY + 18, 4, 10);
            ctx.fillRect(midX + (player.facing === "right" ? 19 : -23), topY + 21, 10, 4);
        }

        if (player.abilityActive > 0) {
            ctx.strokeStyle = "rgba(57,217,138,.9)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(midX, topY + 23, 26 + Math.sin(actionTime) * 3, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (player.hasBow && player.equippedWeapon === "bow") {
            ctx.strokeStyle = "#39d98a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(midX + (player.facing === "right" ? 12 : -12), topY + 22, 11, -1.2, 1.2);
            ctx.stroke();
        }
    }

    ctx.restore();

    // =================================
    // CHARACTER-JUMP DETAILS
    // =================================

    if (!player.grounded) {
        ctx.save();

        if (player.character === "Rogue") {
            ctx.strokeStyle = "#ff3333";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(midX + 5, topY + 16);
            ctx.quadraticCurveTo(midX + 18, topY + 24 + Math.sin(characterAnimTime) * 4, midX + 12, topY + 38);
            ctx.stroke();
        }

        if (player.character === "Mage") {
            ctx.fillStyle = "rgba(90,220,255,.28)";
            ctx.beginPath();
            ctx.ellipse(midX - 13, topY + 4, 8, 5 + verticalStrength * 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (player.character === "Robot") {
            ctx.fillStyle = "rgba(0,220,255,.38)";
            ctx.beginPath();
            ctx.moveTo(midX - 7, topY + 42);
            ctx.lineTo(midX - 3, topY + 50 + verticalStrength * 5);
            ctx.lineTo(midX, topY + 42);
            ctx.closePath();
            ctx.fill();
        }

        if (player.character === "Shadow Ninja") {
            ctx.strokeStyle = "rgba(190,80,255,.65)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(midX - 8, topY + 38);
            ctx.quadraticCurveTo(midX, topY + 48 + verticalStrength * 4, midX + 8, topY + 38);
            ctx.stroke();
        }

        if (player.character === "Doctor") {
            ctx.strokeStyle = "#eef3f5";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(midX - 9, topY + 16);
            ctx.lineTo(midX - 13, topY + 38);
            ctx.moveTo(midX + 9, topY + 16);
            ctx.lineTo(midX + 13, topY + 38);
            ctx.stroke();
        }

        if (player.character === "Archer") {
            ctx.strokeStyle = "#d8b56a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(midX + 8, topY + 18);
            ctx.quadraticCurveTo(midX + 18, topY + 27, midX + 13, topY + 38);
            ctx.stroke();
        }

        ctx.restore();
    }

    // =================================
// HOVER BOOTS VISUAL DESIGN
// =================================

if (player.hasHoverBoots) {

    const bootY = topY + 40;
    const glow = Math.sin(performance.now() / 100) * 4;

    ctx.save();

    // Purple and cyan glow
    ctx.shadowColor = "#00eeff";
    ctx.shadowBlur = 15 + glow;

    // Left boot
    ctx.fillStyle = "#222244";
    ctx.fillRect(midX - 10, bootY, 9, 8);

    // Right boot
    ctx.fillRect(midX + 2, bootY, 9, 8);

    // Cyan armor
    ctx.fillStyle = "#00eeff";
    ctx.fillRect(midX - 10, bootY, 9, 3);
    ctx.fillRect(midX + 2, bootY, 9, 3);

    // Purple details
    ctx.fillStyle = "#bb44ff";
    ctx.fillRect(midX - 8, bootY + 5, 5, 2);
    ctx.fillRect(midX + 4, bootY + 5, 5, 2);

    // Hover flames
    if (player.isHovering) {

        ctx.fillStyle = "#00ffff";

        ctx.beginPath();
        ctx.moveTo(midX - 9, bootY + 9);
        ctx.lineTo(midX - 5, bootY + 17 + glow);
        ctx.lineTo(midX - 1, bootY + 9);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(midX + 3, bootY + 9);
        ctx.lineTo(midX + 7, bootY + 17 + glow);
        ctx.lineTo(midX + 11, bootY + 9);
        ctx.fill();
    }

    ctx.restore();
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
updateIndexDisplay();

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

        initGameMusic();
        setMusicTrack("exploration");

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
        document.getElementById("game-container")?.classList.add("cutscene-running");
        gameState.isPaused = true;

        playOpeningCutscene(() => {
            document.getElementById("game-container")?.classList.remove("cutscene-running");
            gameState.isPaused = false;

            // Load the saved level
            loadLevel(gameState.level);

            updateHUD();
            updateShopButtons();
            updateIndexDisplay();
            saveGame();
        });
    });

} else {
    console.error("Missing game startup HTML elements.");
}

// ============================================
// OPENING CUTSCENE
// ============================================

async function playOpeningCutscene(onComplete) {
    const overlay = document.getElementById("cutscene-overlay");
    const textElement = document.getElementById("cutscene-text");
    const speakerElement = document.getElementById("cutscene-speaker");
    const skipButton = document.getElementById("skip-cutscene-btn");

    if (!overlay || !textElement) {
        onComplete();
        return;
    }

    const scene = [
        { text: "Before all of this, everything was peaceful.", stage: "outside", fade: false, hold: 2200 },
        { text: "I wanted nothing to change in this world...", stage: "outside", fade: false, hold: 2200 },
        { text: "", stage: "room", fade: false, hold: 1800 },
        { text: "", stage: "bed", fade: false, hold: 2200 },
        { text: "But then ___ came...", stage: "bed", fade: true },
        { text: "I watched ___ take over my world, my freedom, everything that I loved.", fade: true },
        { text: "It took everyone away, but for some reason, they never took me.", fade: true },
        { text: "It's been years since the incident.", fade: true },
        { text: "I made a ship, and flew in the direction that ___ went. Until I hit a planet.", fade: true },
        { text: "I think I found it", fade: false }
    ];

    let skipped = false;
    skipButton?.addEventListener("click", event => {
        event.stopPropagation();
        skipped = true;
    }, { once: true });

    const stageElement = document.getElementById("cutscene-stage");

    overlay.classList.remove("hidden");
    // if (speakerElement) speakerElement.textContent = "(Player)";

    for (const line of scene) {
        if (skipped) break;

        if (stageElement) {
            if (line.stage === "outside") {
                stageElement.className = "cutscene-outside";
                stageElement.innerHTML = `
                    <div class="cutscene-person player"></div>
                    <div class="cutscene-person family-one"></div>
                    <div class="cutscene-person family-two"></div>
                `;
            } else if (line.stage === "room") {
                stageElement.className = "cutscene-room";
                stageElement.innerHTML = `
                    <div class="cutscene-room-door"></div>
                    <div class="cutscene-room-player"></div>
                `;
            } else if (line.stage === "bed") {
                stageElement.className = "cutscene-bed";
                stageElement.innerHTML = `
                    <div class="cutscene-bed-frame"></div>
                    <div class="cutscene-bed-matress"></div>
                    <div class="cutscene-bed-player"></div>
                `;
            }
        }

        if (line.fade) {
            stageElement?.classList.add("fade-black");
            overlay.classList.remove("fade-black");
        } else {
            stageElement?.classList.remove("fade-black");
            overlay.classList.remove("fade-black");
        }

        textElement.textContent = "";

        if (line.text) {
            for (const character of line.text) {
                if (skipped) break;
                textElement.textContent += character;
                initGameMusic();
                playSoundEffect("hit");
                await new Promise(resolve => setTimeout(resolve, 22));
            }
        }

        if (skipped) break;

        await new Promise(resolve => {
            const advance = () => {
                overlay.removeEventListener("click", advance);
                resolve();
            };
            overlay.addEventListener("click", advance, { once: true });
        });
    }

    stageElement?.classList.remove("fade-black");
    overlay.classList.remove("fade-black");
    overlay.classList.add("hidden");
    onComplete();
}

// ============================================
// START ONLY ONE GAME LOOP
// ============================================

gameLoop();

setupSettingsControls();

const musicToggleButton = document.getElementById("music-toggle-btn");
if (musicToggleButton) {
    musicToggleButton.textContent = gameMusic.muted ? "Music: Off" : "Music: On";
    musicToggleButton.classList.toggle("muted", gameMusic.muted);
    musicToggleButton.addEventListener("click", toggleGameMusic);
}

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
