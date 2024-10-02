import { type Msg, loadMessages } from '@/utils/lang'

const messages = import.meta.glob('@/**/lang/en.json', { eager: true, import: 'default' })

export default loadMessages(messages as Msg)
