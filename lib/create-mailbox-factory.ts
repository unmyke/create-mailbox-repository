import createSend, { MsgProcessor } from './create-send-mail'
import Mailbox from './mailbox'
import createPredicateList from './create-predicate-list'
import createNotifyHookList from './create-notify-hook-list'
import deprecatedCaller from './deprecated-caller'
import createState from './create-state'
import createCallIfEnabled from './create-call-if-enabled'

export type MailboxFactory = (name: string, sendHook?: MsgProcessor) => Mailbox

const createMailboxFactory = (): MailboxFactory => {
  // mailbox factory
  const createMailbox = (name: string, send?: MsgProcessor): Mailbox => {
    const getName = (): string => {
      return name
    }

    const { isEnabled, disable } = createState()
    const callIfMailboxEnabled = createCallIfEnabled(isEnabled)

    const {
      getPredicates: getPreHooks,
      addPredicate: addPreHook,
      removePredicate: removePreHook,
      checkMsg,
      dropPredicates,
    } = createPredicateList(callIfMailboxEnabled)
    const {
      getNotifyHooks: getNotifyHooks,
      addNotifyHook: addNotifyHook,
      removeNotifyHook: removeNotifyHook,
      runNotifyHooks,
      dropNotifyHooks,
    } = createNotifyHookList(callIfMailboxEnabled)

    const pre = deprecatedCaller(addPreHook)
    const notify = deprecatedCaller(addNotifyHook)

    const sendMail = createSend({
      name,
      checkMsg,
      runNotifyHooks,
      send,
      callIfMailboxEnabled,
    })

    const mailbox = {
      isEnabled,
      getName,
      sendMail,
      getPreHooks,
      addPreHook,
      pre,
      removePreHook,
      getNotifyHooks,
      addNotifyHook,
      notify,
      removeNotifyHook,
      disable: (): void => {
        dropPredicates()
        dropNotifyHooks()
        disable()
      },
    }

    return mailbox
  }

  return createMailbox
}

export default createMailboxFactory
