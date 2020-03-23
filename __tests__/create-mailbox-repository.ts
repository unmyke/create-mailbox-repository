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

  describe('#remove', () => {
    let remove, getAll

    beforeEach(() => {
      mailbox = createMailbox(mailboxName, defaultSend)
      remove = mailboxRepository.remove
      getAll = mailboxRepository.getAll
    })

    test('should remove mailbox from repository', () => {
      expect(getAll()).toContain(mailbox)
      remove(mailbox)
      expect(getAll()).not.toContain(mailbox)
    })

    test('should disable mailbox', () => {
      expect(mailbox.isEnabled()).toBeTruthy()
      remove(mailbox)
      expect(mailbox.isDisabled()).toBeTruthy()
    })

    test('should do nothing when passed removed mailbox', () => {
      mailbox.disable()
      expect(getAll()).not.toContain(mailbox)
      expect(mailbox.isDisabled()).toBeTruthy()
      remove(mailbox)
      expect(getAll()).not.toContain(mailbox)
      expect(mailbox.isDisabled()).toBeTruthy()
    })
  })

  describe('#add', () => {
    let add, getAll

    
    beforeEach(() => {
      add = mailboxRepository.add
      getAll = mailboxRepository.getAll
      mailbox = createMailbox(mailboxName, defaultSend)
    })

    test('should add disabled mailbox to repository', () => {
      mailbox.disable()
      expect(getAll()).not.toContain(mailbox)
      add(mailbox)
      expect(getAll()).toContain(mailbox)
    })

    test('should enable mailbox', () => {
      mailbox.disable()
      expect(mailbox.isDisabled()).toBeTruthy()
      add(mailbox)
      expect(mailbox.isEnabled()).toBeTruthy()
    })

    test('should do nothing when passed added mailbox', () => {
      expect(getAll()).toContain(mailbox)
      expect(mailbox.isEnabled()).toBeTruthy()
      add(mailbox)
      expect(getAll()).toContain(mailbox)
      expect(mailbox.isEnabled()).toBeTruthy()
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
      let notifyMockFn, sendMockFn

      beforeEach(() => {
        sendMockFn = jest.fn()
        const { mockFn, createHook: createNotifyHook } = useNotifyHookMock()
        notifyMockFn = mockFn;
        notifyHook1 = createNotifyHook(1)
        notifyHook2 = createNotifyHook(2)
        notifyHook3 = createNotifyHook(3)
        mailbox = createMailbox(mailboxName, sendMockFn)
      })

      describe('manage notify hooks', () => {
        beforeEach(() => {
          mailbox.addNotifyHook(notifyHook1)
          mailbox.addNotifyHook(notifyHook2)
          mailbox.addNotifyHook(notifyHook3)
        })
        test('should count of added notify hooks', () => {
          const notifyHooks = mailbox.getNotifyHooks()
          expect(notifyHooks).toEqual([notifyHook1, notifyHook2, notifyHook3])
        })
        test('should count of notify hooks when second hook is removed', () => {
          mailbox.removeNotifyHook(notifyHook2)

          const notifyHooks = mailbox.getNotifyHooks()
          expect(notifyHooks).toEqual([notifyHook1, notifyHook3])
        })
        test('should count of added notify hooks when first andl last hooks is removed', () => {
          mailbox.removeNotifyHook(notifyHook1)
          mailbox.removeNotifyHook(notifyHook3)

          const notifyHooks = mailbox.getNotifyHooks()
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

          expect(notifyMockFn.mock.calls).toHaveLength(3)
          expect(notifyMockFn.mock.calls[0][0]).toBe(`notifyHook1: ${msg}`)
          expect(notifyMockFn.mock.calls[1][0]).toBe(`notifyHook2: ${msg}`)
          expect(notifyMockFn.mock.calls[2][0]).toBe(`notifyHook3: ${msg}`)
          expect(notifyMockFn.mock.calls[2][0]).toBe(`notifyHook3: ${msg}`)
          expect(sendMockFn.mock.calls).toHaveLength(1)
          expect(sendMockFn.mock.calls[0][0]).toBe(msg)
        })
      })
    })

    describe('#addPreHook/#removePreHook/#sendMail with pre hooks', () => {
      let predicateMockFn: jest.Mock<Msg, [Msg]>
      let createPredicate: (bool: boolean) => Predicate
      let truthyPredicate1, truthyPredicate2, truthyPredicate3, falsyPredicate: Predicate

      beforeEach(() => {
        const { mockFn, createHook } = usePreHookMock()
        createPredicate = createHook;
        predicateMockFn = mockFn
        truthyPredicate1 = createPredicate(true)
        truthyPredicate2 = createPredicate(true)
        truthyPredicate3 = createPredicate(true)
        falsyPredicate = createPredicate(false)
      })

      describe('manage pre hooks', () => {
        beforeEach(() => {
          mailbox = createMailbox(mailboxName, defaultSend)
        })
        test('should count of added pre hooks', () => {
          mailbox.addPreHook(truthyPredicate1)
          mailbox.addPreHook(truthyPredicate2)
          mailbox.addPreHook(truthyPredicate3)
          mailbox.addPreHook(falsyPredicate)
          const predicates = mailbox.getPreHooks()
          expect(predicates).toEqual([truthyPredicate1, truthyPredicate2, truthyPredicate3, falsyPredicate])
        })
        test('should count of pre hooks when second hook is removed', () => {
          mailbox.addPreHook(truthyPredicate1)
          mailbox.addPreHook(truthyPredicate2)
          mailbox.addPreHook(truthyPredicate3)
          mailbox.addPreHook(falsyPredicate)
          mailbox.removePreHook(truthyPredicate2)

          const predicates = mailbox.getPreHooks()
          expect(predicates).toEqual([truthyPredicate1, truthyPredicate3, falsyPredicate])
        })
        test('should count of added pre hooks when first andl last hooks is removed', () => {
          mailbox.addPreHook(truthyPredicate1)
          mailbox.addPreHook(truthyPredicate2)
          mailbox.addPreHook(truthyPredicate3)
          mailbox.addPreHook(falsyPredicate)
          mailbox.removePreHook(truthyPredicate1)
          mailbox.removePreHook(truthyPredicate3)

          const predicates = mailbox.getPreHooks()
          expect(predicates).toEqual([truthyPredicate2, falsyPredicate])
        })
        test('should return no pre hooks when all hooks are removed', () => {
          mailbox.addPreHook(truthyPredicate1)
          mailbox.addPreHook(truthyPredicate2)
          mailbox.addPreHook(truthyPredicate3)
          mailbox.addPreHook(falsyPredicate)
          mailbox.removePreHook(truthyPredicate1)
          mailbox.removePreHook(truthyPredicate2)
          mailbox.removePreHook(truthyPredicate3)
          mailbox.removePreHook(falsyPredicate)

          const predicates = mailbox.getPreHooks()
          expect(predicates).toHaveLength(0)
        })
      })

      describe('calculate predicates on sendMail', () => {
        let sendHook
        let msg: Msg

        beforeEach(() => {
          sendHook = jest.fn()
          mailbox = createMailbox(mailboxName, sendHook)
        })

        test('should run send hook when all predicates return true', () => {
          mailbox.addPreHook(truthyPredicate1)
          mailbox.addPreHook(truthyPredicate2)
          mailbox.addPreHook(truthyPredicate3)
          mailbox.sendMail(msg)

          expect(predicateMockFn.mock.calls).toHaveLength(3)
          expect(predicateMockFn.mock.calls[0][0]).toBe(msg)
          expect(predicateMockFn.mock.calls[1][0]).toBe(msg)
          expect(predicateMockFn.mock.calls[2][0]).toBe(msg)
          expect(sendHook.mock.calls).toHaveLength(1)
          expect(sendHook.mock.calls[0][0]).toBe(msg)
        })

        test(
          'should not run send hook and calculate only first predicate when first predicate return false', () => {
            mailbox.addPreHook(falsyPredicate)
            mailbox.addPreHook(truthyPredicate1)
            mailbox.addPreHook(truthyPredicate2)
            mailbox.addPreHook(truthyPredicate3)
            mailbox.addPreHook(truthyPredicate3)
            mailbox.sendMail(msg)

            expect(predicateMockFn.mock.calls).toHaveLength(1)
            expect(sendHook.mock.calls).toHaveLength(0)
          }
        )

        test(
          'should not run send hook and calculate all predicates when last predicate return false', () => {
            mailbox.addPreHook(truthyPredicate1)
            mailbox.addPreHook(truthyPredicate2)
            mailbox.addPreHook(truthyPredicate3)
            mailbox.addPreHook(truthyPredicate3)
            mailbox.addPreHook(falsyPredicate)
            mailbox.sendMail(msg)

            expect(predicateMockFn.mock.calls).toHaveLength(5)
            expect(sendHook.mock.calls).toHaveLength(0)
          }
        )

        test('should not run send hook when more than one predicates return false', () => {
          mailbox.addPreHook(truthyPredicate1)
          mailbox.addPreHook(falsyPredicate)
          mailbox.addPreHook(truthyPredicate2)
          mailbox.addPreHook(truthyPredicate3)
          mailbox.addPreHook(falsyPredicate)
          mailbox.sendMail(msg)
          
          expect(predicateMockFn.mock.calls).toHaveLength(2)
          expect(sendHook.mock.calls).toHaveLength(0)
        })
        
        test('should not run send hook when all predicates return false', () => {
          mailbox.addPreHook(falsyPredicate)
          mailbox.addPreHook(falsyPredicate)
          mailbox.addPreHook(falsyPredicate)
          mailbox.addPreHook(falsyPredicate)
          mailbox.addPreHook(falsyPredicate)
          mailbox.sendMail(msg)
          
          expect(predicateMockFn.mock.calls).toHaveLength(1)
          expect(sendHook.mock.calls).toHaveLength(0)
        })
      })
    })
  })
})
