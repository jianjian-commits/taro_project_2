import React, { useEffect, useRef } from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gmfe/react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

import store from '../store'

const Div = styled.div`
  width: 80px;
`

const Rejection = () => {
  const ref = useRef(null)

  useEffect(() => {
    ref.current.focus()
  }, [])

  const handleChange = (event) => {
    const { setReason } = store
    setReason(event.target.value)
  }

  const { reason } = store
  return (
    <div>
      <p>{t('确定要驳回该单的改单审核吗？')}</p>
      <Flex alignStart>
        <Div>{t('驳回原因：')}</Div>
        <textarea
          rows={6}
          cols={25}
          className='form-control'
          value={reason}
          onChange={handleChange}
          ref={ref}
        />
      </Flex>
    </div>
  )
}
export default observer(Rejection)
