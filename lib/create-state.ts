export enum STATE {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

export type StatePredicate = () => boolean
export type Disable = () => void

const createState = (): { isEnabled: StatePredicate; disable: Disable } => {
  let state: STATE = STATE.ENABLED

  const isEnabled = (): boolean => {
    return state === STATE.ENABLED
  }
  const disable = (): void => {
    state = STATE.DISABLED
  }

  return { isEnabled, disable }
}

export default createState
