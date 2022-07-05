import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { WithBreadCrumbs } from 'common/service'
import Filter from './filter'
import List from './list'
import store from './store'
import Loading from './components/loading'
import { runCloudImagesType, runZipType, unzipFile } from './util'
import { Tip } from '@gmfe/react'
import { history } from 'common/service'
import AffixAction from './components/affix_action'
import Tips from './components/tips'

const MatchImages = observer(() => {
  const { loading } = store
  useEffect(() => {
    store.setLoading(true)
    if (store.type === runCloudImagesType) {
      handleRecommendCloudImages()
    }
    if (store.type === runZipType) {
      handleRunUnzip()
    }
  }, [])

  const handleRunUnzip = async () => {
    const { zipFile, withoutImagesLength } = store
    if (!zipFile) {
      Tip.info('压缩包数据丢失，请重新上传')
      history.replace('/merchandise/manage/list')
    }
    try {
      if (!withoutImagesLength) {
        await store.getSpuWithoutImage()
      }
      store.setLoadingProgress(20)
      const fileMap = await unzipFile(zipFile)
      store.setLoadingProgress(50)
      await store.matchImages(fileMap)
      store.setLoading(false)
    } catch (error) {
      console.log(error)
      store.setLoading(false)
    }
  }

  const handleRecommendCloudImages = () => {
    store.postStartCompute().then((json) => {
      store.setLoading(true)
      const task_url = json.data.task_url

      const getRecommendResultTimer = setInterval(() => {
        store
          .getRecommendResult(task_url)
          .then((json) => {
            store.setLoadingProgress(json.data.progress)

            if (json.data.progress === 100) {
              clearInterval(getRecommendResultTimer)
              store.setRecommendResult(json.data.result.spus)
              store.setLoading(false)
            }
          })
          // eslint-disable-next-line handle-callback-err
          .catch((err) => {
            clearInterval(getRecommendResultTimer)
            store.setLoading(false)
          })
      }, 2000)
    })
  }

  return (
    <>
      <WithBreadCrumbs breadcrumbs={[t('快速匹配图片')]} />
      {loading && <Loading />}
      <Filter />
      {!loading && <Tips />}
      <List />
      <AffixAction />
    </>
  )
})

export default MatchImages
