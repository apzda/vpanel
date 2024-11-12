import useAxios from '@/utils/axios'

const axios = useAxios()

export interface Role {
  [key: string]: any

  id?: string;
  role: string;
  name: string;
  description: string;
  children: string[];
  granted: string[];
  builtin?: boolean
}

export function createRole(data: Role) {
  return axios.post('/role/create', { data })
}

export function updateRole(data: Role) {
  return axios.post('/role/update', { data })
}

export function deleteRole(data: Role) {
  return axios.post('/role/delete', { data: { id: data.id } })
}

export const getRoleList = async (keyField?: string, disabled?: Role[]) => {
  const { data } = await axios.post('/role/list', {
    data: {
      current: 1,
      size: 1000
    }
  })

  const field = keyField || 'role'
  const toBeDisabled = disabled || []
  return data.results.map((role: Role) => {
    return {
      key: role[field],
      label: role.name,
      disabled: toBeDisabled.filter((r) => r.role == role.role).length > 0
    }
  })
}