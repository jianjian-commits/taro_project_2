import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'

const InitShopRegister = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '[data-id="initShopRegister"]',
          content: (
            <Content title='商城注册设置'>
              若开启邀请码注册，需要到「新商户邀请」中配置邀请码
            </Content>
          ),
        },
      ]}
    />
  )
}

InitShopRegister.TYPE = 'InitShopRegister'
InitShopRegister.pathname = '/system/setting/custom_page'

export default guideTypeHOC(InitShopRegister)
