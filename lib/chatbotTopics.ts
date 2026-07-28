export interface ChatTopic {
  slug: string;
  label: string;
  icon: string;
  greeting: string;
  questions: string[];
}

export const CHAT_TOPICS: ChatTopic[] = [
  {
    slug: "weather",
    label: "Weather Forecast",
    icon: "fa-cloud-sun-rain",
    greeting: "Ask me about rainfall, temperature or the best time to irrigate in your district.",
    questions: [
      "Will it rain in my district this week?",
      "What is the best time to irrigate today?",
      "Should I delay harvesting because of the weather?",
    ],
  },
  {
    slug: "crop-guides",
    label: "Crop Guide",
    icon: "fa-book-open",
    greeting: "Ask me about soil prep, sowing, feeding or harvest timing for any crop.",
    questions: [
      "How do I prepare soil for growing tomatoes?",
      "When should I sow paddy this season?",
      "What is the best fertilizer schedule for chili?",
    ],
  },
  {
    slug: "ai-chatbot",
    label: "Pest & Disease",
    icon: "fa-camera-retro",
    greeting: "Describe what you see on the plant and I will help identify the pest or disease and suggest a treatment.",
    questions: [
      "How to identify and control common pests in tomato crops?",
      "My rice leaves have yellow spots, what should I do?",
      "How can I prevent leaf blight naturally?",
    ],
  },
  {
    slug: "irrigation-solar",
    label: "Irrigation & Solar",
    icon: "fa-solar-panel",
    greeting: "Ask me about drip irrigation setups, solar pumps, costs or subsidy eligibility.",
    questions: [
      "How much does a solar water pump cost?",
      "Am I eligible for a solar subsidy?",
      "What is the difference between drip and sprinkler irrigation?",
    ],
  },
  {
    slug: "marketplace",
    label: "Marketplace",
    icon: "fa-store",
    greeting: "Ask me about buying seeds and fertilizer, or selling your own produce on Valam.",
    questions: [
      "Where can I buy certified paddy seeds?",
      "How do I list my produce for sale?",
      "What is a fair price for organic compost?",
    ],
  },
];

export const DEFAULT_CHAT_TOPIC = "ai-chatbot";
