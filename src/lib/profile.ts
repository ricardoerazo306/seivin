import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { requireClient, useAuth } from './auth'
import type { Profile, ProfileUpdate, Theme } from './types'

export function useProfile() {
  const auth = useAuth()
  const userId = auth.status === 'signed-in' ? auth.session.user.id : null
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await requireClient().from('profiles').select('*').eq('id', userId!).single()
      if (error) throw error
      return data as Profile
    },
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  const auth = useAuth()
  const userId = auth.status === 'signed-in' ? auth.session.user.id : null
  return useMutation({
    mutationFn: async (patch: ProfileUpdate) => {
      const { data, error } = await requireClient().from('profiles').update(patch).eq('id', userId!).select().single()
      if (error) throw error
      return data as Profile
    },
    onSuccess: (data) => qc.setQueryData(['profile', userId], data),
  })
}

/** Aplica el tema guardado (claro, oscuro o el del sistema). */
export function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  try {
    localStorage.setItem('seivin:tema', theme)
  } catch {
    /* almacenamiento no disponible: no pasa nada */
  }
}

export function useThemeFromProfile() {
  const { data } = useProfile()
  useEffect(() => {
    if (data?.theme) applyTheme(data.theme)
  }, [data?.theme])
}
