import React from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { productDefaultImg } from 'common/service'
import store from '../store'
import ListImg from '../../../component/list_img'
import { renderRecommendImageModal } from '../../../component/recommend_image_modal'

const Images = observer((props) => {
  const {
    original: { image_list, name, id },
    index,
  } = props.row

  const handleUploadImg = (files) => {
    const res = _.map(files, (item) => store.uploadImg(item))
    return Promise.all(res).then((json) => _.map(json, (i) => i.data))
  }

  const image = image_list && image_list[0]
  return (
    <ListImg
      imgSrc={image ? image.url : productDefaultImg}
      onClick={() => {
        const info = { name, spu_id: id, defaultImages: image ? [image] : [] }
        renderRecommendImageModal({
          info,
          onSubmit: (imgs) => {
            store.updateSpuImages(index, imgs)
          },
          onUpload: async (files) => {
            const imgs = await handleUploadImg(files)
            store.updateSpuImages(index, imgs)
          },
        })
      }}
    />
  )
})

export default Images
