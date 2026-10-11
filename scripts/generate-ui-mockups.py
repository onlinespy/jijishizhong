from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


W, H = 375, 812
PRIMARY = (47, 114, 87)
LIGHT = (230, 241, 237)
WHITE = (255, 255, 255)
LINE = (238, 238, 238)
TEXT = (51, 51, 51)
MUTED = (119, 119, 119)
HINT = (153, 153, 153)
PAGE = (255, 255, 255)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT.parent / "记记食钟-UI效果图"
ICON_DIR = ROOT / "miniprogram" / "assets" / "tabbar"
FONT_REGULAR = "C:/Windows/Fonts/msyh.ttc"
FONT_BOLD = "C:/Windows/Fonts/msyhbd.ttc"


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)


def text(draw, xy, value, size=14, color=TEXT, bold=False, anchor="la"):
    draw.text(xy, value, font=font(size, bold), fill=color, anchor=anchor)


def wrap(draw, value, x, y, width, size=14, color=TEXT, line_height=22, max_lines=None):
    current = ""
    lines = []
    for char in value:
        candidate = current + char
        if draw.textlength(candidate, font=font(size)) <= width:
            current = candidate
        else:
            lines.append(current)
            current = char
    if current:
        lines.append(current)
    if max_lines:
        lines = lines[:max_lines]
    for index, line in enumerate(lines):
        text(draw, (x, y + index * line_height), line, size, color)
    return y + len(lines) * line_height


def card(draw, x, y, width, height, fill=WHITE, radius=12):
    draw.rounded_rectangle(
        (x + 1, y + 2, x + width + 1, y + height + 2),
        radius=radius,
        fill=(250, 250, 250),
    )
    draw.rounded_rectangle(
        (x, y, x + width, y + height),
        radius=radius,
        fill=fill,
        outline=LINE,
        width=1,
    )


def nav(draw, title):
    text(draw, (W / 2, 24), title, 18, TEXT, True, "mm")


def tabbar(img, active):
    draw = ImageDraw.Draw(img)
    top = H - 76
    draw.line((0, top, W, top), fill=LINE, width=1)
    labels = [("home", "首页"), ("records", "记录"), ("articles", "科普"), ("profile", "我的")]
    item_w = W / 4
    for index, (key, label) in enumerate(labels):
        x0 = index * item_w + 6
        x1 = (index + 1) * item_w - 6
        if key == active:
            draw.rounded_rectangle((x0, top + 8, x1, H - 6), radius=8, fill=LIGHT)
        icon_path = ICON_DIR / f"{key}{'-active' if key == active else ''}.png"
        icon = Image.open(icon_path).convert("RGBA").resize((28, 28))
        img.alpha_composite(icon, (int((x0 + x1) / 2 - 14), top + 12))
        text(
            draw,
            ((x0 + x1) / 2, H - 15),
            label,
            12,
            PRIMARY if key == active else MUTED,
            key == active,
            "mm",
        )


def chip(draw, x, y, label, active=False, width=None):
    if width is None:
        width = max(70, int(draw.textlength(label, font=font(14))) + 22)
    draw.rounded_rectangle((x, y, x + width, y + 32), radius=8, fill=PRIMARY if active else WHITE, outline=PRIMARY)
    text(draw, (x + width / 2, y + 16), label, 14, WHITE if active else MUTED, False, "mm")
    return width


def chip_row(draw, labels, y, active_index=0):
    x = 16
    for index, label in enumerate(labels):
        width = chip(draw, x, y, label, index == active_index)
        x += width + 8
    return y + 40


def button(draw, x, y, width, label, secondary=False):
    draw.rounded_rectangle((x, y, x + width, y + 44), radius=8, fill=WHITE if secondary else PRIMARY, outline=PRIMARY)
    text(draw, (x + width / 2, y + 22), label, 14, PRIMARY if secondary else WHITE, True, "mm")
    return y + 44


def section(draw, title, y, note=""):
    text(draw, (16, y), title, 16, TEXT, True)
    if note:
        text(draw, (359, y + 1), note, 12, HINT, False, "ra")
    return y + 28


def list_row(draw, x, y, width, symbol, title, note, value=""):
    draw.line((x, y + 52, x + width, y + 52), fill=LINE, width=1)
    draw.rounded_rectangle((x, y + 10, x + 32, y + 42), radius=8, fill=LIGHT)
    text(draw, (x + 16, y + 26), symbol, 12, PRIMARY, True, "mm")
    text(draw, (x + 44, y + 10), title, 14, TEXT, True)
    text(draw, (x + 44, y + 30), note, 12, HINT)
    if value:
        text(draw, (x + width, y + 26), value, 12, TEXT, True, "rm")


def base_page(title, top_content, active=None):
    image = Image.new("RGBA", (W, H), PAGE + (255,))
    draw = ImageDraw.Draw(image)
    nav(draw, title)
    top_content(image, draw)
    if active:
        tabbar(image, active)
    return image.convert("RGB")


def dashboard(image, draw):
    text(draw, (16, 58), "10月11日 周日", 12, MUTED)
    y = 76
    card(draw, 16, y, 343, 220)
    draw.rounded_rectangle((16, y, 24, y + 220), radius=4, fill=PRIMARY)
    text(draw, (40, y + 16), "轻断食计划", 16, TEXT, True)
    text(draw, (40, y + 42), "16+8 · 12:00 - 20:00", 12, HINT)
    draw.rounded_rectangle((300, y + 16, 343, y + 38), radius=8, fill=LIGHT)
    text(draw, (321, y + 27), "记录中", 12, PRIMARY, True, "mm")
    draw.rounded_rectangle((40, y + 66, 327, y + 130), radius=12, fill=LIGHT)
    text(draw, (56, y + 82), "当前为断食窗口", 14, TEXT, True)
    text(draw, (56, y + 106), "可正常饮水，如有不适请停止", 12, HINT)
    text(draw, (311, y + 98), "08:26:15", 12, PRIMARY, True, "ra")
    button(draw, 40, y + 150, 135, "调整计划", True)
    button(draw, 185, y + 150, 142, "记录今日完成")
    text(draw, (187, y + 208), "停止当前计划", 12, HINT, False, "mm")

    y = 316
    text(draw, (16, y), "喝水记录", 16, TEXT, True)
    text(draw, (359, y), "目标 2000ml", 12, HINT, False, "ra")
    y += 26
    card(draw, 16, y, 343, 190)
    draw.arc((40, y + 28, 120, y + 108), -90, 198, fill=(76, 127, 163), width=10)
    draw.arc((40, y + 28, 120, y + 108), 198, 270, fill=(232, 242, 248), width=10)
    text(draw, (80, y + 62), "1600", 20, (76, 127, 163), True, "mm")
    text(draw, (80, y + 86), "ml", 12, MUTED, False, "mm")
    text(draw, (140, y + 28), "80%", 20, (76, 127, 163), True)
    text(draw, (140, y + 58), "按每日目标记录", 12, HINT)
    chip(draw, 140, y + 80, "+200ml", False, 62)
    chip(draw, 208, y + 80, "+300ml", False, 62)
    chip(draw, 276, y + 80, "+500ml", False, 62)
    draw.line((48, y + 128, 327, y + 128), fill=LINE)
    text(draw, (48, y + 144), "喝水提醒", 14, TEXT, True)
    text(draw, (48, y + 166), "已授权 · 可随时关闭", 12, HINT)
    text(draw, (230, y + 154), "撤销上一次", 12, (76, 127, 163), False, "rm")
    draw.rounded_rectangle((292, y + 144, 336, y + 170), radius=13, fill=PRIMARY)
    draw.ellipse((314, y + 147, 332, y + 165), fill=WHITE)

    y = 548
    for x, title, value in [(16, "摄入热量", "1280"), (195, "运动消耗", "260")]:
        card(draw, x, y, 164, 90)
        if title == "运动消耗":
            draw.rounded_rectangle((x, y, x + 164, y + 6), radius=3, fill=(76, 127, 163))
        else:
            draw.rounded_rectangle((x, y, x + 164, y + 6), radius=3, fill=PRIMARY)
        text(draw, (x + 16, y + 14), title, 16, TEXT, True)
        text(draw, (x + 16, y + 44), value, 26, (76, 127, 163) if title == "运动消耗" else PRIMARY, True)
        text(draw, (x + 16, y + 72), "kcal", 12, HINT)

    y = 654
    card(draw, 16, y, 343, 76)
    text(draw, (187, y + 14), "今日热量差额", 16, TEXT, True, "mm")
    text(draw, (187, y + 40), "1020", 24, (217, 154, 61), True, "mm")


def records_base(image, draw, exercise=False):
    text(draw, (16, 58), "10月11日 周日", 12, MUTED)
    chip(draw, 16, 82, "饮食", not exercise, 164)
    chip(draw, 195, 82, "运动", exercise, 164)
    chip(draw, 16, 124, "体重记录", False, 164)
    chip(draw, 195, 124, "经期记录", False, 164)
    y = 180
    card(draw, 16, y, 343, 474 if not exercise else 388)
    text(draw, (32, y + 16), "添加运动" if exercise else "添加饮食", 16, TEXT, True)
    if not exercise:
        text(draw, (32, y + 50), "餐次", 14, TEXT, True)
        chip_row(draw, ["早餐", "午餐", "晚餐", "加餐"], y + 74, 0)
        text(draw, (32, y + 130), "录入方式", 14, TEXT, True)
        draw.rounded_rectangle((32, y + 154, 327, y + 198), radius=8, fill=LINE)
        button(draw, 36, y + 158, 145, "基础食物库", True)
        button(draw, 181, y + 158, 142, "手动录入", True)
        text(draw, (32, y + 216), "搜索食物", 14, TEXT, True)
        draw.rounded_rectangle((32, y + 240, 327, y + 284), radius=8, fill=WHITE, outline=LINE)
        text(draw, (44, y + 262), "搜索食物名称", 14, HINT, False, "lm")
        chip_row(draw, ["主食", "肉蛋奶"], y + 300, 0)
        for index, (name, kcal) in enumerate([("米饭", "116 kcal/100g"), ("馒头", "223 kcal/100g"), ("燕麦片", "377 kcal/100g"), ("红薯", "86 kcal/100g")]):
            col = index % 2
            row = index // 2
            x = 32 + col * 151
            yy = y + 350 + row * 78
            draw.rounded_rectangle((x, yy, x + 135, yy + 62), radius=12, fill=WHITE, outline=LINE)
            text(draw, (x + 12, yy + 12), name, 14, TEXT, True)
            text(draw, (x + 12, yy + 36), kcal, 12, HINT)
        button(draw, 32, y + 516, 295, "保存饮食记录")
        text(draw, (16, 680), "当日饮食", 16, TEXT, True)
        card(draw, 16, 708, 343, 92)
        list_row(draw, 32, 716, 311, "早", "燕麦牛奶", "早餐 · 1份", "310 kcal")
    else:
        text(draw, (32, y + 50), "录入方式", 14, TEXT, True)
        draw.rounded_rectangle((32, y + 74, 327, y + 118), radius=8, fill=LINE)
        button(draw, 36, y + 78, 145, "基础运动库", True)
        button(draw, 181, y + 78, 142, "自定义运动", True)
        labels = ["快走", "慢跑", "健身操", "骑行"]
        for index, label in enumerate(labels):
            col = index % 2
            row = index // 2
            x = 32 + col * 151
            yy = y + 140 + row * 88
            draw.rounded_rectangle((x, yy, x + 135, yy + 72), radius=12, fill=LIGHT if index == 0 else WHITE, outline=PRIMARY if index == 0 else LINE)
            text(draw, (x + 67, yy + 26), label, 14, PRIMARY if index == 0 else TEXT, index == 0, "mm")
            text(draw, (x + 67, yy + 50), "约 4.3 MET", 12, HINT, False, "mm")
        text(draw, (32, y + 326), "运动时长（分钟）", 14, TEXT, True)
        draw.rounded_rectangle((32, y + 350, 327, y + 394), radius=8, fill=WHITE, outline=LINE)
        text(draw, (44, y + 372), "35", 14, TEXT, False, "lm")
        draw.rounded_rectangle((32, y + 418, 327, y + 480), radius=12, fill=LIGHT)
        text(draw, (48, y + 436), "参考运动消耗", 14, TEXT, True)
        text(draw, (48, y + 458), "按档案体重估算，仅作记录参考", 12, HINT)
        text(draw, (311, y + 448), "158 kcal", 16, PRIMARY, True, "rm")
        button(draw, 32, y + 500, 295, "保存运动记录")


def articles(image, draw):
    chip(draw, 16, 66, "全部", True, 96)
    chip(draw, 120, 66, "久坐办公体态", False, 150)
    items = [
        ("久坐办公时，先把屏幕和椅子调顺", "3 分钟"),
        ("久坐间隙可以做的三个轻动作", "4 分钟"),
        ("日常站立时，重心不要总压在一条腿上", "3 分钟"),
        ("站立办公并不等于站得越久越好", "3 分钟"),
        ("居家轻拉伸：从呼吸和缓慢动作开始", "4 分钟"),
        ("把短时活动安排进一个普通工作日", "3 分钟"),
    ]
    y = 116
    accent_colors = [PRIMARY, (76, 127, 163), (217, 154, 61), (210, 110, 91), (76, 127, 163), PRIMARY]
    for index, (title, duration) in enumerate(items):
        card(draw, 16, y, 343, 72)
        draw.rounded_rectangle((16, y, 28, y + 72), radius=6, fill=accent_colors[index])
        text(draw, (44, y + 18), title, 14, TEXT, True)
        text(draw, (44, y + 44), f"体态科普 · {duration}", 12, HINT)
        text(draw, (340, y + 36), "›", 22, HINT, False, "mm")
        y += 88


def profile(image, draw):
    draw.rounded_rectangle((16, 66, 68, 118), radius=12, fill=PRIMARY)
    text(draw, (42, 92), "记", 20, WHITE, True, "mm")
    text(draw, (82, 70), "记记食钟用户", 16, TEXT, True)
    text(draw, (82, 96), "女 · 1993-05-16", 12, HINT)
    draw.rounded_rectangle((298, 72, 343, 96), radius=8, fill=LIGHT)
    text(draw, (320, 84), "3/6", 12, PRIMARY, True, "mm")
    draw.rounded_rectangle((16, 138, 359, 204), radius=12, fill=WHITE, outline=LINE)
    stats = [("165", "身高 cm"), ("57.8", "体重 kg"), ("21.2", "BMI 数值"), ("14", "记录天数")]
    for index, (value, label) in enumerate(stats):
        x = 16 + index * 86
        text(draw, (x + 43, 152), value, 16, PRIMARY, True, "mm")
        text(draw, (x + 43, 178), label, 12, HINT, False, "mm")
    menus = [
        ("档", "个人健康档案", "身高、体重、性别、生日"),
        ("历", "综合打卡日历", "回看饮食、体重、运动记录"),
        ("章", "勋章墙", "连续记录成就展示"),
        ("设", "设置", "提醒设置与数据清理"),
        ("隐", "隐私政策", "了解数据收集与使用方式"),
        ("免", "全局免责声明", "产品功能与使用边界说明"),
    ]
    y = 224
    menu_colors = [PRIMARY, (76, 127, 163), (217, 154, 61), PRIMARY, (76, 127, 163), (210, 110, 91)]
    for index, (symbol, title, note) in enumerate(menus):
        draw.rounded_rectangle((16, y + 10, 48, y + 42), radius=8, fill=menu_colors[index])
        list_row(draw, 16, y, 343, symbol, title, note)
        draw.rounded_rectangle((16, y + 10, 48, y + 42), radius=8, fill=menu_colors[index])
        text(draw, (32, y + 26), symbol, 12, WHITE, True, "mm")
        y += 72


def water_history(image, draw):
    for index, (value, label) in enumerate([("14", "记录天数"), ("2000", "每日目标 ml")]):
        x = 16 + index * 180
        card(draw, x, 66, 163, 100)
        text(draw, (x + 82, 92), value, 26, PRIMARY, True, "mm")
        text(draw, (x + 82, 133), label, 12, HINT, False, "mm")
    y = 190
    card(draw, 16, y, 343, 246)
    text(draw, (32, y + 16), "10月11日 周日", 16, TEXT, True)
    text(draw, (343, y + 16), "1600ml", 14, PRIMARY, True, "ra")
    for index, (amount, timestamp) in enumerate([("200ml", "08:00"), ("300ml", "11:00"), ("500ml", "14:00"), ("300ml", "17:00")]):
        yy = y + 58 + index * 42
        draw.line((32, yy + 34, 343, yy + 34), fill=LINE)
        text(draw, (32, yy), f"喝水 {amount}", 14, TEXT)
        text(draw, (343, yy), timestamp, 12, HINT, False, "ra")
        text(draw, (300, yy), "删除", 12, HINT, False, "ra")


def fasting_setup(image, draw):
    text(draw, (16, 64), "选择适合你的轻断食模板", 18, TEXT, True)
    text(draw, (16, 94), "仅保存进食与断食时间安排", 12, HINT)
    y = 126
    for index, (name, note) in enumerate([("16+8", "每日 8 小时进食窗口"), ("14+10", "每日 10 小时进食窗口"), ("18+6", "每日 6 小时进食窗口"), ("5+2", "每周 2 天计划记录")]):
        col = index % 2
        row = index // 2
        x = 16 + col * 180
        yy = y + row * 110
        draw.rounded_rectangle((x, yy, x + 163, yy + 94), radius=12, fill=LIGHT if index == 0 else WHITE, outline=PRIMARY if index == 0 else LINE)
        text(draw, (x + 16, yy + 16), name, 18, PRIMARY if index == 0 else TEXT, True)
        wrap(draw, note, x + 16, yy + 52, 130, 12, HINT, 18, 2)
    card(draw, 16, 358, 343, 190)
    text(draw, (32, 374), "进食窗口", 16, TEXT, True)
    text(draw, (343, 374), "恢复模板", 12, PRIMARY, False, "ra")
    for index, value in enumerate(["12:00", "20:00"]):
        x = 32 + index * 152
        draw.rounded_rectangle((x, 408, x + 135, 452), radius=8, fill=WHITE, outline=LINE)
        text(draw, (x + 67, 430), value, 14, TEXT, False, "mm")
    draw.rounded_rectangle((32, 472, 327, 526), radius=12, fill=LIGHT)
    text(draw, (48, 488), "进食窗口", 12, HINT)
    text(draw, (48, 506), "8 小时", 14, TEXT, True)
    text(draw, (311, 488), "其余时间", 12, HINT, False, "ra")
    text(draw, (311, 506), "16 小时", 14, PRIMARY, True, "ra")
    button(draw, 16, 578, 343, "更新计划")
    text(draw, (187, 650), "停止当前轻断食计划", 12, HINT, False, "mm")


def calendar(image, draw):
    card(draw, 16, 66, 343, 390)
    text(draw, (72, 88), "‹", 20, PRIMARY, False, "mm")
    text(draw, (187, 88), "2026年10月", 16, TEXT, True, "mm")
    text(draw, (303, 88), "›", 20, PRIMARY, False, "mm")
    for index, day in enumerate(["日", "一", "二", "三", "四", "五", "六"]):
        text(draw, (38 + index * 48, 122), day, 12, MUTED, False, "mm")
    for index in range(35):
        day = index - 2
        x = 24 + (index % 7) * 48
        y = 148 + (index // 7) * 48
        if day > 0 and day <= 31:
            if day == 11:
                draw.rounded_rectangle((x - 16, y - 6, x + 16, y + 32), radius=8, fill=PRIMARY)
                color = WHITE
            else:
                color = TEXT
            text(draw, (x, y + 4), str(day), 12, color, False, "mm")
            if day in (8, 9, 10, 11):
                draw.ellipse((x - 5, y + 22, x - 1, y + 26), fill=PRIMARY)
                draw.ellipse((x + 3, y + 22, x + 7, y + 26), fill=PRIMARY)
    text(draw, (16, 486), "10月11日 周日", 16, TEXT, True)
    card(draw, 16, 516, 343, 142)
    list_row(draw, 32, 524, 311, "水", "喝水 1600ml", "当日累计记录")
    list_row(draw, 32, 594, 311, "食", "摄入 1280 kcal", "运动消耗 260 kcal")


def badges(image, draw):
    card(draw, 16, 66, 343, 118)
    text(draw, (32, 82), "记录成就", 12, MUTED)
    text(draw, (32, 108), "3 枚勋章已解锁", 18, TEXT, True)
    text(draw, (32, 144), "勋章仅根据记录自动展示", 12, HINT)
    names = ["习惯起步", "一周坚持", "稳定记录", "规律饮水", "体重观察", "记录达人"]
    for index, name in enumerate(names):
        col = index % 2
        row = index // 2
        x = 16 + col * 180
        y = 204 + row * 154
        card(draw, x, y, 163, 138)
        medal_color = [PRIMARY, (76, 127, 163), (217, 154, 61), PRIMARY, (210, 110, 91), (217, 154, 61)][index] if index < 3 else LINE
        draw.ellipse((x + 56, y + 16, x + 108, y + 68), fill=medal_color)
        text(draw, (x + 82, y + 42), str(index + 3), 16, WHITE if index < 3 else HINT, True, "mm")
        text(draw, (x + 82, y + 84), name, 14, TEXT if index < 3 else HINT, True, "mm")
        text(draw, (x + 82, y + 110), "已解锁" if index < 3 else "继续记录解锁", 12, HINT, False, "mm")


def profile_edit(image, draw):
    card(draw, 16, 66, 343, 430)
    y = 82
    for label, value in [("称呼", "记记食钟用户"), ("性别", "女"), ("生日", "1993-05-16")]:
        text(draw, (32, y), label, 14, TEXT, True)
        draw.rounded_rectangle((32, y + 26, 327, y + 70), radius=8, fill=WHITE, outline=LINE)
        text(draw, (44, y + 48), value, 14, TEXT if label != "性别" else PRIMARY, False, "lm")
        y += 98
    for index, (label, value) in enumerate([("身高 cm", "165"), ("体重 kg", "57.8")]):
        x = 32 + index * 152
        text(draw, (x, y), label, 14, TEXT, True)
        draw.rounded_rectangle((x, y + 26, x + 135, y + 70), radius=8, fill=WHITE, outline=LINE)
        text(draw, (x + 67, y + 48), value, 14, TEXT, False, "mm")
    draw.rounded_rectangle((32, y + 94, 327, y + 158), radius=12, fill=LIGHT)
    text(draw, (48, y + 112), "BMI 数值", 14, TEXT, True)
    text(draw, (48, y + 136), "仅展示计算结果", 12, HINT)
    text(draw, (311, y + 126), "21.2", 18, PRIMARY, True, "rm")
    card(draw, 16, 516, 343, 92)
    text(draw, (32, 536), "隐藏经期模块", 14, TEXT, True)
    text(draw, (32, 562), "开启后记录页不再显示经期入口", 12, HINT)
    draw.rounded_rectangle((292, 540, 336, 566), radius=13, fill=LINE)
    draw.ellipse((296, 543, 314, 561), fill=WHITE)
    button(draw, 16, 640, 343, "保存档案")


def settings(image, draw):
    text(draw, (16, 66), "订阅消息管理", 16, TEXT, True)
    draw.rounded_rectangle((298, 62, 359, 86), radius=8, fill=LIGHT)
    text(draw, (328, 74), "本地模式", 12, PRIMARY, False, "mm")
    card(draw, 16, 98, 343, 162)
    list_row(draw, 32, 108, 311, "水", "喝水提醒", "需用户主动授权", "")
    draw.rounded_rectangle((310, 130, 354, 156), radius=13, fill=PRIMARY)
    draw.ellipse((332, 133, 350, 151), fill=WHITE)
    list_row(draw, 32, 182, 311, "期", "经期提醒", "通过微信订阅消息发送", "")
    draw.rounded_rectangle((310, 204, 354, 230), radius=13, fill=LINE)
    draw.ellipse((314, 207, 332, 225), fill=WHITE)
    text(draw, (16, 296), "协议与说明", 16, TEXT, True)
    card(draw, 16, 328, 343, 144)
    list_row(draw, 32, 338, 311, "隐", "隐私政策", "数据收集、用途与删除方式")
    list_row(draw, 32, 410, 311, "免", "全局免责声明", "产品定位与使用边界")
    text(draw, (187, 526), "轻断食健康管理软件 V1.0", 12, HINT, False, "mm")


def agreement(image, draw):
    text(draw, (16, 70), "隐私政策", 18, TEXT, True)
    text(draw, (16, 102), "更新日期：2026年10月11日", 12, HINT)
    card(draw, 16, 132, 343, 98)
    wrap(draw, "记记食钟重视用户隐私。本政策说明小程序处理的数据、使用目的与用户权利。", 32, 150, 311, 14, TEXT, 22)
    sections = [
        ("一、收集的数据", "用户主动填写的身高、体重、性别、生日，以及断食、饮食、运动、喝水和经期记录。"),
        ("二、数据用途", "用于 BMI 数值计算、运动消耗估算、历史日历和记录展示。"),
        ("三、存储与安全", "未启用云开发时保存于本机；启用后按 OpenID 隔离保存。"),
    ]
    y = 258
    for title, body in sections:
        text(draw, (16, y), title, 16, TEXT, True)
        y = wrap(draw, body, 16, y + 32, 343, 14, TEXT, 24)
        draw.line((16, y + 16, 359, y + 16), fill=LINE)
        y += 44
    text(draw, (187, 750), "记记食钟健康管理软件 V1.0", 12, HINT, False, "mm")


def article_detail(image, draw):
    card(draw, 16, 66, 343, 150)
    draw.rounded_rectangle((32, 82, 102, 106), radius=8, fill=LIGHT)
    text(draw, (67, 94), "久坐办公体态", 12, PRIMARY, False, "mm")
    wrap(draw, "久坐办公时，先把屏幕和椅子调顺", 32, 118, 300, 18, TEXT, 26)
    text(draw, (32, 182), "3 分钟 · 日常科普", 12, HINT)
    y = 246
    for title, body in [
        ("让双脚有稳定支撑", "坐下后先观察双脚是否能自然踩稳地面。如果椅子偏高，可以使用脚踏。"),
        ("把常用物品放到顺手位置", "屏幕顶部与视线接近，键盘和鼠标靠近身体，可以减少前伸和耸肩。"),
    ]:
        text(draw, (16, y), title, 16, TEXT, True)
        y = wrap(draw, body, 16, y + 32, 343, 14, TEXT, 24)
        draw.line((16, y + 16, 359, y + 16), fill=LINE)
        y += 46
    text(draw, (16, 690), "温馨提示：本篇仅为日常健康科普参考，不构成医疗指导。", 12, HINT)


SCREENS = [
    ("dashboard", lambda: base_page("今日仪表盘", dashboard, "home")),
    ("records-diet", lambda: base_page("健康记录", lambda image, draw: records_base(image, draw, False), "records")),
    ("records-exercise", lambda: base_page("健康记录", lambda image, draw: records_base(image, draw, True), "records")),
    ("articles", lambda: base_page("体态科普", articles, "articles")),
    ("profile", lambda: base_page("我的", profile, "profile")),
    ("water-history", lambda: base_page("喝水历史", water_history)),
    ("fasting-setup", lambda: base_page("设置轻断食计划", fasting_setup)),
    ("calendar", lambda: base_page("综合打卡日历", calendar)),
    ("badges", lambda: base_page("勋章墙", badges)),
    ("profile-edit", lambda: base_page("个人健康档案", profile_edit)),
    ("settings", lambda: base_page("设置", settings)),
    ("agreement", lambda: base_page("隐私政策", agreement)),
    ("article-detail", lambda: base_page("久坐办公体态", article_detail)),
]


def make_contact_sheet(images):
    columns = 4
    tile_w = 290
    tile_h = 628
    gap = 20
    rows = (len(images) + columns - 1) // columns
    sheet = Image.new("RGB", (gap + columns * (tile_w + gap), gap + rows * (tile_h + gap)), LINE)
    for index, image in enumerate(images):
        thumb = image.resize((tile_w, tile_h), Image.Resampling.LANCZOS)
        x = gap + (index % columns) * (tile_w + gap)
        y = gap + (index // columns) * (tile_h + gap)
        sheet.paste(thumb, (x, y))
    return sheet


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    images = []
    for name, builder in SCREENS:
        image = builder()
        image.save(OUTPUT / f"{name}.png")
        images.append(image)
    make_contact_sheet(images).save(OUTPUT / "00-全部页面总览.png")
    print(f"Generated {len(images) + 1} UI images in {OUTPUT}")


if __name__ == "__main__":
    main()
