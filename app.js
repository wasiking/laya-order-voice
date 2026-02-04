let recipes = [];
fetch('recipes.json').then(res => res.json()).then(data => recipes = data);

const btn = document.getElementById('voice-btn');
const status = document.getElementById('status');
const resultDiv = document.getElementById('result');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    status.innerText = "瀏覽器不支援語音辨識";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';

    // 關鍵點擊事件：必須確保這裡的語法絕對正確
    btn.addEventListener('click', function() {
        // 1. 聲音預熱：解決 iPhone 沒聲音的關鍵
        try {
            const wakeup = new SpeechSynthesisUtterance("");
            window.speechSynthesis.speak(wakeup);
        } catch (e) {
            console.log("語音預熱跳過");
        }

        // 2. 啟動辨識
        try {
            recognition.start();
            status.innerText = "正在聽您說話...";
        } catch (err) {
            // 防止重複啟動的錯誤
            recognition.stop();
            setTimeout(() => recognition.start(), 200);
        }
    });

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        status.innerText = "您說的是：" + text;
        findRecipe(text);
    };
}

function findRecipe(name) {
    const recipe = recipes.find(r => name.includes(r.name));
    if (recipe) {
        let content = `<h3>${recipe.name}</h3><p>麵包：${recipe.bread}</p><ul>`;
        recipe.steps.forEach(s => content += `<li>${s}</li>`);
        content += "</ul>";
        resultDiv.innerHTML = content;
        
        // 語音朗讀
        speak(`${recipe.name}的製作方式如下：${recipe.bread}。` + recipe.steps.join("。"));
    } else {
        speak("找不到這個品項，請再說一次品項名稱。");
    }
}

function speak(text) {
    window.speechSynthesis.cancel(); // 停止目前的說話
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-TW';
    window.speechSynthesis.speak(msg);

}



