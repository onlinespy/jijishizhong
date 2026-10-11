const DISCLAIMER = '温馨提示：本篇仅为日常健康科普参考，不构成医疗指导；体态存在不适请前往医院就诊。'

const ARTICLE_CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'sit', name: '久坐办公体态' }
]

const ARTICLES = [
  {
    id: 'sit-1',
    category: 'sit',
    categoryName: '久坐办公体态',
    title: '久坐办公时，先把屏幕和椅子调顺',
    excerpt: '从桌椅高度、屏幕位置和双脚支撑三个细节开始调整日常坐姿。',
    readTime: '3 分钟',
    theme: 'green',
    sections: [
      {
        heading: '让双脚有稳定支撑',
        paragraphs: [
          '坐下后先观察双脚是否能自然踩稳地面。如果椅子偏高，可以使用脚踏，避免脚尖长期悬空。',
          '膝盖与髋部保持大致舒适的角度即可，不需要长时间维持同一个“标准姿势”。'
        ]
      },
      {
        heading: '把常用物品放到顺手位置',
        paragraphs: [
          '屏幕顶部与视线接近，键盘和鼠标靠近身体，可以减少反复前伸和耸肩。',
          '每工作 30 到 45 分钟，起身活动一两分钟，往往比刻意绷紧身体更有帮助。'
        ]
      }
    ]
  },
  {
    id: 'sit-2',
    category: 'sit',
    categoryName: '久坐办公体态',
    title: '久坐间隙可以做的三个轻动作',
    excerpt: '不追求拉伸幅度，用短暂活动打断持续静坐。',
    readTime: '4 分钟',
    theme: 'blue',
    sections: [
      {
        heading: '肩颈放松',
        paragraphs: [
          '双肩自然下沉，缓慢转头看向左肩，再看向右肩。动作保持轻缓，不追求明显拉伸感。',
          '如果活动时出现疼痛、眩晕或其他不适，应停止并及时就医。'
        ]
      },
      {
        heading: '起身接水',
        paragraphs: [
          '利用喝水、接电话或会议间隙站起来走动。短而频繁的活动更容易融入工作节奏。',
          '把水杯放在需要起身的位置，也是一个简单可行的提醒方式。'
        ]
      },
      {
        heading: '脚踝活动',
        paragraphs: [
          '坐着时缓慢转动脚踝，或在安全环境中做几次提踵。工作间隙只做少量、舒适的动作即可。'
        ]
      }
    ]
  },
  {
    id: 'stand-1',
    category: 'stand',
    categoryName: '站姿习惯',
    title: '日常站立时，重心不要总压在一条腿上',
    excerpt: '识别单腿承重、骨盆偏向一侧等常见站立习惯。',
    readTime: '3 分钟',
    theme: 'gold',
    sections: [
      {
        heading: '留意重心位置',
        paragraphs: [
          '排队、等车或做饭时，可以偶尔感受双脚承重是否明显偏向一侧。',
          '调整时以舒适为前提，让重心更均匀地分布在双脚，而不必强行夹紧身体。'
        ]
      },
      {
        heading: '允许姿势自然变化',
        paragraphs: [
          '人体不是静止模型，长时间保持某个固定姿态本身就会带来不适。',
          '与其追求时刻挺拔，不如每隔一段时间改变站姿、走动或做轻柔活动。'
        ]
      }
    ]
  },
  {
    id: 'stand-2',
    category: 'stand',
    categoryName: '站姿习惯',
    title: '站立办公并不等于站得越久越好',
    excerpt: '交替坐姿和站姿，比长时间维持单一姿势更贴近日常使用。',
    readTime: '3 分钟',
    theme: 'orange',
    sections: [
      {
        heading: '先调整工作台高度',
        paragraphs: [
          '站立办公时，肩膀应保持自然，手肘能轻松放在桌面附近，屏幕不需要抬头或低头过多。',
          '如果桌面高度无法调整，可使用稳固的增高台，并确保设备不会滑落。'
        ]
      },
      {
        heading: '设置切换节奏',
        paragraphs: [
          '可以从每坐 45 分钟、站 10 分钟开始，根据自身感受调整。',
          '孕产期、术后恢复期或存在基础疾病的人群，应优先遵循专业人员建议。'
        ]
      }
    ]
  },
  {
    id: 'stretch-1',
    category: 'stretch',
    categoryName: '居家简易拉伸',
    title: '居家轻拉伸：从呼吸和缓慢动作开始',
    excerpt: '适合工作间隙的轻柔活动，不需要器械，也不追求极限幅度。',
    readTime: '4 分钟',
    theme: 'cyan',
    sections: [
      {
        heading: '准备环境',
        paragraphs: [
          '选择平整、干燥且周围没有障碍物的区域。穿着便于活动的衣物，赤脚或穿防滑鞋均可。',
          '动作过程中保持自然呼吸，不憋气，不快速弹震。'
        ]
      },
      {
        heading: '肩背轻活动',
        paragraphs: [
          '双手自然放在身体两侧，缓慢向后画圈数次，再向前画圈数次。',
          '幅度以舒适为准。出现疼痛、麻木或明显不适时应立即停止。'
        ]
      },
      {
        heading: '大腿后侧轻活动',
        paragraphs: [
          '坐在稳固椅面的前侧，一条腿缓慢向前伸展，脚跟着地，身体保持自然。',
          '不需要追求触碰脚尖，也不要把膝关节锁死。'
        ]
      }
    ]
  },
  {
    id: 'stretch-2',
    category: 'stretch',
    categoryName: '居家简易拉伸',
    title: '把短时活动安排进一个普通工作日',
    excerpt: '用接水、午休和下班后的三个小节点，建立可持续的活动习惯。',
    readTime: '3 分钟',
    theme: 'purple',
    sections: [
      {
        heading: '上午：接水时顺路走动',
        paragraphs: [
          '接水时不急着返回座位，可以沿着安全通道慢走一小圈。',
          '目标不是完成高强度运动，而是减少连续静坐时间。'
        ]
      },
      {
        heading: '午间：饭后轻松步行',
        paragraphs: [
          '饭后根据自身情况安排轻松步行，避开炎热、湿滑或交通复杂的路段。',
          '如身体不适，应停止活动并咨询专业人员。'
        ]
      },
      {
        heading: '晚间：少量整理和舒展',
        paragraphs: [
          '睡前可选择两三组舒适、缓慢的活动，不必追求疲劳感。',
          '规律、适量和可持续，比临时一次大量活动更容易融入生活。'
        ]
      }
    ]
  }
]

function getArticle(id) {
  return ARTICLES.find((item) => item.id === id) || null
}

module.exports = {
  ARTICLE_CATEGORIES,
  ARTICLES,
  DISCLAIMER,
  getArticle
}
