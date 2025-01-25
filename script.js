const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "AIzaSyC5RXpFuOTOMCTY2fPBja05_k1jCxZfoYY"; // Use a secure backend to handle this instead

// Function to load data from localStorage and set default message
const loadDataFromLocalstorage = () => {
  const themeColor = localStorage.getItem("theme-color");

  document.body.classList.toggle("light-mode", themeColor === "light_mode");
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";
  // Function to show a default greeting message when the chat is empty
  const showDefaultMessage = `<div class="default-text">
      <h1>Hey I am Chat-Bot who is using Google gemini API. You can ask anything and I am created by Abhinav Mishra.</h1>
      <p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here.</p>
      </div>`;

  chatContainer.innerHTML =
    localStorage.getItem("all-chats") || showDefaultMessage;
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const createElement = (html, className) => {
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = html;
  return chatDiv;
};

// Fetch response from the API
const getChatResponse = async (incomingChatDiv) => {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Only this header is needed
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: userText, // Replace with the user's input
            },
          ],
        },
      ],
    }),
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const responseData = await response.json();

    // Append the AI response to the chat bubble
    const pElement = document.createElement("p");
    pElement.textContent =
      responseData.candidates[0].content.parts[0].text.trim();
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);

    // Save chat content to localStorage
    localStorage.setItem("all-chats", chatContainer.innerHTML);
  } catch (error) {
    console.error(error);
    // Handle API errors gracefully
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").innerHTML +=
      "<p>Something went wrong. Please try again later.</p>";
  }
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const copyResponse = (copyBtn) => {
  const responseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(responseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => (copyBtn.textContent = "content_copy"), 1000);
};

// Show typing animation
const showTypingAnimation = () => {
  const html = `<div class="chat-content">
        <div class="chat-details">
          <img src="chatbot.jpg" alt="chat-img">
          <div class="typing-animation">
            <div class="typing-dot" style="--delay: 0.2s"></div>
            <div class="typing-dot" style="--delay: 0.3s"></div>
            <div class="typing-dot" style="--delay: 0.4s"></div>
          </div>
        </div>
        <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
      </div>`;
  const incomingChatDiv = createElement(html, "incoming");
  chatContainer.appendChild(incomingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

  // Pass the created typing bubble to the getChatResponse function
  getChatResponse(incomingChatDiv);
};

// Handle user's outgoing message
const handleOutgoingChat = () => {
  userText = chatInput.value.trim();
  if (!userText) {
    alert("Please enter a message!");
    return;
  }

  // Remove the default message if the user starts typing
  const defaultText = chatContainer.querySelector(".default-text");
  if (defaultText) {
    defaultText.remove(); // Remove default message
  }

  const html = `<div class="chat-content">
  <div class="chat-details">
    <img src="user.jpg" alt="user-img">
    <p></p>
  </div>
</div>`;
  const outgoingChatDiv = createElement(html, "outgoing");
  outgoingChatDiv.querySelector("p").textContent = userText;
  document.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outgoingChatDiv);
  chatInput.value = ""; // Clear the input field
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

  setTimeout(showTypingAnimation, 500);
};

// Load theme and chat data when the page is ready
document.addEventListener("DOMContentLoaded", loadDataFromLocalstorage);

// Change theme on button click
themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("theme-color", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";
});

// Delete all chats on button click
deleteButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalstorage(); // Reload to show default message
  }
});

// Trigger sending on button click
sendButton.addEventListener("click", handleOutgoingChat);

// Trigger sending on Enter key press
chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter" && !event.shiftKey && window.innerWidth > 800) {
    event.preventDefault();
    handleOutgoingChat();
  }
});
