<script>
(function () {
  var endpoint = "https://project-rf761.vercel.app/api/centrahq";
  if (document.getElementById("centrahq-root")) return;

  var state = {
    open: false,
    greeted: false
  };

  var root = document.createElement("div");
  root.id = "centrahq-root";
  root.style.position = "fixed";
  root.style.right = "20px";
  root.style.bottom = "20px";
  root.style.zIndex = "999999";
  root.style.fontFamily = "Arial, sans-serif";

  var style = document.createElement("style");
  style.textContent = `
    #centrahq-root * { box-sizing: border-box; }
    .centrahq-fade-in { animation: centrahqFadeIn .25s ease-out; }
    .centrahq-pop { animation: centrahqPop .28s ease-out; }
    .centrahq-pulse { animation: centrahqPulse 2s infinite; }
    @keyframes centrahqFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes centrahqPop {
      0% { transform: scale(.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes centrahqPulse {
      0% { box-shadow: 0 0 0 0 rgba(139,92,246,.45); }
      70% { box-shadow: 0 0 0 14px rgba(139,92,246,0); }
      100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
    }
  `;
  document.head.appendChild(style);

  var wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "flex-end";
  wrapper.style.gap = "10px";

  var greeting = document.createElement("div");
  greeting.className = "centrahq-fade-in";
  greeting.style.display = "none";
  greeting.style.maxWidth = "260px";
  greeting.style.background = "#ffffff";
  greeting.style.color = "#111827";
  greeting.style.padding = "12px 14px";
  greeting.style.borderRadius = "16px";
  greeting.style.boxShadow = "0 12px 30px rgba(0,0,0,.18)";
  greeting.style.fontSize = "14px";
  greeting.style.lineHeight = "1.4";
  greeting.innerHTML = "<strong>CentraHQ</strong><br>Hello, how can I help?";

  var panel = document.createElement("div");
  panel.className = "centrahq-pop";
  panel.style.display = "none";
  panel.style.width = "340px";
  panel.style.maxWidth = "calc(100vw - 24px)";
  panel.style.background = "#0f172a";
  panel.style.borderRadius = "18px";
  panel.style.boxShadow = "0 16px 40px rgba(0,0,0,.28)";
  panel.style.overflow = "hidden";
  panel.style.border = "1px solid rgba(255,255,255,.08)";

  var header = document.createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.padding = "12px 14px";
  header.style.background = "linear-gradient(135deg, #7c3aed, #ec4899)";
  header.style.color = "#fff";

  var headerLeft = document.createElement("div");
  headerLeft.style.display = "flex";
  headerLeft.style.alignItems = "center";
  headerLeft.style.gap = "10px";

  var headerAvatar = document.createElement("div");
  headerAvatar.style.width = "34px";
  headerAvatar.style.height = "34px";
  headerAvatar.style.borderRadius = "999px";
  headerAvatar.style.background = "linear-gradient(135deg, #f9a8d4, #c4b5fd)";
  headerAvatar.style.display = "flex";
  headerAvatar.style.alignItems = "center";
  headerAvatar.style.justifyContent = "center";
  headerAvatar.style.color = "#111827";
  headerAvatar.style.fontWeight = "700";
  headerAvatar.textContent = "C";

  var headerTextWrap = document.createElement("div");
  var headerTitle = document.createElement("div");
  headerTitle.textContent = "CentraHQ";
  headerTitle.style.fontWeight = "700";
  headerTitle.style.fontSize = "14px";

  var headerSub = document.createElement("div");
  headerSub.textContent = "Sales, support and lead capture";
  headerSub.style.fontSize = "11px";
  headerSub.style.opacity = "0.92";

  headerTextWrap.appendChild(headerTitle);
  headerTextWrap.appendChild(headerSub);
  headerLeft.appendChild(headerAvatar);
  headerLeft.appendChild(headerTextWrap);

  var closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.style.background = "rgba(255,255,255,.16)";
  closeBtn.style.color = "#fff";
  closeBtn.style.border = "0";
  closeBtn.style.width = "30px";
  closeBtn.style.height = "30px";
  closeBtn.style.borderRadius = "999px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "20px";
  closeBtn.style.lineHeight = "1";

  header.appendChild(headerLeft);
  header.appendChild(closeBtn);

  var quickWrap = document.createElement("div");
  quickWrap.style.display = "flex";
  quickWrap.style.gap = "8px";
  quickWrap.style.padding = "10px 12px";
  quickWrap.style.background = "#111827";
  quickWrap.style.borderBottom = "1px solid rgba(255,255,255,.06)";

  function makeQuickButton(label, text) {
    var btn = document.createElement("button");
    btn.textContent = label;
    btn.style.flex = "1";
    btn.style.padding = "10px 8px";
    btn.style.borderRadius = "12px";
    btn.style.border = "1px solid rgba(255,255,255,.08)";
    btn.style.background = "#1f2937";
    btn.style.color = "#fff";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "12px";
    btn.onclick = function () {
      appendMessage("user", text);
      sendToAI(text);
    };
    return btn;
  }

  quickWrap.appendChild(makeQuickButton("Get a Quote", "I would like a quote"));
  quickWrap.appendChild(makeQuickButton("Ask a Question", "I have a question"));
  quickWrap.appendChild(makeQuickButton("Talk to Sales", "I want to speak to sales"));

  var chat = document.createElement("div");
  chat.id = "centrahq-chat";
  chat.style.height = "260px";
  chat.style.overflowY = "auto";
  chat.style.background = "#0f172a";
  chat.style.padding = "12px";
  chat.style.color = "#fff";
  chat.style.fontSize = "14px";

  var inputWrap = document.createElement("div");
  inputWrap.style.display = "flex";
  inputWrap.style.gap = "8px";
  inputWrap.style.padding = "12px";
  inputWrap.style.background = "#111827";
  inputWrap.style.borderTop = "1px solid rgba(255,255,255,.06)";

  var input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ask me anything...";
  input.style.flex = "1";
  input.style.padding = "12px";
  input.style.borderRadius = "12px";
  input.style.border = "1px solid #374151";
  input.style.background = "#fff";
  input.style.color = "#111827";
  input.style.outline = "none";

  var sendBtn = document.createElement("button");
  sendBtn.textContent = "Send";
  sendBtn.style.padding = "12px 14px";
  sendBtn.style.borderRadius = "12px";
  sendBtn.style.border = "0";
  sendBtn.style.background = "linear-gradient(135deg, #7c3aed, #ec4899)";
  sendBtn.style.color = "#fff";
  sendBtn.style.cursor = "pointer";
  sendBtn.style.fontWeight = "700";

  inputWrap.appendChild(input);
  inputWrap.appendChild(sendBtn);

  panel.appendChild(header);
  panel.appendChild(quickWrap);
  panel.appendChild(chat);
  panel.appendChild(inputWrap);

  var launcher = document.createElement("button");
  launcher.className = "centrahq-pulse";
  launcher.style.width = "68px";
  launcher.style.height = "68px";
  launcher.style.borderRadius = "999px";
  launcher.style.border = "0";
  launcher.style.cursor = "pointer";
  launcher.style.background = "linear-gradient(135deg, #7c3aed, #ec4899)";
  launcher.style.color = "#fff";
  launcher.style.boxShadow = "0 12px 30px rgba(0,0,0,.25)";
  launcher.style.display = "flex";
  launcher.style.alignItems = "center";
  launcher.style.justifyContent = "center";
  launcher.style.position = "relative";

  var launcherInner = document.createElement("div");
  launcherInner.style.width = "56px";
  launcherInner.style.height = "56px";
  launcherInner.style.borderRadius = "999px";
  launcherInner.style.background = "linear-gradient(135deg, #f9a8d4, #c4b5fd)";
  launcherInner.style.display = "flex";
  launcherInner.style.alignItems = "center";
  launcherInner.style.justifyContent = "center";
  launcherInner.style.color = "#111827";
  launcherInner.style.fontWeight = "700";
  launcherInner.style.fontSize = "20px";
  launcherInner.textContent = "C";

  launcher.appendChild(launcherInner);

  function appendMessage(role, text) {
    var row = document.createElement("div");
    row.style.marginBottom = "10px";
    row.style.display = "flex";
    row.style.justifyContent = role === "user" ? "flex-end" : "flex-start";

    var bubble = document.createElement("div");
    bubble.style.maxWidth = "82%";
    bubble.style.padding = "10px 12px";
    bubble.style.borderRadius = "14px";
    bubble.style.lineHeight = "1.4";
    bubble.style.whiteSpace = "pre-wrap";
    bubble.style.wordBreak = "break-word";

    if (role === "user") {
      bubble.style.background = "#7c3aed";
      bubble.style.color = "#fff";
    } else {
      bubble.style.background = "#1f2937";
      bubble.style.color = "#fff";
    }

    bubble.textContent = text;
    row.appendChild(bubble);
    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
  }

  async function sendToAI(message) {
    appendMessage("assistant", "Typing...");
    var typingNode = chat.lastChild;

    try {
      var res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
      });

      var data = await res.json();
      chat.removeChild(typingNode);
      appendMessage("assistant", data.reply || "Sorry, I didn't get a response.");
    } catch (err) {
      chat.removeChild(typingNode);
      appendMessage("assistant", "Connection error. Please try again.");
    }
  }

  function openPanel() {
    state.open = true;
    panel.style.display = "block";
    greeting.style.display = "none";
    launcher.style.display = "none";

    if (!state.greeted) {
      appendMessage("assistant", "Hello, I'm CentraHQ. How can I help you today?");
      state.greeted = true;
    }
  }

  function closePanel() {
    state.open = false;
    panel.style.display = "none";
    launcher.style.display = "flex";
  }

  launcher.onclick = openPanel;
  closeBtn.onclick = closePanel;

  sendBtn.onclick = function () {
    var message = input.value.trim();
    if (!message) return;
    input.value = "";
    appendMessage("user", message);
    sendToAI(message);
  };

  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendBtn.click();
  });

  wrapper.appendChild(greeting);
  wrapper.appendChild(panel);
  wrapper.appendChild(launcher);
  root.appendChild(wrapper);
  document.body.appendChild(root);

  setTimeout(function () {
    if (!state.open) greeting.style.display = "block";
  }, 2500);
})();
</script>
