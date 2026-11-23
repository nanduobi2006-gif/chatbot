const API_URL = "http://localhost:5000/api/chat";

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const messages = document.getElementById("messages");
const welcomeScreen = document.getElementById("welcomeScreen");
const sendButton = document.getElementById("sendButton");
const newChatButton = document.getElementById("newChat");
const historyList = document.getElementById("historyList");

let chatHistory = [];

// Display messages
function addMessage(text, sender) {
    const message = document.createElement("div");
    message.className = `message ${sender}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = sender === "user" ? "👤" : "✦";

    const content = document.createElement("div");
    content.className = "message-content";
    content.textContent = text;

    message.appendChild(avatar);
    message.appendChild(content);
    messages.appendChild(message);

    const chatArea = document.getElementById("chatArea");
    chatArea.scrollTop = chatArea.scrollHeight;

    return message;
}

// Loading animation
function showLoading() {
    const loading = document.createElement("div");
    loading.className = "typing";
    loading.id = "loading";
    loading.textContent = "✦ Axon AI is thinking...";

    messages.appendChild(loading);

    const chatArea = document.getElementById("chatArea");
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Remove loading
function hideLoading() {
    const loading = document.getElementById("loading");
    if (loading) loading.remove();
}

// Send message to MySQL + Gemini backend
async function sendMessage(question) {
    if (!question.trim()) return;

    welcomeScreen.style.display = "none";

    addMessage(question, "user");

    userInput.value = "";
    userInput.style.height = "auto";
    sendButton.disabled = true;

    showLoading();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: question,
                history: chatHistory
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Backend request failed");
        }

        const answer = data.reply || data.answer || data.response;

        if (!answer) {
            throw new Error("No answer received");
        }

        hideLoading();

        addMessage(answer, "bot");

        chatHistory.push({
            role: "user",
            content: question
        });

        chatHistory.push({
            role: "assistant",
            content: answer
        });

        updateHistory(question);

    } catch (error) {
        hideLoading();

        addMessage(
            "Sorry! Axon AI could not connect. Please check the backend and try again.",
            "bot"
        );

        console.error("Axon AI Error:", error);

    } finally {
        sendButton.disabled = false;
        userInput.focus();
    }
}

// Submit form
chatForm.addEventListener("submit", function(event) {
    event.preventDefault();
    sendMessage(userInput.value);
});

// Enter key
userInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});

// Auto-resize input
userInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
});

// Suggested questions
document.querySelectorAll(".suggestion-card").forEach(button => {
    button.addEventListener("click", function() {
        const question = this.dataset.question;
        if (question) sendMessage(question);
    });
});

// New chat
newChatButton.addEventListener("click", function() {
    messages.innerHTML = "";
    chatHistory = [];

    welcomeScreen.style.display = "block";
    userInput.value = "";
    userInput.focus();
});

// Recent chat history
function updateHistory(question) {
    const empty = historyList.querySelector(".empty-history");

    if (empty) empty.remove();

    const item = document.createElement("div");
    item.className = "history-item";
    item.textContent = "💬 " + question;

    historyList.prepend(item);
}