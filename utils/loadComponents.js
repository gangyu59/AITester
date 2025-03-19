// utils/loadComponents.js 
console.log('loadComponents.js 已加载'); // 确保文件被加载

window.LoadComponents = {
    observeElement: function(selector, callback) {
        console.log(`开始监听元素: ${selector}`); // 打印监听的元素
        const observer = new MutationObserver((mutations, obs) => {
            console.log(`检测到 DOM 变化，查找元素: ${selector}`); // 打印 DOM 变化
            const element = document.querySelector(selector);
            if (element && !element.dataset.eventBound) {
                console.log(`元素已找到: ${selector}`); // 打印找到的元素
                callback(element);
                element.dataset.eventBound = true; // 标记为已绑定
                obs.disconnect(); // 停止监听
            } else if (!element) {
                console.log(`元素未找到: ${selector}`); // 打印未找到的元素
            }
        });

        // 监听整个文档的变化
        observer.observe(document.body, {
            childList: true,  // 监听子节点的变化
            subtree: true     // 监听所有后代节点
        });
    },

    observeElements: function(elements) {
        console.log('开始监听多个元素'); // 打印监听多个元素的开始
        elements.forEach(({ selector, event, handler }) => {
            this.observeElement(selector, (element) => {
                console.log(`绑定事件: ${event} 到元素: ${selector}`); // 打印绑定的事件
                element.addEventListener(event, handler);
            });
        });
    },

    setupDynamicPage: function(elementsToObserve) {
        console.log('启动动态页面监听'); // 打印启动监听的日志
        this.observeElements(elementsToObserve);
    }
};