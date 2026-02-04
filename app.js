let recipes = [];

// 1. 確保 JSON 讀取
fetch('recipes.json')
    .then(res => res.json())
    .then(data => { 
        recipes = data; 
        console.log("食譜資料載入成功");
    })
    .catch(err => console.error("JSON 讀取失敗:", err));

const btn = document.getElementById('voice-btn');
const status = document.getElementById('status');
const resultDiv = document.getElementById('result');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    status.innerText = "瀏覽器不支援語音辨識";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';
    // 保持單次辨識模式，避免 iOS 自動靜音
    recognition.continuous = false;
    recognition.interimResults = false;

    // 關鍵點擊事件
    btn.addEventListener('click', function() {
        // --- 核心 A：聲音預熱 (解決 iPhone 沒聲音的關鍵) ---
        try {
            window.speechSynthesis.cancel(); // 先清空舊語音
            const wakeup = new SpeechSynthesisUtterance("");
            window.speechSynthesis.speak(wakeup);
        } catch (e) {
            console.log("語音預熱跳過");
        }

        // --- 核心 B：啟動辨識 ---
        try {
            recognition.start();
            status.innerText = "正在聽您說話...";
        } catch (err) {
            // 防止重複啟動的錯誤，先停再開
            recognition.stop();
            setTimeout(() => recognition.start(), 200);
        }
    });

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript.trim();
        status.innerText = "您說的是：" + text;
        findRecipe(text);
    };

    recognition.onerror = (event) => {
        status.innerText = "辨識錯誤: " + event.error;
    };

    recognition.onend = () => {
        // 當辨識結束，如果沒有結果顯示，恢復狀態
        if (status.innerText === "正在聽您說話...") {
            status.innerText = "點擊按鈕後說出品項名稱";
        }
    };
}

// 搜尋與顯示邏輯
function findRecipe(name) {
    if (!name) return;
    const recipe = recipes.find(r => name.includes(r.name));
    
    if (recipe) {
        // 顯示步驟
        let content = `<h3>${recipe.name}</h3><p>麵包：${recipe.bread}</p><ul>`;
        recipe.steps.forEach(s => {
            content += `<li>${s}</li>`;
        });
        content += "</ul>";
        resultDiv.innerHTML = content;
        
        // 執行語音朗讀
        speak(`${recipe.name}，${recipe.bread}。` + recipe.steps.join("。"));
    } else {
        resultDiv.innerHTML = "找不到該品項";
        speak("找不到品項，請再說一次。");
    }
}

// 語音朗讀函數
function speak(text) {
    // 停止之前的聲音
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-TW';
    // iPhone 專屬強化設定
    msg.volume = 1.0;
    msg.rate = 1.0;
    window.speechSynthesis.speak(msg);
}
