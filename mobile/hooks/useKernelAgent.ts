/**
 * useKernelAgent Hook
 * Hook ???????????????? ?????? Agents ?????? ?????? Kernel
 */

import { useState, useEffect, useCallback } from 'react';
import { RAREKernel } from '../core/RAREKernel';

export function useKernelAgent(agentId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const kernel = RAREKernel.getInstance();

  /**
   * Execute action via agent
   */
  const executeAction = useCallback(
    async (action: string, parameters: any = {}) => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        // Emit user input to kernel ??? cognitive loop ??? agent
        kernel.emit({
          type: 'user:input',
          data: {
            action,
            agent: agentId,
            parameters,
          },
          source: 'ui',
        });

        // Listen for result
        const handleResult = (event: any) => {
          if (event.type === 'cognitive:result') {
            setResult(event.data.result);
            setLoading(false);
          }
        };

        const handleError = (event: any) => {
          if (event.type === 'cognitive:execution_error') {
            setError(event.data.error);
            setLoading(false);
          }
        };

        kernel.on('cognitive:result', handleResult);
        kernel.on('cognitive:execution_error', handleError);

        // Cleanup listeners after some time
        setTimeout(() => {
          kernel.off('cognitive:result', handleResult);
          kernel.off('cognitive:execution_error', handleError);
        }, 30000); // 30 seconds timeout

      } catch (err) {
        setError(String(err));
        setLoading(false);
      }
    },
    [agentId, kernel]
  );

  /**
   * Listen for agent events
   */
  const listenForEvents = useCallback(
    (eventType: string, callback: (data: any) => void) => {
      const handler = (event: any) => {
        if (event.type === eventType) {
          callback(event.data);
        }
      };

      kernel.on(eventType, handler);

      return () => {
        kernel.off(eventType, handler);
      };
    },
    [kernel]
  );

  return {
    executeAction,
    listenForEvents,
    loading,
    error,
    result,
  };
}



