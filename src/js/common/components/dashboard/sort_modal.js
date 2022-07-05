import { t } from 'gm-i18n'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Flex, Modal, Button } from '@gmfe/react'
import _ from 'lodash'
import SortContainer from 'common/components/sort_container'
import Bulletin from 'common/components/dashboard/bulletin'

const SortModal = ({ infos, onConfirm, core, column, decimal, height }) => {
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
    onConfirm(data.slice(0, core.length || 4))
    Modal.hide()
  }

  return (
    <div>
      <SortContainer
        onSort={handleSort}
        core={core.length || 4}
        column={column || 4}
      >
        {data.map((v, i) => (
          <SortContainer.Item index={i} key={v}>
            <Bulletin
              height={height}
              options={_.omit(infos[v], ['tLink', 'yLink'])}
              decimal={decimal}
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
  column: PropTypes.number,
  decimal: PropTypes.number,
  height: PropTypes.string,
}

export default SortModal
