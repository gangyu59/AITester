class VoiceInput {
  constructor() {
    this.recognition = null;
    this.timer = null;
    this.startTime = null;
    this.isRecognizing = false; // 防止重复启动
    this.init();
  }

  init() {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      console.error('当前浏览器不支持语音识别');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false; // 单次识别
    this.recognition.interimResults = false; // 只返回最终结果
    this.recognition.lang = 'zh-CN'; // 默认语言为中文

    // 语音识别开始
    this.recognition.onstart = () => {
      this.isRecognizing = true;
      this.startTimer();
      this.toggleIcons(true); // 切换到完成图标
      document.querySelector('.recording-indicator').classList.add('active');
    };

    // 语音识别结果
    this.recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      this.updateInput(transcript);
    };

    // 语音识别错误处理
    this.recognition.onerror = (e) => {
      console.error('语音识别错误:', e.error);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        alert('请确保已授予麦克风权限，并刷新页面重试');
      }
      this.resetState();
    };

    // 语音识别结束
    this.recognition.onend = () => {
      this.resetState();
    };
  }

  // 启动语音识别
  start() {
    if (!this.recognition) {
      alert('当前浏览器不支持语音输入，请使用最新版 Chrome 或 Edge');
      return;
    }

    if (this.isRecognizing) {
      console.warn('语音识别已启动，避免重复操作');
      return;
    }

    try {
      this.recognition.start();
      document.getElementById('voice-btn').disabled = true;
    } catch (err) {
      console.error('启动语音识别失败:', err);
      alert('麦克风权限被拒绝，请在浏览器设置中允许访问麦克风');
    }
  }

  // 更新输入框内容
  updateInput(text) {
    const input = document.getElementById('user-input');
    input.value = text;
    input.focus();
    input.setSelectionRange(text.length, text.length);
  }

  // 启动计时器
  startTimer() {
    this.startTime = Date.now();
    this.timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - this.startTime) / 1000);
      document.getElementById('timer').textContent =
        `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }, 1000);
  }

  // 重置状态
  resetState() {
    clearInterval(this.timer);
    this.isRecognizing = false;
    this.toggleIcons(false); // 切换回麦克风图标
    document.querySelector('.recording-indicator').classList.remove('active');
    document.getElementById('voice-btn').disabled = false;
  }

  // 切换图标
  toggleIcons(isRecording) {
    const micIcon = document.getElementById('mic-icon');
    const checkIcon = document.getElementById('check-icon');
    if (isRecording) {
      micIcon.style.display = 'none';
      checkIcon.style.display = 'inline';
    } else {
      micIcon.style.display = 'inline';
      checkIcon.style.display = 'none';
    }
  }
}

// 检查麦克风权限并初始化
async function checkMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('麦克风权限已授予');
    stream.getTracks().forEach(track => track.stop()); // 关闭麦克风
    return true;
  } catch (err) {
    console.error('麦克风权限被拒绝或不可用:', err);
    return false;
  }
}

// 初始化
checkMicrophonePermission().then(hasPermission => {
  if (hasPermission) {
    const voiceInput = new VoiceInput();
    document.getElementById('voice-btn').addEventListener('click', () => voiceInput.start());
  } else {
    console.error('请确保已授予麦克风权限，并刷新页面重试');
  }
});