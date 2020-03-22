import Mailbox from './mailbox'
import createMailboxList, { MailboxGetter } from './create-mailbox-list'
import { MsgProcessor } from './create-send-mail'
import createMailboxFactory, { MailboxFactory } from './create-mailbox-factory'
import { ListProcessor } from './create-list-handlers'

export type MailboxRepository = {
  createMailbox: MailboxFactory
  getAll: () => Mailbox[]
  getByName: MailboxGetter
  drop: ListProcessor
}

const createMailboxRepository = (): MailboxRepository => {
  const {
    addMailbox,
    dropMailboxes: drop,
    getMailboxByName: getByName,
    getMailboxes: getAll,
    removeMailbox,
  } = createMailboxList()

  const createMailbox = (name: string, send?: MsgProcessor): Mailbox => {
    // search mailbox if exist and return it

    const currentMailbox = getByName(name)
    if (currentMailbox) {
      return currentMailbox
    }

    // construct new mailbox
    const mailboxFactory = createMailboxFactory()
    const {
      enable: enableMailbox,
      disable: disableMailbox,
      ...restMailbox
    } = mailboxFactory(name, send)
    const disable = (): boolean => {
      if (restMailbox.isDisabled()) {
        return false
      }

      removeMailbox(mailbox)
      return disableMailbox()
    }
    const enable = (): boolean => {
      if (getByName(restMailbox.getName()) !== undefined) {
        return false
      }

      if (restMailbox.isEnabled()) {
        return false
      }

      addMailbox(mailbox)
      return enableMailbox()
    }

    const mailbox = {
      ...restMailbox,
      enable,
      disable,
    }
    addMailbox(mailbox)

    return mailbox
  }

  return {
    createMailbox,
    getAll,
    getByName,
    drop,
  }
}
export default createMailboxRepository
