const $ = (id) => document.getElementById(id);

function showError(message) {
  const el = $("error");
  el.hidden = !message;
  el.textContent = message || "";
}

function renderComment(comment) {
  const li = document.createElement("li");

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `${comment.author}  (#${comment.id})`;

  const body = document.createElement("div");
  body.textContent = comment.text;

  const escaped = document.createElement("div");
  escaped.className = "escaped";
  escaped.textContent = `escaped: ${comment.escapedText}`;

  li.append(meta, body, escaped);
  return li;
}

async function loadComments() {
  const response = await fetch("/comments");
  if (!response.ok) {
    throw new Error("Could not load comments");
  }

  const data = await response.json();
  const list = $("list");
  list.replaceChildren();

  for (const comment of data.comments) {
    list.appendChild(renderComment(comment));
  }
}

$("form").addEventListener("submit", async (event) => {
  event.preventDefault();
  showError("");

  const form = event.currentTarget;
  const payload = {
    author: form.author.value,
    text: form.text.value,
  };

  const response = await fetch("/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    showError(data.error || "Could not post comment");
    return;
  }

  form.text.value = "";
  await loadComments();
});

loadComments().catch((error) => {
  showError(error.message);
});
