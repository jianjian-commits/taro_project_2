import React, { createContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { Button, Flex, LoadingChunk, Modal, Tabs, Tip } from '@gmfe/react'
import { Request } from '@gm-common/request'
import { System } from '../../../common/service'
import { forEach } from 'lodash'
import SystemIcons from './icons/system_icons'
import LocalIcons from './icons/local_icons'

export const defaultIconContext = createContext()

const { Provider } = defaultIconContext
const tabs = [t('系统图标'), t('本地图标')]

function IconsManagement({ onOk }) {
  const [loading, changeLoading] = useState(false)
  const [active, changeActive] = useState(0)
  const [icons, changeIcons] = useState([])
  const [defaultIcon, changeDefaultIcon] = useState()

  /** 待添加图标列表 */
  const [toAddIcons, changeToAddIcons] = useState([])
  /** 待删除图标列表 */
  const [toDeleteIcons, changeToDeleteIcons] = useState([])

  useEffect(() => {
    /** 获取按钮集合 */
    changeLoading(true)
    Request('/merchandise/category1/icon')
      .get()
      .then(({ data }) => {
        changeIcons(data)
        changeLoading(false)
      })
  }, [])

  useEffect(() => {
    /** 获取默认按钮 */
    Request('/merchandise/category1/icons/default/get')
      .get()
      .then(({ data }) => {
        const { default_icon_id } = data
        changeDefaultIcon(default_icon_id)
      })
  }, [])

  /** 设置默认货位 */
  const handleSetDefault = (value) => {
    changeDefaultIcon(value)
  }

  /**
   * @param url {string}
   */
  const onDelete = (url) => {
    const icon = icons.filter((icon) => icon.url !== url)
    changeIcons(icon)
    if (url.match(/img.guanmai.cn/g)) {
      // 从后端拉去的图标
      toDeleteIcons.push(icons.find((icon) => icon.url === url))
      changeToDeleteIcons([...toDeleteIcons])
    }
    if (toAddIcons.some((icon) => icon.preview === url)) {
      // 待添加的图标
      const icon = toAddIcons.filter((icon) => icon.preview !== url)
      changeToAddIcons(icon)
    }
  }

  const onUpload = (image_file) => {
    if (image_file.some((image) => image.size > 300 * 1024)) {
      Tip.warning(t('上传的图标不能超过300kb'))
      return
    }
    forEach(image_file, (image) => {
      if (icons.filter((icon) => icon.type === 2).length === 50) {
        Tip.warning(t('上传本地图标不能超过50张'))
        return false
      }
      toAddIcons.push(image)
      icons.push({ url: image.preview, type: 2 })
    })
    changeToAddIcons([...toAddIcons])
    changeIcons([...icons])
    return Promise.resolve(
      icons.filter((icon) => icon.type === 2).map((icon) => icon.url)
    )
  }

  /** 取消 */
  const handleCancel = () => {
    Modal.hide()
  }

  /** 保存系统图标 */
  const handleSaveSystemIcons = () => {
    return Request('/merchandise/category1/icons/default/update')
      .data({ default_icon_id: defaultIcon })
      .post()
      .then(() => {
        Tip.success(t('保存成功'))
        Modal.hide()
        onOk()
      })
  }

  /** 保存本地图标 */
  const handleSaveLocalIcons = () => {
    const addPromises = toAddIcons.map((icon) =>
      Request('/image/upload').data({ image_file: icon, image_type: 2, is_retail_interface: System.isC() ? 1 : null }).post()
    )
    const deletePromise = Request('/merchandise/category1/icons/delete')
      .data({
        delete_icons: JSON.stringify(
          toDeleteIcons.map((icon) => ({
            id: icon.id,
            name: icon.url.split('//img.guanmai.cn/icon/')[1],
          }))
        ),
        default_icon_id: defaultIcon,
        default_icon_name: icons
          .find((icon) => icon.id === defaultIcon)
          .url.split('//img.guanmai.cn/icon/')[1],
      })
      .post()
    return Promise.all([...addPromises, deletePromise]).then(() => {
      Tip.success(t('保存成功'))
      Modal.hide()
      onOk()
    })
  }

  return (
    <>
      <Tabs tabs={tabs} active={active} onChange={changeActive}>
        <Provider value={defaultIcon}>
          <LoadingChunk loading={loading}>
            <SystemIcons
              icons={icons.filter((icon) => icon.type === 1)}
              onSetDefault={handleSetDefault}
            />
          </LoadingChunk>
        </Provider>
        <LocalIcons
          icons={icons
            .filter((icon) => icon.type === 2)
            .map((item) => item.url)}
          handleDelete={onDelete}
          handleUpload={onUpload}
        />
      </Tabs>
      <Flex justifyEnd row className='gm-margin-top-10'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button
          type='primary'
          onClick={active ? handleSaveLocalIcons : handleSaveSystemIcons}
        >
          {t('保存')}
        </Button>
      </Flex>
    </>
  )
}

IconsManagement.propTypes = {
  onOk: PropTypes.func,
}

export default IconsManagement
