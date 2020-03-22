export enum STATE {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

export type StatePredicate = () => boolean
export type StateProcessor = () => void

const createState = (): {
  isEnabled: StatePredicate
  isDisabled: StatePredicate
  disable: StateProcessor
} => {
  let state: STATE = STATE.ENABLED

  const isEnabled = (): boolean => {
    return state === STATE.ENABLED
  }
  const isDisabled = (): boolean => {
    return !isEnabled()
  }
  const disable = (): void => {
    state = STATE.DISABLED
  }

  return { isEnabled, isDisabled, disable }
}

export default createState
