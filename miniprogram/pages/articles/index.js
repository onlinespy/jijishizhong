const { ARTICLE_CATEGORIES, ARTICLES } = require('../../data/articles')

Page({
  data: {
    categories: ARTICLE_CATEGORIES,
    activeCategory: 'all',
    articles: ARTICLES
  },

  onShow() {
    this.syncTabBar()
  },

  syncTabBar() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },

  selectCategory(event) {
    const activeCategory = event.currentTarget.dataset.id
    this.setData({
      activeCategory,
      articles: activeCategory === 'all'
        ? ARTICLES
        : ARTICLES.filter((item) => item.category === activeCategory)
    })
  },

  openArticle(event) {
    wx.navigateTo({
      url: `/pages/article-detail/index?id=${event.currentTarget.dataset.id}`
    })
  }
})
