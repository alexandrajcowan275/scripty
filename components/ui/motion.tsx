"use client";

import Link from "next/link";
import { isStudioRoute } from "@/lib/navigation";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type TransitionKind =
  | "page"
  | "start"
  | "mara"
  | "shot"
  | "shot-step"
  | "memory"
  | "evidence"
  | "eval"
  | "receipt";
type TransitionContext = {
  navigate: (href: string, kind?: TransitionKind) => void;
};
const MotionContext = createContext<TransitionContext | null>(null);
export function MotionProvider({ children }: { children: ReactNode }) {
  const router = useRouter(),
    pathname = usePathname();
  const completed = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    completed.current?.();
    completed.current = null;
  }, [pathname]);
  const navigate = useCallback(
    (href: string, kind: TransitionKind = "page") => {
      document.documentElement.dataset.transition = kind;
      if (
        (isStudioRoute(pathname) && isStudioRoute(href)) ||
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        router.push(href);
        return;
      }
      completed.current?.();
      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            let timer: ReturnType<typeof setTimeout>;
            completed.current = () => {
              clearTimeout(timer);
              resolve();
            };
            timer = setTimeout(resolve, 1000);
            router.push(href);
          }),
      );
    },
    [router, pathname],
  );
  return (
    <MotionContext.Provider value={{ navigate }}>
      {children}
      <ViewfinderCursor />
    </MotionContext.Provider>
  );
}
export function useMotionNavigation() {
  const context = useContext(MotionContext);
  if (!context) throw new Error("MotionProvider missing");
  return context.navigate;
}
export function MotionLink({
  href,
  kind = "page",
  children,
  className,
  style,
  title,
  onNavigate,
  "aria-label": ariaLabel,
}: {
  href: string;
  kind?: TransitionKind;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;
  onNavigate?: () => void;
  "aria-label"?: string;
}) {
  const navigate = useMotionNavigation();
  return (
    <Link
      href={href}
      className={className}
      style={style}
      title={title}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onNavigate?.();
        navigate(href, kind);
      }}
    >
      {children}
    </Link>
  );
}
export function Ambient({ warm = false }: { warm?: boolean }) {
  return (
    <>
      <div className="v2-haze" aria-hidden="true" />
      {warm && <div className="v2-haze-warm" aria-hidden="true" />}
      <div className="v2-grain" aria-hidden="true" />
    </>
  );
}
export function RevealHeadline({
  lead,
  continuation,
  className = "",
}: {
  lead: string;
  continuation?: string;
  className?: string;
}) {
  return (
    <h1 className={`v2-headline ${className}`}>
      {lead.split(/\s+/).map((word, i) => (
        <span
          className="v2-reveal-word"
          style={{ "--word": i } as CSSProperties}
          key={`${word}-${i}`}
        >
          {word}{" "}
        </span>
      ))}
      {continuation && (
        <span className="v2-headline-tone">
          {continuation.split(/\s+/).map((word, i) => (
            <span
              className="v2-reveal-word"
              style={
                { "--word": i + lead.split(/\s+/).length } as CSSProperties
              }
              key={`${word}-${i}`}
            >
              {word}{" "}
            </span>
          ))}
        </span>
      )}
    </h1>
  );
}
export function Tilt({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`v2-tilt ${className}`}
      style={style}
      onPointerMove={(e) => {
        if (
          e.pointerType !== "mouse" ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const r = e.currentTarget.getBoundingClientRect(),
          x = (e.clientX - r.left) / r.width,
          y = (e.clientY - r.top) / r.height;
        e.currentTarget.style.setProperty("--tilt-x", `${(0.5 - y) * 9}deg`);
        e.currentTarget.style.setProperty("--tilt-y", `${(x - 0.5) * 11}deg`);
        e.currentTarget.style.setProperty("--pointer-x", `${x * 100}%`);
        e.currentTarget.style.setProperty("--pointer-y", `${y * 100}%`);
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.setProperty("--tilt-x", "0deg");
        e.currentTarget.style.setProperty("--tilt-y", "0deg");
      }}
    >
      {children}
    </div>
  );
}
export function Brackets({
  region,
  className = "",
}: {
  region?: { x: number; y: number; width: number; height: number };
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`v2-brackets ${region ? "located" : "frame-outline"} ${className}`}
      style={
        region
          ? {
              left: `${region.x * 100}%`,
              top: `${region.y * 100}%`,
              width: `${region.width * 100}%`,
              height: `${region.height * 100}%`,
            }
          : undefined
      }
    >
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
export function Scan({ active = true }: { active?: boolean }) {
  return active ? <span className="v2-scan" aria-hidden="true" /> : null;
}
export function InView({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null),
    [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    if (
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setEntered(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`${className} ${entered ? "v2-entered" : "v2-awaiting"}`}
      style={style}
    >
      {children}
    </div>
  );
}
function ViewfinderCursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let frame: number | null = null;
    let currentX = 0,
      currentY = 0,
      targetX = 0,
      targetY = 0,
      initialized = false;
    const follow = () => {
      const element = ref.current;
      if (!element) return;
      currentX += (targetX - currentX) * 0.25;
      currentY += (targetY - currentY) * 0.25;
      element.style.transform = `translate3d(${currentX}px,${currentY}px,0)`;
      frame =
        Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.1
          ? requestAnimationFrame(follow)
          : null;
    };
    const move = (e: PointerEvent) => {
      const element = ref.current;
      if (
        !element ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      targetX = e.clientX;
      targetY = e.clientY;
      if (!initialized) {
        currentX = targetX;
        currentY = targetY;
        initialized = true;
      }
      element.classList.toggle(
        "active",
        !!(e.target as Element).closest("[data-viewfinder]"),
      );
      if (frame === null) frame = requestAnimationFrame(follow);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div ref={ref} className="v2-viewfinder-cursor" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}
