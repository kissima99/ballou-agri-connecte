{/* Replace the problematic line with the correct icon component */}
<span className="flex items-center gap-2">
  {isAdminConfirmed ? (
    <>
      <FileDownload className="h-5 w-5" />
      CONFIRMER & REÇU
    </>
  ) : (
    "EN ATTENTE..."
  )}
</span>