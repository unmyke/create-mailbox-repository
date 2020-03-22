import { StatePredicate } from './create-state'
import { PredicatesGetter, PredicateSetter } from './create-predicate-list'
import { NotifyHooksGetter, NotifyHookSetter } from './create-notify-hook-list'
import { MsgProcessor } from './create-send-mail'

export type StateProcessor = () => boolean
export type NameGetter = () => string

type Mailbox = {
  readonly isEnabled: StatePredicate
  readonly isDisabled: StatePredicate
  readonly getName: NameGetter
  readonly sendMail: MsgProcessor
  readonly getPreHooks: PredicatesGetter
  readonly pre: PredicateSetter
  readonly addPreHook: PredicateSetter
  readonly removePreHook: PredicateSetter
  readonly getNotifyHooks: NotifyHooksGetter
  readonly notify: NotifyHookSetter
  readonly addNotifyHook: NotifyHookSetter
  readonly removeNotifyHook: NotifyHookSetter
  readonly enable: StateProcessor
  readonly disable: StateProcessor
}

export default Mailbox
