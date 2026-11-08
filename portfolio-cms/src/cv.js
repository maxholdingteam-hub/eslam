// "Import from CV": sends the PDF to Claude and gets back bilingual portfolio content
// matching the site's schema (structured output → always valid JSON).

import Anthropic from "@anthropic-ai/sdk";
import { Buffer } from "node:buffer";
import { cvJsonSchema } from "./content.js";

const MODEL = "claude-opus-5-5";

const SYSTEM = `You turn a person's CV into the content of their personal portfolio website.

Rules:
- Use only facts that are in the CV (and in the owner's notes, if given). Never invent employers, dates, numbers, clients, certifications or achievements. If a section has no information, return an empty list or empty strings.
- Every text field has "en" and "ar". Write natural, professional English and natural Modern Standard Arabic (not a word-for-word translation). Keep brand, product and platform names (e.g. Google Ads, Canva) in Latin letters in both languages.
- Write in the third person in "about" paragraphs only when the CV does; otherwise keep a confident, neutral voice. Keep bullets short and concrete, starting with a verb.
- Accents: in profile.role, about.big, project titles and contact.heading, wrap 1–2 key words in *asterisks* (e.g. "turns *ad spend* into growth"). In contact.heading, "|" marks a line break.
- stats: up to 4 short numbers taken from the CV (e.g. years of experience, number of markets). value is digits only; suffix is e.g. "+" or "".
- skills.level is 0–100 and languages.level is 1–5: estimate from the CV's wording and order; if the CV gives levels, follow them.
- expertise: 3–6 core areas, each with an icon from the allowed list that fits best.
- marquee: 6–10 short keywords (tools, platforms, specialities) in English.
- profile.monogram: the person's initials (2 letters, Latin). profile.whatsapp: digits only with country code, from the phone number. profile.available: true unless the CV says otherwise.
- contact.formEnabled: true.`;

export async function importCv(env, pdfBuffer, notes) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const data = Buffer.from(pdfBuffer).toString("base64");

  let message;
  try {
    // Streaming avoids HTTP timeouts on long CVs; finalMessage() collects the full response.
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: cvJsonSchema() },
      },
      system: SYSTEM,
      messages: [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data } },
          { type: "text", text: notes ? `Build the portfolio content from this CV.\n\nNotes from the owner:\n${notes}` : "Build the portfolio content from this CV." },
        ],
      }],
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
  if (message.stop_reason === "max_tokens") return { error: "The CV is too long to process in one go.", status: 422 };

  const text = message.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    return { content: JSON.parse(text) };
  } catch {
    return { error: "The AI returned an unreadable result. Try again.", status: 502 };
  }
}
