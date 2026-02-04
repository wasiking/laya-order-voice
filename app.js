let recipes = [];
fetch('recipes.json').then(res => res.json()).then(data => recipes = data);

const btn = document.getElementById('voice-btn');
const status = document.getElementById('status');
const resultDiv = document.getElementById('result');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let isAwake = false; // 紀錄是否已被喚醒

if (!SpeechRecognition) {
    status.innerText = "瀏覽器不支援語音辨識";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.continuous = true; 
    recognition.interimResults = false; 

    btn.addEventListener('click', () => {
        startVoiceAssistant();
    });

    function startVoiceAssistant() {
        try {
            window.speechSynthesis.cancel();
            recognition.start();
            status.innerText = "已啟動，請說 Hey Laya 喚醒我";
            btn.style.background = "#3498db"; // 變成藍色表示待命
            btn.innerText = "待命中心...";
        } catch (err) {
            console.log("辨識已在運行");
        }
    }

    recognition.onresult = (event) => {
    // 取得最新一筆辨識文字
    const text = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("偵測到：" + text);
    status.innerText = "偵測中：" + text;

    const wakeWords = ["hey laya", "laya", "嘿拉亞", "拉亞"];
    const hasWakeWord = wakeWords.some(word => text.includes(word));

    // 邏輯優化：只要聽到喚醒詞，或是已經處於喚醒狀態，就去搜尋
    if (hasWakeWord || isAwake) {
        if (hasWakeWord && !isAwake) {
            isAwake = true;
            // 這裡可以選擇不跳出 speak，直接讓使用者說下去，反應會更快
            console.log("系統已喚醒");
        }

        // 搜尋品項
        const recipe = recipes.find(r => text.includes(r.name));
        if (recipe) {
            showAndSpeakRecipe(recipe);
            // 關鍵點：執行完後立即重置狀態，等待下一次喚醒
            isAwake = false; 
        }
    };
}

function showAndSpeakRecipe(recipe) {
    // 1. 顯示內容
    let content = `<h3>${recipe.name}</h3><p>麵包：${recipe.bread}</p><ul>`;
    recipe.steps.forEach(s => content += `<li>${s}</li>`);
    content += "</ul>";
    resultDiv.innerHTML = content;

    // 2. 語音朗讀
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(`${recipe.name}。${recipe.bread}。` + recipe.steps.join("。"));
    msg.lang = 'zh-TW';
    
    // 朗讀結束後的處理 (iOS 必備：確保語音唸完後，辨識還活著)
    msg.onend = () => {
        status.innerText = "請說 Hey Laya 喚醒我";
        console.log("語音播報完畢，回到監聽狀態");
    };
    
    window.speechSynthesis.speak(msg);
}

function speak(text) {
    window.speechSynthesis.cancel(); // 停止目前的說話
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-TW';
    window.speechSynthesis.speak(msg);

}






