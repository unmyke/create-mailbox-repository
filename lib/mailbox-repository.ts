import { MailboxFactory } from './create-mailbox-factory'
import Mailbox from './mailbox'
import { MailboxGetter } from './create-mailbox-list'
import { ListProcessor as MailboxesProcessor } from './create-list-handlers'

type MailboxProcessor = (mailbox: Mailbox) => boolean

type MailboxRepository = {
  createMailbox: MailboxFactory
  getAll: () => Mailbox[]
  getByName: MailboxGetter
  add: MailboxProcessor
  remove: MailboxProcessor
  drop: MailboxesProcessor
}

export default MailboxRepository
