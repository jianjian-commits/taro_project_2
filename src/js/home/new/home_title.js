import React, { useState, useEffect } from 'react'
import { Button, Flex } from '@gmfe/react'
import { Storage } from '@gm-common/tool'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import store from './store'
const Hometitle = () => {
  const [vision, setVision] = useState()
  useEffect(() => {
    setVision(store.vision)
  }, store.vision)
  const toggleVision = (type) => {
    Storage.set('vision', type)
    store.setVision(type)
  }
  return (
    <Flex justifyStart alignCenter className='home-title-bg'>
      <Button
        className={classNames({
          'home-vision-toggle': vision === 'new',
        })}
        onClick={() => toggleVision('new')}
      >
        切换新版本
      </Button>
      <Button
        className={classNames({
          'home-vision-toggle': vision !== 'new',
        })}
        onClick={() => toggleVision('old')}
      >
        切换旧版本
      </Button>
    </Flex>
  )
}
export default observer(Hometitle)
