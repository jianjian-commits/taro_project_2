import React from 'react'
import { Switch, Flex, ToolTip } from '@gmfe/react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'

const CommonSwitchControl = observer(
  ({
    commonSwitchControlTitle,
    commonSwitchControlTip,
    commonSwitchControlCheck,
    commonSwitchControlHandle,
    showCommonSwitchControlTip,
  }) => {
    const handleChangeSwitch = (name, value) => {
      commonSwitchControlHandle(name)
    }
    return (
      <Flex alignCenter>
        <Flex>
          {commonSwitchControlTitle}
          {!showCommonSwitchControlTip && (
            <ToolTip
              center
              popup={
                <div className='gm-padding-5' style={{ minWidth: '160px' }}>
                  {commonSwitchControlTip ?? ''}
                </div>
              }
              className='gm-margin-left-5 gm-margin-right-5'
            />
          )}
        </Flex>
        <Switch
          on={t('开启')}
          off={t('关闭')}
          checked={commonSwitchControlCheck}
          onChange={handleChangeSwitch}
        />
      </Flex>
    )
  },
)
CommonSwitchControl.propTypes = {
  commonSwitchControlTitle: PropTypes.string,
  commonSwitchControlTip: PropTypes.string,
  commonSwitchControlHandle: PropTypes.func,
  commonSwitchControlCheck: PropTypes.bool,
  showCommonSwitchControlTip: PropTypes.bool,
}
export default CommonSwitchControl
