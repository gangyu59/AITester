document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        // 移除所有激活状态
        document.querySelectorAll('.nav-btn, .tab-content').forEach(el => {
            el.classList.remove('active');
        });

        // 设置当前激活状态
        this.classList.add('active');
        const targetTab = document.getElementById(`${this.dataset.tab}-tab`);
        targetTab.classList.add('active');

        // **如果是 postcard 页面，动态加载内容（仅首次加载）**
        if (this.dataset.tab === 'postcard' && !targetTab.dataset.loaded) {
            try {
                console.log('加载 postcard.html');

                // 加载HTML内容
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

                // **加载 `postcard.js`，但确保只加载一次**
                const jsPath = targetTab.dataset.agent.replace('.html', '.js');
                if (!document.querySelector(`script[src="${jsPath}"]`)) {
                    const script = document.createElement('script');
                    script.src = jsPath;
                    script.onload = () => {
                        console.log('postcard.js 加载完成');

                        // **确保 `PostcardAgent` 只初始化一次**
                        if (!window.postcardAgent) {
                            console.log('初始化 PostcardAgent');
                            window.postcardAgent = new PostcardAgent();
                        }
                    };
                    document.body.appendChild(script);
                } else {
                    console.log('postcard.js 已加载，直接初始化 PostcardAgent');
                    if (!window.postcardAgent) {
                        window.postcardAgent = new PostcardAgent();
                    }
                }

                // 标记为已加载
                targetTab.dataset.loaded = true;
            } catch (error) {
                console.error('加载 postcard.html 失败:', error);
            }
        } else if (this.dataset.tab === 'postcard') {
            // **如果页面已经加载过，直接初始化 PostcardAgent**
            console.log('postcard.html 已加载，直接初始化 PostcardAgent');
            if (!window.postcardAgent) {
                window.postcardAgent = new PostcardAgent();
            }
        }
    });
});

// 默认加载 home 页面
document.addEventListener('DOMContentLoaded', () => {
    const homeBtn = document.querySelector('.nav-btn[data-tab="home"]');
    if (homeBtn) {
        homeBtn.click(); // 模拟点击 home 按钮
    }
});