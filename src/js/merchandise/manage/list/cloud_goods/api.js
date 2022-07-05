import { Request } from '@gm-common/request'

const getCategory1 = () => Request('/merchandise/template/category1/get').get()
const getCategory2 = () => Request('/merchandise/template/category2/get').get()
const getPinlei = () => Request('/merchandise/template/pinlei/get').get()

export { getCategory1, getCategory2, getPinlei }
