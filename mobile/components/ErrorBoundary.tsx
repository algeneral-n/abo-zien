/**
 * RARE 4N - Error Boundary Component
 * يمنع الكراشات في التطبيق
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // #region agent log
    if (__DEV__) {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/components/ErrorBoundary.tsx:componentDidCatch',message:'ErrorBoundary caught error',data:{error:error?.message,stack:error?.stack?.substring(0,200),componentStack:errorInfo?.componentStack?.substring(0,200)},timestamp:Date.now(),sessionId:'error-session',runId:'run1',hypothesisId:'ERROR_BOUNDARY'})}).catch(()=>{});
    }
    // #endregion
    
    console.error('ErrorBoundary caught error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Log to backend (non-blocking)
    this.logError(error, errorInfo).catch(() => {});
    
    // Call custom error handler
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/components/ErrorBoundary.tsx:onError',message:'Error handler failed',data:{error:handlerError?.toString()},timestamp:Date.now(),sessionId:'error-session',runId:'run1',hypothesisId:'ERROR_HANDLER'})}).catch(()=>{});
        }
        // #endregion
        console.error('Error handler failed:', handlerError);
      }
    }
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      // #region agent log
      if (__DEV__) {
        await fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'ErrorBoundary:logError',
            message: 'Error logged',
            data: {
              error: error?.message || 'Unknown error',
              stack: error?.stack?.substring(0, 500) || '',
              componentStack: errorInfo?.componentStack?.substring(0, 500) || '',
            },
            timestamp: Date.now(),
            sessionId: 'error-session',
            runId: 'run1',
            hypothesisId: 'ERROR_LOG',
          }),
        }).catch(() => {
          // Ignore logging errors
        });
      }
      // #endregion
    } catch (e) {
      // Ignore logging errors
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>حدث خطأ</Text>
            <Text style={styles.message}>
              {this.state.error?.message || 'خطأ غير معروف'}
            </Text>
            
            {__DEV__ && this.state.errorInfo && (
              <ScrollView style={styles.stackContainer}>
                <Text style={styles.stackTitle}>تفاصيل الخطأ:</Text>
                <Text style={styles.stackText}>
                  {this.state.error?.stack}
                </Text>
                <Text style={styles.stackTitle}>مكون الخطأ:</Text>
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </ScrollView>
            )}
            
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000408',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff0040',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  stackContainer: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  stackTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00eaff',
    marginTop: 10,
    marginBottom: 5,
  },
  stackText: {
    fontSize: 10,
    color: '#cccccc',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#00eaff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
  },
  buttonText: {
    color: '#000408',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

