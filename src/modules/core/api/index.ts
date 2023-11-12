import useAxios from '@/config/axios'

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
