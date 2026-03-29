export default function PageHeader({ title, description, action, actions }) {
  const right = actions ?? action;

  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-base">{description}</p>
        ) : null}
      </div>
      {right ? <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">{right}</div> : null}
    </div>
  );
}
