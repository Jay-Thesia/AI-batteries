const $ = (id) => document.getElementById(id);

let csrfToken = "";

function showMessage(text, ok) {
  const el = $("message");
  el.hidden = !text;
  el.textContent = text || "";
  el.classList.toggle("ok", Boolean(ok));
  el.classList.toggle("error", Boolean(text) && !ok);
}

function renderSession(data) {
  csrfToken = data.csrfToken;
  $("name").textContent = data.name;
  $("email").textContent = data.email;
  $("csrf").textContent = data.csrfToken;
  $("logged-out").hidden = true;
  $("logged-in").hidden = false;
}

function renderLoggedOut() {
  csrfToken = "";
  $("logged-out").hidden = false;
  $("logged-in").hidden = true;
}

async function readJson(response) {
  return response.json().catch(() => ({}));
}

async function loadSession() {
  const response = await fetch("/session");
  if (response.status === 401) {
    renderLoggedOut();
    return;
  }

  if (!response.ok) {
    showMessage("Could not load session", false);
    return;
  }

  renderSession(await readJson(response));
}

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");

  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: event.currentTarget.name.value }),
  });

  const data = await readJson(response);
  if (!response.ok) {
    showMessage(data.error || "Login failed", false);
    return;
  }

  renderSession(data);
  showMessage("Logged in. Cookie = who. Token = intent.", true);
});

$("email-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");

  const email = event.currentTarget.email.value;
  const response = await fetch("/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ email }),
  });

  const data = await readJson(response);
  if (!response.ok) {
    showMessage(data.error || "Could not update email", false);
    return;
  }

  $("email").textContent = data.email;
  event.currentTarget.reset();
  showMessage(`Email saved as ${data.email}`, true);
});

$("without-token").addEventListener("click", async () => {
  showMessage("");

  const response = await fetch("/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "rejected@example.com" }),
  });

  const data = await readJson(response);
  showMessage(
    `${response.status}: ${data.error || "unexpected"}`,
    response.ok,
  );
});

$("logout").addEventListener("click", async () => {
  await fetch("/logout", { method: "POST" });
  renderLoggedOut();
  showMessage("Logged out.", true);
});

loadSession();
