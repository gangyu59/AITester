if (!window.PostcardAgent) {
    class PostcardAgent {
        constructor() {
            this.initUI();
            this.bindEvents();
        }

        initUI() {
            // 动态显示自定义输入框
            document.getElementById('occasion').addEventListener('change', (e) => {
                const customInput = document.getElementById('custom-occasion');
                customInput.classList.toggle('hidden', e.target.value !== 'other');
            });
        }

        bindEvents() {
            // 绑定生成按钮事件
            document.getElementById('generate-btn').addEventListener('click', () => {
                this.generatePostcard();
            });

            // 绑定下载按钮事件
            document.getElementById('download-btn').addEventListener('click', () => {
                this.downloadPostcard();
            });
        }

        async generatePostcard() {
						
            // 获取用户输入
            const occasion = document.getElementById('occasion').value === 'other'
                ? document.getElementById('custom-occasion').value
                : document.getElementById('occasion').value;
            const recipient = document.getElementById('recipient').value;
            const textType = document.getElementById('text-type').value;
            const preferences = Array.from(document.querySelectorAll('input[name="preference"]:checked'))
                .map(input => input.value);
            const imageLayout = document.getElementById('image-layout').value;
            const textPosition = document.getElementById('text-position').value;
            const aiModel = document.getElementById('ai-model').value;

					  // 显示加载动画
				    const loadingIndicator = document.getElementById('loading-indicator');
				    loadingIndicator.classList.remove('hidden');
						
            try {
                // 构建AI提示词
                const textPrompt = `生成一段${textType}风格的祝福语，主题是${occasion}，接收人是${recipient}，风格偏好是${preferences.join(',')}`;
                const imagePrompt = `明信片背景，${imageLayout}布局，${textPosition}文字位置`;

                // 调用AI生成祝福语
                const generatedText = await this.callAI(aiModel, textPrompt);
                document.getElementById('text-overlay').innerText = generatedText;

                // 调用DALL-E生成图片
                const imageUrl = await this.callAI('dalle', imagePrompt);
                document.getElementById('postcard-image').src = imageUrl;

                // 显示下载按钮
                document.getElementById('download-btn').classList.remove('hidden');
            } catch (error) {
                console.error('生成失败:', error);
                alert('生成失败，请稍后重试');
            } finally {
                // 隐藏加载动画
      				loadingIndicator.classList.add('hidden');
            }
        }

        async callAI(model, prompt) {
            // 根据模型调用对应的API
            switch (model) {
                case 'gpt':
                    return await window.AI_Tester.generateText(prompt);
                case 'deepseek':
                    return await window.AI_Tester.generateText(prompt);
                case 'claude':
                    return await window.AI_Tester.generateText(prompt);
                case 'ark':
                    return await window.AI_Tester.generateText(prompt);
                case 'dalle':
                    return await window.AI_Tester.generateImage({ prompt, size: '1024x1024' });
                default:
                    throw new Error('未知的AI模型');
            }
        }

        downloadPostcard() {
            // 实现下载功能
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = document.getElementById('postcard-image');
            const text = document.getElementById('text-overlay');

            canvas.width = img.width;
            canvas.height = img.height;

            // 绘制图片
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 绘制文字
            ctx.font = '24px "Ma Shan Zheng", cursive';
            ctx.fillStyle = '#3e2723';
            ctx.fillText(text.innerText, 20, canvas.height - 40);

            // 生成下载链接
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'postcard.png';
            link.click();
        }
    }

    // 将类挂载到全局对象
    window.PostcardAgent = PostcardAgent;
}

// 初始化智能体
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.postcard-agent')) {
        new PostcardAgent();
    }
});