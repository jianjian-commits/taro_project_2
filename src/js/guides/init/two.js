import React from 'react'
import { Flex } from '@gmfe/react'
import InitMatchImages from './guide/init_match_images'
import Video from './components/video'

const Two = () => {
  return (
    <Flex className='b-init-info'>
      <Flex column>
        <Video src='https://image.document.guanmai.cn/video/picture.mov' />
      </Flex>
      <div className='gm-padding-10' />
      <Flex column alignStart justifyEnd>
        <div className='gm-text-bold'>匹配商品图片</div>
        <div className='gm-padding-10' />
        <div>
          <div className='gm-margin-bottom-10'>
            ① 快速为每个商品匹配商品图片
          </div>
          <div className='gm-margin-bottom-10'>
            图片来源可以选择「云图库」或「上传图片包」
          </div>
          <div className='gm-margin-bottom-10'>
            若使用「上传图片」需要将图片名设置为对应的商品名称
          </div>
          <div className='gm-margin-bottom-10'>
            ②
            快速匹配图片后还可以在商品列表上点击商品图片，对商品图片进行逐个修改
          </div>
        </div>
        <div className='gm-padding-5' />
        <InitMatchImages.GoToButton>
          快速匹配商品图片
        </InitMatchImages.GoToButton>
      </Flex>
    </Flex>
  )
}

export default Two
