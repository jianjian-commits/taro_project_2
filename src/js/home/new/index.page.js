import React from 'react'
import Gird from 'common/components/grid'

import HomeCommonFunction from './home_common_function'
import HomeTodo from './home_todo'
import HomeBrief from './home_brief'
import HomeWarning from './home_warning'
import HomeNotify from './home_notify'

import AdModal from './components/ad_modal'

import global from 'stores/global'
import store from './store'
import Hometitle from './home_title'
class Home extends React.Component {
  isForeign = global.isForeign()

  componentDidMount() {
    store.fetchAllData()
  }

  render() {
    return (
      <>
        <Hometitle />
        <Gird column={4} className='gm-padding-15'>
          {/* 待处理事项 */}
          <HomeTodo className='b-grid-span-3' isForeign={this.isForeign} />
          {/* 常用功能 */}
          <HomeCommonFunction className='b-grid-span-1' />
          {/* 今日简报 */}
          <HomeBrief className='b-grid-span-3' />
          <div column className='b-grid-span-1'>
            {/* 预警信息 */}
            <HomeWarning className='b-home-warning' />
            {/* 消息通知 */}
            <HomeNotify className='b-home-notify gm-margin-top-15' />
          </div>
        </Gird>

        <AdModal />
      </>
    )
  }
}

export default Home
