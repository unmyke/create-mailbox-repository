# createMailboxRepository

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

## Описание пакета

Пакет экспортирует функцию-фабрику `createMailboxRepository`, возвращающую репозиторий почтовых ящиков. Для более подробного описание см. [раздел API](#createmailboxrepository-mailboxrepository)

### Дополнительные задания:

#### Изменения в API

По заданию конструктор класса `Mailbox` помещает созданный экземпляр в репозиторий почтовых ящиков. Такое решение имеет ряд взаимосвязанных проблем:

- неочевидность создания репозитория при первом импорте пакета;
- конструктор класса в зависимости от ситуации возвращает или новый объект, или созданный до этого, что нарушает принцип единственной ответственности, а так же семантически некорректно: `new Mailbox(name)` подразумевает создание нового объекта, ответственностью репозитория может быть как возврат нового, так и уже существующего объекта;
- по заданию доступ к репозиторию ограничен неочевидным и единственным методом репозитория — конструктором класса;
- отсутствие других методов управления репозиторием.

Для устранения данных проблем пакет экспортирует фабричную функцию `createMailboxRepository`. Возвращенный фабрикой репозиторий имеет фабричный метод `createMailbox`, который заменяет конструктор предложенного заданием класса `Mailbox`.

Значительно обогащено [API почтового ящика](#mailbox).

#### Переиспользование

Применение парадигмы функционального программирования позволяет разбить кодовую базу на переиспользуемые и простые функции. Наиболее используемой функцией является фабрика по созданию списков: на нижнем уровне список используется абстракцией репозитория почтовых ящиков, внутри абстракции почтового ящика — для хранения pre-хуков и notify-хуков.

## API

### Система типов

```ts
type Predicate = (msg: string) => boolean
type NotifyHook = (msg: string) => void

type Mailbox {
  readonly getName: () => string;
  readonly isEnabled: () => boolean;
  readonly isDisabled: () => boolean;
  readonly enable: () => boolean;
  readonly disable: () => boolean;
  readonly sendMail: (msg: string) => void;
  readonly getPreHooks: Predicate[];
  readonly pre: (preHook: Predicate) => void;
  readonly addPreHook: (preHook: Predicate) => void;
  readonly removePreHook: (preHook: Predicate) => void;
  readonly dropPreHooks: () => void;
  readonly getNotifyHooks: () => NotifyHook[];
  readonly notify: (notifyHook: NotifyHook) => void;
  readonly addNotifyHook: (notifyHook: NotifyHook) => void;
  readonly removeNotifyHook: (notifyHook: NotifyHook) => void;
  readonly dropNotifyHooks: () => void;
}

type MailboxRepository = {
  readonly createMailbox: (name: string, send?) => Mailbox;
  readonly getAll: () => Mailbox[];
  readonly getByName: (name: string) => Mailbox;
  readonly add: (mailbox: Mailbox) => boolean;
  readonly remove: (mailbox: Mailbox) => boolean;
  readonly drop: () => void;
}
```

### `createMailboxRepository(): MailboxRepository`

Возращенный фабрикой объект, являющийся абстракцией репозитория почтового ящика, содержит только методы, изменяющие или получающие его состояние, и не предоставляет возможности изменять состояние (приватные поля) напрямую.

### `MailboxRepository`

#### `mailboxRepository.createMailbox(name: string, sendHook: (msg: string) => Mailbox)`

Возвращает и добавляет в репозиторий новый почтовый ящик, если почтового ящика с таким именем не существует, иначе возвращает существующий в репозитории почтовый ящик.

Второй необязательный параметр `send` позволяет добавить логику отправки письма в среде, отличной от 'production' (т.е. если значение process.env.NODE_ENV не равно `production`). Если же параметр не задан будет запущена [логика отправки письма по-умолчанию](/lib/create-send-mail/default-send-hook.ts).

```ts
const name = 'Mailbox name'

const mailbox = mailboxRepository.createMailbox(name)

const sameMailbox = mailboxRepository.createMailbox(name)

console.log(mailbox === sameMailbox) // Output: true
```

#### `mailboxRepository.getAll(): Mailbox[]`

Возвращает массив почтовых ящиков репозитория.

#### `mailboxRepository.getByName(name: string): Mailbox`

Возвращает почтовый ящик из репозитория по его имени.

#### `mailboxRepository.add(mailbox: Mailbox): boolean`

Добавляет отключенный почтовый ящик в репозиторий и возвращает `true`. Возвращает `false` в случаях, если почтовый ящик уже в репозитории или репозиторий содержит почтовый ящик с таким же именем. Аналогичного эффекта можно добиться запуском метода [`enable` почтового ящика](#mailboxenable-boolean).

#### `mailboxRepository.remove(mailbox: Mailbox): boolean`

Удаляет включенный почтовый ящик из репозитория и возвращает `true`. Возвращает `false` в случае, если почтовый ящик отключен. Аналогичного эффекта можно добиться запуском метода [`disable` почтового ящика](#mailboxdisable-boolean).

#### `mailboxRepository.drop(): void`

Удаляет все почтовые ящики из репозитория.

### `Mailbox`

Созданный фабричным методом `createMailbox` объект, предоставляющий абстракцию почтового ящика, содержит только методы, изменяющие его состояние, и не предоставляет возможности изменять состояние (приватные поля) напрямую.

#### `mailbox.getName(): string`

Возвращает имя почтового ящика.

#### `mailbox.isEnabled(): boolean`

Возвращает `true` в случае наличия почтового ящика в репозитории почтовых ящиков.

#### `mailbox.isDisabled(): boolean`

Возвращает `true` в случае, если почтовый ящик удален из репозитория почтовых ящиков.

#### `mailbox.enable(): boolean`

Добавляет удаленный почтовый ящик в репозиторий и возвращает `true` или `false` в случае, если почтовый ящик с таким же именем существует в репозитории.

#### `mailbox.disable(): boolean`

Удаляет почтовый ящик из репозитория и возвращает `true` или `false` в случае, если почтовый ящик уже удален из репозитория. Удаленный ящик теряет возможность отправлять письма, управлять списком pre- и notify-хуков. После удаления из репозитория почтовых ящиков появляется возможность создать и добавить в репозиторий новый почтовый ящик с таким же именем.

#### `mailbox.sendMail(msg: string): void`

Отправляет переданное в метод сообщение. Перед отправкой запускаются pre-хуки (предикаты соответствия сообщения критерию) почтового ящика и отправка письма произойдет только в случае, если все предикаты вернут true. После отправки произойдет запуск notify-хуков в очередности их добавления.

#### `mailbox.getPreHooks(): Predicate[]`

Возвращает список pre-хуков почтового ящика (подробнее о pre-хуках в описании метода [`addPreHook`](#mailboxaddprehookprehook-predicate-void), запускаемых перед отправкой письма методом [`sendMail`](#mailboxsendmailmsg-string-void).

#### `mailbox.pre(preHook: Predicate): void`

**deprecated**

Метод заменен на [`addPreHook`](#mailboxaddprehookprehook-predicate-void). Тем не менее метод запускает `addPreHook` и выдает предупреждающее сообщение о неактуальности метода.

#### `mailbox.addPreHook(preHook: Predicate): void`

Метод добавляет pre-хук почтовому ящику.

---

#### изменения в API метода `pre`

В задании в качестве pre-хука предлагалось использование функции, принимающей сообщение и коллбек, запускаемый в случае соответствия письма критериям отправки. Для большей декларативности pre-хук заменен на предикат соответствия письма критериям отправки.

---

#### `mailbox.removePreHook(Predicate): void`

Удаляет переданный методу pre-хук.

#### `mailbox.dropPreHooks(): void`

Удаляет все pre-хуки.

#### `mailbox.getNotifyHooks(): NotifyHook[]`

Возвращает список notify-хуков, запускаемых после отправки письма.

#### `mailbox.notify(notifyHook: NotifyHook): void`

**deprecated**

Метод заменен на [`addNotifyHook`](#mailboxaddnotifyhooknotifyhook-notifyhook-void). Тем не менее метод запускает `addNotifyHook` и выдает предупреждающее сообщение о неактуальности метода.

#### `mailbox.addNotifyHook(notifyHook: NotifyHook): void`

Добавляет notify-хук в список. Устаревший метод `notify` так же доступен и вызывает `addNotifyHook` с выдачей предупреждающего сообщения.

#### `mailbox.removeNotifyHook(notifyHook: NotifyHook): void`

Удаляет переданный методу notify-хук.

#### `mailbox.dropNotifyHooks(): void`

Удаляет все notify-хуки.
