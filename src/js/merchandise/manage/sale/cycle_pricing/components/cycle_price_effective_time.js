/**
 * @description 周期定价列表修改生效时间组件，不含input框的日期选择器
 */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import Overlay from '@gmfe/react/src/component/date_picker/overlay'
import { TableUtil } from '@gmfe/table'
import { showTimeFormat, disabledEffectiveTime } from '../utils'
import { editCyclePriceReq } from '../service'
import store from '../store'

const { EditButton } = TableUtil

function CyclePriceEffectiveTime(props) {
  const { original } = props
  const [timeLoading, setTimeLoading] = useState(false)

  // 编辑生效时间
  function editEffectiveTime(time, ruleData, closePopup) {
    if (timeLoading) {
      // 防止重复发送请求
      return
    }

    setTimeLoading(true)
    const data = {
      ...ruleData,
      effective_time: showTimeFormat(time),
    }

    editCyclePriceReq(data).then((res) => {
      // 编辑成功后不会改变规则在列表中的位置，刷新当前页面数据即可
      if (res.code === 0) store.doCyclePriceCurrentRequest()

      setTimeLoading(false)
      closePopup()
    })
  }

  return (
    <EditButton
      popupRender={(closePopup) => (
        <Overlay
          enabledTimeSelect
          date={new Date(original.effective_time)}
          onSelect={(time) => editEffectiveTime(time, original, closePopup)}
          min={new Date()}
          timeLimit={{
            timeSpan: 60 * 60 * 1000,
            disabledSpan: (time) => disabledEffectiveTime(time),
          }}
        />
      )}
    />
  )
}

CyclePriceEffectiveTime.propTypes = {
  original: PropTypes.object,
}

export default observer(CyclePriceEffectiveTime)
