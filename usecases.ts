import Mailbox, { createMailbox, getMailboxes, dropMailboxes } from "./lib";

// helpers
export const consoleMailboxInventoryMeta = (externalMailboxes?: Mailbox[]) => {
  const isInventoryMalboxes = !externalMailboxes;
  const mailboxes = isInventoryMalboxes ? getMailboxes() : externalMailboxes;
  const isEmpty = !mailboxes.length;

  const header = isInventoryMalboxes
    ? "mailbox inventory"
    : "    mailboxes    ";
  if (!isEmpty) {
    console.log("┌─────────────────────────────────────┐");
    console.log(`│          ${header}          │`);
    console.table(
      mailboxes.map(({ getName, isEnabled }) => ({
        name: getName(),
        enabled: isEnabled()
      }))
    );
    console.log(
      `     mailboxes count:${mailboxes.length.toString().padStart(12)}`
    );
  } else {
    console.log("┌─────────────────────────────────────┐");
    console.log("│      mailbox inventory is empty     │");
    console.log("└─────────────────────────────────────┘");
  }
};

// mailbox names
const nameIns1 = "mailbox ins 1";
const nameIns2 = "mailbox ins 2";
const nameObj1 = "mailbox obj 1";
const nameObj2 = "mailbox obj 2";

console.log("\n:: MAILBOX INVENTORY");

// constructor
console.log("\n:: start with empty mailbox inventory");
consoleMailboxInventoryMeta();

console.log("\n:: 1 mailbox added");
const mailboxIns1 = new Mailbox(nameIns1);
consoleMailboxInventoryMeta();

console.log("\n:: 1 more mailboxes added");
const mailboxIns2 = new Mailbox(nameIns2);
consoleMailboxInventoryMeta();

// factory
console.log("\n:: and 2 more mailbox added");
const mailboxObj1 = createMailbox(nameObj1);
const mailboxObj2 = createMailbox(nameObj2);
consoleMailboxInventoryMeta();

console.log("\n:: list of mailbox constructor");
console.table(
  getMailboxes().map(({ constructor: { name }, getName }) => ({
    name: getName(),
    ctor: name
  }))
);

console.log(
  "\n:: get mailbox from inventory by constructor or factory when passed same name"
);
console.log("\n:::: factory return mailbox, created by constructor");
const sameMailboxIns1ByFactory = createMailbox(nameIns1);
console.log(`> name: ${sameMailboxIns1ByFactory.getName()}`);
console.log(
  `> sameMailboxIns1ByFactory === mailboxIns1: ${sameMailboxIns1ByFactory ===
    mailboxIns1}`
);

console.log("\n:::: constructor return mailbox, created by factory");
const sameMailboxObj2Constructor = new Mailbox(nameObj2);
console.log(`> name: ${sameMailboxObj2Constructor.getName()}`);
console.log(
  `> sameMailboxObj2Constructor === mailboxObj2: ${sameMailboxObj2Constructor ===
    mailboxObj2}`
);

console.log("\n:: drop mailbox inventory");
const mailboxesBeforeDrop = getMailboxes();
dropMailboxes();
console.log("\n:::: mailbox inventory after drop");
consoleMailboxInventoryMeta();
console.log("\n:::: mailboxes out of mailbox inventory");
consoleMailboxInventoryMeta(mailboxesBeforeDrop);

console.log("".padStart(39, "*"));
console.log("\n\n:: MAILBOX");
const mailbox = createMailbox("mailbox obj 5");

const acceptableMsg = "msg1:msg2:msg3";
const unacceptableMsg = "msg1:msg2";

console.log("\n:::: PreHooks");
const createPredicate = (regExp: RegExp) => (msg: string): boolean =>
  regExp.test(msg);
const regExp1 = /.*msg1.*/;
const regExp2 = /.*msg2.*/;
const regExp3 = /.*msg3.*/;
const predicate1 = createPredicate(regExp1);
const predicate2 = createPredicate(regExp2);
const predicate3 = createPredicate(regExp3);

console.log("\n:: add pre-hooks");
console.log(`> pre-hooks count before: ${mailbox.getPreHooks().length}`);
mailbox.addPreHook(predicate1);
mailbox.addPreHook(predicate2);
mailbox.addPreHook(predicate3);
console.log(`> pre-hooks count after : ${mailbox.getPreHooks().length}`);
console.log("\n:: send acceptable message");
mailbox.sendMail(acceptableMsg);
console.log("\n:: send unacceptable message");
mailbox.sendMail(unacceptableMsg);
console.log("\n:: remove one preHook");
mailbox.removePreHook(predicate3);
console.log(`> pre-hooks count after : ${mailbox.getPreHooks().length}`);
console.log(":: now unacceptable message must be send");
mailbox.sendMail(unacceptableMsg);

console.log("\n:: #NotifyHooks");
const createNotifyHook = notifyMsg => (msg: string): void => {
  console.warn(`> notification: ${notifyMsg}`);
};
const notifyMsg1 = "notify message 1";
const notifyMsg2 = "notify message 2";
const notifyMsg3 = "notify message 3";
const notifyHook1 = createNotifyHook(notifyMsg1);
const notifyHook2 = createNotifyHook(notifyMsg2);
const notifyHook3 = createNotifyHook(notifyMsg3);

console.log("\n:: add notify-hooks");
console.log(`> notify-hooks count before: ${mailbox.getNotifyHooks().length}`);
mailbox.addNotifyHook(notifyHook1);
mailbox.addNotifyHook(notifyHook2);
mailbox.addNotifyHook(notifyHook3);
console.log(`> notify-hooks count after : ${mailbox.getNotifyHooks().length}`);
console.log("\n:: send acceptable message");
mailbox.sendMail(acceptableMsg);
console.log(":: send unacceptable message");
mailbox.sendMail("unacceptable mesage");

console.log("\n:: #Remove mailbox from inventory");
const consoleMailboxData = ({
  getName,
  getNotifyHooks,
  getPreHooks,
  isEnabled
}) => {
  const getCount = (getter: () => any[]) => getter().length;
  console.log("┌──────────────────────────────────────┐");
  console.log(`│ mailbox name: ${getName().padEnd(22)} │`);
  console.table({
    name: getName(),
    "pre hooks count": getCount(getPreHooks),
    "notify hooks count": getCount(getNotifyHooks),
    state: isEnabled() ? "enabled" : "disabled"
  });
};
console.log("\n:: disable");
console.log("\n:::: before disable");
consoleMailboxData(mailbox);
consoleMailboxInventoryMeta();
console.log("\n:::: after disable");
mailbox.disable();
consoleMailboxData(mailbox);
consoleMailboxInventoryMeta();
console.log(":: blocked: sendMail");
mailbox.sendMail(acceptableMsg);
console.log(":: blocked: hook manage");
mailbox.addPreHook(predicate2);
mailbox.addNotifyHook(notifyHook3);
consoleMailboxData(mailbox);

console.log("\n:: now new mailbox with same name can be created");
const newMailbox = new Mailbox(mailbox.getName());
consoleMailboxData(newMailbox);
console.log(":: mailbox accessed to manage");
newMailbox.addPreHook(predicate1);
newMailbox.addPreHook(predicate3);
newMailbox.addNotifyHook(notifyHook2);
newMailbox.addNotifyHook(notifyHook3);
consoleMailboxData(newMailbox);
console.log(":: and to send messages");
newMailbox.sendMail("msg1msg3");
