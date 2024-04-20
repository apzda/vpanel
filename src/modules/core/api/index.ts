import useAxios, { type Response } from '@/utils/axios'

const axios = useAxios()

export const loadConfig = () => {
  axios
    .get('/config.json')
    .then(({ data }) => {
      console.log(data)
    })
    .catch((err) => {
      console.error(err)
    })
}

export function getData(): Response<{ id: number }> {
  return axios.get('/data', { login: true })
}
