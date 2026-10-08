"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadExporter() {
  const scriptPath = path.join(__dirname, "..", "chatgpt-web-utils.user.js");
  const source = fs.readFileSync(scriptPath, "utf8");
  const sandbox = {
    AbortController,
    Blob,
    URL,
    clearTimeout,
    console,
    setTimeout,
    location: { origin: "https://chatgpt.com", href: "https://chatgpt.com/", pathname: "/" },
    localStorage: { getItem: () => null, setItem: () => {} },
    navigator: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    document: { readyState: "loading", addEventListener: () => {} }
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox, { filename: scriptPath });
  return sandbox.ChatGPTExporter;
}

const exporter = loadExporter();
const marker = "\uE200cite\uE202turn1search0\uE201";

function references(safeUrls) {
  return { metadata: { content_references: [{ matched_text: marker, safe_urls: safeUrls }] } };
}

test("deduplicates tracked and untracked forms of the same citation URL", () => {
  const base = "https://www.mayoclinic.org/example";
  const result = exporter.renderCitationLinks(`Claim.${marker}`, references([base, `${base}?utm_source=chatgpt.com`]));

  assert.equal(result.text, "Claim.[mayoclinic.org](https://www.mayoclinic.org/example)");
  assert.equal(result.sources.length, 0);
});

test("preserves multiple distinct URLs attached to one citation marker", () => {
  const first = "https://www.mayoclinic.org/first";
  const second = "https://www.mayoclinic.org/second?p=1";
  const result = exporter.renderCitationLinks(`Claim.${marker}`, references([
    first,
    `${first}?utm_source=chatgpt.com`,
    second,
    `${second}&utm_source=chatgpt.com`
  ]));

  assert.match(result.text, /\(https:\/\/www\.mayoclinic\.org\/first\)/);
  assert.match(result.text, /\(https:\/\/www\.mayoclinic\.org\/second\?p=1\)/);
  assert.equal((result.text.match(/mayoclinic\.org/g) || []).length, 4);
  assert.doesNotMatch(result.text, /utm_source/);
  assert.equal(result.sources.length, 0);
});

test("prefers an exact citation URL over safe URL fallbacks", () => {
  const message = {
    metadata: {
      citations: [{ matched_text: marker, metadata: { title: "Exact source", url: "https://exact.example/article" } }],
      content_references: [{ matched_text: marker, safe_urls: ["https://fallback.example/article"] }]
    }
  };
  const result = exporter.renderCitationLinks(`Claim.${marker}`, message);

  assert.equal(result.text, "Claim.[Exact source](https://exact.example/article)");
  assert.doesNotMatch(result.text, /fallback/);
});

test("preserves multiple exact sources attached to one marker", () => {
  const message = {
    metadata: {
      citations: [
        { matched_text: marker, metadata: { title: "First", url: "https://first.example/article" } },
        { matched_text: marker, metadata: { title: "Second", url: "https://second.example/article" } }
      ]
    }
  };
  const result = exporter.renderCitationLinks(`Claim.${marker}`, message);

  assert.match(result.text, /\[First\]\(https:\/\/first\.example\/article\)/);
  assert.match(result.text, /\[Second\]\(https:\/\/second\.example\/article\)/);
});

test("removes an internal citation marker when no URL is available", () => {
  const result = exporter.renderCitationLinks(`Claim.${marker}`, {});
  assert.equal(result.text, "Claim.");
});

test("rounds prefer final answers and fall back to the last assistant answer", () => {
  const rounds = exporter.roundsFromMessages([
    { role: "user", id: "u1", text: "Question 1", markdown: "Question 1" },
    { role: "assistant", id: "a1", channel: "commentary", text: "Preliminary", markdown: "Preliminary" },
    { role: "assistant", id: "a2", channel: "final", text: "Final answer", markdown: "Final answer" },
    { role: "user", id: "u2", text: "Question 2", markdown: "Question 2" },
    { role: "assistant", id: "a3", channel: "", text: "Earlier", markdown: "Earlier" },
    { role: "assistant", id: "a4", channel: "", text: "Latest", markdown: "Latest" }
  ]);

  assert.equal(rounds.length, 2);
  assert.equal(rounds[0].assistant.text, "Final answer");
  assert.equal(rounds[1].assistant.text, "Latest");
});

test("recognizes reasoning duration status text", () => {
  assert.equal(exporter.isReasoningStatus("思考了 4s"), true);
  assert.equal(exporter.isReasoningStatus("思考了两秒"), true);
  assert.equal(exporter.isReasoningStatus("有信息量的最终回答"), false);
});

test("Markdown export uses conversation and Round hierarchy", () => {
  const markdown = exporter.formatMarkdown({
    title: "Example",
    exportedAt: "2026-10-08T00:00:00Z",
    url: "https://chatgpt.com/c/example",
    roundCount: 1,
    rounds: [{ index: 1, user: { markdown: "Question" }, assistant: { markdown: "Answer" } }],
    warnings: []
  });

  assert.match(markdown, /^# Example/m);
  assert.match(markdown, /^## Round 1/m);
  assert.match(markdown, /^\*\*User\*\*$/m);
  assert.match(markdown, /^\*\*Assistant\*\*$/m);
  assert.doesNotMatch(markdown, /^## \d+\. (?:User|ChatGPT)$/m);
});
