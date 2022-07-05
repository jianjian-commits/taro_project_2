import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'
import PropTypes from 'prop-types'

const InitMatchImages = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '[data-id="initMatchImages"]:first-child',
          content: (
            <Content title='快速匹配商品图片'>
              通过云图库或自行上传图片包自动批量为没有图片的商品添加图片，匹配后仍可手动逐个修改商品图片
            </Content>
          ),
          actionBefore: () => {
            props.refMoreAction.current.apiDoSetActive(true)
          },
          actionAfter: () => {
            props.refMoreAction.current.apiDoSetActive(false)
          },
        },
        {
          selector: '[data-id="initMatchImagesImage"]',
          content: (
            <Content title='修改商品主图'>
              点击商品主图可以对商品图片快速进行修改
            </Content>
          ),
        },
      ]}
    />
  )
}

InitMatchImages.propTypes = {
  refMoreAction: PropTypes.object.isRequired,
}

InitMatchImages.TYPE = 'InitMatchImages'
InitMatchImages.pathname = '/merchandise/manage/list'

export default guideTypeHOC(InitMatchImages)
