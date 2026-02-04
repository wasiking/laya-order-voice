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

if (!SpeechRecognition) {
    status.innerText = "您的瀏覽器不支援語音功能";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.continuous = true;
    recognition.interimResults = false;

    // 按鈕啟動監聽
    btn.addEventListener('click', () => {
        try {
            // 預熱語音引擎
            window.speechSynthesis.cancel();
            const wakeup = new SpeechSynthesisUtterance("");
            window.speechSynthesis.speak(wakeup);
            
            recognition.start();
            status.innerText = "已啟動，請說 Hey Laya 喚醒我";
            btn.innerText = "監聽中...";
            btn.style.background = "#3498db"; 
        } catch (e) {
            console.log("辨識運行中，嘗試重啟...");
            recognition.stop();
        }
    });

    recognition.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log("偵測到語音：" + text);

        const wakeWords = ["hey laya", "laya", "嘿拉亞", "拉亞", "來啊"];
        const hasWakeWord = wakeWords.some(word => text.includes(word));

        if (hasWakeWord) {
            isAwake = true;
            status.innerText = "我在聽，請說出品項...";
            speak("我在！請問要查詢什麼？");
        } else if (isAwake) {
            findAndShowRecipe(text);
        }
    };

    // 重要：修復自動重啟機制，解決第二次失效
    recognition.onend = () => {
        console.log("辨識停止，300ms 後自動重新啟動...");
        setTimeout(() => {
            try { recognition.start(); } catch (e) {}
        }, 300);
    };

    recognition.onerror = (e) => {
        console.error("語音錯誤:", e.error);
        if (e.error === 'no-speech') console.log("未偵測到聲音");
    };
}

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
