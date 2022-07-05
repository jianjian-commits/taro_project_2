import { t } from 'gm-i18n'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Flex, Modal, Button } from '@gmfe/react'
import _ from 'lodash'
import SortContainer from 'common/components/sort_container'
import Bulletin from 'common/components/report/bulletin'

const SortModal = ({ infos, onConfirm, core }) => {
  const [data, setData] = useState(() => {
    const rest = _.omit(infos, core)
    return core.concat(Object.keys(rest))
  })
  const handleSort = (indexs) => {
    const retData = []
    _.forEach(indexs, (i) => {
      retData.push(data[i])
    })
    setData(retData)
  }

  const handleClick = () => {
    onConfirm(data.slice(0, 4))
    Modal.hide()
  }

  return (
    <div>
      <SortContainer
        onSort={handleSort}
        core={4}
        split={
          <div
            className='gm-margin-lr-10 gm-border-top gm-margin-top-5 gm-padding-top-5'
            style={{ width: '800px' }}
          >
            {t('可拖动更换卡片')}
          </div>
        }
      >
        {data.map((v, i) => (
          <SortContainer.Item
            index={i}
            key={v}
            style={{ width: '200px', color: '#fff' }}
          >
            <Bulletin
              options={_.omit(infos[v], ['tLink', 'yLink'])}
              className={`gm-margin-5 b-home-bulletin-${i > 3 ? 'gray' : i}`} // 第四个以后的bulletin置灰色
            />
          </SortContainer.Item>
        ))}
      </SortContainer>
      <Flex justifyEnd>
        <Button
          className='gm-margin-right-10'
          onClick={() => {
            Modal.hide()
          }}
        >
          {t('取消')}
        </Button>
        <Button type='primary' onClick={handleClick}>
          {t('确定')}
        </Button>
      </Flex>
    </div>
  )
}
SortModal.propTypes = {
  infos: PropTypes.object,
  onConfirm: PropTypes.func,
  core: PropTypes.array,
}

export default SortModal
