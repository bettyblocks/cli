import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@betty-blocks/design-system';

interface ErrorBoundaryProps {
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<
  object,
  ErrorBoundaryProps
> {
  constructor(props: object) {
    super(props);
    this.state = { errorInfo: null };
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo,
    });
  }

  handleClick(): void {
    this.setState({ errorInfo: null });
  }

  render(): ReactNode {
    const {
      props: { children },
      state: { errorInfo },
    } = this;

    if (errorInfo) {
      return (
        <div style={{ textAlign: 'center' }}>
          <p>
            An error occured in your component. This error is probably related
            to an issue in the combination of your component and options.
          </p>
          <p>Check the browser console for the message and stack trace.</p>
          <Button size="large" category="primary" onClick={this.handleClick}>
            Reload component
          </Button>
        </div>
      );
    }

    return children;
  }
}
