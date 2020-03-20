# Mailbox

## [Тестовое задание](https://codepen.io/csssr/pen/QPyPrz?editors=1010) [CSSSR](https://csssr.com/)

> ## Задание
>
> - Реализуйте класс Mailbox
>
> ### Доп. задания:
>
> - Если считаете, что Mailbox не хватает еще каких-то технических функций для более готового к использованию API, добавьте их или напишите, что бы вы добавили. Если считаете, что данное API содержит какие-то проблемы с точки зрения проектирования, опишите их и предложите рефакторинг.
> - Какие части кода можно было бы концептуально абстрагировать из реализации Mailbox и сделать их переиспользуемыми? Попробуйте максимально разбить реализацию на переиспользуемые части.

## Скрипты

### Установка

```console
git clone git@github.com:unmyke/create-mailbox-repository.git
cd ./create-mailbox-repository
yarn install
```

### Запуск тестов

```console
yarn test
```

### Примеры использования

```console
yarn usecases
```

## Описание

Значительной переработке подверглось предлагаемое заданием API пакета, что улучшило использование не только самого класса, но управлением репозиторием почтовых ящиков: по заданию предполагалось добавление в репозиторий почтовых ящиков при создании экземпляра, но методов работы с ним не предусматривалось.

Так же конструктор класса `Mailbox` вызывает фабрику `createMailbox`, использование фабрики напрямую более предпочтительнее. Экземпляр почтового ящика содержит методы, каждый из которых может быть использован в отрыве от самого экземпляра, что позволяет передать метод обработчикам/функциям/методам сторонних пакетов, при этом потери контекста не произойдет.

Применение функционального стиля программирования позволило разбить кодовую базу на переиспользуемые и простые функции. Наиболее используемой функцией является фабрика по созданию списков: на нижнем уровне список используется абстракцией репозитория почтовых ящиков, внутри экземпляра — для хранения pre-хуков и notify-хуков.

## API

Библиотека экспортирует два типа сущностей: функции для управления репозиторием и типы, используемые функциями и экземплярами `Mailbox`.

### Система типов

```ts
type Predicate = (msg: string) => boolean
type NotifyHook = (msg: string) => void

declare class Mailbox {
  isEnabled: () => boolean
  getName: () => string
  sendMail: (msg: string) => void
  getPreHooks: Array<Predicate>
  pre: (preHook: Predicate) => void
  addPreHook: (preHook: Predicate) => void
  removePreHook: (preHook: Predicate) => void
  getNotifyHooks: () => Array<NotifyHook>
  notify: (notifyHook: NotifyHook) => void
  addNotifyHook: (notifyHook: NotifyHook) => void
  removeNotifyHook: (notifyHook: NotifyHook) => void
  disable: () => viod

  constructor(name: string, send?: (msg: string) => void)
}
```

### Управление репозиторием почтовых ящиков

Для управления репозиторием библиотека предоставляет две функции и фабрика создания почтовых ящиков (или конструктор класса `Mailbox`): `getMailboxes`, `dropMailboxes` и `createMailbox`.

#### `getMailboxes(): Array<Mailbox>`

```ts
import { getMailboxes } from './lib'

// Output: []
console.log(getMailboxes())

const name = 'mailbox'
const mailbox = createMailbox(name)
// Output: [mailbox]
console.log(getMailboxes())

const newMailbox = createMailbox('new mailbox')
// Output: [mailbox, newMailbox]
console.log(getMailboxes())

const mailbox = createMailbox(name)
// Output: [mailbox, newMailbox]
console.log(getMailboxes())
```

#### `dropMailboxes(): viod`

```ts
import { getMailboxes } from './lib'

// Output: []
console.log(getMailboxes())

const name = 'mailbox'
const mailbox = createMailbox(name)
const newMailbox = createMailbox('new mailbox')
// Output: [mailbox, newMailbox]
console.log(getMailboxes())

dropMailboxes()
// Output: []
console.log(getMailboxes())
```

#### `new Mailbox(name: string, sendHook: (msg: string) => void)` / `createMailbox(name: string, sendHook: (msg: string) => Mailbox)`

Добавление в репозиторий нового почтового ящика происходит при его создании, если почтового ящика с таким именем не существует, иначе будет возвращен существующий экземпляр.

Второй необязательный параметр позволяет добавить логику отправки письма в среде, отличной от 'production' (т.е. если значение process.env.NODE_ENV не равно `production`). Если же параметр не задан будет запущена [логика отправки письма по-умолчанию](/lib/create-send-mail/default-send-hook.ts).

```ts
import Mailbox, { createMailbox } from './lib'

const name = 'Mailbox name'

const mailbox = new Mailbox(name)
// или
const mailbox = createMailbox(name)

const sameMailbox = new Mailbox(name)
// или
const sameMailbox = createMailbox(name)

console.log(mailbox === sameMailbox) // Output: true
```

---

_Замечание касательно выбора способа создания почтовых ящиков_

Фабрика `createMailbox` возвращает экземпляр класса `Object`, конструктор (`new Mailbox(name)`) - экземпляр класса `Mailbox` в случае отсутствия в репозитории почтового ящика с таким же имение. В противном случае будет возращен существующий экземпляр не зависимо от выбранного способа. Поведение методов экземпляров обоих классов идентичное, в том числе после их деструкторизации на отдельные функции.

Смешенное использовании обоих способов никак не влияет на управление репозиторием почтовых ящиков, кроме наличия в нем экземпляров обоих классов одновременно.

Тем не менее при использовании библиотеки стоит выбирать один способ создания почтовых ящиков. Если вы предполагаете использовать `instanceof` для определения принадлежности почтового ящика к классу `Mailbox`, создавайте почтовые ящики только через конструктор. Во всех остальных случаях отдавайте предпочтение фабрике `createMailbox` ввиду большей (хоть и не значительно) производительности.

---

### Mailbox

Созданный объект, предоставляющий абстракцию почтового ящика, содержит только методы, изменяющие его состояние, и не предоставляет возможности изменять состояние (приватные поля) напрямую.

#### `getName(): string`

Возвращает имя почтового ящика.

#### `isEnabled(): boolean`

Возвращает `true` в случае наличия почтового ящика в репозитории почтовых ящиков.

#### `disable(): void`

Отключает почтовый ящик. При этом ящик теряет возможность отправлять письма, удаляются добавленные pre- и notify-хуки, управление списком pre- и notify-хуков так же блокируется. Отключенный ящик удаляется из репозитория почтовых ящиков, что предоставляет возможность создать и добавить в репозиторий новый почтовый ящик с таким же именем

#### `getPreHooks(): Array<Predicate>`

Возвращает список pre-хуков почтового ящика (подробнее о pre-хуках в описании метода [`addPreHook`](#addprehookprehook-predicate-void)), запускаемых перед отправкой письма методом [`sendMail`](#sendmailmsg-string-void).

#### `pre(preHook: Predicate): void`

**deprecated**

Метод заменен на [`addPreHook`](#addprehookprehook-predicate-void). Тем не менее метод запускает `addPreHook` и выдает предупреждающее сообщение о неактуальности метода.

#### `addPreHook(preHook: Predicate): void`

Метод добавляет pre-хук почтовому ящику.

---

#### изменения в API метода `pre`

В задании в качестве pre-хука предлагалось использование функции, принимающей сообщение и коллбек, запускаемый в случае соответствия письма критериям отправки. Для большей декларативности pre-хук заменен на предикат соответствия письма критериям отправки.

---

#### `removePreHook(Predicate): void`

Удаляет переданный методу pre-хук.

#### `getNotifyHooks(): Array<NotifyHook>`

Возвращает список notify-хуков, запускаемых после отправки письма.

#### `notify(notifyHook: NotifyHook): void`

**deprecated**

Метод заменен на [`addNotifyHook`](#addnotifyhooknotifyhook-notifyhook-void). Тем не менее метод запускает `addNotifyHook` и выдает предупреждающее сообщение о неактуальности метода.

#### `addNotifyHook(notifyHook: NotifyHook): void`

Добавляет notify-хук в список. Устаревший метод `notify` так же доступен и вызывает `addNotifyHook` с выдачей предупреждающего сообщения.

#### `removeNotifyHook(notifyHook: NotifyHook): void`

Удаляет переданный методу notify-хук.

#### `sendMail(msg: string): void`

Отправляет переданное в метод сообщение. Перед отправкой запускаются pre-хуки (предикаты соответствия сообщения критерию) почтового ящика и отправка письма произойдет только в случае, если все предикаты вернут true. После отправки произойдет запуск notify-хуков в очередности их добавления.
