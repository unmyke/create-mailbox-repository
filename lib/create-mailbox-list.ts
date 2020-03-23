import createListHandlers, {
  ListGetter,
  ListSetter,
  ListProcessor,
} from './create-list-handlers'
import Mailbox from './mailbox'

export type MailboxGetter = (name: string) => Mailbox
export type MailboxListGetter = ListGetter<Mailbox>
export type MailboxSetter = ListSetter<Mailbox>
export type MailboxesProccesor = (
  origMailbox: Mailbox,
  newMailbox: Mailbox,
) => void

const createMailboxList = (): {
  getMailboxes: MailboxListGetter
  getMailboxByName: MailboxGetter
  addMailbox: MailboxSetter
  removeMailbox: MailboxSetter
  dropMailboxes: ListProcessor
} => {
  const {
    get: getMailboxes,
    add: addMailbox,
    remove: removeMailbox,
  } = createListHandlers<Mailbox>()

  const getMailboxByName = (name: string): Mailbox => {
    const mailboxes = getMailboxes()

    return mailboxes.find((mailbox: Mailbox): boolean => {
      return mailbox.getName() === name
    })
  }

  const dropMailboxes = (): void => {
    const mailboxes = getMailboxes()

    mailboxes.forEach(({ disable }: Mailbox): void => {
      disable()
    })
  }

  return {
    getMailboxes,
    getMailboxByName,
    addMailbox,
    removeMailbox,
    dropMailboxes,
  }
}

export default createMailboxList
