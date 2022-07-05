/**
 * @description 打印报价单
 */
import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Button,
  Flex,
  Radio,
  RadioGroup,
  RightSideModal,
  Checkbox,
  Storage,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import { Request } from '@gm-common/request'
import { openNewTab } from 'common/util'
import { observer } from 'mobx-react'
import qs from 'query-string'
import globalStore from 'stores/global'

@observer
class PopupPrintModal extends React.Component {
  state = {
    print_type: 0,
    template_id: '',
    templateList: [],
    category_sort: Storage.get('category_sort_model') || false, // 是否按照商品管理顺序打印
  }

  handleTemChange = (template_id) => {
    this.setState({ template_id })
  }

  handlePrintTypeChange = (print_type) => {
    this.setState({ print_type })
  }

  handleSetSku = () => {
    const { salemenu_id } = this.props

    openNewTab(
      `#/merchandise/manage/sale/print_item_setting?salemenu_id=${salemenu_id}`,
    )
  }

  handlePrint = () => {
    const { template_id, print_type, category_sort } = this.state
    const { salemenu_id, target_url, type } = this.props

    openNewTab(
      `${target_url}?${qs.stringify({
        template_id,
        print_type,
        salemenu_id,
        type,
        category_sort,
      })}`,
    )

    RightSideModal.hide()
  }

  handleChangeCategorySort = (e) => {
    this.setState({
      category_sort: e.currentTarget.checked,
    })
    Storage.set('category_sort_model', e.currentTarget.checked)
  }

  componentDidMount() {
    Request('/fe/sale_menu_tpl/list')
      .get()
      .then((res) => {
        this.setState({ templateList: res.data, template_id: res.data[0].id })
      })
  }

  render() {
    const { template_id, print_type, templateList } = this.state
    const canEdit = globalStore.hasPermission('edit_salemenu_templates')

    return (
      <Flex
        column
        style={{ width: '300px' }}
        className='b-distribute-order-popup-right'
      >
        <Flex
          justifyBetween
          alignCenter
          className='gm-border-bottom gm-padding-bottom-5 gm-padding-right-15'
        >
          <h4>{i18next.t('选择单据模板')}</h4>

          <div>
            {this.props.type !== 'cycle_price' && (
              <Button type='default' onClick={this.handleSetSku}>
                {i18next.t('预设打印商品')}
              </Button>
            )}
            <div className='gm-gap-10' />
            <Button type='primary' onClick={this.handlePrint}>
              {i18next.t('确认')}
            </Button>
          </div>
        </Flex>

        <div className='gm-margin-top-10'>
          <Checkbox
            className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-padding-left-5'
            checked={this.state.category_sort}
            onChange={this.handleChangeCategorySort.bind(this)}
          >
            {i18next.t('按商品分类管理顺序打印')}
          </Checkbox>
          <RadioGroup
            name='template_id'
            value={template_id}
            onChange={this.handleTemChange}
            className='gm-padding-right-15 b-distribute-order-popup-temp-radio gm-padding-left-5'
          >
            {templateList.map((item) => (
              <Radio value={item.id} key={item.id}>
                <span>{item.content.name}</span>
                {canEdit && (
                  <a
                    href={`#/system/setting/distribute_templete/salemenus_editor?template_id=${item.id}`}
                    className='gm-text-12'
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    {i18next.t('设置模板>')}
                  </a>
                )}
                {template_id === item.id && (
                  <div className='gm-margin-left-10'>
                    <RadioGroup
                      name='print_type'
                      value={print_type}
                      onChange={this.handlePrintTypeChange}
                    >
                      <Radio value={0} key={0}>
                        {i18next.t('打印全部商品')}
                      </Radio>
                      {this.props.type !== 'cycle_price' && (
                        <Radio value={1} key={1}>
                          {i18next.t('打印预设商品')}
                        </Radio>
                      )}
                    </RadioGroup>
                  </div>
                )}
              </Radio>
            ))}
          </RadioGroup>
        </div>
      </Flex>
    )
  }
}

PopupPrintModal.propTypes = {
  // 模版类型：不传该值默认为报价单，cycle_price: 周期定价规则
  type: PropTypes.string,
  // 报价单/周期定价规则id
  salemenu_id: PropTypes.string.isRequired,
  target_url: PropTypes.string.isRequired,
}

export default (props) => {
  RightSideModal.render({
    children: <PopupPrintModal {...props} />,
    onHide: RightSideModal.hide,
    style: {
      width: '300px',
    },
  })
}
