import React from 'react'
import _ from 'lodash'
import { Carousel, Flex } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import { setTitle } from '@gm-common/tool'
import classNames from 'classnames'
import store from './store'
import { observer } from 'mobx-react'

@observer
class ApplicationCenter extends React.Component {
  componentDidMount() {
    setTitle(i18next.t('应用中心'))
    store.getAppCopyWriterData()
    store.getCarouselListData()
  }

  componentDidUpdate() {
    setTitle(i18next.t('应用中心'))
  }

  handleOpenUrl = (url) => {
    if (url) {
      window.open(url)
    }
  }

  renderCarouselItem = () => {
    const bannerDataList = store.carouselList

    return _.map(bannerDataList, (v) => {
      return (
        <div
          key={_.uniqueId()}
          onClick={this.handleOpenUrl.bind(this, v.open_url)}
          className={classNames({ 'gm-cursor': !!v.open_url })}
          style={{
            backgroundColor: `${v.color}`,
            height: '100%',
            width: '100%',
          }}
        >
          <Flex justifyCenter>
            <img style={{ height: '294px', width: '1160px' }} src={v.url} />
          </Flex>
        </div>
      )
    })
  }

  renderItem = (data) => {
    const isPay = data.type === 1
    const btnText = isPay ? i18next.t('付费') : i18next.t('免费')

    return (
      <Flex
        className={classNames({
          'gm-cursor gm-text-hover-primary': !!data.open_url,
        })}
        style={{ width: '375px', height: '95px' }}
        onClick={this.handleOpenUrl.bind(this, data.open_url)}
      >
        <img
          className='gm-application-center-content-item-img'
          src={data.iconUrl}
        />

        <Flex column style={{ marginLeft: '20px' }}>
          <Flex column justifyBetween style={{ height: '70px' }}>
            <h4>{data.header}</h4>
            <span>{data.msg}</span>
          </Flex>

          <button
            style={{
              backgroundColor: isPay ? '#56a3f2' : '#ffffff',
              color: isPay ? '#ffffff' : '#56a3f2',
            }}
          >
            {btnText}
          </button>
        </Flex>
      </Flex>
    )
  }

  render() {
    const contentDataList = store.appCopyWriterList

    return (
      <div>
        <Carousel
          delay={7000} // 轮播时延
          transitionTime={1000} // 切换时间（ms）
          style={{ width: '100%', height: '294px', overflow: 'hidden' }}
        >
          {this.renderCarouselItem()}
        </Carousel>

        <div className='gm-quick gm-application-center-content'>
          {_.map(contentDataList, ([title, data], index) => {
            return (
              <div
                className={classNames('gm-padding-lr-20', {
                  'gm-margin-top-20': !!index,
                })}
                key={index}
              >
                <h3 className='gm-margin-top-0 gm-margin-bottom-10 gm-text-18 gm-padding-lr-20'>
                  {title || i18next.t('未分类')}
                </h3>
                <hr className='gm-margin-top-0 gm-margin-lr-10' />
                <Flex wrap justifyBetween>
                  {data.map((v) => (
                    <div
                      key={_.uniqueId()}
                      className='gm-application-center-content-item'
                    >
                      {this.renderItem(v)}
                    </div>
                  ))}
                  {_.times(4, () => (
                    <div key={_.uniqueId()}>
                      <style jsx>{`
                        div {
                          margin-left: 20px;
                          margin-right: 20px;
                          width: 372px;
                        }
                      `}</style>
                    </div>
                  ))}
                </Flex>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default ApplicationCenter
