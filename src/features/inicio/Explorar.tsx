import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { enterDemo } from '../../demo/mode'

/** /explorar: activa el modo exploración con datos de ejemplo y entra a la app. */
export function Explorar() {
  const navigate = useNavigate()
  useEffect(() => {
    enterDemo()
    navigate('/app', { replace: true })
  }, [navigate])
  return null
}
