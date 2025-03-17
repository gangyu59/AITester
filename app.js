// 全局变量
var currentTestType = 'logic'; // 当前测试类型
var currentModel = 'gpt'; // 当前选择的模型

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 绑定模型选择事件
    document.getElementById('ai-model').addEventListener('change', function(event) {
        currentModel = event.target.value;
    });

    // 绑定测试类型按钮事件
    document.querySelectorAll('.test-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            const testType = event.target.getAttribute('onclick').match(/'(\w+)'/)[1];
            setTestType(testType);
        });
    });

    // 绑定开始测试按钮事件
    document.getElementById('run-btn').addEventListener('click', executeTest);
});

// 设置测试类型并高亮按钮
function setTestType(testType) {
    currentTestType = testType;
    highlightSelectedButton(testType);
}

// 高亮选中的测试按钮
function highlightSelectedButton(testType) {
    document.querySelectorAll('.test-btn').forEach(button => {
        if (button.getAttribute('onclick').includes(testType)) {
            button.style.backgroundColor = '#007aff'; // 选中按钮的背景色
            button.style.color = '#fff'; // 选中按钮的文字颜色
        } else {
            button.style.backgroundColor = '#e5e5ea'; // 未选中按钮的背景色
            button.style.color = '#000'; // 未选中按钮的文字颜色
        }
    });
}

// 执行测试
async function executeTest() {
    // 获取基础输入内容
    const inputText = document.getElementById('user-input').value;
    
    // 多模态校验逻辑
    if (currentTestType === 'multimodal') {
        // 当选择多模态测试时，至少需要输入内容或附件
        if (!inputText && mediaAttachments.length === 0) {
            alert('多模态测试需要输入文字或添加附件');
            return;
        }
    } else {
        // 非多模态测试需要文本输入
        if (!inputText) {
            alert('请输入测试内容');
            return;
        }
    }

    toggleLoading(true);

    try {
        let response;
        const messages = [];
        
        // 构建基础消息结构
        if (inputText) {
            messages.push({
                role: 'user',
                content: inputText
            });
        }

        // 处理多模态附件
        if (currentTestType === 'multimodal' && mediaAttachments.length > 0) {
            messages.push({
                role: 'user',
                content: await processAttachments(mediaAttachments)
            });
        }

        // 模型分发处理
        switch (currentModel) {
            case 'gpt':
                response = await callGPT(formatGPTMessage(messages), { 
                    testType: currentTestType 
                });
                break;
                
            case 'deepseek':
                if (currentTestType === 'multimodal') {
                    throw new Error('DeepSeek暂不支持多模态');
                }
                response = await callDeepSeek(messages, { 
                    testType: currentTestType 
                });
                break;
                
            case 'claude':
                response = await callClaude(formatClaudeMessage(messages), {
                    testType: currentTestType
                });
                break;
                
            case 'ark':
                response = await callARK(formatARKMessage(messages), {
                    testType: currentTestType
                });
                break;
                
            case 'dalle':
                // DALL-E特殊处理
                const prompt = currentTestType === 'multimodal' 
                    ? await generateDallePrompt(messages)
                    : inputText;
                response = await callDalle(prompt, {
                    size: '1024x1024'
                });
                break;
                
            default:
                throw new Error('未选择的模型');
        }

        displayResult(response);
    } catch (error) {
        displayError(error);
    } finally {
        toggleLoading(false);
        mediaAttachments = []; // 清空附件
        document.getElementById('media-preview').innerHTML = ''; // 清空预览
    }
}

// 多模态附件处理函数
async function processAttachments(attachments) {
    const content = [];
    
    for (const attachment of attachments) {
        switch (attachment.type) {
            case 'image':
                content.push({
                    type: 'image_url',
                    image_url: {
                        url: await uploadToCDN(attachment.data), // 假设有图床服务
                        detail: 'auto'
                    }
                });
                break;
                
            case 'audio':
                content.push({
                    type: 'text',
                    text: `[语音输入] ${attachment.data}`
                });
                break;
                
            case 'file':
                content.push({
                    type: 'text',
                    text: `[文件内容] ${attachment.data.substring(0, 1000)}...` // 截断处理
                });
                break;
                
            default:
                content.push({
                    type: 'text',
                    text: attachment.data
                });
        }
    }
    
    return content;
}

// GPT多模态消息格式化
function formatGPTMessage(messages) {
    return messages.map(msg => {
        if (Array.isArray(msg.content)) {
            return {
                role: msg.role,
                content: msg.content.map(item => {
                    if (item.type === 'image_url') {
                        return {
                            type: 'image_url',
                            image_url: item.image_url
                        };
                    }
                    return {
                        type: 'text',
                        text: item.text
                    };
                })
            };
        }
        return msg;
    });
}

// Claude消息格式化
function formatClaudeMessage(messages) {
    return messages.map(msg => {
        if (Array.isArray(msg.content)) {
            return {
                role: msg.role,
                content: msg.content.map(item => {
                    if (item.type === 'image_url') {
                        return {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: 'image/jpeg',
                                data: item.image_url.url.split(',')[1]
                            }
                        };
                    }
                    return item.text;
                }).join('\n')
            };
        }
        return msg;
    });
}

// 生成DALL-E提示词（多模态增强）
async function generateDallePrompt(messages) {
    // 如果包含图片，使用GPT-4生成增强描述
    const hasImage = messages.some(msg => 
        msg.content.some(item => item.type === 'image_url')
    );
    
    if (!hasImage) return messages[0].content;
    
    const visionResponse = await callGPT([{
        role: 'user',
        content: [
            { type: 'text', text: '详细描述这张图片的内容和风格' },
            ...messages[0].content
        ]
    }], { model: 'gpt-4-vision' });
    
    return visionResponse.choices[0].message.content;
}

// 显示结果
function displayResult(data) {
    const outputArea = document.getElementById('output-area');
    if (currentModel === 'dalle') {
        // 处理 DALL-E 的图片生成结果
        if (data.data && data.data.length > 0) {
            outputArea.innerHTML = data.data.map(image => `
                <div class="image-result">
                    <img src="${image.url}" alt="生成的图片">
                </div>
            `).join('');
        } else {
            outputArea.innerHTML = '<div class="error">未生成图片</div>';
        }
    } else {
        // 处理其他模型的文本结果
        outputArea.innerHTML = `
            <div class="result-card">
                <div class="model-info">${currentModel} 响应：</div>
                <div class="response-content">${data.choices[0].message.content}</div>
            </div>
        `;
    }
}

// 显示错误
function displayError(error) {
    const outputArea = document.getElementById('output-area');
    outputArea.innerHTML = `<div class="error">错误：${error.message}</div>`;
}

// 切换加载状态
function toggleLoading(show) {
    const runButton = document.getElementById('run-btn');
    const statusIndicator = document.getElementById('status-indicator');

    runButton.disabled = show;
    statusIndicator.classList.toggle('status-visible', show);
    runButton.querySelector('.loader').classList.toggle('hidden', !show);
    runButton.querySelector('.btn-text').textContent = show ? '处理中...' : '开始';
}

class Router {
  constructor() {
    this.panes = document.querySelectorAll('.tab-content');
    this.initNavigation();
    this.loadInitialAgent();
  }

  initNavigation() {
    // 标签点击事件
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchPane(btn.dataset.tab));
    });
  }

  async switchPane(targetId) {
    // 切换激活状态
    document.querySelectorAll('.nav-btn, .tab-content').forEach(el => {
      el.classList.remove('active');
    });
    document.querySelector(`[data-tab="${targetId}"]`).classList.add('active');
    
    const targetPane = document.getElementById(`${targetId}-tab`);
    targetPane.classList.add('active');

    // 动态加载智能体
    if (targetId !== 'home' && !targetPane.dataset.loaded) {
      await this.loadAgent(targetPane);
      targetPane.dataset.loaded = true;
    }
  }

	async loadAgent(pane) {
	    const agentPath = pane.dataset.agent;
	    
	    try {
	        // 加载HTML片段
	        const response = await fetch(agentPath);
	        if (!response.ok) {
	            throw new Error(`加载失败: ${response.statusText}`);
	        }
	        pane.innerHTML = await response.text();
	
	        // 注入CSS（仅一次）
	        if (!pane.dataset.cssLoaded) {
	            const cssPath = agentPath.replace('.html', '.css');
	            this.injectCSS(cssPath);
	            pane.dataset.cssLoaded = true;
	        }
	
	        // 加载JS（仅一次）
	        if (!pane.dataset.jsLoaded) {
	            const jsPath = agentPath.replace('.html', '.js');
	            await this.loadJS(jsPath);
	            pane.dataset.jsLoaded = true;
	        }
	
	        pane.dataset.loaded = true;
	    } catch (error) {
	        console.error('加载智能体失败:', error);
	        pane.innerHTML = `<p class="error-message">加载失败，请刷新页面或检查网络连接。</p>`;
	    }
	}

  injectCSS(path) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    document.head.appendChild(link);
  }

  loadJS(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = path;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  loadInitialAgent() {
    if (window.location.hash === '#postcard') {
      this.switchPane('postcard');
    }
  }
}

// 初始化路由
new Router();