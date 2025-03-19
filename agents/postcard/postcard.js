if (!window.PostcardAgent) {
    class PostcardAgent {
        constructor() {
            console.log('📌 PostcardAgent 初始化');
            this.maxRetries = 20; // **最大尝试次数，防止死循环**
            this.retryCount = 0;   // **当前尝试次数**
            this.waitForElements(); // **确保组件加载后再绑定事件**
        }

        waitForElements() {
            console.log('⏳ 等待 postcard.html 组件加载...');
            
            // **轮询检查所有组件是否已加载**
            const checkInterval = setInterval(() => {
                const generateBtn = document.getElementById('generate-btn');
                const generateImageBtn = document.getElementById('generate-image-btn');
                const downloadBtn = document.getElementById('download-btn');
                const occasionElem = document.getElementById('occasion');
                const recipientElem = document.getElementById('recipient');
                const textTypeElem = document.getElementById('text-type');
                const aiModelElem = document.getElementById('ai-model');
								const loadingIndicator = document.getElementById(' loading-indicator');

                if (generateBtn && generateImageBtn && downloadBtn && occasionElem && recipientElem && textTypeElem && aiModelElem) {
                    clearInterval(checkInterval); // **所有组件加载完毕，停止轮询**
                    console.log('✅ 所有组件已加载，绑定事件');
                    this.bindEvents();
                } else {
                    this.retryCount++;
                    if (this.retryCount >= this.maxRetries) {
                        clearInterval(checkInterval);
                        console.error('🚨 组件加载超时，可能存在问题');
                    }
                }
            }, 300);
        }

        bindEvents() {
            console.log('📌 执行 bindEvents()');

            // **绑定 "生成明信片" 按钮**
            const generateBtn = document.getElementById('generate-btn');
            if (generateBtn) {
                generateBtn.addEventListener('click', () => {
                    console.log('📝 generate-btn 被点击');
                    window.generatePostcard();
                });
            } else {
                console.warn('⚠️ generate-btn 未找到');
            }

            // **绑定 "生成图片" 按钮**
            const generateImageBtn = document.getElementById('generate-image-btn');
            if (generateImageBtn) {
                generateImageBtn.addEventListener('click', () => {
                    console.log('🖼️ generate-image-btn 被点击');
                    this.generateImage();
                });
            } else {
                console.warn('⚠️ generate-image-btn 未找到');
            }

            // **绑定 "下载图片" 按钮**
            const downloadBtn = document.getElementById('download-btn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    console.log('⬇️ download-btn 被点击');
                    this.downloadPostcard();
                });
            } else {
                console.warn('⚠️ download-btn 未找到');
            }

            // **绑定 "场景选择" 下拉框**
            const occasionElem = document.getElementById('occasion');
            if (occasionElem) {
                occasionElem.addEventListener('change', (e) => {
                    const customInput = document.getElementById('custom-occasion');
                    if (customInput) {
                        customInput.classList.toggle('hidden', e.target.value !== 'other');
                    }
                });
            } else {
                console.warn('⚠️ occasion 元素未找到');
            }
        }



        
    }

    window.PostcardAgent = PostcardAgent;
}



// **确保 `PostcardAgent` 只初始化一次**
document.addEventListener('DOMContentLoaded', function () {
    if (!window.postcardAgent) {
        console.log('✅ 初始化 PostcardAgent');
        window.postcardAgent = new PostcardAgent();
    }
});