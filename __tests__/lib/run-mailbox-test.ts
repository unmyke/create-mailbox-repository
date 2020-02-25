// tslint:disable: no-shadowed-variable
// tslint:disable: one-variable-per-declaration

import Mailbox, { NotifyHook, Predicate, Msg } from '../../lib'
import { MsgProcessor } from '../../lib/create-send-mail'
import { MailboxListGetter } from '../../lib/create-mailbox-list'
import { ListProcessor } from '../../lib/create-list-handlers'

const createMailboxTests = ({
  createMailbox,
  getMailboxes,
  dropMailboxes
}: {
  createMailbox: (name: string, send?: MsgProcessor) => Mailbox;
  getMailboxes: MailboxListGetter;
  dropMailboxes: ListProcessor;
}): void => {
  describe('Mailbox::', () => {
    let mailbox: Mailbox
    const mailboxName = 'name'

    const cleanup = () => {
      dropMailboxes()
      mailbox = undefined
    }

    afterAll(cleanup)
    beforeEach(cleanup)

    describe('Mailbox Inventory::', () => {
      test('should check mailbox inventory to be fullfiled by new mailboxes', () => {
        expect(getMailboxes()).toHaveLength(0)

        const mailbox1 = createMailbox('1')
        expect(getMailboxes()).toHaveLength(1)
        expect(getMailboxes()).toEqual([mailbox1])

        const mailbox2 = createMailbox('2')
        expect(getMailboxes()).toHaveLength(2)
        expect(getMailboxes()).toEqual([mailbox1, mailbox2])

        const mailbox3 = createMailbox('3')
        expect(getMailboxes()).toHaveLength(3)
        expect(getMailboxes()).toEqual([mailbox1, mailbox2, mailbox3])

        dropMailboxes()
        expect(getMailboxes()).toHaveLength(0)
      })
    })

    describe('#createMailbox', () => {
      beforeEach(() => {
        mailbox = createMailbox(mailboxName)
      })

      test('returns new instance for different mailbox name', () => {
        const newMailboxName = 'new name'
        const newMailbox = createMailbox(newMailboxName)

        expect(mailbox.getName()).toBe(mailboxName)
        expect(newMailbox.getName()).toBe(newMailboxName)
        expect(newMailbox).not.toBe(mailbox)
      })

      test('returns existing instance for same mailbox name', () => {
        const sameMailbox = createMailbox(mailboxName)

        expect(sameMailbox).toBe(mailbox)
      })
    })

    describe('#isEnabled', () => {
      beforeEach(() => {
        cleanup()
        mailbox = createMailbox(mailboxName)
      })

      test('returns enabled for new mailbox', () => {
        expect(mailbox.isEnabled()).toBeTruthy()
      })
    })

    describe('#disable', () => {
      beforeEach(() => {
        mailbox = createMailbox(mailboxName)
        mailbox.disable()
      })

      test('should check mailbox state to be "disable"', () => {
        expect(mailbox.isEnabled()).toBeFalsy()
      })

      test('should check mailbox have no hooks', () => {
        expect(mailbox.getPreHooks()).toHaveLength(0)
        expect(mailbox.getNotifyHooks()).toHaveLength(0)
      })

      test('should check mailbox have no hooks', () => {
        expect(mailbox.getPreHooks()).toHaveLength(0)
        expect(mailbox.getNotifyHooks()).toHaveLength(0)
      })

      test('should check ability to create new mailbox with same name', () => {
        const sameMailbox = createMailbox(mailboxName)

        expect(sameMailbox).not.toBe(mailbox)
        expect(sameMailbox.getName()).toBe(mailbox.getName())
      })
    })

    describe('#sendMail', () => {
      let sendMockFn
      const msg = 'msg'

      beforeEach(() => {
        sendMockFn = jest.fn()

        mailbox = createMailbox(mailboxName, (msg: Msg) => {
          sendMockFn(msg)
        })
      })

      test('should call send hook', () => {
        mailbox.sendMail(msg)

        expect(sendMockFn.mock.calls.length).toBe(1)
        expect(sendMockFn.mock.calls[0][0]).toBe(msg)
      })

      test('should not call send hook is not when mailbox is disabled', () => {
        mailbox.disable()
        mailbox.sendMail(msg)

        expect(sendMockFn.mock.calls.length).toBe(0)
      })
    })

    describe('#addNotifyHook/#removeNotifyHook/#sendMail with notify hooks', () => {
      const msg = 'msg'

      let notifyHook1, notifyHook2, notifyHook3: NotifyHook
      let notifyMockFn

      beforeEach(() => {
        notifyMockFn = jest.fn()

        const createNotifyHook = (num: number) => (msg: Msg) => {
          notifyMockFn(`notifyHook${num}: ${msg}`)
        }

        notifyHook1 = createNotifyHook(1)
        notifyHook2 = createNotifyHook(2)
        notifyHook3 = createNotifyHook(3)
        mailbox = createMailbox(mailboxName)
      })

      describe('manage notify hooks', () => {
        beforeEach(() => {
          mailbox.addNotifyHook(notifyHook1)
          mailbox.addNotifyHook(notifyHook2)
          mailbox.addNotifyHook(notifyHook3)
        })
        test('should count of added notify hooks', () => {
          const notifyHooks = mailbox.getNotifyHooks()
          expect(notifyHooks).toHaveLength(3)
          expect(notifyHooks).toEqual([notifyHook1, notifyHook2, notifyHook3])
        })
        test('should count of notify hooks when second hook is removed', () => {
          mailbox.removeNotifyHook(notifyHook2)

          const notifyHooks = mailbox.getNotifyHooks()
          expect(notifyHooks).toHaveLength(2)
          expect(notifyHooks).toEqual([notifyHook1, notifyHook3])
        })
        test('should count of added notify hooks when first andl last hooks is removed', () => {
          mailbox.removeNotifyHook(notifyHook1)
          mailbox.removeNotifyHook(notifyHook3)

          const notifyHooks = mailbox.getNotifyHooks()
          expect(notifyHooks).toHaveLength(1)
          expect(notifyHooks).toEqual([notifyHook2])
        })
        test('should return no notify hooks when all hooks are removed', () => {
          mailbox.removeNotifyHook(notifyHook1)
          mailbox.removeNotifyHook(notifyHook2)
          mailbox.removeNotifyHook(notifyHook3)

          const notifyHooks = mailbox.getNotifyHooks()
          expect(notifyHooks).toHaveLength(0)
        })
      })

      describe('process notify hooks', () => {
        test('should run all notify-hook when sendMail calls', () => {
          mailbox.addNotifyHook(notifyHook1)
          mailbox.addNotifyHook(notifyHook2)
          mailbox.addNotifyHook(notifyHook3)
          mailbox.sendMail(msg)

          expect(notifyMockFn.mock.calls.length).toBe(3)
          expect(notifyMockFn.mock.calls[0][0]).toBe(`notifyHook1: ${msg}`)
          expect(notifyMockFn.mock.calls[1][0]).toBe(`notifyHook2: ${msg}`)
          expect(notifyMockFn.mock.calls[2][0]).toBe(`notifyHook3: ${msg}`)
        })

        test('should not add notify hooks when disabled', () => {
          mailbox.disable()
          mailbox.addNotifyHook(notifyHook1)
          mailbox.addNotifyHook(notifyHook2)
          mailbox.addNotifyHook(notifyHook3)
          mailbox.sendMail(msg)

          expect(mailbox.getNotifyHooks()).toHaveLength(0)
          expect(notifyMockFn.mock.calls.length).toBe(0)
        })
      })
    })

    describe('#addPreHook/#removePreHook/#sendMail with pre hooks', () => {
      let predicate1, predicate2, predicate3: Predicate

      const createPredicate = (regexp: RegExp): Predicate => (
        msg: Msg
      ): boolean => regexp.test(msg)
      const predicate1Regexp = /^.*hook1.*$/
      const predicate2Regexp = /^.*hook2.*$/
      const predicate3Regexp = /^.*hook3.*$/
      predicate1 = createPredicate(predicate1Regexp)
      predicate2 = createPredicate(predicate2Regexp)
      predicate3 = createPredicate(predicate3Regexp)

      describe('manage pre hooks', () => {
        beforeEach(() => {
          mailbox = createMailbox(mailboxName)
          mailbox.addPreHook(predicate1)
          mailbox.addPreHook(predicate2)
          mailbox.addPreHook(predicate3)
        })
        test('should count of added pre hooks', () => {
          const predicates = mailbox.getPreHooks()
          expect(predicates).toHaveLength(3)
          expect(predicates).toEqual([predicate1, predicate2, predicate3])
        })
        test('should count of pre hooks when second hook is removed', () => {
          mailbox.removePreHook(predicate2)

          const predicates = mailbox.getPreHooks()
          expect(predicates).toHaveLength(2)
          expect(predicates).toEqual([predicate1, predicate3])
        })
        test('should count of added pre hooks when first andl last hooks is removed', () => {
          mailbox.removePreHook(predicate1)
          mailbox.removePreHook(predicate3)

          const predicates = mailbox.getPreHooks()
          expect(predicates).toHaveLength(1)
          expect(predicates).toEqual([predicate2])
        })
        test('should return no pre hooks when all hooks are removed', () => {
          mailbox.removePreHook(predicate1)
          mailbox.removePreHook(predicate2)
          mailbox.removePreHook(predicate3)

          const predicates = mailbox.getPreHooks()
          expect(predicates).toHaveLength(0)
        })
        test('should return no pre hooks when mailbox is disabled', () => {
          mailbox.disable()
          mailbox.addPreHook(predicate1)
          mailbox.addPreHook(predicate2)
          mailbox.addPreHook(predicate3)

          const predicates = mailbox.getPreHooks()
          expect(predicates).toHaveLength(0)
        })
      })

      describe('calculate predicates on sendMail', () => {
        let sendHook

        beforeEach(() => {
          sendHook = jest.fn()

          mailbox = createMailbox(mailboxName, (msg: Msg) => {
            sendHook(msg)
          })
          mailbox.addPreHook(predicate1)
          mailbox.addPreHook(predicate2)
          mailbox.addPreHook(predicate3)
        })

        test('should run send hook when all predicates return true', () => {
          const acceptableMsg = 'hook1 hook2 hook3'
          mailbox.sendMail(acceptableMsg)

          expect(sendHook.mock.calls.length).toBe(1)
          expect(sendHook.mock.calls[0][0]).toBe(acceptableMsg)
        })

        test('should not run send hook when one predicates return false', () => {
          const unacceptableMsg = 'hook1 hook2 hook4'
          mailbox.sendMail(unacceptableMsg)

          expect(sendHook.mock.calls.length).toBe(0)
        })

        test('should not run send hook when more than one predicates return false', () => {
          const unacceptableMsg = 'hook0 hook2 hook4'
          mailbox.sendMail(unacceptableMsg)

          expect(sendHook.mock.calls.length).toBe(0)
        })

        test('should not run send hook when all predicates return false', () => {
          const unacceptableMsg = ''
          mailbox.sendMail(unacceptableMsg)

          expect(sendHook.mock.calls.length).toBe(0)
        })
      })
    })
  })
}

export default createMailboxTests
