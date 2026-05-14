export const ICON_MAP: Record<string, string> = {
  // Food & Drink
  food: "🍔",
  pizza: "🍕",
  coffee: "☕",
  restaurant: "🍽️",
  catering: "🥘",
  drinks: "🥤",
  snack: "🍿",
  groceries: "🛍️",
  bakery: "🥐",
  dessert: "🍰",

  // Transport
  car: "🚗",
  fuel: "⛽",
  motorcycle: "🏍️",
  taxi: "🚕",
  bus: "🚌",
  train: "🚆",
  flight: "✈️",
  travel: "🧳",
  parking: "🅿️",

  // Housing
  home: "🏠",
  rent: "🏢",
  electric: "💡",
  water: "💧",
  internet: "📡",
  gas: "🔥",
  furniture: "🛋️",
  repair: "🔧",

  // Health
  health: "💊",
  hospital: "🏥",
  doctor: "👨‍⚕️",
  pharmacy: "💉",
  fitness: "🏃",
  gym: "🏋️",
  mental: "🧠",

  // Shopping
  shop: "🛒",
  fashion: "👗",
  shoes: "👟",
  accessories: "💍",
  beauty: "💄",
  skincare: "🧴",

  // Entertainment
  game: "🎮",
  music: "🎵",
  movie: "🎬",
  streaming: "📺",
  sports: "⚽",
  hobby: "🎨",
  book: "📚",
  concert: "🎤",

  // Personal
  pet: "🐶",
  gift: "🎁",
  charity: "❤️",
  education: "🎓",
  baby: "👶",
  wedding: "💒",

  // Finance
  money: "💰",
  expense: "💸",
  bill: "🧾",
  tax: "📋",
  insurance: "🛡️",
  investment: "📈",
  savings: "🏦",
  loan: "💳",

  // Work
  phone: "📱",
  office: "💼",
  equipment: "💻",
  subscription: "🔄",
  salary: "💵",
  freelance: "🧑‍💻",

  // Other
  general: "📊",
  other: "📌",
};

export const getIcon = (key: string | null) => ICON_MAP[key ?? "money"] ?? "💰";
