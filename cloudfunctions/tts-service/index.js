const tencentcloud = require('tencentcloud-sdk-nodejs');

// 获取环境变量中的密钥
const SECRET_ID = process.env.TENCENT_SECRET_ID;
const SECRET_KEY = process.env.TENCENT_SECRET_KEY;

// 初始化 TTS 客户端
const TtsClient = tencentcloud.tts.v20190823.Client;

const clientConfig = {
  credential: {
    secretId: SECRET_ID,
    secretKey: SECRET_KEY,
  },
  region: 'ap-guangzhou',
  profile: {
    httpProfile: {
      endpoint: 'tts.tencentcloudapi.com',
    },
  },
};

exports.main = async (event, context) => {
  const { text } = event;

  if (!text) {
    return {
      success: false,
      message: '请提供要转换的文本',
    };
  }

  // 限制文本长度（腾讯云 TTS 最大支持 600 字节，约 300 个中文字符）
  const maxLength = 300;
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

  try {
    const client = new TtsClient(clientConfig);

    const params = {
      Text: truncatedText,
      VoiceType: 1, // 1: 青年女声
      Codec: 'mp3',
      Speed: 0,
      Volume: 0,
      ProjectId: 0,
    };

    const response = await client.SynthesizeText(params);

    // TTS API 返回的是 Base64 编码的音频数据
    if (response.Audio) {
      // 将 Base64 转换为可以直接访问的 URL
      // 由于返回的是二进制数据，我们需要特殊处理
      const audioBase64 = Buffer.from(response.Audio, 'base64');

      return {
        success: true,
        audioData: audioBase64.toString('base64'),
        message: '语音合成成功',
      };
    } else {
      return {
        success: false,
        message: '语音合成失败，未返回音频数据',
      };
    }
  } catch (error) {
    console.error('TTS 错误:', error);
    return {
      success: false,
      message: '语音合成失败: ' + error.message,
    };
  }
};
