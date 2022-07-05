function getDataHX(bufferStr) {
  let arr = []
  // 衡新(粤衡)电子秤有三种制表符 优先判断 \t (\t,\n,\r，表面看起来都是空格符，区别是\t 横向跳到下一制表符位置，\r 回车，\n 回车换行)
  if (bufferStr.includes('\t')) {
    arr = bufferStr.split('\t')
  } else if (bufferStr.includes('\n')) {
    arr = bufferStr.split('\n')
  } else if (bufferStr.includes('\r')) {
    arr = bufferStr.split('\r')
  }

  // 三个可以保证一定能获取数据了
  if (arr.length >= 3) {
    return arr.slice(-2, -1)[0]
  }
}

function getDataWXL(bufferStr) {
  const arr = bufferStr.split('=')

  // 三个可以保证一定能获取数据了
  if (arr.length >= 3) {
    return arr.slice(-2, -1)[0]
  } else if (arr.length === 2) {
    // chrome插件取的数据=83.0000
    // 第二种数据格式83.0000=
    return arr.slice(-1)[0] || arr.slice(-2)[0] || 0
  }
}

/**
 * 首衡
 * 格式：<1字节 0x02>A=00.0000<1字节 0x01><1字节 0x01><1字节 0x03>
 * 其中"00.0000"即为称重数据
 */
function getDataShouheng(bufferStr) {
  return bufferStr.slice(3, 10)
}

export { getDataHX, getDataWXL, getDataShouheng }
