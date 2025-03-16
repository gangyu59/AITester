// 获取复制按钮和输出区
const copyBtn = document.getElementById('copy-btn');
const outputArea = document.getElementById('output-area');

// 点击复制按钮
copyBtn.addEventListener('click', () => {
  // 创建一个临时的 textarea 元素
  const tempTextArea = document.createElement('textarea');
  tempTextArea.value = outputArea.innerText; // 获取输出区的内容
  document.body.appendChild(tempTextArea);

  // 选择内容并复制
  tempTextArea.select();
  try {
    document.execCommand('copy');
    console.log('内容已复制到剪贴板！');
  } catch (err) {
    console.error('复制失败:', err);
    console.log('复制失败，请手动选择并复制内容。');
  }

  // 移除临时的 textarea 元素
  document.body.removeChild(tempTextArea);
});