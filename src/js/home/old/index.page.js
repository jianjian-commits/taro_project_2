import React from 'react'
import { Flex, Col, Row } from '@gmfe/react'
import CommonFunction from './common_function'
import OperatingBulletin from './operating_bulletin'
import Profix from './profit'
import AnalyseSkus from './analyse_skus'
import AnalyseMerchant from './analyse_merchant'
import ReadyBills from './ready_bills'
import Warning from './warning'
import Notify from './notify'
import HomeMap from './components/home_map'
import global from 'stores/global'
import classNames from 'classnames'
import InitHome from '../../guides/init/guide/init_home'
import AdModal from './components/ad_modal'
import Hometitle from '../new/home_title'
class Home extends React.Component {
  isForeign = global.isForeign()

  render() {
    return (
      <>
        <Hometitle />

        <Col
          style={{ backgroundColor: '#f6f7fb' }}
          className='gm-padding-lr-20 gm-padding-tb-10 b-home'
        >
          <Row>
            <Col className='b-home-top-left' lg={18} md={24} sm={24}>
              {/* 运营简报 */}
              <OperatingBulletin isForeign={this.isForeign} />
              <Flex className='gm-padding-top-10'>
                <div style={{ flex: '2 1 40px' }}>
                  {/* 销售趋势 */}
                  <Profix />
                </div>
                <div className='gm-flex-flex gm-padding-left-10'>
                  {/* 待处理单据 */}
                  <ReadyBills />
                </div>
              </Flex>
            </Col>
            <Col lg={6} md={24} sm={24} className='b-home-top-right'>
              {/* 常用功能 */}
              <CommonFunction />
              <div className='gm-padding-5' />
              {/* 预警信息 */}
              <Warning />
              <div className='gm-padding-5' />
              {/* 消息通知 */}
              <Notify />
            </Col>
          </Row>
          <Row className='gm-padding-top-10'>
            {!this.isForeign && (
              <Col lg={8} md={24} sm={24}>
                {/* 运营地图 */}
                <HomeMap />
              </Col>
            )}
            <Col
              lg={this.isForeign ? 12 : 8}
              md={24}
              sm={24}
              className={classNames({
                'gm-padding-lr-10': !this.isForeign,
              })}
            >
              {/* 分类统计 */}
              <AnalyseSkus />
            </Col>
            <Col
              lg={this.isForeign ? 12 : 8}
              md={24}
              sm={24}
              className={classNames('b-home-bottom-right', {
                'gm-padding-left-10': this.isForeign,
              })}
            >
              {/* 商户销量分布 */}
              <AnalyseMerchant />
            </Col>
          </Row>
          <InitHome
            ready
            forceShow={global.isShowHomeTip()}
            onClose={() => global.setDisabledHomeTip()}
          />
          {/* 首页弹窗 */}
          <AdModal />
        </Col>
      </>
    )
  }
}

export default Home
