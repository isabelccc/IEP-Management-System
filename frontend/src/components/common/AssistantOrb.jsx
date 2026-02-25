import { useState } from 'react'
import AssistantPanel from '../assistant/AssistantPanel.jsx'

function AssistantOrb() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="assistant-orb"
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        title="Assistant"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="assistant-orb-core" />
      </button>
      {open && <AssistantPanel onClose={() => setOpen(false)} />}
    </>
  )
}

export default AssistantOrb
