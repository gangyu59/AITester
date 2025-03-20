//agents/postcard/aiService.js        

async function generatePostcard() {
            console.log('🎨 开始生成明信片');

            // **确保 `postcard.html` 加载完成**
            const occasionElem = document.getElementById('occasion');
            if (!occasionElem) {
                console.error('🚨 页面尚未加载完成，无法生成明信片');
                return;
            }

            // **获取用户输入**
            const occasion = occasionElem.value === 'other'
                ? document.getElementById('custom-occasion').value
                : occasionElem.value;
            const recipient = document.getElementById('recipient').value;
            const textType = document.getElementById('text-type').value;
            const preferences = Array.from(document.querySelectorAll('input[name="preference"]:checked'))
                .map(input => input.value);
            const aiModel = document.getElementById('ai-model').value;

            console.log('📝 用户输入:', { occasion, recipient, textType, preferences, aiModel });

            toggleHourglass(true);

            try {
                // **构建 AI 提示词**
                const textPrompt = `生成一段简短的不超过四句${textType}风格的祝福语，场景是${occasion}，接收人是${recipient}，风格偏好是${preferences.join(',')}`;

                console.log('📝 文本提示词:', textPrompt);

                // **调用 AI 生成祝福语**
                const generatedText = await this.callAICard(aiModel, textPrompt);
                console.log('📜 生成的祝福语:', generatedText);
                document.getElementById('text-overlay').innerText = generatedText;
            } catch (error) {
                console.error('🚨 生成失败:', error);
                alert('生成失败，请稍后重试');
            } finally {
                toggleHourglass(false);
            }
        }

        async function callAICard(model, prompt) {
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
                        throw new Error('🚨 未选择的模型');
                }

                console.log('🤖 API 原始响应数据:', response);

                if (response && response.choices && response.choices.length > 0) {
                    return response.choices[0].message.content;
                } else {
                    console.error('⚠️ API 响应格式异常:', response);
                    return null;
                }
            } catch (error) {
                console.error('🚨 AI 调用失败:', error);
                return null;
            }
        }
				
async function generateImage() {
    console.log('🎨 开始生成明信片图片');

    const imageLayout = document.getElementById('image-layout').value;
    const textPosition = document.getElementById('text-position').value;
    const userText = document.getElementById('text-overlay').innerText.trim();

    if (!userText) {
        alert('请先输入祝福语！');
        return;
    }

    console.log('✍️ 用户修改后的祝福语:', userText);

    // **构建 DALL·E 提示词**
    const imagePrompt = `按照以下内容："${userText}"，设计一张精美的图片背景（一张图，不是多图），${imageLayout}布局，请不要添加任何文字，以便后续叠加。`;

    console.log('📝 DALL·E 图片提示词:', imagePrompt);

    try {
        toggleHourglass(true); // **显示加载动画**

        // **调用 DALL·E 生成图片**
        const dalleResponse = await callDalle(imagePrompt, { size: "1024x1024" });

        // **解析 DALL·E 返回的图片 URL**
        if (dalleResponse && dalleResponse.data && dalleResponse.data.length > 0) {
            const imageUrl = dalleResponse.data[0].url;
            console.log('🖼️ DALL·E 生成的图片 URL:', imageUrl);
						
						// **将文字和背景合成**
          mergeTextWithBackground(imageUrl, userText);

            // **更新 `postcard-image`，让图片显示**
            const postcardImage = document.getElementById('postcard-image');
            if (postcardImage) {
                postcardImage.src = imageUrl;
            } else {
                console.error('🚨 找不到 postcard-image 元素');
            }
        } else {
            console.error('🚨 DALL·E 响应数据异常:', dalleResponse);
            alert('图片生成失败，请稍后重试');
        }
    } catch (error) {
        console.error('🚨 DALL·E 生成图片失败:', error);
        alert('DALL·E 生成图片失败，请稍后重试');
    } finally {
        toggleHourglass(false); // **隐藏加载动画**
    }
}


function mergeTextWithBackground(backgroundSrc, text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundSrc;

    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制背景图片
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // **格式化为诗词**
        const formattedText = formatPoetryText(text);
        const lines = formattedText.split('\n'); // 逐行拆分

        // **设置文字样式**
        ctx.font = 'bold 36px KaiTi, SimHei, Arial';
        ctx.fillStyle = '#FFD700';  // **金色，适合多数背景**
        ctx.textAlign = 'center';

        // **计算起始位置**
        const startY = canvas.height * 0.7;
        const lineSpacing = 40; // **缩小行间距**

        // **绘制每一行**
        lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, startY + index * lineSpacing);
        });

				// **隐藏 text-overlay**
        document.getElementById('text-overlay').style.display = 'none';
				
        // **显示合成的最终图片**
        document.getElementById('postcard-image').src = canvas.toDataURL('image/png');
    };
}

function formatPoetryText(text) {
    return text.replace(/(，|。|；)/g, '$1\n'); // 在标点后面换行
}

// 辅助函数：拆分长文本为多行
function splitText(text, maxLength) {
    const result = [];
    for (let i = 0; i < text.length; i += maxLength) {
        result.push(text.substring(i, i + maxLength));
    }
    return result;
}
				
window.generatePostcard();
window.generateImage();