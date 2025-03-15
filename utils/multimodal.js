// 在app.js中添加
let mediaAttachments = [];

document.getElementById('test-type').addEventListener('change', function(e) {
    const multimodalToolbar = document.querySelector('.multimodal-toolbar');
    multimodalToolbar.classList.toggle('hidden', e.target.value !== 'multimodal');
});

document.getElementById('add-media').addEventListener('click', function(e) {
    const menu = document.getElementById('media-menu');
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    menu.classList.toggle('hidden');
});

// 处理菜单选择
document.querySelectorAll('.media-option').forEach(btn => {
    btn.addEventListener('click', async function() {
				document.getElementById('media-menu').classList.remove('show');
        menuVisible = false;
        const type = this.dataset.type;
        const menu = document.getElementById('media-menu');
        menu.classList.add('hidden');

        switch(type) {
            case 'audio':
                await handleAudioInput();
                break;
            case 'image':
                document.getElementById('image-upload').click();
                break;
            case 'file':
                document.getElementById('file-upload').click();
                break;
        }
    });
});

// 处理图片上传
document.getElementById('image-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        addMediaPreview({
            type: 'image',
            data: reader.result,
            name: file.name
        });
    };
    reader.readAsDataURL(file);
});

// 处理文件上传
document.getElementById('file-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        addMediaPreview({
            type: 'file',
            data: reader.result,
            name: file.name
        });
    };
    reader.readAsText(file);
});

// 语音输入处理
async function handleAudioInput() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('当前浏览器不支持语音输入');
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'zh-CN';
    
    return new Promise((resolve) => {
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            addMediaPreview({
                type: 'text',
                data: transcript,
                name: '语音输入'
            });
        };

        recognition.start();
    });
}

// 添加媒体预览
function addMediaPreview(media) {
    mediaAttachments.push(media);
    
    const preview = document.getElementById('media-preview');
    const item = document.createElement('div');
    item.className = 'media-item';
    
    let content;
    if (media.type === 'image') {
        content = `<img src="${media.data}">`;
    } else if (media.type === 'audio') {
        content = `<audio controls src="${media.data}"></audio>`;
    } else {
        content = `<div class="text-preview">${media.data}</div>`;
    }

    item.innerHTML = `
        ${content}
        <button class="remove-media">×</button>
    `;
    
    item.querySelector('.remove-media').addEventListener('click', () => {
        mediaAttachments = mediaAttachments.filter(m => m !== media);
        item.remove();
    });
    
    preview.appendChild(item);
}

// 在app.js中添加/修改以下内容
// 监听测试类目变化
document.getElementById('test-type').addEventListener('change', function(e) {
    const isMultimodal = e.target.value === 'multimodal';
    
    // 切换工具栏显示
    const toolbar = document.getElementById('multimodal-toolbar');
    toolbar.classList.toggle('hidden', !isMultimodal);
    
    // 清除非多模态模式的附件
    if (!isMultimodal) {
        mediaAttachments = [];
        document.getElementById('media-preview').innerHTML = '';
    }
});

// 增强的媒体菜单交互
let menuVisible = false;

document.getElementById('add-media').addEventListener('click', function(e) {
    if (menuVisible) return;
    
    const menu = document.getElementById('media-menu');
    const rect = e.target.getBoundingClientRect();
    
    // 定位菜单
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 8}px`;
    
    menu.classList.add('show');
    menuVisible = true;
    
    // 点击外部关闭菜单
    const clickHandler = (event) => {
        if (!menu.contains(event.target)) {
            menu.classList.remove('show');
            menuVisible = false;
            document.removeEventListener('click', clickHandler);
        }
    };
    
    setTimeout(() => document.addEventListener('click', clickHandler));
});


