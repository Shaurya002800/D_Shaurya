import { Component } from 'react'

export default class WorldBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) { this.props.onUnavailable?.(error) }
  render() { return this.state.failed ? null : this.props.children }
}
