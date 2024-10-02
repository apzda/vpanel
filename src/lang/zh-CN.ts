import { loadMessages, type Msg } from '@/utils/lang'

const messages = import.meta.glob('@/**/lang/zh*.json', { eager: true, import: 'default' })

export default loadMessages(messages as Msg)
