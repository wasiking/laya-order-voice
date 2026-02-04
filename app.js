let recipes = [];

// 1. 載入食譜資料庫
fetch('recipes.json')
    .then(res => res.json())
    .then(data => { 
        recipes = data; 
        console.log("資料庫已就緒");
    })
    .catch(err => {
        console.error("資料庫載入失敗:", err);
        alert("無法讀取食譜資料，請檢查 recipes.json");
    });

const btn = document.getElementById('voice-btn');
const status = document.getElementById('status');
const resultDiv = document.getElementById('result');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    status.innerText = "您的瀏覽器不支援語音功能，請使用 Chrome";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';
    // 關閉持續監聽與自動啟動，這是回歸穩定的關鍵
    recognition.continuous = false; 
    recognition.interimResults = false;

    // 2. 按鈕點擊：單次觸發辨識
    btn.addEventListener('click', () => {
        // 點擊瞬間立即停止所有說話與舊辨識，清空 iPhone 音訊頻道
        window.speechSynthesis.cancel();
        try {
            recognition.stop();
        } catch (e) {}

        status.innerText = "正在聽您說話...";
        btn.innerText = "錄音中...";
        btn.style.background = "#e67e22"; // 變色提示

        // 給予 100ms 的極短緩衝再啟動，避開 iOS 切換衝突
        setTimeout(() => {
            try {
                recognition.start();
            } catch (e) {
                console.log("辨識重啟中...");
            }
        }, 100);
    });

    // 3. 取得單次辨識結果
    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript.trim().toLowerCase();
        status.innerText = "您說的是：" + text;
        findRecipe(text);
    };

    // 4. 辨識結束（不論成功或失敗）恢復按鈕狀態
    recognition.onend = () => {
        btn.innerText = "按我說話";
        btn.style.background = "#f39c12"; // 恢復橘色
        if (status.innerText === "正在聽您說話...") {
            status.innerText = "點擊按鈕後說出品項名稱";
        }
    };

    recognition.onerror = (e) => {
        console.log("語音錯誤:", e.error);
        if (e.error === 'no-speech') {
            status.innerText = "沒聽到聲音，請再試一次";
        }
    };
}

// 5. 搜尋與顯示邏輯
function findRecipe(name) {
    if (!name) return;
    const recipe = recipes.find(r => name.includes(r.name));
    
    if (recipe) {
        let content = `<h3>${recipe.name}</h3><p>麵包：${recipe.bread}</p><ul>`;
        recipe.steps.forEach(s => content += `<li>${s}</li>`);
        content += "</ul>";
        resultDiv.innerHTML = content;
        
        // 朗讀步驟
        speak(`${recipe.name}。${recipe.bread}。` + recipe.steps.join("。"));
    } else {
        resultDiv.innerHTML = "<p style='color:red;'>找不到該品項，請再說一次</p>";
        speak("找不到品項名稱，請再試一次");
    }
}

// 6. 語音朗讀 (TTS)
function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-TW';
    msg.rate = 1.0;
    window.speechSynthesis.speak(msg);
}
