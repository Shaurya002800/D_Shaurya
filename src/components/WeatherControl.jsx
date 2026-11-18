import { WEATHER_SEQUENCE } from '../data/weather.js'
import './WeatherControl.css'

export default function WeatherControl({ weather, mode, onSelect }) {
  return (
    <label
      className="weather-control"
      onKeyDown={event => event.stopPropagation()}
      onKeyUp={event => event.stopPropagation()}
    >
      <span className="weather-control__icon" aria-hidden="true">{weather.icon}</span>
      <span className="weather-control__label">Weather</span>
      <select aria-label="Weather" value={mode} onChange={event => onSelect(event.target.value)}>
        <option value="auto">Auto · {weather.shortLabel}</option>
        {WEATHER_SEQUENCE.map(option => (
          <option key={option.id} value={option.id}>{option.shortLabel}</option>
        ))}
      </select>
      <svg className="weather-control__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  )
}
