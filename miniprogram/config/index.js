module.exports = {
  appName: '记记食钟',
  softwareName: '记记食钟健康管理软件',
  version: 'V1.0.0',

  // 本地预览保持 false；创建云环境并部署 cloudfunctions 后改为 true。
  cloudEnabled: false,
  cloudEnv: '',
  cloudFunctionName: 'health',

  // 仅用于软著截图和演示，正式发布时必须保持 false。
  demoDataEnabled: false,

  // 在微信公众平台申请订阅消息模板后填写，否则设置页只展示配置状态。
  subscriptionTemplates: {
    water: '',
    period: ''
  },

  storageKey: 'qf_health_data_v1'
}
