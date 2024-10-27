const chatData = {
    "chat": [
        { "name": "Trollzila", "text": "Eae, galera", "audio": "notif" },
        { "name": "Trollzila", "text": "Comé q cês tão?", "audio": "notif" },
        { "name": "MiauLancholia", "text": "Mergulhado", "audio": "notif" },
        { "name": "MiauLancholia", "text": "em um mar de deprê :/", "audio": "notif" },
        { "name": "RiCao", "text": "Pô, mó tristê isso", "audio": "notif" },
        { "name": "RiCao", "text": "Eu tô suave", "audio": "notif" },
        { "name": "RiCao", "text": "acabei de voltar da praia", "audio": "notif" },
        { "name": "Trollzila", "text": "Falando em mar...", "audio": "notif" },
        { "name": "Trollzila", "text": "Qual é o oceano", "audio": "notif" },
        { "name": "Trollzila", "text": "que odeia brigas?", "audio": "notif" },
        { "name": "MiauLancholia", "text": "O oceano das minhas lágrimas", "audio": "notif" },
        { "name": "EfeitoVideo", "text": "videos/A NAO AI NAO.mp4" },
        { "name": "RiCao", "text": "Affe, mó sem graça", "audio": "notif" },
        { "name": "RiCao", "text": "Deixa eu fala, é o Atlântico", "audio": "notif" },
        { "name": "Trollzila", "text": "Oceano Pacífico kkkkkk", "audio": "boom" },
        { "name": "EfeitoVideo", "text": "videos/velho-rindo.mp4" },
        { "name": "MiauLancholia", "text": "Previsível...", "audio": "notif" },
        { "name": "MiauLancholia", "text": "como a minha vontade de viver", "audio": "notif" }
    ]
};

const chatContainer = document.getElementById('chat');
const inputField = document.getElementById('inputField');
const videoOverlay = document.getElementById('videoOverlay');
const effectVideo = document.getElementById('effectVideo');
const colors = {};
const videoCache = {};

function playAudio(audio, isTrollzila) {
    const audioFile = isTrollzila && audio === "notif" ? "sons/notif-send.mp3" : `sons/${audio}.mp3`;
    const audioElement = new Audio(audioFile);
    audioElement.play();
}

function speakText(text, callback) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = callback;
    window.speechSynthesis.speak(utterance);
}

function addMessage(name, text, audio, isRight, showName) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    if (isRight) {
        messageElement.classList.add('right');
    }

    if (showName) {
        const nameElement = document.createElement('div');
        nameElement.classList.add('name');
        nameElement.innerText = name;
        nameElement.style.color = colors[name];

        const imgElement = document.createElement('img');
        imgElement.src = `imgs/${name}.png`;
        imgElement.alt = name;

        if (isRight) {
            nameElement.appendChild(imgElement);
        } else {
            nameElement.insertBefore(imgElement, nameElement.firstChild);
        }

        messageElement.appendChild(nameElement);
    }

    const textElement = document.createElement('div');
    textElement.classList.add('text');
    textElement.innerText = text;

    messageElement.appendChild(textElement);
    chatContainer.appendChild(messageElement);

    if (audio) {
        playAudio(audio, isRight);
    }

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('typing');
    typingElement.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;
    chatContainer.appendChild(typingElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return typingElement;
}

function removeTypingIndicator(typingElement) {
    chatContainer.removeChild(typingElement);
}

function typeText(text, callback) {
    let index = 0;
    inputField.value = '';

    function type() {
        if (index < text.length) {
            inputField.value += text[index];
            index++;
            setTimeout(type, 100); // Ajuste a velocidade de digitação conforme necessário
        } else {
            callback();
        }
    }

    type();
}

function playEffectVideo(videoSrc, callback) {
    videoOverlay.style.display = 'flex';
    effectVideo.src = videoSrc;
    effectVideo.play();
    effectVideo.onended = () => {
        videoOverlay.style.display = 'none';
        callback();
    };
}

function startChat() {
    let index = 0;
    let lastSender = '';

    function nextMessage() {
        if (index < chatData.chat.length) {
            const { name, text, audio } = chatData.chat[index];
            const isRight = name === "Trollzila";
            const showName = name !== lastSender;

            if (name === "EfeitoVideo") {
                playEffectVideo(text, () => {
                    index++;
                    nextMessage(); // Chama a próxima mensagem imediatamente após o vídeo
                });
            } else if (audio === "boom") {
                addMessage(name, text, audio, isRight, showName);
                speakText(text, () => {
                    index++;
                    nextMessage(); // Chama a próxima mensagem imediatamente após o TTS terminar
                });
            } else {
                const typingIndicator = showTypingIndicator();
                const delay = text.length * 50; // Ajuste o tempo conforme necessário

                if (isRight) {
                    typeText(text, () => {
                        removeTypingIndicator(typingIndicator);
                        addMessage(name, text, audio, isRight, showName);
                        inputField.value = '';
                        speakText(text, () => {
                            lastSender = name;
                            index++;
                            nextMessage(); // Chama a próxima mensagem imediatamente após o TTS terminar
                        });
                    });
                } else {
                    setTimeout(() => {
                        removeTypingIndicator(typingIndicator);
                        addMessage(name, text, audio, isRight, showName);
                        speakText(text, () => {
                            lastSender = name;
                            index++;
                            nextMessage(); // Chama a próxima mensagem imediatamente após o TTS terminar
                        });
                    }, delay);
                }
            }
        }
    }

    nextMessage();
}

function preloadVideos(callback) {
    const videoPaths = [
        "videos/A NAO AI NAO.mp4",
        "videos/velho-rindo.mp4"
        // Adicione mais caminhos de vídeos aqui conforme necessário
    ];
    let loadedVideos = 0;

    if (videoPaths.length === 0) {
        callback();
        return;
    }

    videoPaths.forEach(path => {
        const video = document.createElement('video');
        video.src = path;
        video.onloadeddata = () => {
            videoCache[path] = video;
            loadedVideos++;
            if (loadedVideos === videoPaths.length) {
                callback();
            }
        };
        video.onerror = () => {
            console.error(`Erro ao carregar o vídeo: ${path}`);
            loadedVideos++;
            if (loadedVideos === videoPaths.length) {
                callback();
            }
        };
    });
}

window.onload = () => {
    // Gerar cores aleatórias para os nomes
    chatData.chat.forEach(({ name }) => {
        if (!colors[name]) {
            colors[name] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }
    });

    // Listar todas as vozes disponíveis quando estiverem carregadas
    window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        const ptBrVoices = voices.filter(voice => voice.lang === "pt-BR");
        console.log("Vozes disponíveis (pt-BR):", ptBrVoices);
    };


    // Pré-carregar os vídeos e iniciar o chat após o carregamento
    preloadVideos(startChat);
};
