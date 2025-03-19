if (!window.PostcardAgent) {
    class PostcardAgent {
        constructor() {
            console.log('PostcardAgent 初始化');
 					document.addEventListener("DOMContentLoaded", () => {
                this.initUI();
                this.bindEvents();
            });
        }

        initUI() {
            const occasionElem = document.getElementById('occasion');
            if (occasionElem) {
                occasionElem.addEventListener('change', (e) => {
                    const customInput = document.getElementById('custom-occasion');
                    customInput.classList.toggle('hidden', e.target.value !== 'other');
                });
            } else {
                console.warn('occasion 元素未找到，可能是页面未完全加载');
            }
        }

        bindEvents() {
            console.log('执行 bindEvents()');

            // 绑定 "生成明信片" 按钮
            const generateBtn = document.getElementById('generate-btn');
            if (generateBtn) {
                generateBtn.addEventListener('click', () => {
                    console.log('generate-btn 被点击');
                    this.generatePostcard();
                });
            } else {
                console.warn('generate-btn 未找到，可能是页面未完全加载');
            }

            // 绑定 "生成图片" 按钮
            const generateImageBtn = document.getElementById('generate-image-btn');
            if (generateImageBtn) {
                generateImageBtn.addEventListener('click', () => {
                    console.log('generate-image-btn 被点击');
                    generateImage();
                });
            } else {
                console.warn('generate-image-btn 未找到，可能是页面未完全加载');
            }

            // 绑定 "下载图片" 按钮
            const downloadBtn = document.getElementById('download-btn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    this.downloadPostcard();
                });
            } else {
                console.warn('download-btn 未找到，可能是页面未完全加载');
            }
        }

        async generatePostcard() {
            console.log('开始生成明信片');

            // 确保所有元素都已加载
            const occasionElem = document.getElementById('occasion');
            if (!occasionElem) {
                console.error('页面尚未加载完成，无法生成明信片');
                return;
            }

            // 获取用户输入
            const occasion = occasionElem.value === 'other'
                ? document.getElementById('custom-occasion').value
                : occasionElem.value;
            const recipient = document.getElementById('recipient').value;
            const textType = document.getElementById('text-type').value;
            const preferences = Array.from(document.querySelectorAll('input[name="preference"]:checked'))
                .map(input => input.value);
            const aiModel = document.getElementById('ai-model').value;

            console.log('用户输入:', { occasion, recipient, textType, preferences, aiModel });

            toggleHourglass(true);

            try {
                // 构建AI提示词
                const textPrompt = `生成一段简短的不超过四句${textType}风格的祝福语，场景是${occasion}，接收人是${recipient}，风格偏好是${preferences.join(',')}`;

                console.log('文本提示词:', textPrompt);

                // 调用AI生成祝福语
                const generatedText = await this.callAICard(aiModel, textPrompt);
                console.log('生成的祝福语:', generatedText);
                document.getElementById('text-overlay').innerText = generatedText;
            } catch (error) {
                console.error('生成失败:', error);
                alert('生成失败，请稍后重试');
            } finally {
                toggleHourglass(false);
            }
        }

        async callAICard(model, prompt) {
            const messages = [{ role: 'user', content: prompt }];

            try {
                let response;

                switch (model) {
                    case 'gpt':
                        response = await callGPT(messages, {});
                        break;
                    case 'deepseek':
                        response = await callDeepSeek(messages, {});
                        break;
                    case 'claude':
                        response = await callClaude(messages, {});
                        break;
                    case 'ark':
                        response = await callARK(messages, {});
                        break;
                    default:
                        throw new Error('未选择的模型');
                }

                console.log('API 原始响应数据:', response);

                if (response && response.choices && response.choices.length > 0) {
                    return response.choices[0].message.content;
                } else {
                    console.error('API 响应格式异常，未能解析文本:', response);
                    return null;
                }
            } catch (error) {
                console.error('AI 调用失败:', error);
                return null;
            }
        }

        downloadPostcard() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = document.getElementById('postcard-image');
            const text = document.getElementById('text-overlay');

            if (!img) {
                console.error('图片未找到，无法下载');
                return;
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.font = '24px Arial';
            ctx.fillStyle = '#3e2723';
            ctx.fillText(text.innerText, 20, canvas.height - 40);

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'postcard.png';
            link.click();
        }
    }

    window.PostcardAgent = PostcardAgent;
}

// 确保 PostcardAgent 只初始化一次
document.addEventListener('DOMContentLoaded', function() {
    if (!window.postcardAgent) {
        console.log('初始化 PostcardAgent');
        window.postcardAgent = new PostcardAgent();
    }
});

// 监听 tab 切换，确保 `postcard.html` 只加载一次
const postcardButton = document.querySelector('.nav-btn[data-tab="postcard"]');
if (postcardButton) {
    postcardButton.addEventListener('click', async () => {
        const targetTab = document.getElementById('postcard-tab');

        if (!targetTab.dataset.loaded) {
            console.log('加载 postcard.html');
            try {
                const response = await fetch(targetTab.dataset.agent);
                targetTab.innerHTML = await response.text();

                // 加载CSS（防止重复加载）
                const cssPath = targetTab.dataset.agent.replace('.html', '.css');
                if (!document.querySelector(`link[href="${cssPath}"]`)) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = cssPath;
                    document.head.appendChild(link);
                }

                // 加载JS（防止重复加载）
                const jsPath = targetTab.dataset.agent.replace('.html', '.js');
                if (!document.querySelector(`script[src="${jsPath}"]`)) {
                    const script = document.createElement('script');
                    script.src = jsPath;
                    document.body.appendChild(script);
                }

                targetTab.dataset.loaded = true;
            } catch (error) {
                console.error('加载 postcard.html 失败:', error);
            }
        }

        // **确保 PostcardAgent 只初始化一次**
        if (!window.postcardAgent) {
            setTimeout(() => {
                console.log('初始化 PostcardAgent');
                window.postcardAgent = new PostcardAgent();
            }, 500);
        }
    });
} else {
    console.error('未找到 Postcard tab 按钮');
}