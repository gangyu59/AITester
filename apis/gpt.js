/**
 * 调用GPT模型
 * @param {Array} messages - 消息列表
 * @param {Object} options - 可选参数（如testType, max_tokens, temperature等）
 * @returns {Promise<Object>} - GPT的响应结果
 */
var callGPT = async function(messages, options = {}) {
    const headers = {
        'api-key': GPT_API_KEY
    };

    // 根据测试类型生成提示词
    const prompt = generatePrompt(messages[0].content, options.testType);

    const body = {
        model: GPT_API_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.7
    };

    return await callAI(GPT_API_URL, headers, body);
};

// 生成提示词
function generatePrompt(input, testType) {
    const prompts = {
        logic: `请严格分析以下逻辑问题：${input}`,
        creative: `请用创新的方式处理：${input}`,
        multimodal: `请生成包含文字和图片描述的方案：${input}`
    };
    return prompts[testType] || input;
}