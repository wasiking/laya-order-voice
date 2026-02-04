let recipes = [];

// 1. 載入食譜資料
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
    recognition.continuous = false;
    recognition.interimResults = false;

    // 2. 點擊事件 (iOS 語音解鎖的核心)
    btn.addEventListener('click', () => {
        // --- 核心步驟 1：立即清理並解鎖音訊 ---
        window.speechSynthesis.cancel(); 
        const wakeup = new SpeechSynthesisUtterance(""); 
        window.speechSynthesis.speak(wakeup); // 必須在點擊最前端，確保 iOS 認可

        // --- 核心步驟 2：確保辨識狀態乾淨 ---
        try {
            recognition.stop();
        } catch (e) {}

        // 3. 更新 UI
        status.innerText = "正在聽您說話...";
        btn.innerText = "錄音中...";
        btn.style.background = "#e67e22";

        // 4. 啟動辨識 (緊接在點擊之後，不使用延遲)
        try {
            recognition.start();
        } catch (e) {
            console.log("辨識重啟中...");
        }
    });

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript.trim().toLowerCase();
        status.innerText = "您說的是：" + text;
        findAndShowRecipe(text);
    };

    recognition.onend = () => {
        btn.innerText = "按我說話";
        btn.style.background = "#f39c12";
    };

    recognition.onerror = (e) => {
        console.log("辨識錯誤:", e.error);
        if (e.error === 'no-speech') status.innerText = "沒聽到聲音，請再試一次";
    };
}

// 5. 搜尋邏輯
function findAndShowRecipe(name) {
    const recipe = recipes.find(r => name.includes(r.name));
    if (recipe) {
        let content = `<h3>${recipe.name}</h3><p>麵包：${recipe.bread}</p><ul>`;
        recipe.steps.forEach(s => content += `<li>${s}</li>`);
        content += "</ul>";
        resultDiv.innerHTML = content;
        
        // 朗讀步驟
        speak(`${recipe.name}，${recipe.bread}。` + recipe.steps.join("。"));
    } else {
        resultDiv.innerHTML = "找不到品項";
        speak("找不到品項，請再說一次。");
    }
}

// 6. 語音執行 (TTS)
function speak(text) {
    // 再次執行 cancel 確保頻道乾淨
    window.speechSynthesis.cancel();
    
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-TW';
    msg.volume = 1.0; // 確保音量滿格
    msg.rate = 1.1;   // 稍微加快一點速度更像真人
    window.speechSynthesis.speak(msg);
}
