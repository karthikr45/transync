// UI standard: UI-STANDARDS.json (enforced by npm run ui:check).
"use client";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/ui/Button";
import MetadataEditor from "./editor";
import { MetadataDetails, DeleteConfirmation } from "./components";
import { useMetadata } from "./hooks";
export default function MetadataScreen() {
  const m = useMetadata();
  return (
    <>
      <PageHeader title="Metadata" subtitle="Manage signup options and patient app settings." />
      {m.notice && (
        <p role="status" className="card p-3 mb-4 text-sm">
          {m.notice}
        </p>
      )}
      {m.edit ? (
        <MetadataEditor
          original={m.edit.original}
          section={m.edit.section}
          onCancel={m.cancelEdit}
          onSaved={m.saved}
        />
      ) : m.deleteOpen ? (
        <DeleteConfirmation
          confirmation={m.confirmation}
          onConfirmation={m.setConfirmation}
          deleting={m.deleting}
          error={m.deleteError}
          uncertain={m.deleteUncertain}
          onCancel={m.cancelDelete}
          onDelete={m.remove}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button disabled={m.loading} onClick={() => void m.load()}>
              Refresh metadata
            </Button>
            {m.data && !m.loading && !m.error && (
              <>
                <Button variant="primary" disabled={!m.data._id} onClick={() => m.openEditor()}>
                  Update metadata
                </Button>
                <Button variant="danger" disabled={!m.data._id} onClick={m.openDelete}>
                  Delete metadata
                </Button>
              </>
            )}
          </div>
          {m.loading && (
            <p role="status" className="card p-6">
              Loading metadata…
            </p>
          )}
          {m.error && (
            <div role="alert" className="card p-5">
              <p className="text-sm text-red-700">{m.error}</p>
              <Button className="mt-3" onClick={() => void m.load()}>
                Try again
              </Button>
            </div>
          )}
          {!m.loading && !m.error && !m.data && (
            <div className="card p-6">
              <h2 className="font-semibold">No metadata yet</h2>
              <p className="my-3 text-sm text-slate-500">
                Create the signup options and settings for patient applications.
              </p>
              <Button variant="primary" onClick={() => m.openEditor()}>
                Create metadata
              </Button>
            </div>
          )}
          {!m.loading && !m.error && m.data && (
            <>
              {!m.data._id && (
                <p role="status" className="mb-4 text-sm text-slate-600">
                  This record has no identifier. Viewing is available; update and delete are
                  disabled.
                </p>
              )}
              <MetadataDetails data={m.data} editable={!!m.data._id} onEdit={m.openEditor} />
            </>
          )}
        </>
      )}
    </>
  );
}
