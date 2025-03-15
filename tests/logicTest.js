/**
 * 运行逻辑测试
 */
var runLogicTest = async function() {
    const prompt = "如果所有的A都是B，所有的B都是C，那么所有的A都是C吗？";
    
    try {
        const gptResponse = await callGPT([{ role: 'user', content: prompt }]);
        console.log('GPT响应:', gptResponse);

        const deepSeekResponse = await callDeepSeek([{ role: 'user', content: prompt }]);
        console.log('DeepSeek响应:', deepSeekResponse);
    } catch (error) {
        console.error('测试失败:', error);
    }
};