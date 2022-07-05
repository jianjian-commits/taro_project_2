import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Flex } from '@gmfe/react'
import printStore from './store'
import { isPcConnect } from 'common/util'
import styled from 'styled-components'
import classNames from 'classnames'

const PrinterWrapper = styled.div`
  color: #333 !important;
  margin-bottom: 20px;
  width: 45%;
  padding: 10px 20px;
`

const DefaultTag = styled.div`
  font-size: 14px;
  padding: 2px;
  color: #333;
`
const Print = observer(() => {
  useEffect(() => {
    printStore.init()
    printStore.getPrinterList()
  }, [])

  const handlePrinter = (name) => {
    printStore.setPrinter(name)
  }

  return (
    <div className='gm-margin-left-20'>
      <Flex className='gm-margin-bottom-10' alignCenter>
        {isPcConnect && (
          <div className='t-margin-left-15'>
            {t('已选择打印机名')}：{printStore.name}
          </div>
        )}
      </Flex>
      <div>
        {isPcConnect && (
          <Flex justifyBetween wrap>
            {printStore.list.slice().map(({ name, isDefault, description }) => (
              <PrinterWrapper
                onClick={() => handlePrinter(name)}
                key={name}
                className={classNames('gm-border', {
                  'b-border-color-primary': name === printStore.name,
                })}
              >
                <Flex alignCenter className='gm-padding-bottom-10'>
                  <div className='gm-margin-right-10'>
                    {t('名字')}：{name}
                  </div>
                  {isDefault && (
                    <DefaultTag className='gm-border'>
                      {t('系统默认')}
                    </DefaultTag>
                  )}
                </Flex>
                <div className='text-left'>
                  {t('描述')}：{description}
                </div>
              </PrinterWrapper>
            ))}
          </Flex>
        )}
      </div>
    </div>
  )
})

export default Print
