/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatePredicate } from './create-state'

export type CallIfEnabled<Fn extends (...args: any[]) => any> = (
  fn: Fn,
) => (...args: Parameters<Fn>) => ReturnType<Fn> | void

const createCallIfEnabled = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Fn extends (...args: any[]) => any
>(
  isEnabled: StatePredicate,
): CallIfEnabled<Fn> => (fn: Fn) => (
  ...args: Parameters<Fn>
): ReturnType<Fn> | void => {
  if (isEnabled()) {
    return fn(...args)
  }
}
export default createCallIfEnabled
