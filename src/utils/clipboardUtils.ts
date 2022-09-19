export function copy(text: string) {
  try {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
    } else {
      // other legacy browsers
      const el = document.createElement('input')
      el.innerHTML = text
      copyToClipboard(el)
    }
  } catch (e: unknown) {
    throw new Error(e as string) // copy failed.
  }
}

function copyToClipboard(el: HTMLInputElement) {
  const oldContentEditable = el.contentEditable
  const oldReadOnly = el.readOnly

  try {
    el.contentEditable = 'true' // specific to iOS
    el.readOnly = false
    copyNodeContentsToClipboard(el)
  } finally {
    el.contentEditable = oldContentEditable
    el.readOnly = oldReadOnly
  }
}

function copyNodeContentsToClipboard(el: HTMLInputElement) {
  const range = document.createRange()
  const selection = window.getSelection()
  range.selectNodeContents(el)
  selection?.removeAllRanges()

  selection?.addRange(range)
  el.setSelectionRange(0, 999999)

  document.execCommand('copy')
}
