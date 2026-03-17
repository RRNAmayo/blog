---
name: CloudBase TTS 语音播放功能实现
overview: 在 Hexo Butterfly 博客中实现云函数 TTS 语音播放功能，包括创建 CloudBase 云函数和前端音频播放逻辑
todos:
  - id: create-tts-function
    content: 使用 [integration:tcb] 创建并部署 tts-service 云函数，调用腾讯云 TTS API
    status: pending
  - id: create-frontend-js
    content: 创建前端 audio-player.js 文件，调用云函数并使用 HTML5 Audio 播放
    status: pending
  - id: update-theme-config
    content: 在 _config.butterfly.yml 中配置 inject.bottom 引入 audio-player.js
    status: pending
    dependencies:
      - create-frontend-js
  - id: build-deploy
    content: 执行 hexo generate 构建并部署到 CloudBase 静态 hosting
    status: pending
    dependencies:
      - update-theme-config
  - id: test-verification
    content: 验证语音播放功能是否正常工作
    status: pending
    dependencies:
      - build-deploy
---

## 用户需求

用户发现部分手机浏览器不支持 Web Speech API，希望使用方案二：通过 CloudBase 云函数调用腾讯云 TTS API 实现语音合成播放功能。

## 核心功能

- 在不支持 Web Speech API 的浏览器上，通过云函数调用腾讯云 TTS API 生成音频
- 前端通过 HTML5 Audio 播放生成的音频
- 保持原有 UI 交互（点击朗读、暂停、停止按钮）
- 添加加载状态和错误提示

## 技术方案说明

1. **CloudBase 云函数**：调用腾讯云 TTS API（域名：tts.cloud.tencent.com/stream），将文本转换为音频 URL
2. **前端 JavaScript**：调用云函数，使用 HTML5 Audio 播放
3. **降级处理**：当云函数调用失败时，回退到原有 Web Speech API（如果有支持）

## 技术选型

- **云函数运行时**：Node.js 18.15（推荐）
- **TTS SDK**：腾讯云语音合成 Node.js SDK（tencentcloud-sdk-nodejs）
- **前端 SDK**：@cloudbase/js-sdk（已集成）
- **音频播放**：HTML5 Audio API

## 实现方案

### 架构设计

```
用户点击朗读 → 前端调用云函数 → 云函数调用腾讯云 TTS API → 返回音频 URL → 前端播放音频
```

### 云函数设计

- **函数名**：tts-service
- **功能**：接收文本参数，调用腾讯云 TTS API，返回音频 URL
- **环境变量**：TENCENT_SECRET_ID、TENCENT_SECRET_KEY（需用户配置）
- **超时时间**：60秒（文本转语音需要一定时间）
- **返回格式**：{ audioUrl: string, message: string }

### 前端设计

- 调用云函数获取音频 URL
- 使用 HTML5 Audio 播放
- 添加加载动画和错误提示
- 保持与原有 UI 的一致性

## 实现步骤

1. 创建云函数目录结构和代码
2. 配置云函数（环境变量、超时时间）
3. 部署云函数
4. 创建前端 JS 文件处理音频播放
5. 更新主题配置加载 JS
6. 构建并部署博客

## Agent 扩展

### Integration

- **tcb**: 用于创建、部署 CloudBase 云函数，调用云函数 API
- 用途：创建 tts-service 云函数并部署到 CloudBase
- 预期结果：云函数成功创建并可调用，返回音频 URL