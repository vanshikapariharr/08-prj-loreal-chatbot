const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const WORKER_URL = "https://broad-tree-4f22.vpariha1.workers.dev";

const messages = [
  {
    role: "system",
    content:
      "You are a helpful L'Oréal beauty advisor. Only answer questions about L'Oréal products, skincare, makeup, haircare, fragrance, routines, ingredients, and product recommendations. If the user asks about anything unrelated, politely refuse and redirect them to L'Oréal beauty topics. Keep responses friendly and concise.",
  },
];

function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `msg ${role}`;

  const label = document.createElement("div");
  label.className = "msg-label";
  label.textContent = role === "user" ? "You" : "L'Oréal Advisor";

  const content = document.createElement("div");
  content.className = "msg-text";
  content.textContent = String(text); // fixes [object Object]

  bubble.appendChild(label);
  bubble.appendChild(content);
  chatWindow.appendChild(bubble);
  scrollToBottom();

  return bubble;
}

function showTyping() {
  const bubble = document.createElement("div");
  bubble.className = "msg ai typing";

  const label = document.createElement("div");
  label.className = "msg-label";
  label.textContent = "L'Oréal Advisor";

  const content = document.createElement("div");
  content.className = "msg-text";
  content.textContent = "Typing...";

  bubble.appendChild(label);
  bubble.appendChild(content);
  chatWindow.appendChild(bubble);
  scrollToBottom();

  return bubble;
}

addMessage(
  "ai",
  "Hi! I am your L'Oréal beauty advisor. Ask me about products, routines, or what to use for your skin or hair type.",
);

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  userInput.value = "";
  userInput.focus();

  messages.push({ role: "user", content: text });
  addMessage("user", text);

  const typingBubble = showTyping();

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();
    typingBubble.remove();

    const rawReply =
      data?.choices?.[0]?.message?.content ??
      data?.error ??
      "Sorry, I could not generate a response right now.";

    const reply =
      typeof rawReply === "string"
        ? rawReply
        : Array.isArray(rawReply)
          ? rawReply.map((p) => p.text || JSON.stringify(p)).join(" ")
          : JSON.stringify(rawReply);

    messages.push({ role: "assistant", content: reply });
    addMessage("ai", reply);
  } catch (error) {
    typingBubble.remove();
    addMessage("ai", "Sorry, something went wrong connecting to the chatbot.");
    console.error(error);
  }
});
