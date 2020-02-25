import Mailbox, { createMailbox, getMailboxes, dropMailboxes } from '../lib'

describe('Mixed usage of constructor and factory::', () => {
  const cleanup = () => {
    mailboxIns1 = undefined
    mailboxObj1 = undefined
    mailboxIns2 = undefined
    mailboxObj2 = undefined
    mailboxIns3 = undefined
    mailboxObj3 = undefined
    mailboxes = undefined
    dropMailboxes()
  }
  beforeEach(cleanup)
  afterAll(cleanup)

  const nameIns1 = 'nameIns1'
  const nameIns2 = 'nameIns2'
  const nameIns3 = 'nameIns3'
  const nameObj1 = 'nameObj1'
  const nameObj2 = 'nameObj2'
  const nameObj3 = 'nameObj3'

  // tslint:disable-next-line: one-variable-per-declaration
  let mailboxIns1,
    mailboxObj1,
    mailboxIns2,
    mailboxObj2,
    mailboxIns3,
    mailboxObj3: Mailbox
  let mailboxes: Mailbox[]

  describe('Inventory::', () => {
    beforeEach(() => {
      mailboxIns1 = new Mailbox(nameIns1)
      mailboxObj1 = createMailbox(nameObj1)
      mailboxIns2 = new Mailbox(nameIns2)
      mailboxObj2 = createMailbox(nameObj2)
      mailboxIns3 = new Mailbox(nameIns3)
      mailboxObj3 = createMailbox(nameObj3)

      mailboxes = getMailboxes()
    })

    test('should add different types mailbox to mailbox inventory', () => {
      expect(mailboxes).toHaveLength(6)
      expect(mailboxes).toEqual([
        mailboxIns1,
        mailboxObj1,
        mailboxIns2,
        mailboxObj2,
        mailboxIns3,
        mailboxObj3
      ])
    })

    test('should check prototype inventory mailboxes', () => {
      expect(mailboxes[0].constructor).toBe(Mailbox)
      expect(mailboxes[1].constructor).toBe(Object)
      expect(mailboxes[2].constructor).toBe(Mailbox)
      expect(mailboxes[3].constructor).toBe(Object)
      expect(mailboxes[4].constructor).toBe(Mailbox)
      expect(mailboxes[5].constructor).toBe(Object)
    })

    test('should check correct remove from mixed inventory', () => {
      mailboxes[0].disable()
      expect(getMailboxes()).toHaveLength(5)
      expect(getMailboxes()).toEqual([
        mailboxObj1,
        mailboxIns2,
        mailboxObj2,
        mailboxIns3,
        mailboxObj3
      ])

      mailboxes[1].disable()
      expect(getMailboxes()).toHaveLength(4)
      expect(getMailboxes()).toEqual([
        mailboxIns2,
        mailboxObj2,
        mailboxIns3,
        mailboxObj3
      ])

      mailboxes[5].disable()
      expect(getMailboxes()).toHaveLength(3)
      expect(getMailboxes()).toEqual([mailboxIns2, mailboxObj2, mailboxIns3])

      mailboxes[3].disable()
      expect(getMailboxes()).toHaveLength(2)
      expect(getMailboxes()).toEqual([mailboxIns2, mailboxIns3])

      mailboxes[2].disable()
      expect(getMailboxes()).toHaveLength(1)
      expect(getMailboxes()).toEqual([mailboxIns3])

      mailboxes[4].disable()
      expect(getMailboxes()).toHaveLength(0)
    })
  })

  describe('Constructor and factory::', () => {
    test('should constructor return Object instance when mailbox with passed name exist and created by factory', () => {
      mailboxObj1 = createMailbox(nameObj1)
      mailboxIns1 = new Mailbox(nameObj1)

      expect(mailboxIns1.constructor).toBe(Object)
      expect(mailboxIns1).toBe(mailboxObj1)
    })

    test('should factory return Mailbox instance when mailbox with passed name exist and created by constructor', () => {
      mailboxIns1 = new Mailbox(nameObj1)
      mailboxObj1 = createMailbox(nameObj1)

      expect(mailboxObj1.constructor).toBe(Mailbox)
      expect(mailboxIns1).toBe(mailboxObj1)
    })
  })
})
