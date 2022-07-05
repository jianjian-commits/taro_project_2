import React from 'react'
import { t } from 'gm-i18n'
import { TransferV2, Flex, Button, Tip } from '@gmfe/react'
import { observer } from 'mobx-react'
import store from './store'

@observer
class Index extends React.Component {
  componentDidMount() {
    const { salemenu_id } = this.props.location.query
    store.fetchData(salemenu_id)
  }

  handleSave = () => {
    store.saveData().then(() => {
      Tip.success(t('保存成功!'))
      setTimeout(() => window.closeWindow(), 800)
    })
  }

  render() {
    const { selectedIdList, onSelected, treeData } = store

    return (
      <div>
        <Flex justifyCenter className='gm-margin-15'>
          <div className='text-primary gm-text-16'>
            {t('请选择需要打印的商品，添加到右侧')}
          </div>
        </Flex>
        <Flex justifyCenter className='gm-margin-15'>
          <TransferV2
            selectedValues={selectedIdList}
            onSelectValues={onSelected}
            list={treeData}
            rightTree
            leftTitle={t('待选择商品')}
            rightTitle={t('已选打印商品')}
          />
        </Flex>

        <Flex alignCenter justifyCenter>
          <Button type='default' onClick={() => window.closeWindow()}>
            {t('取消')}
          </Button>
          <div className='gm-gap-10' />
          <Button type='primary' onClick={this.handleSave}>
            {t('保存')}
          </Button>
        </Flex>
      </div>
    )
  }
}

export default Index
