import { uploadShotImage } from "./db";
import { aiFetch, emptyUsage, reserve, safeError, type Usage } from "./engine-ai";
import { imageDataUrl } from "./engine-images";
export type Generation = { imageUrl: string; provenance: "openai" | "gemini" | "cached_fallback"; errors: string[]; usage: Usage };
export async function generateImage(input: { finalPrompt: string; referenceImageUrl: string; acceptedReferenceUrl?: string; fallbackImageUrl: string; filename: string; deadline?: number }): Promise<Generation> {
  const usage = emptyUsage(); const errors: string[] = [];
  let references: string[];
  try { references = await Promise.all([input.referenceImageUrl, input.acceptedReferenceUrl].filter((url): url is string => Boolean(url)).map(imageDataUrl)); }
  catch (error) { return { imageUrl: input.fallbackImageUrl, provenance: "cached_fallback", errors: [safeError(error)], usage }; }
  for (let attempt = 0; attempt < 2; attempt++) {
    const gemini = Boolean(process.env.GEMINI_API_KEY) && (attempt === 1 || !process.env.OPENAI_API_KEY);
    try {
      if (!gemini && !process.env.OPENAI_API_KEY) throw new Error("No image provider is configured");
      await reserve(0.50, usage); usage.imageRequests++;
      let base64: string | undefined; let mime = "image/png";
      if (gemini) {
        const model = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
        const response = await aiFetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
          body: JSON.stringify({ contents: [{ parts: [{ text: input.finalPrompt }, ...references.map((reference) => { const [prefix, data] = reference.split(","); return { inlineData: { mimeType: prefix.slice(5).split(";")[0], data } }; })] }], generationConfig: { responseModalities: ["TEXT", "IMAGE"] } }),
        }, input.deadline);
        const data = await response.json();
        const image = data.candidates?.[0]?.content?.parts?.find((part: { inlineData?: unknown }) => part.inlineData)?.inlineData;
        base64 = image?.data; mime = image?.mimeType ?? mime;
        usage.inputTokens += data.usageMetadata?.promptTokenCount ?? 0; usage.outputTokens += data.usageMetadata?.candidatesTokenCount ?? 0;
      } else {
        const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5";
        if (!["gpt-image-1.5", "gpt-image-2", "gpt-image-2-2026-04-21"].includes(model)) throw new Error("Image model is outside the budgeted allowlist");
        const quality = process.env.OPENAI_IMAGE_QUALITY ?? "medium";
        if (!["low", "medium"].includes(quality)) throw new Error("Image quality must be low or medium for the demo budget");
        const response = await aiFetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, images: references.map((image_url) => ({ image_url })), prompt: input.finalPrompt, n: 1, size: "1536x1024", quality, output_format: "png", ...(model === "gpt-image-1.5" ? { input_fidelity: "high" } : {}) }) }, input.deadline);
        const data = await response.json(); base64 = data.data?.[0]?.b64_json;
        usage.inputTokens += data.usage?.input_tokens ?? 0; usage.outputTokens += data.usage?.output_tokens ?? 0;
      }
      if (!base64 || !["image/png", "image/jpeg", "image/webp"].includes(mime)) throw new Error("Image provider did not return a supported image");
      const imageUrl = await uploadShotImage(new Uint8Array(Buffer.from(base64, "base64")), input.filename, mime);
      return { imageUrl, provenance: gemini ? "gemini" : "openai", errors, usage };
    } catch (error) { errors.push(safeError(error)); }
  }
  return { imageUrl: input.fallbackImageUrl, provenance: "cached_fallback", errors, usage };
}
