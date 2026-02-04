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
        const lastIndex = event.results.length - 1;
        const text = event.results[lastIndex][0].transcript.trim().toLowerCase();
        
        console.log("偵測到：" + text);

        // 1. 檢查喚醒詞 (支援英文與中文諧音)
        const wakeWords = ["hey laya", "laya", "嘿拉亞", "拉亞", "嘿拉雅"];
        const hasWakeWord = wakeWords.some(word => text.includes(word));

        if (hasWakeWord) {
            isAwake = true;
            status.innerText = "我在聽，請說出品項...";
            speak("在！請問要做什麼品項？");
            
            // 如果語音中「同時」包含了品項（例如：Hey Laya 起司堡）
            // 則直接執行搜尋
            checkAndFindRecipe(text);
        } else if (isAwake) {
            // 2. 如果已經被喚醒，則直接搜尋品項
            checkAndFindRecipe(text);
        }
    };

    recognition.onend = () => {
        recognition.start(); // 保持持續監聽
    };
}

function checkAndFindRecipe(text) {
    const recipe = recipes.find(r => text.includes(r.name));
    if (recipe) {
        status.innerText = "正在查詢：" + recipe.name;
        let content = `<h3>${recipe.name}</h3><p>麵包：${recipe.bread}</p><ul>`;
        recipe.steps.forEach(s => content += `<li>${s}</li>`);
        content += "</ul>";
        resultDiv.innerHTML = content;
        
        speak(`${recipe.name}。${recipe.bread}。` + recipe.steps.join("。"));
        
        // 報完步驟後，重設喚醒狀態，等待下一次 Hey Laya
        isAwake = false; 
        status.innerText = "請說 Hey Laya 喚醒我";
    }
}

function speak(text) {
    window.speechSynthesis.cancel(); // 停止目前的說話
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-TW';
    window.speechSynthesis.speak(msg);

}




