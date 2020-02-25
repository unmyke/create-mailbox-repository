import { StatePredicate } from './create-state'

export type CallIfEnabled<Fn extends (...args: any[]) => any> = (
  fn: Fn
) => (...args: any[]) => ReturnType<Fn> | void

const createCallIfEnabled = (isEnabled: StatePredicate) => <
  Fn extends (...args: any[]) => any
>(
  fn: Fn
) => (...args: any[]): ReturnType<Fn> | void => {
  if (isEnabled()) {
    return fn(...args)
  }
}
export default createCallIfEnabled
