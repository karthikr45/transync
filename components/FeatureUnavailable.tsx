import PageHeader from "./PageHeader";
/** Backend-unimplemented features never display sample patients or fake success. */
export default function FeatureUnavailable({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title.replace(/^./, (c) => c.toUpperCase())} />
      <div className="card p-6">
        <h2 className="font-semibold">This feature is not available yet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Please contact your administrator for assistance.
        </p>
      </div>
    </>
  );
}
