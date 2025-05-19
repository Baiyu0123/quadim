const originalImg = document.getElementById('original-image');
const processedImg = document.getElementById('processed-image');
let currentOutputUrl = '';

document.querySelector('input[name="image_file"]').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        originalImg.src = URL.createObjectURL(file);
        originalImg.style.display = 'block';
    } else {
        originalImg.src = '';
        originalImg.style.display = 'none';
    }
});

document.getElementById('quadim-form').onsubmit = async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const response = await fetch('/run', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    const resultDiv = document.getElementById('result');

    if (result.success) {
        currentOutputUrl = result.output_url;
        processedImg.src = currentOutputUrl + '?t=' + Date.now(); // 避免缓存
        processedImg.style.display = 'block';
        document.getElementById('buttons-box').style.display = 'flex';
        resultDiv.innerText = "✅ 处理成功！你可以选择保存或丢弃此图像。";
    } else {
        resultDiv.innerText = "❌ 错误：" + result.error;
        processedImg.style.display = 'none';
        document.getElementById('buttons-box').style.display = 'none';
    }
};

document.getElementById('save-button').onclick = function () {
    if (!currentOutputUrl) return;
    const link = document.createElement('a');
    link.href = currentOutputUrl;
    link.download = 'styled-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

document.getElementById('discard-button').onclick = async function () {
    if (!currentOutputUrl) return;
    const res = await fetch('/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentOutputUrl })
    });

    const result = await res.json();
    if (result.success) {
        processedImg.style.display = 'none';
        currentOutputUrl = '';
        document.getElementById('buttons-box').style.display = 'none';
        document.getElementById('result').innerText = "🗑️ 已丢弃图片。";
    } else {
        alert("删除失败：" + result.error);
    }
};
