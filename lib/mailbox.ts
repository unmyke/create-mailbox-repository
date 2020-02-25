import { StatePredicate } from './create-state'
import { PredicatesGetter, PredicateSetter } from './create-predicate-list'
import { NotifyHooksGetter, NotifyHookSetter } from './create-notify-hook-list'
import createMailboxListFactory, {
  MailboxProcessor,
  NameGetter
} from './create-mailbox-list-factory'
import { MsgProcessor } from './create-send-mail'
import identity from './identity'

export type MailboxConstructor = (mailbox: Mailbox) => Mailbox

const {
  createMailboxFactory,
  getMailboxes,
  dropMailboxes
} = createMailboxListFactory()

const instantiateMailbox = createMailboxFactory(
  (mailbox: Mailbox): Mailbox => {
    const mailboxInstance = Object.create(Mailbox.prototype)

    Object.getOwnPropertyNames(mailbox).forEach((methodName: string): void => {
      mailboxInstance[methodName] = mailbox[methodName]
    })
    return mailboxInstance
  }
)
const createMailbox = createMailboxFactory(identity)

class Mailbox {
  isEnabled: StatePredicate
  getName: NameGetter
  sendMail: MsgProcessor
  getPreHooks: PredicatesGetter
  pre: PredicateSetter
  addPreHook: PredicateSetter
  removePreHook: PredicateSetter
  getNotifyHooks: NotifyHooksGetter
  notify: NotifyHookSetter
  addNotifyHook: NotifyHookSetter
  removeNotifyHook: NotifyHookSetter
  disable: MailboxProcessor

  constructor(name: string, send?: MsgProcessor) {
    const mailbox = instantiateMailbox(name, send)
    return mailbox
  }
}

export default Mailbox
export { createMailbox, dropMailboxes, getMailboxes }
