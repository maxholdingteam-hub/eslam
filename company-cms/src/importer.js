// "Import from company profile": sends the profile PDF to Claude and gets back bilingual site content
// matching the schema (structured output → always valid JSON). Images are never invented.

import Anthropic from "@anthropic-ai/sdk";
import { Buffer } from "node:buffer";
import { importJsonSchema } from "./content.js";

const MODEL = "claude-opus-5-5";

const SYSTEM = `You turn a company profile (PDF) into the content of the company's portfolio website.

Rules:
- Use only facts from the document (and the owner's notes, if given). Never invent clients, projects, numbers, years, awards, testimonials or team members. If something is missing, return an empty string or an empty list.
- Every text field has "en" and "ar". Write polished, natural English and natural Modern Standard Arabic (not word-for-word). Keep brand and product names in Latin letters in both languages when they are written that way in the document.
- Accents: in brand.headline, about.title and contact.heading wrap 1–2 key words in *asterisks*; "|" marks a line break in brand.headline and contact.heading. Keep the headline short (max ~8 words per language).
- brand.short: 2–3 Latin letters for the logo badge (initials).
- stats: up to 4 numbers that appear in the document (value = digits only, suffix e.g. "+" or "%").
- services: every service the company offers, each with the best-fitting icon from the allowed list and a one-to-two-line description.
- projects: every project or case study named in the document, with category, client, location and year when given. featured = true for at most two of the most important ones. url only if a link is in the document.
- process: the company's working steps if described, otherwise an empty list.
- clients: names of clients/partners listed in the document.
- testimonials and team: only if they appear in the document.
- contact: copy phone, WhatsApp (digits with country code), email, address, Google Maps link, hours and social links exactly as written. formEnabled = true.`;

export async function importProfile(env, pdfBuffer, notes) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const data = Buffer.from(pdfBuffer).toString("base64");
  let message;
  try {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: importJsonSchema() } },
      system: SYSTEM,
      messages: [{ role: "user", content: [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data } },
        { type: "text", text: notes ? `Build the website content from this company profile.\n\nNotes from the owner:\n${notes}` : "Build the website content from this company profile." },
      ]}],
    });
    message = await stream.finalMessage();
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return { error: "The Anthropic API key is invalid", status: 500 };
    if (err instanceof Anthropic.RateLimitError) return { error: "The AI service is busy. Try again in a minute.", status: 429 };
    if (err instanceof Anthropic.BadRequestError) return { error: `The AI service rejected the file: ${err.message}`, status: 400 };
    if (err instanceof Anthropic.APIError) return { error: "The AI service is unavailable right now. Try again shortly.", status: 502 };
    throw err;
  }
  if (message.stop_reason === "refusal") return { error: "The AI declined to process this file.", status: 422 };
  if (message.stop_reason === "max_tokens") return { error: "The document is too long to process in one go.", status: 422 };
  const text = message.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try { return { content: JSON.parse(text) }; } catch { return { error: "The AI returned an unreadable result. Try again.", status: 502 }; }
}
