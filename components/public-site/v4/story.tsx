"use client";
import { useEffect, useRef, type ReactNode } from "react";
export function ScrollStory({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const story = root.current;
    if (!story) return;
    // Public stories always open on their first screen after client navigation.
    window.scrollTo({ top: 0, behavior: "instant" });
    const beats = Array.from(story.querySelectorAll<HTMLElement>(".beat"));
    const dots = Array.from(
      story.querySelectorAll<HTMLButtonElement>(".prog button"),
    );
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let current = -1;
    function update() {
      frame = 0;
      if (!story) return;
      const r = story.getBoundingClientRect();
      const p = Math.min(
        0.9999,
        Math.max(0, -r.top / (r.height - innerHeight)),
      );
      const index = Math.floor(p * count);
      const local = p * count - index;
      if (index !== current) {
        current = index;
        beats.forEach((beat, k) => {
          beat.classList.toggle("on", k === index);
          beat.inert = k !== index;
          beat.setAttribute("aria-hidden", String(k !== index));
        });
        dots.forEach((dot, k) => {
          dot.classList.toggle("on", k === index);
          dot.setAttribute("aria-current", k === index ? "step" : "false");
        });
      }
      const total = story.querySelectorAll("[data-later-frame]").length;
      const lit =
        index > 3
          ? total
          : index === 3
            ? media.matches
              ? total
              : Math.floor(Math.min(1, local * 1.35) * total)
            : 0;
      story
        .querySelectorAll<HTMLElement>("[data-later-frame]")
        .forEach((el, k) => el.classList.toggle("lit", k < lit));
      const counter = story.querySelector("[data-reach-count]");
      if (counter) counter.textContent = String(lit);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    update();
    return () => {
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
    };
  }, [count]);
  function go(index: number) {
    const story = root.current;
    if (!story) return;
    const y =
      story.getBoundingClientRect().top +
      scrollY +
      ((story.offsetHeight - innerHeight) * (index + 0.04)) / count;
    window.scrollTo({
      top: y,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <section
      ref={root}
      className={`story story-${count}`}
      aria-label={
        count === 5
          ? "Follow a correction through Mara’s recorded takes"
          : "The API learning loop"
      }
    >
      <div className="prog" aria-label="Story progress">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            aria-label={`Go to beat ${i + 1} of ${count}`}
            onClick={() => go(i)}
            className={i === 0 ? "on" : ""}
          />
        ))}
      </div>
      <div className="sticky">{children}</div>
    </section>
  );
}
