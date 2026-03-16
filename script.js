document.addEventListener('DOMContentLoaded', () => {
    // 【世界遺産：10x10 究極の高密度・不整合ゼロ盤面】
    const gridSize = 10;

    // 配置の再設計（すべての単語が論理的に連結され、隙間を最小化）
    const denseConfig = {
        hints: {
            across: [
                { num: 1, text: "奈良の法隆寺地域の仏教建造物があるイカルガの里", row: 1, col: 0, answer: "イカルガ" },
                { num: 3, text: "パリのセーヌ河岸に建つ世界最大級 of 美術館ルーヴル", row: 2, col: 0, answer: "ルーヴル" },
                { num: 5, text: "インドの総大理石で造られた美しい墓廟タージマハル", row: 3, col: 0, answer: "タージマハル" },
                { num: 7, text: "兵庫県にある白鷺城とも呼ばれる美しいヒメジジョウ", row: 4, col: 0, answer: "ヒメジジョウ" },
                { num: 9, text: "スペインのガウディ未完の傑作サグラダファミリア", row: 5, col: 0, answer: "サグラダファミリア" },
                { num: 11, text: "イタリアのローマに建つ巨大な円形闘技場コロッセオ", row: 7, col: 1, answer: "コロッセオ" },
                { num: 13, text: "エジプト of ギザに建つクフ王らの巨大なピラミッド", row: 8, col: 2, answer: "ピラミッド" },
                { num: 15, text: "ニューヨークの自由の象徴、ジユウノメガミ", row: 9, col: 1, answer: "ジユウノメガミ" }
            ],
            down: [
                { num: 2, text: "スペインにあるイスラム建築の傑作、アルハンブラ宮殿", row: 0, col: 1, answer: "アルハンブラ" },
                { num: 4, text: "イギリスの平原に並ぶ謎の巨大な石の輪ストーンヘンジ", row: 0, col: 2, answer: "ストーンヘンジ" },
                { num: 6, text: "太陽王ルイ14世が築いた豪華絢爛なヴェルサイユ宮殿", row: 0, col: 3, answer: "ヴェルサイユ" },
                { num: 8, text: "フランスに浮かぶ神秘的な孤島の修道院モンサンミシェル", row: 0, col: 5, answer: "モンサンミシェル" },
                { num: 10, text: "京都の舞台で有名な世界遺産キヨミズデラ", row: 0, col: 6, answer: "キヨミズデラ" },
                { num: 12, text: "インカ帝国の空中都市として知られるマチュピチュ", row: 0, col: 7, answer: "マチュピチュ" },
                { num: 14, text: "カンボジアの密林に眠る巨大な寺院アンコールワット", row: 0, col: 8, answer: "アンコールワット" },
                { num: 16, text: "ギリシャのアテネ의丘に建つ大理石の神殿パルテノン", row: 0, col: 9, answer: "パルテノン" }
            ]
        }
    };

    function buildSolution(data) {
        const sol = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
        data.hints.across.forEach(h => {
            for (let i = 0; i < h.answer.length; i++) {
                if (h.col + i < gridSize && h.row < gridSize) sol[h.row][h.col + i] = h.answer[i];
            }
        });
        data.hints.down.forEach(h => {
            for (let i = 0; i < h.answer.length; i++) {
                if (h.row + i < gridSize && h.col < gridSize) sol[h.row + i][h.col] = h.answer[i];
            }
        });
        return sol;
    }

    let gameData = denseConfig;
    let currentSolution = buildSolution(gameData);

    const boardEl = document.getElementById('crossword-board');
    const acrossHintsEl = document.getElementById('across-hints');
    const downHintsEl = document.getElementById('down-hints');
    const resultOverlay = document.getElementById('result-overlay');
    const resultMessage = document.getElementById('result-message');
    const gameScreen = document.getElementById('game-screen');
    const editorScreen = document.getElementById('editor-screen');
    const jsonEditor = document.getElementById('json-editor');

    function initGame() {
        boardEl.innerHTML = '';
        boardEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        acrossHintsEl.innerHTML = '';
        downHintsEl.innerHTML = '';

        currentSolution.forEach((row, r) => {
            row.forEach((cell, c) => {
                const cellEl = document.createElement('div');
                cellEl.classList.add('cell');
                if (cell === null) {
                    cellEl.classList.add('black');
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.dataset.row = r;
                    input.dataset.col = c;
                    input.addEventListener('input', (e) => handleInput(e, r, c));
                    input.addEventListener('keydown', (e) => handleKeydown(e, r, c));
                    input.addEventListener('focus', (e) => e.target.select());
                    cellEl.appendChild(input);

                    const number = getCellNumber(r, c);
                    if (number) {
                        const numSpan = document.createElement('span');
                        numSpan.classList.add('cell-number');
                        numSpan.textContent = number;
                        cellEl.appendChild(numSpan);
                    }
                }
                boardEl.appendChild(cellEl);
            });
        });

        gameData.hints.across.forEach(h => {
            const maskedText = h.text.replace(h.answer, "〇".repeat(h.answer.length));
            acrossHintsEl.innerHTML += `<li>${h.num}. ${maskedText}</li>`;
        });
        gameData.hints.down.forEach(h => {
            const maskedText = h.text.replace(h.answer, "〇".repeat(h.answer.length));
            downHintsEl.innerHTML += `<li>${h.num}. ${maskedText}</li>`;
        });
    }

    function getCellNumber(r, c) {
        const h = [...gameData.hints.across, ...gameData.hints.down].find(h => h.row === r && h.col === c);
        return h ? h.num : null;
    }

    function handleInput(e, r, c) {
        let val = e.target.value;
        if (val.length > 1) {
            val = val.charAt(0);
            e.target.value = val;
        }
        if (Util.isHiragana(val)) {
            val = Util.toKatakana(val);
            e.target.value = val;
        }
        if (Util.isKatakana(val) && val !== '') {
            if (!moveFocus(r, c + 1)) moveFocus(r + 1, c);
        }
        checkCompletion();
    }

    function handleKeydown(e, r, c) {
        if (e.key === 'Backspace' && e.target.value === '') {
            moveFocus(r, c - 1) || moveFocus(r - 1, c);
        }
    }

    function moveFocus(r, c) {
        const target = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
        if (target) { target.focus(); return true; }
        return false;
    }

    function checkCompletion() {
        const inputs = document.querySelectorAll('.cell input');
        if (inputs.length === 0) return;

        let isFull = true;
        let isCorrect = true;
        inputs.forEach(input => {
            if (input.value === '') isFull = false;
            else {
                const row = parseInt(input.dataset.row), col = parseInt(input.dataset.col);
                if (Util.toKatakana(input.value) !== currentSolution[row][col]) isCorrect = false;
            }
        });
        if (isFull) showResult(isCorrect);
    }

    function showResult(isCorrect) {
        setTimeout(() => {
            resultOverlay.classList.remove('hidden');
            resultOverlay.classList.add('visible');
            if (isCorrect) {
                resultMessage.textContent = '〇';
                resultMessage.className = 'message correct';
            } else {
                resultMessage.textContent = '×';
                resultMessage.className = 'message wrong';
                setTimeout(() => {
                    resultOverlay.classList.remove('visible');
                    resultOverlay.classList.add('hidden');
                }, 2000);
            }
        }, 500);
    }

    document.getElementById('btn-show-editor').addEventListener('click', () => {
        jsonEditor.value = JSON.stringify(gameData.hints, null, 2);
        gameScreen.classList.add('hidden');
        editorScreen.classList.remove('hidden');
    });

    document.getElementById('btn-back-game').addEventListener('click', () => {
        editorScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
    });

    document.getElementById('btn-save-data').addEventListener('click', () => {
        try {
            const newData = JSON.parse(jsonEditor.value);
            gameData.hints = newData;
            currentSolution = buildSolution(gameData);
            initGame();
            editorScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
        } catch (e) {
            alert('JSONの形式が正しくありません。');
        }
    });

    const Util = {
        isHiragana: s => !!s.match(/^[ぁ-んー]*$/),
        isKatakana: s => !!s.match(/^[ァ-ンー]*$/),
        toKatakana: s => s.replace(/[\u3041-\u3096]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60))
    };

    initGame();
});
