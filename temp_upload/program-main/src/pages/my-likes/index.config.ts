export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '我的点赞',
      navigationBarBackgroundColor: '#FFFFFF',
      navigationBarTextStyle: 'black'
    })
  : { navigationBarTitleText: '我的点赞' }
