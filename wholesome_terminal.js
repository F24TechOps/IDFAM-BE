const config = {
  hugEmoji: "(づ｡◕‿‿◕｡)づ",
  affirmations: [
    "You are seen", "You are heard", "You are enough", "You are resilient", "You are kind",
    "Rest is not failure", "Small steps matter", "You deserve peace", "You’re doing great"
  ],
  bannerMessages: [
    "💚 Stay kind | Rest is brave | You matter | Breathe | You are loved 💚",
    "🌟 You are doing better than you think 🌟",
    "🌈 Everything is figureoutable 🌈"
  ],
  encouragements: [
    "You're doing great", "Keep breathing", "You matter", "Believe in your strength",
    "This moment is yours", "Progress, not perfection", "Be gentle with yourself"
  ],
  companion: {
    name: "PixelPal",
    mood: "happy",
    energy: 92,
    love: "∞",
    loyalty: 100,
    actions: ["purr", "tail wags", "snuggle", "happy blinks", "roll over"]
  },
  plantEmoji: "🌿",
  width: 120
};

function printBanner(text) {
  console.log("═".repeat(config.width));
  const padding = Math.max(0, Math.floor((config.width - text.length) / 2));
  console.log(" ".repeat(padding) + text);
  console.log("═".repeat(config.width));
}

function sendVirtualHug(name = "you") {
  console.log(`Sending hug to ${name}: ${config.hugEmoji.repeat(4)}`);
}

function printAffirmations() {
  config.affirmations.forEach((msg, i) => {
    console.log(`✨ ${msg.padEnd(30)} | timestamp: ${new Date().toLocaleTimeString()} ✨`);
  });
}

function printEncouragements() {
  console.log("💬 Encouragements: ", config.encouragements.join("  |  "));
}

function printCompanion() {
  const c = config.companion;
  console.log("🐾 Companion Status:");
  console.log(`Name: ${c.name}  | Mood: ${c.mood}  | Energy: ${c.energy}  | Love: ${c.love}  | Loyalty: ${c.loyalty}`);
  console.log("Actions:", c.actions.join(" • "));
}

function printSpacing() {
  for (let i = 0; i < 10; i++) {
    console.log(" ".repeat(i * 4) + config.plantEmoji.repeat(30 - i * 2));
  }
}

function runTerminal() {
  console.clear();
  printBanner(config.bannerMessages[0]);
  sendVirtualHug();
  printEncouragements();
  printBanner(config.bannerMessages[1]);
  printCompanion();
  printAffirmations();
  printBanner(config.bannerMessages[2]);
  printSpacing();
  printBanner(config.bannerMessages[0]);
}

runTerminal();
