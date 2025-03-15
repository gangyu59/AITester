/**
 * 运行多模态测试
 */
var runMultimodalTest = async function() {
    const textPrompt = "描述一张美丽的风景画：";
    const imagePrompt = "一张美丽的风景画，有山有水，阳光明媚";

    try {
        // 测试文本生成
        const gptResponse = await callGPT([{ role: 'user', content: textPrompt }]);
        console.log('GPT文本生成响应:', gptResponse);

        // 测试图片生成
        const dalleResponse = await callDalle(imagePrompt, { n: 1, size: '1024x1024' });
        console.log('DALL-E图片生成响应:', dalleResponse);

        // 显示图片
        if (dalleResponse.data && dalleResponse.data.length > 0) {
            const imageUrl = dalleResponse.data[0].url;
            document.getElementById('output').innerHTML = `<img src="${imageUrl}" alt="生成的图片">`;
        }
    } catch (error) {
        console.error('多模态测试失败:', error);
    }
};