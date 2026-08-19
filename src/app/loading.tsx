export default function Loading() {
  return (
    <div className="container-page py-14">
      <div className="skeleton h-10 w-2/3 max-w-md rounded-full" />
      <div className="mt-4 skeleton h-4 w-1/2 max-w-sm rounded-full" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-80 rounded-card" />
        ))}
      </div>
      <span className="sr-only" role="status">
        Loading
      </span>
    </div>
  );
}
