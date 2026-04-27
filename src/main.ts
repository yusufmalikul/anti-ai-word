const input = document.getElementById("input") as HTMLTextAreaElement;
const button = document.getElementById("rewrite") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLSpanElement;
const outputWrap = document.getElementById("output-wrap") as HTMLDivElement;
const output = document.getElementById("output") as HTMLParagraphElement;
const copyBtn = document.getElementById("copy") as HTMLButtonElement;

async function rewrite() {
  const text = input.value.trim();
  if (!text) {
    statusEl.textContent = "Type or paste some text first.";
    return;
  }

  button.disabled = true;
  statusEl.textContent = "Rewriting...";
  outputWrap.classList.add("hidden");

  try {
    const res = await fetch("/api/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? `HTTP ${res.status}`);
    }

    const data = (await res.json()) as { rewritten: string };
    output.textContent = data.rewritten;
    outputWrap.classList.remove("hidden");
    statusEl.textContent = "";
  } catch (e) {
    statusEl.textContent = e instanceof Error ? e.message : "Something went wrong.";
  } finally {
    button.disabled = false;
  }
}

button.addEventListener("click", rewrite);

input.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    rewrite();
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.textContent ?? "");
  copyBtn.textContent = "Copied";
  setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
});
