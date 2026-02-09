# Masterstrokes - AI-Powered Art Education Game

一个基于 AI 的互动艺术教育游戏，通过两阶段学习系统（探索 + 测验）帮助用户深入理解艺术作品。

## 🎮 核心功能

- **Learning Phase**: 平移缩放画作，点击发现关键细节
- **Quiz Phase**: 重构画作，测试学习成果
- **AI Content Generation**: 从 Google Sheets 自动生成游戏内容
- **Responsive Design**: 移动端 + 桌面端双系统

---

## 📋 目录

1. [快速开始](#快速开始)
2. [Google Sheets 配置](#google-sheets-配置)
3. [Google Apps Script 设置](#google-apps-script-设置)
4. [示例数据](#示例数据-10-个精选画作)
5. [开发指南](#开发指南)

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Google 账号（用于 Sheets API）

### 安装步骤

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd Masterstrokes

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入 Google Sheets API 凭证

# 4. 启动开发服务器
npm run dev

# 5. 访问应用
# 浏览器打开 http://localhost:5173
```

---

## 📊 Google Sheets 配置

### Step 1: 创建 Google Sheet

1. 访问 [Google Sheets](https://sheets.google.com)
2. 点击 **"空白"** 创建新表格
3. 重命名为 `Masterstrokes Content`

### Step 2: 创建三个工作表

#### Sheet 1: `Artworks`

| artwork_id | title | artist | image_url | era |
|------------|-------|--------|-----------|-----|
| girl-pearl-earring | Girl with a Pearl Earring | Johannes Vermeer | https://upload.wikimedia.org/... | Dutch Golden Age |

**列说明：**
- `artwork_id`: 唯一标识符（小写，用连字符）
- `title`: 作品标题
- `artist`: 艺术家名字
- `image_url`: 高清图片 URL（推荐 Wikimedia Commons）
- `era`: 艺术时期

#### Sheet 2: `LearningPoints`

| artwork_id | point_id | label | description | ai_prompt |
|------------|----------|-------|-------------|-----------|
| girl-pearl-earring | left-eye | Left Eye | The left eye is moister than the right eye | Find the left eye of the girl in the painting |

**列说明：**
- `artwork_id`: 对应 Artworks 表的 ID
- `point_id`: 学习点唯一标识符
- `label`: 显示标签（简短）
- `description`: 教育性描述（显示在 tooltip）
- `ai_prompt`: AI 视觉识别提示词

#### Sheet 3: `QuizQuestions`

| artwork_id | point_id | question_text | correct_option_source |
|------------|----------|---------------|----------------------|
| girl-pearl-earring | left-eye | Which is the correct left eye? | original |

**列说明：**
- `artwork_id`: 对应 Artworks 表的 ID
- `point_id`: 对应 LearningPoints 表的 ID
- `question_text`: 测验问题
- `correct_option_source`: `original`（从原图裁切）或 `custom`（自定义）

### Step 3: 获取 Sheet ID

1. 打开你的 Google Sheet
2. 查看 URL：`https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
3. 复制 `{SHEET_ID}` 部分
4. 保存到 `.env` 文件：
   ```
   VITE_GOOGLE_SHEET_ID=你的SHEET_ID
   ```

---

## 🔧 Google Apps Script 设置

### Step 1: 创建 Apps Script 项目

1. 在 Google Sheet 中，点击 **扩展程序 > Apps Script**
2. 删除默认代码，粘贴以下代码：

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // 获取所有工作表数据
  const artworks = getSheetData(sheet.getSheetByName('Artworks'));
  const learningPoints = getSheetData(sheet.getSheetByName('LearningPoints'));
  const quizQuestions = getSheetData(sheet.getSheetByName('QuizQuestions'));
  
  // 返回 JSON
  const output = {
    artworks: artworks,
    learningPoints: learningPoints,
    quizQuestions: quizQuestions
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}
```

### Step 2: 部署为 Web App

1. 点击 **部署 > 新建部署**
2. 选择类型：**网页应用**
3. 配置：
   - **执行身份**: 我
   - **谁有权访问**: 任何人
4. 点击 **部署**
5. 复制 **Web 应用 URL**
6. 保存到 `.env`:
   ```
   VITE_APPS_SCRIPT_URL=你的WEB应用URL
   ```

### Step 3: 测试 API

在浏览器访问你的 Web App URL，应该看到 JSON 数据：

```json
{
  "artworks": [...],
  "learningPoints": [...],
  "quizQuestions": [...]
}
```

---

## 🎨 示例数据: 10 个精选画作

以下是可以直接复制粘贴到 Google Sheets 的示例数据。

### Artworks Sheet

```
artwork_id	title	artist	image_url	era
girl-pearl-earring	Girl with a Pearl Earring	Johannes Vermeer	https://upload.wikimedia.org/wikipedia/commons/0/0f/1665_Girl_with_a_Pearl_Earring.jpg	Dutch Golden Age
starry-night	The Starry Night	Vincent van Gogh	https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg	Post-Impressionism
mona-lisa	Mona Lisa	Leonardo da Vinci	https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg	Renaissance
the-scream	The Scream	Edvard Munch	https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg	Expressionism
birth-of-venus	The Birth of Venus	Sandro Botticelli	https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg	Renaissance
great-wave	The Great Wave off Kanagawa	Katsushika Hokusai	https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/1280px-The_Great_Wave_off_Kanagawa.jpg	Ukiyo-e
american-gothic	American Gothic	Grant Wood	https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg/800px-Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg	Regionalism
last-supper	The Last Supper	Leonardo da Vinci	https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/%C3%9Altima_Cena_-_Da_Vinci_5.jpg/1280px-%C3%9Altima_Cena_-_Da_Vinci_5.jpg	Renaissance
persistence-memory	The Persistence of Memory	Salvador Dalí	https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg	Surrealism
night-watch	The Night Watch	Rembrandt	https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1280px-The_Night_Watch_-_HD.jpg	Dutch Golden Age
```

### LearningPoints Sheet

```
artwork_id	point_id	label	description	ai_prompt
girl-pearl-earring	pearl-earring	Pearl Earring	The iconic pearl earring that gives the painting its name, painted with remarkable luminosity	Locate the pearl earring on the girl's left ear
girl-pearl-earring	turban	Blue Turban	The exotic blue and yellow turban creates a striking contrast with the dark background	Find the blue and yellow turban on the girl's head
girl-pearl-earring	eye-contact	Direct Gaze	The girl's enigmatic gaze directly engages the viewer, creating an intimate connection	Identify the girl's eyes looking at the viewer
starry-night	swirling-sky	Swirling Sky	Van Gogh's signature swirling brushstrokes create dynamic movement in the night sky	Find the swirling patterns in the night sky
starry-night	cypress-tree	Cypress Tree	The dark cypress tree in the foreground reaches toward the sky like a flame	Locate the tall dark cypress tree
starry-night	village	Peaceful Village	The quiet village below contrasts with the turbulent sky above	Find the small village with the church steeple
mona-lisa	enigmatic-smile	Enigmatic Smile	The world's most famous smile, achieved through sfumato technique	Locate Mona Lisa's subtle smile
mona-lisa	landscape	Distant Landscape	The mysterious landscape background uses aerial perspective	Find the landscape behind Mona Lisa
mona-lisa	hands	Folded Hands	The gracefully positioned hands demonstrate Leonardo's anatomical mastery	Identify Mona Lisa's folded hands
the-scream	screaming-figure	Screaming Figure	The agonized figure represents existential anxiety and modern alienation	Find the screaming figure in the foreground
the-scream	wavy-sky	Wavy Sky	The undulating sky mirrors the figure's emotional turmoil	Locate the wavy orange and red sky
the-scream	bridge	Wooden Bridge	The diagonal bridge creates depth and leads the eye into the composition	Find the wooden bridge railing
birth-of-venus	venus	Venus	The goddess of love emerges from the sea on a shell, symbolizing divine beauty	Locate Venus standing on the shell
birth-of-venus	shell	Scallop Shell	The large scallop shell serves as Venus's vessel from the sea	Find the scallop shell beneath Venus
birth-of-venus	zephyr	Zephyr	The wind god Zephyr blows Venus toward shore	Identify the winged figure on the left
great-wave	giant-wave	Giant Wave	The towering wave threatens to engulf the boats, showing nature's power	Find the large wave dominating the composition
great-wave	mount-fuji	Mount Fuji	Sacred Mount Fuji appears small in the background, contrasting with the wave	Locate Mount Fuji in the distance
great-wave	boats	Fishing Boats	Three boats with rowers struggle against the massive wave	Find the boats beneath the wave
american-gothic	pitchfork	Pitchfork	The three-pronged pitchfork echoes the window pattern and symbolizes rural labor	Locate the pitchfork held by the farmer
american-gothic	gothic-window	Gothic Window	The pointed arch window gives the painting its name and adds vertical emphasis	Find the distinctive pointed window
american-gothic	stern-faces	Stern Expressions	The solemn faces reflect Midwestern stoicism and work ethic	Identify the serious expressions
last-supper	jesus	Jesus Christ	Jesus sits at the center, announcing the betrayal	Find Jesus at the center of the table
last-supper	judas	Judas	Judas clutches a money bag and recoils, identified by his position	Locate Judas leaning away from Jesus
last-supper	perspective	Linear Perspective	The ceiling beams demonstrate perfect one-point perspective	Find the perspective lines in the ceiling
persistence-memory	melting-clocks	Melting Clocks	The soft, melting watches symbolize the fluidity of time	Find the drooping pocket watches
persistence-memory	ants	Ants	Ants crawl on the orange watch, representing decay	Locate the ants on the watch
persistence-memory	creature	Sleeping Creature	The strange creature in the center may be a self-portrait	Find the sleeping creature-like form
night-watch	captain	Captain Cocq	The captain in black gestures forward, commanding the militia	Locate the man in black with outstretched hand
night-watch	girl-in-gold	Girl in Gold	The mysterious girl in a golden dress illuminates the scene	Find the girl in the bright yellow dress
night-watch	muskets	Muskets	The militia members carry various weapons showing military readiness	Identify the muskets and weapons
```

### QuizQuestions Sheet

```
artwork_id	point_id	question_text	correct_option_source
girl-pearl-earring	pearl-earring	Which is the correct pearl earring?	original
girl-pearl-earring	turban	Which is the correct turban?	original
girl-pearl-earring	eye-contact	Which shows the correct gaze?	original
starry-night	swirling-sky	Which shows the correct swirling pattern?	original
starry-night	cypress-tree	Which is the correct cypress tree?	original
starry-night	village	Which is the correct village?	original
mona-lisa	enigmatic-smile	Which is the correct smile?	original
mona-lisa	landscape	Which is the correct landscape?	original
mona-lisa	hands	Which are the correct hands?	original
the-scream	screaming-figure	Which is the correct screaming figure?	original
the-scream	wavy-sky	Which is the correct sky pattern?	original
the-scream	bridge	Which is the correct bridge?	original
birth-of-venus	venus	Which is the correct Venus figure?	original
birth-of-venus	shell	Which is the correct shell?	original
birth-of-venus	zephyr	Which is the correct Zephyr?	original
great-wave	giant-wave	Which is the correct wave?	original
great-wave	mount-fuji	Which is the correct Mount Fuji?	original
great-wave	boats	Which are the correct boats?	original
american-gothic	pitchfork	Which is the correct pitchfork?	original
american-gothic	gothic-window	Which is the correct window?	original
american-gothic	stern-faces	Which are the correct expressions?	original
last-supper	jesus	Which is the correct Jesus?	original
last-supper	judas	Which is the correct Judas?	original
last-supper	perspective	Which shows the correct perspective?	original
persistence-memory	melting-clocks	Which are the correct melting clocks?	original
persistence-memory	ants	Which shows the correct ants?	original
persistence-memory	creature	Which is the correct creature?	original
night-watch	captain	Which is the correct captain?	original
night-watch	girl-in-gold	Which is the correct girl in gold?	original
night-watch	muskets	Which are the correct muskets?	original
```

---

## 💻 开发指南

### 项目结构

```
Masterstrokes/
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── LearningCanvas.tsx    # 学习阶段组件
│   │   │   ├── QuizCanvas.tsx        # 测验阶段组件
│   │   │   └── ResultsScreen.tsx     # 结果页面
│   │   ├── hub/
│   │   │   ├── LevelNode.tsx         # 关卡节点
│   │   │   ├── StatusBar.tsx         # 状态栏
│   │   │   └── BottomNav.tsx         # 底部导航
│   │   └── layout/
│   │       ├── Layout.tsx            # 主布局
│   │       └── Sidebar.tsx           # 侧边栏
│   ├── pages/
│   │   ├── GamePage.tsx              # 游戏主页
│   │   ├── HubPage.tsx               # 关卡选择
│   │   └── LoginPage.tsx             # 登录页
│   ├── store/
│   │   ├── gameStore.ts              # 游戏状态管理
│   │   └── userStore.ts              # 用户状态管理
│   ├── data/
│   │   └── mockArtwork.ts            # 示例数据
│   └── services/
│       └── sheetsApi.ts              # Google Sheets API
├── public/
│   ├── assets/                       # 画作图片
│   └── quiz/                         # 测验选项图片
└── README.md
```

### 环境变量

创建 `.env` 文件：

```env
# Google Sheets
VITE_GOOGLE_SHEET_ID=你的Sheet_ID
VITE_APPS_SCRIPT_URL=你的Apps_Script_URL

# Gemini AI (可选，用于 AI 视觉识别)
VITE_GEMINI_API_KEY=你的Gemini_API_Key
```

### 可用脚本

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 生成游戏资源
node generate_game_assets.mjs
```

---

## 🚀 自动部署 (GitHub Actions)

本项目已配置 GitHub Actions 自动构建并部署到 GitHub Pages。

### 1. 配置 Secrets
在 GitHub 仓库中，进入 **Settings > Secrets and variables > Actions**，点击 **New repository secret**，添加以下变量：

- `VITE_APPS_SCRIPT_URL`: 你的 Google Apps Script Web App URL (必须)
- `VITE_GOOGLE_SHEET_ID`: 你的 Google Sheet ID (可选)
- `VITE_GEMINI_API_KEY`: 你的 Google Gemini API Key (可选)

### 2. 触发部署
任何推送到 `main` 分支的代码提交都会自动触发构建和部署流程。

### 3. 开启 GitHub Pages
部署完成后，进入 **Settings > Pages**：
- **Source**: 选择 `Deploy from a branch`
- **Branch**: 选择 `gh-pages` 分支 / `(root)`
- 点击 **Save**

稍等片刻，你的应用即可通过 `https://<username>.github.io/<repo-name>/` 访问。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT License

---

## 📞 支持

如有问题，请提交 [GitHub Issue](your-repo-url/issues)
