export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '邻里圈'
    })
  : { navigationBarTitleText: '邻里圈' }
