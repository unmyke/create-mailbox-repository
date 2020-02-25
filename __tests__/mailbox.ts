import Mailbox, { dropMailboxes, getMailboxes } from '../lib'
import runMailboxTests from './lib/run-mailbox-test'
import defaultSend from './lib/default-send'

const createMailbox = (name: string, send = defaultSend) =>
  new Mailbox(name, send)

runMailboxTests({
  createMailbox,
  getMailboxes,
  dropMailboxes
})
