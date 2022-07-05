import { t } from 'gm-i18n'
import JSZip from 'jszip'
import _ from 'lodash'
import { Tip } from '@gmfe/react'

export const hasImagesType = '1'
export const noImagesType = '2'
export const runCloudImagesType = 1
export const runZipType = 2
export const imagesTypes = 'jpg,jpeg,png'.split(',')
export const Types = [
  {
    text: t('有图'),
    value: hasImagesType,
  },
  {
    text: t('无图'),
    value: noImagesType,
  },
]

export const unzipFile = (zipFile) => {
  return JSZip.loadAsync(zipFile).then(
    async (zip) => {
      const fileMap = {}
      const zipObjects = zip.filter(
        (relativePath) =>
          relativePath.indexOf('__') && relativePath.indexOf('.'),
      )
      for (const obj of zipObjects) {
        const arr = obj.name.split('.')
        const suffix = arr.pop().toLowerCase()
        if (!imagesTypes.includes(suffix)) continue
        // blob 会丢失mimeType
        // const file = await obj.async('blob')
        const buffer = await obj.async('arraybuffer')
        const file = new window.Blob([buffer], { type: `image/${suffix}` })
        const name = arr.join('.').split('/').pop()
        fileMap[name] = file
      }
      return fileMap
    },
    // eslint-disable-next-line handle-callback-err
    (err) => {
      Tip.info('解压失败，请重试')
      return Promise.reject(err)
    },
  )
}

export const eachForMap = (list) => {
  const map = {}
  _.each(list, (item) => {
    map[item.id] = item.name
  })
  return map
}
