const socket = io({ auth: { token: TOKEN } });

const roomsEl = document.getElementById("rooms");
const messagesEl = document.getElementById("messages");
const form = document.getElementById("messageForm");
const input = document.getElementById("messageInput");
let currentRoom = null;

roomsEl.addEventListener("click", (e) => {
  if (e.target.dataset.room) {
    const roomId = e.target.dataset.room;
    currentRoom = roomId;
    socket.emit("joinRoom", roomId);
    document.getElementById("roomName").innerText = e.target.innerText;
    messagesEl.innerHTML = "";
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentRoom) return alert("Select a room first");
  const text = input.value.trim();
  if (!text) return;
  socket.emit("chat:message", { roomId: currentRoom, text });
  addMessage(USER, text, new Date());
  input.value = "";
});

socket.on("chat:message", (msg) => {
  addMessage(msg.user, msg.text, msg.time);
});

function addMessage(user, text, time) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<strong>${user}</strong>: ${text}
    <span class="time">${new Date(time).toLocaleTimeString()}</span>`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}