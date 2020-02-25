import createMailboxList, { MailboxListGetter } from './create-mailbox-list'
import customizeCreateMailboxFactory, {
  CreateMailboxFactory
} from './create-mailbox-factory'

export type NameGetter = () => string
export type MailboxProcessor = () => void
export type MailboxListFactory = {
  createMailboxFactory: CreateMailboxFactory;
  getMailboxes: MailboxListGetter;
  dropMailboxes: MailboxProcessor;
}

const createMailboxListFactory = (): MailboxListFactory => {
  const {
    getMailboxes,
    getMailboxByName,
    addMailbox,
    removeMailbox,
    dropMailboxes
  } = createMailboxList()

  const createMailboxFactory = customizeCreateMailboxFactory({
    getMailboxByName,
    addMailbox,
    removeMailbox
  })

  return {
    createMailboxFactory,
    getMailboxes,
    dropMailboxes
  }
}
export default createMailboxListFactory
