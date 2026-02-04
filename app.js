let recipes = [];

// 1. 讀取資料
fetch('recipes.json')
    .then(res => res.json())
    .then(data => { 
        recipes = data; 
        console.log("資料庫載入成功");
    })
    .catch(err => console.error("資料載入失敗:", err));

const btn = document.getElementById('voice-btn');
const status = document.getElementById('status');
const resultDiv = document.getElementById('result');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    status.innerText = "您的瀏覽器不支援語音功能";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';
    // 關閉持續監聽，回歸穩定模式
    recognition.continuous = false; 
    recognition.interimResults = false;

    // 2. 按鈕點擊事件
    btn.addEventListener('click', () => {
        // 先停止所有語音朗讀，確保 iOS 頻道暢通
        window.speechSynthesis.cancel();
        
        try {
            recognition.start();
            status.innerText = "正在聽您說話...";
            btn.innerText = "錄音中...";
            btn.style.background = "#e67e22"; // 變色提示
        } catch (e) {
            // 如果辨識器還沒結束，先停掉
            recognition.stop();
            console.log("辨識器重設中...");
        }
    });

    // 3. 取得辨識結果
    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript.trim().toLowerCase();
        status.innerText = "您說的是：" + text;
        findAndShowRecipe(text);
    };

    // 4. 辨識結束後的狀態重置
    recognition.onend = () => {
        btn.innerText = "按我說話";
        btn.style.background = "#f39c12"; // 恢復原色
    };

    recognition.onerror = (e) => {
        console.log("語音錯誤:", e.error);
        status.innerText = "沒聽清楚，請再試一次";
    };
}

// 5. 搜尋與顯示邏輯
function findAndShowRecipe(text) {
    const recipe = recipes.find(r => text.includes(r.name));
    if (recipe) {
        let content = `<h3>${recipe.name}</h3><p>麵包：${recipe.bread}</p><ul>`;
        recipe.steps.forEach(s => content += `<li>${s}</li>`);
        content += "</ul>";
        resultDiv.innerHTML = content;
        
        // 朗讀步驟
        speak(`${recipe.name}。${recipe.bread}。` + recipe.steps.join("。"));
    } else {
        resultDiv.innerHTML = "找不到該品項";
        speak("找不到品項名稱，請再試一次");
    }
}

// 6. 語音朗讀邏輯 (iOS 優化版)
function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-TW';
    msg.rate = 1.0;
    window.speechSynthesis.speak(msg);
}
