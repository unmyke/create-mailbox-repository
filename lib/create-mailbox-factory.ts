import createSend, { MsgProcessor } from './create-send-mail'
import Mailbox, { MailboxConstructor } from './mailbox'
import createPredicateList from './create-predicate-list'
import createNotifyHookList from './create-notify-hook-list'
import deprecatedCaller from './deprecated-caller'
import createState from './create-state'
import { MailboxGetter, MailboxSetter } from './create-mailbox-list'
import createCallIfEnabled from './create-call-if-enabled'

export type MailboxFactory = (name: string, sendHook?: MsgProcessor) => Mailbox
export type CreateMailboxFactoryOptions = {
  getMailboxByName: MailboxGetter;
  addMailbox: MailboxSetter;
  removeMailbox: MailboxSetter;
}
export type CustomizeCreateMailboxFactory = (
  opts: CreateMailboxFactoryOptions
) => CreateMailboxFactory

export type CreateMailboxFactory = (ctor: MailboxConstructor) => MailboxFactory

const customizeCreateMailboxFactory = ({
  getMailboxByName,
  addMailbox,
  removeMailbox
}): CreateMailboxFactory => {
  const createMailboxFactory = (
    mailboxConstructor: MailboxConstructor
  ): MailboxFactory => {
    // mailbox factory
    const createMailbox = (name: string, send?: MsgProcessor): Mailbox => {
      // search existent mailbox
      const currentMailbox = getMailboxByName(name)
      if (currentMailbox) {
        return currentMailbox
      }

      // construct mailbox methods
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
        dropPredicates
      } = createPredicateList(callIfMailboxEnabled)
      const {
        getNotifyHooks: getNotifyHooks,
        addNotifyHook: addNotifyHook,
        removeNotifyHook: removeNotifyHook,
        runNotifyHooks,
        dropNotifyHooks
      } = createNotifyHookList(callIfMailboxEnabled)

      const pre = deprecatedCaller(addPreHook)
      const notify = deprecatedCaller(addNotifyHook)

      const sendMail = createSend({
        name,
        checkMsg,
        runNotifyHooks,
        send,
        callIfMailboxEnabled
      })

      // create mailbox

      const mailboxMethods = {
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
          removeMailbox(mailbox)
          disable()
        }
      }

      const mailbox = mailboxConstructor(mailboxMethods)

      addMailbox(mailbox)

      return mailbox
    }

    return createMailbox
  }

  return createMailboxFactory
}

export default customizeCreateMailboxFactory
