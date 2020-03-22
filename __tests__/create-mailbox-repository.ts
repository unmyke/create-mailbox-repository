// tslint:disable: one-variable-per-declaration
// tslint:disable: no-shadowed-variable

import createMailboxRepository, {
  MailboxRepository,
  Mailbox,
  NotifyHook,
  Predicate,
  Msg
} from '../lib'
import { MailboxFactory } from '../lib/create-mailbox-factory'
import defaultSend from './lib/default-send'
import { usePreHookMock, useNotifyHookMock } from './lib'

describe('createMailboxRepository::', () => {
  let mailboxRepository: MailboxRepository
  let mailbox: Mailbox
  let createMailbox: MailboxFactory
  const mailboxName = 'mailbox name'
  const msg ='msg'

  beforeEach(() => {
    mailboxRepository = createMailboxRepository()
    createMailbox = mailboxRepository.createMailbox
  })

  describe('#getAll, #drop::', () => {
    test('should check mailbox repository to be fullfiled by new mailboxes', () => {
      const { getAll, drop } = mailboxRepository

      expect(getAll()).toHaveLength(0)

      const mailbox1 = createMailbox('1')
      expect(getAll()).toHaveLength(1)
      expect(getAll()).toEqual([mailbox1])

      const mailbox2 = createMailbox('2')
      expect(getAll()).toHaveLength(2)
      expect(getAll()).toEqual([mailbox1, mailbox2])

      const mailbox3 = createMailbox('3')
      expect(getAll()).toHaveLength(3)
      expect(getAll()).toEqual([mailbox1, mailbox2, mailbox3])

      drop()
      expect(getAll()).toHaveLength(0)
    })
  })

  describe('#createMailbox', () => {
    beforeEach(() => {
      mailbox = createMailbox(mailboxName, defaultSend)
    })

    test('returns new instance for different mailbox name', () => {
      const newMailboxName = 'new mailbox name'
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
  describe('Mailbox::', () => {
    describe('#isEnabled', () => {
      beforeEach(() => {
        mailbox = createMailbox(mailboxName, defaultSend)
      })

      test('returns true for new mailbox', () => {
        expect(mailbox.isEnabled()).toBeTruthy()
      })

      test('returns false for disabled mailbox', () => {
        mailbox.disable()
        expect(mailbox.isEnabled()).toBeFalsy()
      })
    })

    describe('#isDisabled', () => {
      beforeEach(() => {
        mailbox = createMailbox(mailboxName, defaultSend)
      })

      test('returns false for new mailbox', () => {
        expect(mailbox.isDisabled()).toBeFalsy()
      })

      test('returns true for disabled mailbox', () => {
        mailbox.disable()
        expect(mailbox.isDisabled()).toBeTruthy()
      })
    })

    describe('#disable', () => {
      beforeEach(() => {
        mailbox = createMailbox(mailboxName, defaultSend)
      })

      test('should return true when mailbox is enabled', () => {
        expect(mailbox.disable()).toBeTruthy()
      })
      
      test('should return false when mailbox already disabled', () => {
        mailbox.disable()
        expect(mailbox.disable()).toBeFalsy()
      })

      test('should not change state when mailbox already disabled', () => {
        mailbox.disable()
        expect(mailbox.isDisabled()).toBeTruthy()
        mailbox.disable()
        expect(mailbox.isDisabled()).toBeTruthy()
      })

      describe('disabled mailbox behavior', () => {
        describe('sendMail method behavior', () => {
          test('should block sendMail', () => {
            const sendHook = jest.fn((msg: Msg) => {})
            mailbox = createMailbox(mailboxName, sendHook)

            mailbox.disable()
            mailbox.sendMail(msg)
            expect(sendHook.mock.calls).toHaveLength(0)
          })
        })

        test('should block pre-hooks call when call sendMethod', () => {
          const { mockFn, createHook } = usePreHookMock()
          mailbox.addPreHook(createHook(true))
          mailbox.addPreHook(createHook(true))
          mailbox.addPreHook(createHook(true))
          
          mailbox.disable()
          mailbox.sendMail(msg)
          expect(mockFn.mock.calls).toHaveLength(0)
        })

        test('should block pre-hooks call when call sendMethod ', () => {
          const { mockFn, createHook } = useNotifyHookMock()
          mailbox.addNotifyHook(createHook(1))
          mailbox.addNotifyHook(createHook(2))
          mailbox.addNotifyHook(createHook(3))
          
          mailbox.disable()
          mailbox.sendMail(msg)
          expect(mockFn.mock.calls).toHaveLength(0)
        })
      })
      test('should block addPreHook method call', () => {
        mailbox.addPreHook(() => true)
        mailbox.addPreHook(() => false)
        const preHooksBefore = mailbox.getPreHooks()
        mailbox.disable()
        mailbox.addPreHook(() => true)
        
        expect(mailbox.getPreHooks()).toEqual(preHooksBefore)
      })

      test('should block addNotifyHook method call', () => {
        mailbox.addNotifyHook(() => {})
        mailbox.addNotifyHook(() => {})
        const notifyHooksBefore = mailbox.getNotifyHooks()

        mailbox.disable()
        mailbox.addNotifyHook(() => {})
        expect(mailbox.getNotifyHooks()).toEqual(notifyHooksBefore)
      })
      
      test('should check ability to create new mailbox with same name', () => {
        mailbox.disable()
        const sameMailbox = createMailbox(mailboxName)

        expect(sameMailbox).not.toBe(mailbox)
        expect(sameMailbox.getName()).toBe(mailbox.getName())
      })
    })

    describe('#enable', () => {
      beforeEach(() => {
        mailbox = createMailbox(mailboxName, defaultSend)
        mailbox.disable()
      })

      test('should return true when mailbox is disabled', () => {
        expect(mailbox.enable()).toBeTruthy()
      })
      
      test('should return false when mailbox already enabled', () => {
        mailbox.enable()
        expect(mailbox.enable()).toBeFalsy()
      })

      test('should not change state when mailbox already enabled', () => {
        mailbox.enable()
        expect(mailbox.isEnabled()).toBeTruthy()
        mailbox.enable()
        expect(mailbox.isEnabled()).toBeTruthy()
      })

      test('should check mailbox have pre-hooks after enable', () => {
        mailbox.addPreHook(() => true)
        mailbox.addPreHook(() => true)
        mailbox.addPreHook(() => true)
        const preHooksBefore = mailbox.getPreHooks()
        mailbox.enable()
        expect(mailbox.getPreHooks()).toEqual(preHooksBefore)
      })

      test('should check mailbox have notify-hooks after enable', () => {
        mailbox.addNotifyHook(() => {})
        mailbox.addNotifyHook(() => {})
        mailbox.addNotifyHook(() => {})
        const notifyHooksBefore = mailbox.getNotifyHooks()
        mailbox.enable()
        expect(mailbox.getNotifyHooks()).toEqual(notifyHooksBefore)
      })
      
      test('should return false when mailbox with same name already exists in mailbox repository', () => {
        createMailbox(mailboxName)
        expect(mailbox.enable()).toBeFalsy()
      })

      test('should not add to mailbox repository when mailbox with same name already exists in mailbox repository', () => {
        createMailbox(mailboxName)
        mailbox.enable()
        expect(mailboxRepository.getAll()).not.toContain(mailbox)
      })
    })

    describe('#sendMail', () => {
      let sendMockFn
      const msg = 'msg'

      beforeEach(() => {
        sendMockFn = jest.fn()

        mailbox = createMailbox(mailboxName, sendMockFn)
      })

      test('should call send hook', () => {
        mailbox.sendMail(msg)

        expect(sendMockFn.mock.calls).toHaveLength(1)
        expect(sendMockFn.mock.calls[0][0]).toBe(msg)
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
        mailbox = createMailbox(mailboxName, defaultSend)
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
          mailbox.addNotifyHook(notifyHook1)
          mailbox.addNotifyHook(notifyHook2)
          mailbox.disable()
          mailbox.addNotifyHook(notifyHook3)

          expect(mailbox.getNotifyHooks()).toHaveLength(2)
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
          mailbox = createMailbox(mailboxName, defaultSend)
        })
        test('should count of added pre hooks', () => {
          mailbox.addPreHook(predicate1)
          mailbox.addPreHook(predicate2)
          mailbox.addPreHook(predicate3)
          const predicates = mailbox.getPreHooks()
          expect(predicates).toHaveLength(3)
          expect(predicates).toEqual([predicate1, predicate2, predicate3])
        })
        test('should count of pre hooks when second hook is removed', () => {
          mailbox.addPreHook(predicate1)
          mailbox.addPreHook(predicate2)
          mailbox.addPreHook(predicate3)
          mailbox.removePreHook(predicate2)

          const predicates = mailbox.getPreHooks()
          expect(predicates).toHaveLength(2)
          expect(predicates).toEqual([predicate1, predicate3])
        })
        test('should count of added pre hooks when first andl last hooks is removed', () => {
          mailbox.addPreHook(predicate1)
          mailbox.addPreHook(predicate2)
          mailbox.addPreHook(predicate3)
          mailbox.removePreHook(predicate1)
          mailbox.removePreHook(predicate3)

          const predicates = mailbox.getPreHooks()
          expect(predicates).toHaveLength(1)
          expect(predicates).toEqual([predicate2])
        })
        test('should return no pre hooks when all hooks are removed', () => {
          mailbox.addPreHook(predicate1)
          mailbox.addPreHook(predicate2)
          mailbox.addPreHook(predicate3)
          mailbox.removePreHook(predicate1)
          mailbox.removePreHook(predicate2)
          mailbox.removePreHook(predicate3)

          const predicates = mailbox.getPreHooks()
          expect(predicates).toHaveLength(0)
        })
        test('should return pre hooks when mailbox is disabled', () => {
          mailbox.addPreHook(predicate1)
          mailbox.addPreHook(predicate2)
          mailbox.disable()
          mailbox.addPreHook(predicate3)

          const predicates = mailbox.getPreHooks()
          expect(predicates).toHaveLength(2)
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
})
