const { getArticle, DISCLAIMER } = require('../../data/articles')

Page({
  data: {
    article: null,
    disclaimer: DISCLAIMER
  },

  onLoad(options) {
    const article = getArticle(options.id)
    if (!article) {
      wx.showToast({
        title: '文章不存在',
        icon: 'none'
      })
      setTimeout(() => wx.navigateBack(), 600)
      return
    }
    this.setData({ article })
    wx.setNavigationBarTitle({ title: article.categoryName })
  }
})
