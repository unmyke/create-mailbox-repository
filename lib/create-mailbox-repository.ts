import Mailbox from './mailbox'
import createMailboxList from './create-mailbox-list'
import { MsgProcessor } from './create-send-mail'
import createMailboxFactory from './create-mailbox-factory'
import MailboxRepository from './mailbox-repository'

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

  const add = ({ enable }: Mailbox): boolean => enable()
  const remove = ({ disable }: Mailbox): boolean => disable()

  return {
    createMailbox,
    getAll,
    getByName,
    add,
    remove,
    drop,
  }
}
export default createMailboxRepository
