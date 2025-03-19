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
				
window.generatePostcard();