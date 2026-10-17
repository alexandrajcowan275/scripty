export function ScreenSkeleton({ review = false }: { review?: boolean }) {
  return (
    <div
      className={`v2-screen-skeleton ${review ? "review" : ""}`}
      role="status"
      aria-label={review ? "Loading shot and checks" : "Loading contact sheet"}
    >
      {review ? (
        <>
          <div className="v2-skeleton" />
          <div className="v2-skeleton" />
        </>
      ) : (
        [0, 1, 2, 3].map((index) => <div className="v2-skeleton" key={index} />)
      )}
    </div>
  );
}
