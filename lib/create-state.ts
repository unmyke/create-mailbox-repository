export enum STATE {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

export type StatePredicate = () => boolean
export type StateProcessor = () => void

const createState = (): {
  isEnabled: StatePredicate
  isDisabled: StatePredicate
  enable: StateProcessor
  disable: StateProcessor
} => {
  let state: STATE = STATE.ENABLED

  const isEnabled = (): boolean => {
    return state === STATE.ENABLED
  }
  const isDisabled = (): boolean => {
    return !isEnabled()
  }
  const enable = (): void => {
    state = STATE.ENABLED
  }
  const disable = (): void => {
    state = STATE.DISABLED
  }
  return { isEnabled, isDisabled, enable, disable }
}

export default createState
