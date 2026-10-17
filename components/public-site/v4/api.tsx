import { V4Site } from "./shell";
import { ScrollStory } from "./story";
import { apiMarkup } from "./api-markup";
export function ApiStory() {
  return (
    <V4Site active="API">
      <ScrollStory count={6}>
        <div
          className="api-beats"
          dangerouslySetInnerHTML={{ __html: apiMarkup }}
        />
      </ScrollStory>
      <p className="recorded-note">
        Examples adapted from Mara’s recorded production. These examples never
        send a generation or review request.
        <br />
        Current integration: OpenAI still images. Other generator adapters are a
        design goal.
      </p>
    </V4Site>
  );
}
