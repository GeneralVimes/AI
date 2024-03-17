const selectedBots = [];
window.world = new UniversalBachetWorld([1, 2, 3], true);
window.world.startTournamentBetweenBots([], 1000, 2, false);

function getAllBotsName() {
    return fetch('js/bots.js')
        .then(response => response.text())
        .then(data => {
            const botNames = [];
            const classRegex = /class\s+(\w+)\s+/g;
            let match;
            while ((match = classRegex.exec(data)) !== null) {
                botNames.push(match[1]);
            }
            return botNames;
        });
}

function generateLabel() {
    const selectElement = document.getElementById('sel1');
    if (selectElement) {
        getAllBotsName()
            .then(botNames => {
                botNames.forEach(botName => {
                    const optionElement = document.createElement('option');
                    optionElement.value = botName;
                    optionElement.textContent = botName;
                    selectElement.appendChild(optionElement);
                });
            });
    } else {
        console.error('Element with id "sel1" not found.');
    }
}

function addBot() {
    const selectElement = document.getElementById('sel1');
    const selectedBotName = selectElement.value;
    const botNameInput = document.getElementById('botNameInput');
    const botName = botNameInput.value;

    if (selectedBotName && botName) {
        selectedBots.push({ name: botName, className: selectedBotName });
        console.log(selectedBots);

        const botClass = eval(selectedBotName);
        if (botClass) {
            window.world.createKNewBotsOfClass(botClass, 1, botName);
        } else {
            console.error('Класс бота не найден.');
        }
    } else {
        console.error('Будь ласка, виберіть ім\'я бота та виберіть його клас.');
    }
}

let totalRoundsPlayed = 0;

document.addEventListener('DOMContentLoaded', function() {
    generateLabel();
});

let scores=[];

function startTournament() {
    const numberOfRounds = parseInt(document.getElementById('rounds').value);
    const leftSideElement = document.querySelector('.left-side');

    leftSideElement.innerHTML = '';

    for (let i = 0; i < numberOfRounds; i++) {
        totalRoundsPlayed++;
        selectedBots.forEach(bot => {
            if (bot.className.includes("Evo")) {
                const botClass = eval(bot.className);
                window.world.keepNoMoreThanKBestBotsOfClass(botClass, 3);
                window.world.createDescendantsOfBotsOfClass(botClass, bot.className + i);
            }
        });

        window.world.startTournamentBetweenBots(window.world.allBots, 100, 2, false);
        selectedBots.forEach(bot => {
            const botClass = eval(bot.className)
            scores.push([totalRoundsPlayed, bot.className, window.world.findAverageTournamentResultOfBotsOfClass(botClass)]);
        });
    }

    const resultContainer = document.createElement('div');
    resultContainer.classList.add('tournament-results');

    const heading = document.createElement('h2');
    heading.textContent = 'Tournament Results';
    resultContainer.appendChild(heading);

    const totalRoundsInfo = document.createElement('p');
    totalRoundsInfo.textContent = `Total rounds played: ${totalRoundsPlayed}`;
    resultContainer.appendChild(totalRoundsInfo);

    Object.entries(window.world.tournamentScores).forEach(([botName, score]) => {
        const botResult = document.createElement('div');
        botResult.classList.add('bot-result');
        botResult.innerHTML = `<strong>${botName}:</strong> ${score}`;
        resultContainer.appendChild(botResult);
    });

    leftSideElement.appendChild(resultContainer);
}


let myChart;
function makeGraphic() {
    const graphicsDiv = document.querySelector('.graphics-of-bots');

    if (myChart) {
        myChart.destroy();
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'myChart';
    graphicsDiv.innerHTML = '';
    graphicsDiv.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 100,
                        fontColor: 'rgba(0, 0, 0, 0.7)',
                    },
                    gridLines: {
                        color: 'rgba(0, 0, 0, 0.1)',
                    },
                }],
                xAxes: [{
                    ticks: {
                        fontColor: 'rgba(0, 0, 0, 0.7)',
                    },
                    gridLines: {
                        color: 'rgba(0, 0, 0, 0.1)',
                    },
                }],
            },
            legend: {
                display: true,
                position: 'top',
                labels: {
                    fontColor: 'rgba(0, 0, 0, 0.7)',
                },
            }
        }
    });

    selectedBots.forEach((bot, index) => {
        const botData = scores.filter(score => score[1] === bot.className);
        const botDataset = {
            label: bot.className,
            data: botData.map(data => data[2]),
            fill: false,
            borderColor: getRandomColor(),
            borderWidth: 1,
            tension: 0.1
        };
        myChart.data.datasets.push(botDataset);
    });

    const roundLabels = [];
    for (let i = 1; i <= totalRoundsPlayed; i++) {
        roundLabels.push(`Round ${i}`);
    }

    myChart.data.labels = roundLabels;

    myChart.update();
}


function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
