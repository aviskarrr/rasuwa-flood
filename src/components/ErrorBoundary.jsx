import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="error-boundary-box" role="alert">
          <div className="error-boundary-content">
            <span className="error-tag">COMPONENT DEGRADATION</span>
            <h3>{this.props.sectionName || 'Interactive Section'} Temporarily Unavailable</h3>
            <p>An unexpected error occurred while initializing this component. Other sections remain fully operational.</p>
            {this.state.error?.message && (
              <code className="error-code">{this.state.error.message}</code>
            )}
            <button className="button button-ghost retry-boundary-btn" onClick={this.handleReset}>
              RE-INITIALIZE SECTION
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
