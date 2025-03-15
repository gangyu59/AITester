/**
 * 调用 ARK 模型
 * @param {Array} messages - 消息列表，支持多模态输入
 * @param {Object} options - 可选参数（如 max_tokens, temperature 等）
 * @returns {Promise<Object>} - ARK 的响应结果
 */
var callARK = async function(messages, options = {}) {
    const headers = {
        'Authorization': `Bearer ${ARK_API_KEY}`,
        'Content-Type': 'application/json'
    };

    const body = {
        model: ARK_API_MODEL, // 使用配置中的模型名称
        messages: messages,
        max_tokens: options.max_tokens || 1000, // 默认值 1000
        temperature: options.temperature || 0.7 // 默认值 0.7
    };

    try {
        console.log('发送 ARK API 请求:', {
            url: ARK_API_URL,
            headers: headers,
            body: body
        });

        const response = await fetch(ARK_API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        console.log('ARK API 响应状态:', response.status, response.statusText);

        if (!response.ok) {
            const errorResponse = await response.text();
            console.error('ARK API 请求失败，响应内容:', errorResponse);
            throw new Error(`ARK API 请求失败: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('ARK API 响应数据:', data);
        return data;
    } catch (error) {
        console.error('调用 ARK 时出错:', error);
        throw error;
    }
};