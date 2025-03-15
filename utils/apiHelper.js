async function callApi(url, options) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API调用失败:', error);
        return null;
    }
}