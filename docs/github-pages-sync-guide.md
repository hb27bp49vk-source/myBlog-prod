# 我的工作台与 myBlog：GitHub Pages 上线、数据同步与限定权限 Token 实战记录

> 本文基于“我的工作台”和 myBlog 的实际上线流程整理。截图来自实际操作过程，但不会展示 Token、密码、Gist ID 或私有数据。GitHub 的界面会更新，本文以页面名称和应选择的内容为准。

我现在把个人小项目固定为一套轻量工作流：GitHub Pages 负责公开展示，GitHub 仓库负责代码与版本，Gist 负责轻量内容同步；开发先在测试库进行，确认后再发布到正式库。

它不追求复杂后端，而是优先做到四件事：**能上线、能同步、能回退、凭据不泄露。**

![GitHub 首页：可从左侧 New 或右上角加号新建仓库](/assets/guides/github-pages-sync/01-github-home.png)

## 一、项目结构：测试库与正式库必须分开

每个项目都建立两套仓库：

```text
项目-test  → 日常开发、测试、验收
项目-prod  → 对外公开的正式版本
```

以 myBlog 为例：

```text
myBlog-test → 测试站
myBlog-prod → 正式站
```

![myBlog-test 仓库页：创建完成后，在这里检查名称、代码和 Settings 入口](/assets/guides/github-pages-sync/02-repository-page.png)

测试库只允许测试文章、占位内容和测试配置。它不能读取、复制或写回正式库的真实数据、登录状态、Token、Cookie 或浏览器缓存。正式库每次发布前都要有一个明确的、经过测试的来源版本。

## 二、GitHub Pages：把仓库文件变成网站

GitHub Pages 的作用很简单：把仓库里的静态网页文件发布成网址。

在目标仓库中进入：

```text
Settings → Pages → 选择发布分支和目录 → Save
```

之后的固定流程是：

```text
本地修改 → 本地测试 → 推送测试库 → 检查测试站
→ 验收通过 → 发布正式库 → 检查正式站
```

推送成功不等于发布成功。每次上线后至少确认：仓库文件正确、Pages 构建成功、网站能打开、手机端主要功能正常，并排除浏览器或 PWA 缓存造成的旧页面。

## 三、内容同步：GitHub/Gist 适合“小而可控”的数据

GitHub 仓库或 Gist 可以用来同步文章、标签、配置和非敏感偏好。myBlog 的维护台把内容维护和页面发布分开，先在账号管理中确认 Gist 连接状态。

![myBlog 维护台账号管理：选择账号后可查看登录和 Gist 连接状态](/assets/guides/github-pages-sync/03-blog-admin-account.png)

新设备建立同步账号时，维护台会要求登录账号、账号名称、Token、Gist ID 与加密口令。

![新增云同步账号窗口：只展示所需字段，绝不展示真实凭据](/assets/guides/github-pages-sync/04-add-sync-account.png)

适合同步：公开文章、非敏感 JSON/Markdown、已加密且有备份的小体量内容。

不适合放入公开仓库或公开 Gist：Token、密码、Cookie、登录会话、隐私原文、证件或财务数据、未加密数据库。

## 四、新增关键步骤：创建“限定权限”的 Fine-grained Token

Token 相当于可以调用 GitHub API 的密码。它的经验不是“创建一个万能 Token”，而是：**只让它访问需要的两个仓库，只给它完成当前任务所需的权限。**

### 第 1 步：从 myBlog 维护台进入创建页面

打开 myBlog 测试维护台，依次进入：

```text
账号管理 → 选择当前账号 → 更新发布凭据 → 创建限定权限的 Token
```

或者直接在 GitHub 中进入：

```text
右上角头像 → Settings → Developer settings
→ Personal access tokens → Fine-grained tokens → Generate new token
```

> 如果页面左侧同时出现 `Fine-grained tokens` 和 `Tokens (classic)`，请选择前者。Classic Token 的权限范围更宽，不是这里的首选。

### 第 2 步：填写基本信息

| 字段 | 建议填写 |
| --- | --- |
| Token name | `myBlog Admin` 或清晰说明用途的名称 |
| Description | 例如“用于 myBlog 内容同步与发布” |
| Resource owner | 选择拥有两个 myBlog 仓库的 GitHub 账号 |
| Expiration | 推荐 90 天或自己能定期更换的期限；到期前重新创建并绑定 |

不要把 Token 名称写成模糊的“token”“test”或“new”。将来撤销或排查时，清晰的用途名称非常重要。

### 第 3 步：只选择两个目标仓库

在 **Repository access** 中选择：

```text
Only select repositories
```

然后只勾选：

```text
myBlog-test
myBlog-prod
```

不要选择 `All repositories`。限定到两个仓库后，即使这个 Token 日后泄露，它也不能触及账号下的其他项目。

### 第 4 步：设置最小权限

在 **Repository permissions** 中找到并设置：

```text
Contents → Read and write
```

它用于读取和写入博客内容文件。其他仓库权限保持 `No access`。

如果本次 Token 还需要通过 Gist 同步内容，再在 **Account permissions** 中设置：

```text
Gists → Read and write
```

除这两项外，其他权限都不需要开启。`Write` 已经包含对应的 `Read`，不需要重复授权。

### 第 5 步：生成、复制、立即安全保存

检查无误后点击 **Generate token**。GitHub 只会完整显示一次 Token；复制后立刻回到维护台，在“更新发布凭据”中粘贴并执行“验证并保存”。

以下行为都不允许：

- 不把 Token 发到聊天窗口；
- 不把 Token 截图、写进博客文章或保存到记事本；
- 不把 Token 写入 HTML、JavaScript、公开仓库、公开 Gist 或 localStorage；
- 不用同一个宽权限 Token 管理全部项目。

维护台验证成功后，应检查它能访问 `myBlog-test`、`myBlog-prod` 和当前 Gist。若验证失败，先检查仓库选择和 `Contents` / `Gists` 权限，不要重新创建一批更宽权限的 Token。

### 第 6 步：到期、更换或怀疑泄露时

Token 到期前，先创建一个新的限定权限 Token 并完成维护台验证，再撤销旧 Token，避免同步或发布中断。

一旦怀疑 Token 泄露，立即撤销旧 Token，重新创建新的 Token，并检查代码历史、公开 Gist、网页源码与浏览器存储。仅仅删除代码中的 Token 并不能让旧 Token 自动失效。

GitHub 官方的 Fine-grained Token 说明可参考：[Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)。

## 五、myBlog 的日常发布顺序

1. 在维护台新建或修改内容，并先保存草稿。
2. 选择“测试库”，发布到 `myBlog-test`。
3. 打开测试博客，检查内容、链接、图片和手机端显示。
4. 记录当前正式库的提交版本，作为回退点。
5. 确认无误后，切换到“正式库”。
6. 完成“正式发布”文字确认后发布。
7. 打开正式博客，确认实际页面可用。

这条顺序不能省略测试站验证，也不能为了方便让测试环境接触正式数据。

## 六、我的发布前检查清单

- [ ] 改动只发生在测试库；
- [ ] 测试站已验证；
- [ ] 正式数据、Token、Cookie 没有进入测试库；
- [ ] Token 是 Fine-grained Token；
- [ ] Token 仅选择 `myBlog-test` 和 `myBlog-prod`；
- [ ] `Contents` 已设置为 `Read and write`；
- [ ] 只有确实使用 Gist 同步时才开启 `Gists: Read and write`；
- [ ] 已记录正式库可回退的提交版本；
- [ ] 发布后已打开正式站检查。

## 结语

GitHub Pages 加 GitHub/Gist 同步的价值，不只是免费上线一个网页，而是建立一套简单、可追踪、可回退的个人项目工作方式。真正值得复用的是：测试与正式分离、同步数据有边界、Token 只给最小权限、上线后必须验证。
