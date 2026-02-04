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

    // 保持其他變數不變
btn.addEventListener('click', () => {
    // 1. 先徹底停止所有語音和辨識，清空通道
    window.speechSynthesis.cancel();
    try {
        recognition.abort(); // 強制放棄當前辨識狀態，比 stop 更徹底
    } catch (e) {}

    status.innerText = "準備啟動中...";

    // 2. 建立一個 500ms 的緩衝，給 iOS 切換音訊模式的時間
    setTimeout(() => {
        try {
            // 預熱一個極短的靜音，確保後續朗讀正常
            const wakeup = new SpeechSynthesisUtterance("");
            window.speechSynthesis.speak(wakeup);

            // 啟動辨識
            recognition.start();
            
            btn.innerText = "監聽中...";
            btn.style.background = "#3498db";
            status.innerText = "已啟動，請說 Hey Laya 喚醒我";
        } catch (err) {
            console.error("啟動失敗:", err);
            status.innerText = "啟動異常，請再試一次";
        }
    }, 500); 
});

// 修正重啟邏輯，避免無窮錯誤循環
recognition.onend = () => {
    console.log("辨識停止");
    // 只有在監聽模式下才嘗試重啟，並給予更長的延遲避開衝突
    if (btn.innerText === "監聽中...") {
        setTimeout(() => {
            try { recognition.start(); } catch(e) {}
        }, 800); 
    }
};

recognition.onerror = (e) => {
    // 當出現 no-speech 時，不要跳出錯誤訊息，默默讓它重啟即可
    if (e.error === 'no-speech') {
        console.log("未偵測到聲音，等待重啟...");
    } else {
        console.error("語音錯誤:", e.error);
        status.innerText = "錯誤: " + e.error;
    }
};
}

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


