import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Tour from '@gmfe/tour'
import { withRouter } from '../../common/service'
import pageTipStore from '../../stores/page_tip'
import { autorun } from 'mobx'
import _ from 'lodash'

const MyTour = withRouter(
  ({
    steps,
    endClear,
    location: {
      query: { guide_type },
    },
    onClose,
  }) => {
    const [open, setOpen] = useState(true)
    const ref = useRef(null)

    useEffect(() => {
      autorun(() => {
        if (pageTipStore.init) {
          console.log('apiRecalculate')
          setTimeout(() => {
            ref.current.apiRecalculate()
          }, 100)
        }
      })
    }, [])

    return (
      <Tour
        ref={ref}
        steps={steps}
        isOpen={open}
        onRequestClose={() => {
          setOpen(false)
          onClose()
          // if (endClear) {
          //   window.location.href = window.location.href.replace(
          //     `?guide_type=${guide_type}`,
          //     ''
          //   )
          // }
        }}
      />
    )
  }
)

MyTour.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      selector: PropTypes.string.isRequired,
      content: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.element,
        PropTypes.func,
      ]).isRequired,
    })
  ).isRequired,
  // 结束之后清理 url 上的标志
  endClear: PropTypes.bool,
  onClose: PropTypes.func,
}

MyTour.defaultProps = {
  onClose: _.noop,
}

export default MyTour
