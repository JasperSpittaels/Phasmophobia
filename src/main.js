const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");

let recognition;

startBtn.onclick = async () => {
  startMic();
  statusText.textContent = "Listening... Say something 👀";
};

function startMic() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition not supported!");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "nl";

  recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];

    if (!result.isFinal) return;

    const text = result[0].transcript.trim().toLowerCase();

    if (!text) return;

    console.log("Heard:", text);

    sendToServer(text);
  };

  recognition.start();
}

function checkGhostResponse(text) {
  if (text.includes("are you here")) {
    ghostEvent("Yes...");
  } else if (text.includes("show yourself")) {
    ghostEvent("Appeared!");
  }
}

async function sendToServer(text) {
  try {
    const res = await fetch("http://localhost:3000/ghost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    ghostEvent(data.response);

  } catch (err) {
    console.error("Server error:", err);
    statusText.textContent = "⚠️ Server offline";
  }
}

function ghostEvent(message) {
  statusText.textContent = message;

  setTimeout(() => {
    document.body.style.background = "black";
    statusText.textContent = "Listening...";
  }, 2000);
}