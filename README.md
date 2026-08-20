# loon-icons

个人 Loon 策略组图标库。配置里所有 `img-url` 指向本仓库，换图标只需更新本仓库文件，配置无需改动。

## 目录结构

```
loon-icons/
├── README.md
├── build.js          # 图标构建脚本（node + sharp，统一风格合成）
├── package.json      # sharp 依赖（npm install 后即可构建）
├── src/              # SVG 素材（simple-icons 品牌 / flag-icons 国旗 / FontAwesome 补位）
└── icons/            # 生成的 512×512 PNG（Loon 直接引用）
    ├── ChatGPT.png   # AI 组
    ├── GitHub.png    # GitHub 组
    ├── X.png         # Twitter(X) 组
    ├── Reddit.png    # Reddit 组
    ├── Telegram.png  # Telegram 组
    ├── YouTube.png   # YouTube 组
    ├── HK/TW/JP/KR/SG/US.png   # 各国手动/自动组
    ├── Global.png    # 全球手动节点
    └── Final.png     # 兜底后备策略
```

## 设计规范（品牌色徽章）

- **版式**：512×512 透明背景，内容居中
- **品牌图标**：ChatGPT 使用官方黑色 Monoblossom + 白色圆角方块；其他品牌使用品牌色圆角方块 + 白色字形
- **功能图标**：蓝色 Global、紫色 Final，与品牌图标使用相同的圆角方块和光影
- **国旗**：原色方形裁切 + 圆角描边；台湾、新加坡、美国旗帜采用左侧焦点，避免裁掉关键图案
- **小尺寸优先**：主体占画布约 81%，针对 Loon 列表中的 32–44 px 显示尺寸优化

## 配置引用方式

```
img-url = https://raw.githubusercontent.com/liuzhihang/loon-icons/main/icons/ChatGPT.png
```

GitHub raw 有 CDN 缓存，替换图片后最长约 5 分钟生效；Loon 内手动刷新配置即可拉到新图。

## 如何换图标

### 只换单个图标

1. 找 SVG 素材（推荐来源见下），放进 `src/`（文件名随意）
2. 编辑 `build.js` 里的映射（如把 `ChatGPT.png` 对应的素材换成新文件）
3. 重新生成：`npm install && node build.js`
4. 上传覆盖 `icons/` 下同名 PNG，Loon 刷新配置即可，配置文件不用动

### 换风格（改色 / 改尺寸）

编辑 `build.js` 顶部的 `TILE_SIZE`、`TILE_RADIUS`，或 `logos` 映射中的渐变色、`ink` 与 `scale`，重新生成。

## 推荐图标素材源

| 源 | 说明 | 链接 |
|---|---|---|
| simple-icons | 品牌单色 SVG，覆盖极全（openai/github/x/reddit/telegram/youtube…） | `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/<slug>.svg` |
| FontAwesome Free | 通用功能图标（globe/shield 等），CC BY 4.0 | `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/svgs/solid/<name>.svg` |
| flag-icons | 国旗 SVG（4:3 与 1:1） | `https://cdn.jsdelivr.net/npm/flag-icons@latest/flags/4x3/<cc>.svg` |
| 阿里 iconfont | 中文生态图标，需登录下载 SVG | https://www.iconfont.cn |
| luestr/IconResource | 可莉 App/国旗图标 PNG | https://github.com/luestr/IconResource |
| Koolson/Qure | Qure 图标集 PNG | https://github.com/Koolson/Qure |

## 当前素材来源

- ChatGPT：OpenAI Developers 官方 `OpenAI-black-monoblossom.svg`
- 其他品牌：simple-icons（github、x、reddit、telegram、youtube）
- 功能：FontAwesome Free（globe→Global、shield-halved→Final）
- 国旗：flag-icons 4:3（hk/tw/jp/kr/sg/us）

## 上传到 GitHub（网页版）

1. GitHub 新建仓库 `loon-icons`（Public）
2. 仓库页 → Add file → Upload files，把 `icons/`、`src/`、`build.js`、`README.md` 全部拖进去
3. Commit 后访问 `https://raw.githubusercontent.com/liuzhihang/loon-icons/main/icons/HK.png` 验证

### 命令行版

```bash
cd loon-icons
git init
git add .
git commit -m "init loon icons"
git branch -M main
git remote add origin https://github.com/liuzhihang/loon-icons.git
git push -u origin main
```

## 可选升级：Loon 图标集订阅

图标多起来后，可把 `icons/` 打包成 zip（内含 `iconset.json`，格式 `{"名称": "文件名.png"}`），在 Loon 中用 `loon://import?iconset=<zip 链接>` 订阅，之后 `img-url` 只需写图标名。当前配置用完整 raw URL，无需图标集也能工作。
