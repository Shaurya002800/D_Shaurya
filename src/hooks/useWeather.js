import { useState, useEffect, useCallback } from 'react'
import { WEATHER_SEQUENCE, WEATHER_DURATION_MS } from '../data/weather.js'

function initialWeatherIndex() {
  const requested = new URLSearchParams(window.location.search).get('weather')
  return Math.max(0, WEATHER_SEQUENCE.findIndex(weather => weather.id === requested))
}

export function useWeather(reducedMotion) {
  const [index, setIndex] = useState(initialWeatherIndex)
  const [mode, setMode] = useState('auto')

  useEffect(() => {
    if (mode !== 'auto' || reducedMotion) return undefined
    const interval = setInterval(() => {
      setIndex(current => (current + 1) % WEATHER_SEQUENCE.length)
    }, WEATHER_DURATION_MS)
    return () => clearInterval(interval)
  }, [mode, reducedMotion])

  const selectWeather = useCallback(value => {
    if (value === 'auto') {
      setMode('auto')
      return
    }
    const next = WEATHER_SEQUENCE.findIndex(weather => weather.id === value)
    if (next < 0) return
    setMode(value)
    setIndex(next)
  }, [])

  return { weather: WEATHER_SEQUENCE[index], mode, selectWeather }
}
