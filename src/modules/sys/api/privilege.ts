import { type Ref } from 'vue'
import useAxios from '@/utils/axios'
import type { CommonResponse } from '@/@types/request'
import { ts } from '@/utils/i18n'

const axios = useAxios()

export interface Privilege {
  [key: string]: any

  id?: string
  type: 'authority' | 'resource'
  name: string
  permission: string
  description: string
  extra?: string
  _actions: string[]
  _resource: string[]
}

export interface Resource {
  id: string
  value?: string
  name: string
  label?: string
  actions?: string
  description?: string
  explorer?: string
  perm?: string
  children?: Resource[]
}

const actionsMap = new Map<string, string>()

const calculatePerm = (privilege: Privilege) => {
  if (privilege._resource && privilege._resource.length > 0) {
    if (privilege._actions && privilege._actions.length > 0) {
      privilege.permission = privilege._actions.join(',') + ':' + privilege._resource.join('.')
    } else {
      privilege.permission = privilege._resource.join('.')
    }
    privilege.extra = privilege._resource.join('.') + '.'
  } else {
    privilege.permission = ''
    privilege.extra = ''
  }
}

const transformResource = (resources: Resource[], parent?: Resource) => {
  if (resources && resources.length > 0) {
    resources.unshift({ id: '*', name: ts('All', 'All'), actions: mergeResourceActions(resources) })
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i]
      resource.value = resource.id
      resource.label = resource.name
      resource.children = resource.children || []
      resource.perm = (parent?.perm ? parent.perm + '.' : '') + resource.id
      actionsMap.set(resource.perm, resource.actions || 'c,r,u,d')
      // console.debug('[0]set ', resource.perm, actionsMap.get(resource.perm))
      if (resource.id != '*') {
        transformResource(resource.children, resource)
      }
    }
  } else if (Array.isArray(resources)) {
    resources.unshift({ id: '*', value: '*', label: ts('All', 'All'), name: ts('All', 'All') })
    const pKey = (parent?.perm ? parent.perm + '.' : '') + '*'
    actionsMap.set(pKey, parent?.actions || '*')
    // console.debug('[1]set ', pKey, parent?.actions || '*')
  }
}
// 获取平级资源的所有操作
const mergeResourceActions = (resources: Resource[]): string => {
  const actions = new Set<string>()
  for (let i = 0; i < resources.length; i++) {
    const acts = resources[i].actions
    if (acts) {
      const ops = acts.split(',')
      for (let j = 0; j < ops.length; j++) {
        actions.add(ops[j])
      }
    }
  }
  return [...actions.values()].join(',')
}

export async function getResource(pid: number): Promise<Resource[]> {
  try {
    const { data } = await axios.post<{ resource: Resource[] }>('/ucenter/privilege/resource', {
      data: { pid: pid }
    })
    const resources = data.resource || []
    transformResource(resources)
    return resources
  } catch (e) {
    return []
  }
}

export function createPrivilege(privilege: Privilege) {
  return axios.post('/ucenter/privilege/create', { data: privilege })
}

export function updatePrivilege(privilege: Privilege) {
  return axios.post('/ucenter/privilege/update', { data: privilege })
}

export function deletePrivilege(privilege: Privilege) {
  return axios.post<CommonResponse>('/ucenter/privilege/delete', {
    data: { id: privilege.id }
  })
}

export function onResourceSelected(form: Privilege, actions: Ref<string>) {
  return (value: string[]) => {
    calculatePerm(form)
    actions.value = actionsMap.get(value.join('.')) || '*'
  }
}

export function onActionSelected(form: Privilege) {
  return () => {
    calculatePerm(form)
  }
}

export async function getPrivileges(privileges?: Privilege[]) {
  const { data } = await axios.post('/ucenter/privilege/query', {
    data: {
      current: 1,
      size: 1000
    }
  })


  return data.results.map((privilege: Privilege) => {
    return {
      key: privilege.id,
      label: privilege.name + `(${privilege.description})`,
      disabled: false
    }
  })
}