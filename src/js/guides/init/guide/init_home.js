import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'
import PropTypes from 'prop-types'

const InitHome = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '.gm-nav',
          content: (
            <Content title='功能导航'>
              系统的一级功能入口，鼠标悬停在图标上可以展开更详细的二级菜单
            </Content>
          ),
        },
        {
          selector: '[data-id="search"]',
          content: (
            <Content title='万能搜索'>
              找不到功能再哪？遇到操作问题？快速查询单据都可以在这里搜索。
            </Content>
          ),
        },
        {
          selector: '[data-id="init"]',
          content: (
            <Content title='初始化引导'>
              点击进入系统初始化引导，我们将协助您完成系统的初步设置
            </Content>
          ),
        },
      ]}
    />
  )
}

InitHome.propTypes = {
  refMoreAction: PropTypes.object.isRequired,
}

InitHome.TYPE = 'InitHome'
InitHome.pathname = '/merchandise/manage/list'

export default guideTypeHOC(InitHome)
