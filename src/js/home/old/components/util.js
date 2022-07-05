function fetchMapData(baseUrl, paramsUrl) {
  return new Promise((resolve, reject) => {
    const xhr = new window.XMLHttpRequest()

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch (err) {
            reject(new Error('data error. JSON.parse.'))
          }
        } else {
          reject(new Error('amap service error'))
        }
      }
    }
    xhr.open('get', baseUrl + paramsUrl)
    xhr.send()
  })
}

async function getMapCenterAddress(baseUrl, paramsUrl) {
  const centerData = await fetchMapData(baseUrl, paramsUrl)
  if (centerData.status === '1') {
    const keywords = centerData.geocodes[0].adcode
    return keywords
  }
  return ''
}

export { fetchMapData, getMapCenterAddress }
