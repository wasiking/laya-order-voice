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

    // --- 關鍵修改：點擊事件 ---
    btn.addEventListener('click', () => {
        // 第一步：立即取消所有語音並播放一個「空聲音」來解鎖 iOS 權限
        window.speechSynthesis.cancel();
        const unlock = new SpeechSynthesisUtterance(" ");
        window.speechSynthesis.speak(unlock); 

        // 第二步：停止舊的辨識
        try { recognition.stop(); } catch(e) {}

        status.innerText = "正在聽您說話...";
        btn.innerText = "錄音中...";
        btn.style.background = "#e67e22";

        // 第三步：啟動辨識
        recognition.start();
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
        if (e.error === 'no-speech') status.innerText = "沒聽到聲音，請再試一次";
    };
}

function findAndShowRecipe(name) {
    const recipe = recipes.find(r => name.includes(r.name));
    if (recipe) {
        let content = `<h3>${recipe.name}</h3><p>麵包：${recipe.bread}</p><ul>`;
        recipe.steps.forEach(s => content += `<li>${s}</li>`);
        content += "</ul>";
        resultDiv.innerHTML = content;
        
        // 朗讀結果
        speak(`${recipe.name}，${recipe.bread}。` + recipe.steps.join("。"));
    } else {
        resultDiv.innerHTML = "找不到品項";
        speak("找不到品項，請再說一次。");
    }
}

function speak(text) {
    // 確保在朗讀新內容前先清空頻道
    window.speechSynthesis.cancel();
    
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-TW';
    msg.volume = 1.0; 
    msg.rate = 1.0;   
    
    // iOS 有時需要這行來確保語音被排入隊列
    window.speechSynthesis.speak(msg);
}
