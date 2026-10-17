import { uploadShotImage } from "./db";
import {
  aiFetch,
  emptyUsage,
  reserve,
  safeError,
  settleUsage,
  type Usage,
} from "./engine-ai";
import { imageConfiguration, IMAGE_ATTEMPT_RESERVATION } from "./engine-config";
import { imageDataUrl } from "./engine-images";
export type Generation = {
  imageUrl: string;
  provenance: "openai" | "gemini" | "cached_fallback";
  errors: string[];
  usage: Usage;
  imageModel?: string;
  imageQuality?: string;
};
type GenerationDependencies = {
  reserve: typeof reserve;
  request: typeof aiFetch;
  upload: typeof uploadShotImage;
  image: typeof imageDataUrl;
};
export async function generateImage(
  input: {
    finalPrompt: string;
    referenceImageUrl?: string;
    acceptedReferenceUrl?: string;
    fallbackImageUrl: string;
    filename: string;
    deadline?: number;
  },
  dependencies: Partial<GenerationDependencies> = {},
): Promise<Generation> {
  const services = {
    reserve,
    request: aiFetch,
    upload: uploadShotImage,
    image: imageDataUrl,
    ...dependencies,
  };
  const usage = emptyUsage();
  const errors: string[] = [];
  let imageModel: string | undefined, imageQuality: string | undefined;
  let references: string[];
  try {
    references = await Promise.all(
      [input.referenceImageUrl, input.acceptedReferenceUrl]
        .filter((url): url is string => Boolean(url))
        .map(services.image),
    );
  } catch (error) {
    return {
      imageUrl: input.fallbackImageUrl,
      provenance: "cached_fallback",
      errors: [safeError(error)],
      usage,
    };
  }
  for (let attempt = 0; attempt < 2; attempt++) {
    const gemini =
      Boolean(process.env.GEMINI_API_KEY) &&
      (attempt === 1 || !process.env.OPENAI_API_KEY);
    try {
      if (!gemini && !process.env.OPENAI_API_KEY)
        throw new Error("No image provider is configured");
      const configured = gemini
        ? {
            model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image",
            quality: "provider_default",
          }
        : imageConfiguration();
      imageModel = configured.model;
      imageQuality = configured.quality;
      await services.reserve(IMAGE_ATTEMPT_RESERVATION, usage);
      usage.imageRequests++;
      let base64: string | undefined;
      let mime = "image/png";
      if (gemini) {
        const model = configured.model;
        const response = await services.request(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": process.env.GEMINI_API_KEY!,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: input.finalPrompt },
                    ...references.map((reference) => {
                      const [prefix, data] = reference.split(",");
                      return {
                        inlineData: {
                          mimeType: prefix.slice(5).split(";")[0],
                          data,
                        },
                      };
                    }),
                  ],
                },
              ],
              generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
            }),
          },
          input.deadline,
        );
        const data = await response.json();
        const image = data.candidates?.[0]?.content?.parts?.find(
          (part: { inlineData?: unknown }) => part.inlineData,
        )?.inlineData;
        base64 = image?.data;
        mime = image?.mimeType ?? mime;
        usage.inputTokens += data.usageMetadata?.promptTokenCount ?? 0;
        usage.outputTokens += data.usageMetadata?.candidatesTokenCount ?? 0;
      } else {
        const { model, quality } = configured;
        const response = await services.request(
          references.length
            ? "https://api.openai.com/v1/images/edits"
            : "https://api.openai.com/v1/images/generations",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              ...(references.length
                ? { images: references.map((image_url) => ({ image_url })) }
                : {}),
              prompt: input.finalPrompt,
              n: 1,
              size: "1536x1024",
              quality,
              output_format: "png",
              ...(model === "gpt-image-1.5" && references.length
                ? { input_fidelity: "high" }
                : {}),
            }),
          },
          input.deadline,
        );
        const data = await response.json();
        await settleUsage(usage, model, data.usage);
        base64 = data.data?.[0]?.b64_json;
        usage.inputTokens += data.usage?.input_tokens ?? 0;
        usage.outputTokens += data.usage?.output_tokens ?? 0;
      }
      if (!base64 || !["image/png", "image/jpeg", "image/webp"].includes(mime))
        throw new Error("Image provider did not return a supported image");
      // Generation succeeded. A storage outage must not cause another billable generation.
      try {
        const imageUrl = await services.upload(
          new Uint8Array(Buffer.from(base64, "base64")),
          input.filename,
          mime,
        );
        return {
          imageUrl,
          provenance: gemini ? "gemini" : "openai",
          errors,
          usage,
          imageModel,
          imageQuality,
        };
      } catch (error) {
        errors.push(
          `Image generated but storage upload failed: ${safeError(error)}`,
        );
        return {
          imageUrl: input.fallbackImageUrl,
          provenance: "cached_fallback",
          errors,
          usage,
          imageModel,
          imageQuality,
        };
      }
    } catch (error) {
      errors.push(safeError(error));
    }
  }
  return {
    imageUrl: input.fallbackImageUrl,
    provenance: "cached_fallback",
    errors,
    usage,
    imageModel,
    imageQuality,
  };
}
