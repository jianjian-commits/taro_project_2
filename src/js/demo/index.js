import React from 'react'
import { observer } from 'mobx-react'
import MapEchart from 'common/components/customize_echarts/map_echart'

@observer
class Demo extends React.Component {
  handleChange = (selected) => {
    console.log(selected)
  }

  render() {
    return (
      <div style={{ height: '100vh', background: '#030542' }}>
        <MapEchart />
      </div>
    )
  }
}

export default Demo
