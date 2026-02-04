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

    btn.addEventListener('click', () => {
        // 解決「按兩次」的關鍵：先重設語音與辨識狀態
        window.speechSynthesis.cancel(); 
        
        try {
            recognition.stop(); // 先強迫停止舊的，確保這次是乾淨的啟動
        } catch(e) {}

        // 建立一個微小延遲再啟動，避開 iOS 的音訊切換衝突
        setTimeout(() => {
            try {
                recognition.start();
                status.innerText = "已啟動，請說 Hey Laya 喚醒我";
                btn.innerText = "監聽中...";
                btn.style.background = "#3498db"; 
                
                // 預熱靜音播放放在啟動之後，避免佔用麥克風開啟時間
                const wakeup = new SpeechSynthesisUtterance("");
                window.speechSynthesis.speak(wakeup);
            } catch (e) {
                console.log("啟動辨識失敗:", e);
            }
        }, 150); 
    });

    recognition.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        // 更新 UI 讓你知道「它真的有聽到」
        status.innerText = "偵測中：" + text; 
        console.log("偵測到語音：" + text);

        const wakeWords = ["hey laya", "laya", "嘿拉亞", "拉亞", "來啊"];
        const hasWakeWord = wakeWords.some(word => text.includes(word));

        if (hasWakeWord) {
            isAwake = true;
            speak("我在！請問要查詢什麼？");
        } else if (isAwake) {
            findAndShowRecipe(text);
        }
    };

    recognition.onend = () => {
        // 只有在非錯誤關閉的情況下才自動重啟
        console.log("辨識停止");
        // 延遲重啟，防止進入死循環報錯
        if (btn.innerText === "監聽中...") {
            setTimeout(() => { try { recognition.start(); } catch(e) {} }, 500);
        }
    };

    recognition.onerror = (e) => {
        console.error("語音錯誤:", e.error);
        if (e.error === 'no-speech') {
            status.innerText = "沒聽到聲音，請大聲一點";
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

