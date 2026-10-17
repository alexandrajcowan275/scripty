"use client";
import { ShotImage } from "../shot-image";
import { questionKey, type BlindQuestion } from "../ui-v2/evaluation";
export type AnswerMotion = "" | "yes" | "no" | "unsure";

/** Receives blind question fields only; no monitor verdict or confidence enters the deck. */
export function QuestionDeck({
  question,
  upcoming,
  frameLabel,
  direction,
}: {
  question: BlindQuestion;
  upcoming: BlindQuestion[];
  frameLabel: string;
  direction: AnswerMotion;
}) {
  return (
    <div className="v2-eval-stack">
      {[...upcoming].reverse().map((item, index) => (
        <div
          key={questionKey(item)}
          className={`v2-eval-card behind behind-${index}`}
          aria-hidden="true"
        >
          <ShotImage src={item.imageUrl} alt="" variant="thumbnail" />
        </div>
      ))}
      <div
        className={`v2-eval-card current ${direction ? `swipe-${direction}` : ""}`}
        key={questionKey(question)}
      >
        <ShotImage
          src={question.imageUrl}
          alt="Shot for your independent continuity judgment"
          priority
        />
        <span className="v2-frame-tag v2-glass v2-mono">{frameLabel}</span>
        {/\b(left|right)\b/i.test(question.expected) && (
          <span className="v2-eval-orientation v2-glass">
            Use the character’s left and right.
          </span>
        )}
      </div>
    </div>
  );
}
