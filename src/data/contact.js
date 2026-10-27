// This gate is evaluated only after the visitor has seen the completed handoff.
export function confirmsHandoff(stage, text) {
  return stage === 'confirm' && /^(send|confirm|yes[, ]+send|yes)$/i.test(text.trim())
}
