// tslint:disable: no-console

import createMailboxReposiory, { Mailbox } from './index'

// mailbox repository
const mailboxReposiory = createMailboxReposiory()

// helpers
const consoleMailboxRepoMeta = (externalMailboxes?: Mailbox[]): void => {
  const isInventoryMalboxes = !externalMailboxes
  const mailboxes = isInventoryMalboxes
    ? mailboxReposiory.getAll()
    : externalMailboxes
  const isEmpty = !mailboxes.length

  const header = isInventoryMalboxes
    ? 'mailbox repository'
    : '    mailboxes     '
  if (!isEmpty) {
    console.log('┌─────────────────────────────────┐')
    console.log(`│       ${header}        │`)
    console.table(
      mailboxes.map(({ getName, isEnabled }) => ({
        name: getName(),
        enabled: isEnabled(),
      })),
    )
    console.log(
      `     mailboxes count:${mailboxes.length.toString().padStart(12)}`,
    )
  } else {
    console.log('┌──────────────────────────────────┐')
    console.log('│   mailbox repository is empty    │')
    console.log('└──────────────────────────────────┘')
  }
}

const consoleMailboxData = ({
  getName,
  getNotifyHooks,
  getPreHooks,
  isEnabled,
}): void => {
  const getCount = (getter: () => unknown[]): number => getter().length
  console.log('┌──────────────────────────────────┐')
  console.log(`│ mailbox name: ${getName().padEnd(18)} │`)
  console.table({
    name: getName(),
    'pre hooks count': getCount(getPreHooks),
    'notify hooks count': getCount(getNotifyHooks),
    state: isEnabled() ? 'enabled' : 'disabled',
  })
}

// mailbox names
const mailboxName1 = 'mailbox 1'
const mailboxName2 = 'mailbox 2'
const mailboxName3 = 'mailbox 3'
const mailboxName4 = 'mailbox 4'

console.log('\n:: MAILBOX REPOSITORY')

// constructor
console.log('\n:: start with empty mailbox repository')
consoleMailboxRepoMeta()

console.log('\n:: 1 mailbox added')
const mailbox1 = mailboxReposiory.createMailbox(mailboxName1)
consoleMailboxRepoMeta()

console.log('\n:: 1 more mailboxes added')
const mailbox2 = mailboxReposiory.createMailbox(mailboxName2)
consoleMailboxRepoMeta()

console.log('\n:: and 2 more mailbox added')
const mailbox3 = mailboxReposiory.createMailbox(mailboxName3)
const mailbox4 = mailboxReposiory.createMailbox(mailboxName4)
consoleMailboxRepoMeta()

console.log('\n:: get mailbox from repository when passed same name')
const sameMailbox1 = mailboxReposiory.createMailbox(mailboxName1)
console.log(`> name: ${sameMailbox1.getName()}`)
console.log(`> sameMailbox1 === mailbox1: ${sameMailbox1 === mailbox1}`)
const sameMailbox4 = mailboxReposiory.createMailbox(mailboxName4)
console.log(`> name: ${sameMailbox4.getName()}`)
console.log(`> sameMailbox4 === mailbox4: ${sameMailbox4 === mailbox4}`)

console.log('\n:: drop mailbox repository')
mailboxReposiory.drop()
console.log('\n:::: mailbox repository after drop')
consoleMailboxRepoMeta()
console.log('\n:::: mailboxes out of mailbox repository')
consoleMailboxRepoMeta([mailbox1, mailbox2, mailbox3, mailbox4])

console.log(''.padStart(35, '*'))
console.log('\n\n:: MAILBOX')
const mailbox = mailboxReposiory.createMailbox('mailbox 5')

const acceptableMsg = 'msg1:msg2:msg3'
const unacceptableMsg = 'msg1:msg2'

console.log('\n:::: PreHooks')
const createPredicate = (regExp: RegExp) => (msg: string): boolean =>
  regExp.test(msg)
const regExp1 = /.*msg1.*/
const regExp2 = /.*msg2.*/
const regExp3 = /.*msg3.*/
const predicate1 = createPredicate(regExp1)
const predicate2 = createPredicate(regExp2)
const predicate3 = createPredicate(regExp3)

console.log('\n:: add pre-hooks')
console.log(`> pre-hooks count before: ${mailbox.getPreHooks().length}`)
mailbox.addPreHook(predicate1)
mailbox.addPreHook(predicate2)
mailbox.addPreHook(predicate3)
console.log(`> pre-hooks count after : ${mailbox.getPreHooks().length}`)
console.log('\n:: send acceptable message')
mailbox.sendMail(acceptableMsg)
console.log('\n:: send unacceptable message')
mailbox.sendMail(unacceptableMsg)
console.log('\n:: remove one preHook')
mailbox.removePreHook(predicate3)
console.log(`> pre-hooks count after : ${mailbox.getPreHooks().length}`)
console.log(':: now unacceptable message must be send')
mailbox.sendMail(unacceptableMsg)

console.log('\n:: #NotifyHooks')
const createNotifyHook = notifyMsg => (): void => {
  console.warn(`> notification: ${notifyMsg}`)
}
const notifyMsg1 = 'notify message 1'
const notifyMsg2 = 'notify message 2'
const notifyMsg3 = 'notify message 3'
const notifyHook1 = createNotifyHook(notifyMsg1)
const notifyHook2 = createNotifyHook(notifyMsg2)
const notifyHook3 = createNotifyHook(notifyMsg3)

console.log('\n:: add notify-hooks')
console.log(`> notify-hooks count before: ${mailbox.getNotifyHooks().length}`)
mailbox.addNotifyHook(notifyHook1)
mailbox.addNotifyHook(notifyHook2)
mailbox.addNotifyHook(notifyHook3)
console.log(`> notify-hooks count after : ${mailbox.getNotifyHooks().length}`)
console.log('\n:: send acceptable message')
mailbox.sendMail(acceptableMsg)
console.log(':: send unacceptable message')
mailbox.sendMail('unacceptable mesage')

console.log('\n:: #Remove mailbox from repository')
console.log('\n:: disable')
console.log('\n:::: before disable')
consoleMailboxData(mailbox)
consoleMailboxRepoMeta()
console.log('\n:::: after disable')
mailbox.disable()
consoleMailboxData(mailbox)
consoleMailboxRepoMeta()
console.log(':: blocked: sendMail')
mailbox.sendMail(acceptableMsg)
console.log(':: blocked: hook manage')
mailbox.addPreHook(predicate2)
mailbox.addNotifyHook(notifyHook3)
consoleMailboxData(mailbox)

console.log('\n:: now new mailbox with same name can be created')
const newMailbox = mailboxReposiory.createMailbox(mailbox.getName())
consoleMailboxData(newMailbox)
console.log(':: mailbox accessed to manage')
newMailbox.addPreHook(predicate1)
newMailbox.addPreHook(predicate3)
newMailbox.addNotifyHook(notifyHook2)
newMailbox.addNotifyHook(notifyHook3)
consoleMailboxData(newMailbox)
console.log(':: and to send messages')
newMailbox.sendMail('msg1msg3')
