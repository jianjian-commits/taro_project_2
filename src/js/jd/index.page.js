import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Sheet, SheetColumn } from '@gmfe/react'
import actions from '../actions'
import './reducers'
import './actions'
import EditInput from './components/edit_input'

/**
 * input 标签式的文本
 */
class NormalInputText extends React.Component {
  render() {
    return (
      <input
        value={this.props.value}
        className='input-sm jd-input text'
        disabled
        style={{ width: '100%' }}
      />
    )
  }
}

class Jd extends React.Component {
  constructor(props) {
    super(props)
    this.handleChangePreCode = ::this.handleChangePreCode
    this.handleChangeInvalidDay = ::this.handleChangeInvalidDay
  }

  componentDidMount() {
    actions.jd_get_orders()
  }

  /**
   * 修改编码
   * @param preCode   修改后的编码
   * @param id        sku_id
   * @param index     所在数组的索引
   * @param state     1:上架   0:下架
   */
  handleChangePreCode(preCode, id, index, state) {
    const { jd } = this.props
    const list = state ? jd.upList : jd.downList
    if (list[index].merchant_sku_id !== preCode) {
      actions.jd_update_preCode(preCode, id, index, state)
    }
  }

  // 修改尝鲜期
  handleChangeInvalidDay(validDay, id, index, state) {
    const { jd } = this.props
    const list = state ? jd.upList : jd.downList
    if (list[index].fresh_days !== validDay) {
      actions.jd_update_valid_day(validDay, id, index, state)
    }
  }

  render() {
    const { jd } = this.props
    return (
      <Flex column className='gm-padding-15 gm-bg'>
        <Flex>
          <Flex flex={1} justifyCenter>
            {i18next.t('站点:K5')}
          </Flex>
          <Flex flex={1}>{i18next.t('报价单:JD供货销售单')}</Flex>
        </Flex>
        <Flex className='gm-padding-15' />
        <Sheet list={jd.upList} loading={false} enableEmptyTip>
          <SheetColumn field='id' name='skuid'>
            {(value) => (
              <div>
                <NormalInputText value={value} />
              </div>
            )}
          </SheetColumn>
          <SheetColumn field='name' name={i18next.t('商品名')}>
            {(value) => (
              <div>
                <NormalInputText value={value} />
              </div>
            )}
          </SheetColumn>
          <SheetColumn field='merchant_sku_id' name={i18next.t('专用编码')}>
            {(value, i) => (
              <div className='jd-edit-input'>
                <EditInput
                  data={jd.upList[i]}
                  value={value}
                  index={i}
                  handleChangeInput={this.handleChangePreCode}
                  expr='preCode'
                />
              </div>
            )}
          </SheetColumn>

          <SheetColumn field='fresh_days' name={i18next.t('尝鲜期/天')}>
            {(value, i) => (
              <div className='jd-edit-input'>
                <EditInput
                  data={jd.upList[i]}
                  value={value}
                  index={i}
                  handleChangeInput={this.handleChangeInvalidDay}
                  expr='validDay'
                />
              </div>
            )}
          </SheetColumn>
        </Sheet>

        <Flex className='gm-padding-15'>{i18next.t('以下是下架商品')}:</Flex>
        <Sheet list={jd.downList} loading={false} enableEmptyTip>
          <SheetColumn field='id' name='skuid'>
            {(value) => (
              <div>
                <NormalInputText value={value} />
              </div>
            )}
          </SheetColumn>
          <SheetColumn field='name' name={i18next.t('商品名')}>
            {(value) => (
              <div>
                <NormalInputText value={value} />
              </div>
            )}
          </SheetColumn>
          <SheetColumn field='merchant_sku_id' name={i18next.t('专用编码')}>
            {(value, i) => (
              <div className='jd-edit-input'>
                <EditInput
                  data={jd.downList[i]}
                  value={value}
                  index={i}
                  handleChangeInput={this.handleChangePreCode}
                  expr='preCode'
                />
              </div>
            )}
          </SheetColumn>

          <SheetColumn field='fresh_days' name={i18next.t('尝鲜期/天')}>
            {(value, i) => (
              <div className='jd-edit-input'>
                <EditInput
                  data={jd.downList[i]}
                  value={value}
                  index={i}
                  handleChangeInput={this.handleChangeInvalidDay}
                  expr='validDay'
                />
              </div>
            )}
          </SheetColumn>
        </Sheet>
      </Flex>
    )
  }
}

export default Jd
