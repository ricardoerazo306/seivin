import { useSyncExternalStore } from 'react'

/** Avisos breves ("Guardado", "Meta creada") que desaparecen solos. */
export type Toast = { id: number; text: string; tone: 'good' | 'warn' }

let items: Toast[] = []
let next = 1
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function toast(text: string, tone: Toast['tone'] = 'good') {
  const id = next++
  items = [...items.slice(-2), { id, text, tone }]
  emit()
  setTimeout(() => dismiss(id), tone === 'warn' ? 5000 : 2600)
}

export function dismiss(id: number) {
  items = items.filter((t) => t.id !== id)
  emit()
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => items,
    () => items,
  )
}
