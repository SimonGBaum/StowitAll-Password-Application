import { useTorchTransition as useTorchTransitionContext } from '../context/TorchTransitionContext';

export function useTorchTransition() {
  return useTorchTransitionContext();
}
