import React, { useState, useEffect } from 'react'
import {
  Flex,
  Modal,
  Uploader,
  Button,
  Checkbox,
  Loading,
  Tip,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import { imageMogr2 } from '@gm-common/image'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styled from 'styled-components'
import { groupByWithIndex } from 'common/util'
import SpreadImg from './spread_img'
import SVGRefresh from 'svg/refresh.svg'
import SVGPlus from 'svg/plus.svg'

const SpreadUploader = styled(Uploader)`
  width: 100%;
`
const SpreadDashedWrapper = styled(Flex)`
  border: 1px dashed rgba(216, 222, 231, 0.8);
  width: 100%;
  height: 100%;
`

const CheckboxWrapper = styled(Flex)`
  position: absolute;
  bottom: 5px;
  right: 5px;
`
const len = 3

function RecommendImagesModal({ info, onSubmit, onUpload }) {
  const [images, setImages] = useState([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    handleFetch()
  }, [])

  function handleSetImages(images) {
    const defaultImages = _.map(info.defaultImages || [], (v) => ({
      ...v,
      checked: true,
    }))
    const imgs = images.slice()
    imgs.unshift(...defaultImages)
    setImages(_.uniqBy(imgs, (v) => v.id))
    setLoading(false)
  }

  async function handleFetch() {
    const query = { name: info.name }
    const res = await Request('/merchandise/cloud_images/get').data(query).get()
    const { images } = res.data
    handleSetImages(_.map(images, (img) => ({ ...img, checked: false })))
  }

  function handleFeed() {
    return Request('/station/cloud_images/image_requests/create')
      .data({
        name: info.name,
        spu_id: info.spu_id || null,
      })
      .post()
      .then(() => {
        Tip.info(t('反馈图片成功'))
      })
  }

  function handleHide() {
    Modal.hide()
  }

  async function handleSubmit(e) {
    const imgs = _.filter(images, (img) => img.checked)
    await onSubmit(_.map(imgs, (img) => ({ url: img.url, id: img.id })))
    handleHide()
  }

  async function handleUpload(files) {
    await onUpload(files)
    handleHide()
  }

  function addEmpty(length) {
    const result = []
    if (length !== 0 && length % len !== 0) {
      for (let i = 0; i < len - (length % len); i++) {
        const FlexB = styled(Flex)`
          min-height: 138px;
        `
        result.push(<FlexB flex className='gm-margin-10' key={`empty${i}`} />)
      }
    }
    return result
  }

  function handleOffset(offset) {
    setImages(_.map(images, (img) => ({ ...img, checked: false })))
    setOffset(offset + 5)
  }

  function handleCheck(index, offset) {
    const _images = images.slice()
    const image = images[index + offset]
    image.checked = !image.checked
    setImages(_images)
  }

  if (loading) {
    return <Loading className='gm-margin-20' />
  }

  const imageList = images.slice(offset, offset + 5)
  const nextList = images.slice(offset + 5, offset + 10)
  const contents = _.map(imageList, (image, index) => {
    return (
      <Flex
        flex
        className='gm-margin-10 gm-border gm-position-relative gm-cursor'
        onClick={handleCheck.bind(null, index, offset)}
        key={index}
      >
        <SpreadImg
          src={imageMogr2(image.url, { thumbnail: '138x138!' })}
          minHeight='138px'
        />
        <CheckboxWrapper>
          <Checkbox
            value
            checked={image.checked}
            onChange={handleCheck.bind(null, index, offset)}
          />
        </CheckboxWrapper>
      </Flex>
    )
  })

  contents.push(
    <Flex flex className='gm-margin-10' key='customer'>
      <SpreadUploader onUpload={handleUpload} multiple accept='image/*'>
        <SpreadDashedWrapper
          flex
          alignCenter
          justifyCenter
          column
          className='gm-text-14 gm-text-primary gm-cursor'
        >
          <div className='text-center gm-padding-5'>
            <SVGPlus />
          </div>
          {t('自定义上传')}
        </SpreadDashedWrapper>
      </SpreadUploader>
    </Flex>,
  )

  contents.push(addEmpty(contents.length))

  return (
    <Flex column>
      <span className='gm-text-desc gm-padding-lr-10 gm-padding-bottom-0'>
        {t(
          '默认勾选的图片为商品主图，可以多选其他推荐图片或自定义上传图片来修改商品图片',
        )}
      </span>
      {_.map(
        groupByWithIndex(contents, (value, i) => parseInt(i / len, 10)),
        (value, i) => {
          return (
            <Flex flex={1} key={i}>
              {value}
            </Flex>
          )
        },
      )}
      <Flex alignCenter className='gm-text-14 gm-margin-15 gm-margin-top-5'>
        {nextList.length ? (
          <Flex
            className='gm-cursor gm-text-primary'
            onClick={handleOffset.bind(null, offset)}
          >
            <a>
              <span className='gm-margin-right-5'>
                <SVGRefresh />
              </span>
              {t('换一批')}
            </a>
          </Flex>
        ) : null}
        <Flex flex justifyEnd>
          {t('没有满意的图片，')}
          <a className='text-primary gm-cursor' onClick={handleFeed}>
            {t('去反馈')}
          </a>
        </Flex>
      </Flex>
      {!nextList.length ? (
        <Flex
          justifyCenter
          alignCenter
          className='gm-margin-15 gm-margin-top-0 gm-text-desc'
        >
          {t('没有更多可推荐的图片!')}
        </Flex>
      ) : null}
      <Flex flex justifyEnd className=''>
        <Button onClick={handleHide}>{t('取消')}</Button>
        <span className='gm-gap-10' />
        <Button type='primary' onClick={handleSubmit}>
          {t('确定')}
        </Button>
      </Flex>
    </Flex>
  )
}

RecommendImagesModal.propTypes = {
  info: PropTypes.object,
  onSubmit: PropTypes.func,
  onUpload: PropTypes.func,
}

export function renderRecommendImageModal({ info, onSubmit, onUpload }) {
  return Modal.render({
    title: t('智能推荐商品图片'),
    children: (
      <RecommendImagesModal
        info={info}
        onSubmit={onSubmit}
        onUpload={onUpload}
      />
    ),
    style: { width: '500px' },
    onHide: Modal.hide,
  })
}
