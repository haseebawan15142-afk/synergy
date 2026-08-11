import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeBlogHtml } from "./sanitize-html.ts";

describe("sanitizeBlogHtml", () => {
  it("removes script tags and keeps safe TipTap markup", () => {
    const dirty =
      '<p>Hello <strong>world</strong></p><script>alert("xss")</script><p>Safe</p>';
    const clean = sanitizeBlogHtml(dirty);

    assert.match(clean, /Hello/);
    assert.match(clean, /<strong>world<\/strong>/);
    assert.doesNotMatch(clean, /<script/i);
    assert.doesNotMatch(clean, /alert\(/);
  });

  it("strips event-handler attributes and javascript: URLs", () => {
    const dirty =
      '<p><img src="x" onerror="alert(1)"><a href="javascript:alert(2)">click</a></p>';
    const clean = sanitizeBlogHtml(dirty);

    assert.doesNotMatch(clean, /onerror/i);
    assert.doesNotMatch(clean, /javascript:/i);
    assert.doesNotMatch(clean, /alert\(/);
  });

  it("removes iframe/object/embed", () => {
    const dirty =
      '<p>Text</p><iframe src="https://evil.test"></iframe><object data="x"></object><embed src="y">';
    const clean = sanitizeBlogHtml(dirty);

    assert.match(clean, /Text/);
    assert.doesNotMatch(clean, /iframe/i);
    assert.doesNotMatch(clean, /object/i);
    assert.doesNotMatch(clean, /embed/i);
  });

  it("preserves allowed blog formatting from the editor", () => {
    const dirty =
      '<h2>Title</h2><p>Para with <em>emphasis</em> and <a href="https://synergy.net.pk" target="_blank">link</a></p><ul><li>Item</li></ul>';
    const clean = sanitizeBlogHtml(dirty);

    assert.match(clean, /<h2>Title<\/h2>/);
    assert.match(clean, /<em>emphasis<\/em>/);
    assert.match(clean, /href="https:\/\/synergy\.net\.pk"/);
    assert.match(clean, /<ul>/);
    assert.match(clean, /noopener noreferrer/);
  });
});
