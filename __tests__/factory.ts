import {
  createMailbox as createMailboxFP,
  getMailboxes,
  dropMailboxes
} from '../lib'
import runMailboxTest from './lib/run-mailbox-test'
import defaultSend from './lib/default-send'

const createMailbox = (name: string, send = defaultSend) => {
  return createMailboxFP(name, send)
}

runMailboxTest({
  createMailbox,
  getMailboxes,
  dropMailboxes
})
