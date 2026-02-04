let recipes = [];
let isAwake = false;

// 讀取 JSON 資料
fetch('recipes.json')
    .then(res => res.json())
    .then(data => { recipes = data; })
    .catch(err => console.error("JSON 讀取失敗:", err));

const btn = document.getElementById('voice-btn');
const status = document.getElementById('status');
const resultDiv = document.getElementById('result');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// ... 之前的變數宣告保持不變 ...

if (!SpeechRecognition) {
    status.innerText = "您的瀏覽器不支援語音功能";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.continuous = true;
    recognition.interimResults = false;

 // ... 之前的變數宣告保持不變 ...

btn.addEventListener('click', () => {
    // 1. 徹底清空之前的語音任務與辨識狀態，防止重複啟動錯誤
    window.speechSynthesis.cancel();
    try {
        recognition.abort(); // 使用 abort() 比 stop() 更強效，能立即釋放資源
    } catch (e) {}

    status.innerText = "系統重置中...";

    // 2. 給 iOS 0.5 秒的時間切換音訊模式（從喇叭回到麥克風）
    setTimeout(() => {
        try {
            // 預熱靜音播放，確保後續唸步驟有聲
            const wakeup = new SpeechSynthesisUtterance("");
            window.speechSynthesis.speak(wakeup);

            recognition.start();
            
            btn.innerText = "監聽中...";
            btn.style.background = "#3498db";
            status.innerText = "已啟動，請說 Hey Laya 喚醒我";
            console.log("辨識器已成功啟動");
        } catch (err) {
            console.error("啟動失敗:", err);
            status.innerText = "啟動異常，請再按一次";
        }
    }, 500); 
});

// 優化自動重啟，避免無窮報錯
recognition.onend = () => {
    console.log("辨識停止");
    // 只有在持續監聽模式下，且沒有錯誤衝突時才重啟
    if (btn.innerText === "監聽中...") {
        setTimeout(() => {
            try { recognition.start(); } catch(e) {}
        }, 1000); // 增加延遲到 1 秒，避開系統頻繁啟動的限制
    }
};

recognition.onerror = (e) => {
    console.log("語音錯誤:", e.error);
    if (e.error === 'no-speech') {
        // no-speech 在安靜環境很常見，不需報錯，讓它自動重啟即可
        console.log("未偵測到聲音，等待自動重啟...");
    } else if (e.error === 'aborted') {
        console.log("辨識被手動中止");
    } else {
        status.innerText = "辨識異常，請重新點擊按鈕";
    }
};
// findAndShowRecipe 與 speak 函數維持原樣

function findAndShowRecipe(text) {
    const recipe = recipes.find(r => text.includes(r.name));
    if (recipe) {
        let content = `<h3>${recipe.name}</h3><p>麵包：${recipe.bread}</p><ul>`;
        recipe.steps.forEach(s => content += `<li>${s}</li>`);
        content += "</ul>";
        resultDiv.innerHTML = content;
        
        speak(`${recipe.name}。${recipe.bread}。` + recipe.steps.join("。"));
        
        // 完成後重設狀態，等待下一次 Hey Laya
        isAwake = false;
        status.innerText = "請說 Hey Laya 喚醒我";
    }
}

function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-TW';
    msg.rate = 1.0;
    window.speechSynthesis.speak(msg);
}



