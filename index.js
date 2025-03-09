let playerData = [
    {
        'name': 'Zachary',
        'duluthPicks': [4607, 3277, 6381],
    },
    {
        'name': 'Benji',
        'duluthPicks': [1732, 6217, 2143]
    },
    {
        'name': 'Samantha',
        'duluthPicks': [3197, 3293, 4011]
    },
    {
        'name': 'Bensell',
        'duluthPicks': [1714, 6574, 2823]
    },
    {
        'name': 'Mason',
        'duluthPicks': [1619, 6709, 1306]
    },
    {
        'name': 'Noley',
        'duluthPicks': [7028, 5653, 3291]
    },
    {
        'name': 'Grace & Addie',
        'duluthPicks': [6421, 5903, 2526]
    },
    {
        'name': 'Eric',
        'duluthPicks': [6147, 2847, 5586]
    },
    {
        'name': 'Gabe',
        'duluthPicks': [876, 8122, 2846]
    },
    {
        'name': 'James',
        'duluthPicks': [2181, 3100, 3206]
    },
    {
        'name': 'Nathan',
        'duluthPicks': [10490, 3381, 7619]
    }
];

const resultsTable = document.getElementById('results-table');

var teamPoints;
var teamOrder;
var totalTeamPoints;
var opr;

const tbaOptions = {
    headers: {
        'X-TBA-Auth-Key': 'sBluV8DKQA0hTvJ2ABC9U3VDZunUGUSehxuDPvtNC8SQ3Q5XHvQVt0nm3X7cvP7j'
    }
}

async function getScores() {
    teamPoints = [];
    teamOrder = [];
    totalTeamPoints = [];
    for (let p = 0; p < playerData.length; p++) {
        let tempCurrentPointArray = [];
        let tempCurrentOrderArray = [];
        let currentPlayerData = playerData[p];
        for (let t = 0; t < currentPlayerData.duluthPicks.length; t++) {
            let currentScore = 0;
            await calculateTeamMatchData(currentPlayerData.duluthPicks[t]).then(result => {
                currentScore += parseInt(result);
            });
            await calculateTeamAwardData(currentPlayerData.duluthPicks[t]).then(result => {
                currentScore += parseInt(result);
            });
            tempCurrentPointArray.push(currentScore);
            tempCurrentOrderArray.push(currentPlayerData.duluthPicks[t]);
        }
        teamPoints.push(tempCurrentPointArray);
        teamOrder.push(tempCurrentOrderArray);

        let count = 0;
        for (let c = 0; c < tempCurrentPointArray.length; c++) {
            count += tempCurrentPointArray[c];
        }
        totalTeamPoints.push(count);
    }
    return new Promise(resolve => {
        setTimeout(() => {
            resolve("Operation completed");
        }, 1000);
    });
}

function getEventOPR() {
    opr = [];

    return new Promise((resolve, reject) => {

        fetch(`https://www.thebluealliance.com/api/v3/event/2025mndu/oprs`, tbaOptions)
            .then((response) => response.json())
            .then((json) => {

                let sortable = [];
                for (var team in json.oprs) {
                    sortable.push([team, json.oprs[team]]);
                }

                sortable.sort(function (a, b) {
                    return b[1] - a[1];
                });

                //console.log(sortable);
                for (let i = 0; i < 10; i++) {
                    opr.push(parseInt(String(sortable[i][0]).substring(3)));
                }
                console.log(opr);
                resolve();
            });
    });
}

function calculateTeamMatchData(team) {
    let teamWinsQualifications = 0;
    let teamWinsSemis = 0;
    let teamWinsFinals = 0;
    let teamTies = 0;
    let extraRankPoints = 0;
    let oprPoints = 0;

    return new Promise((resolve, reject) => {

        if (opr.includes(parseInt(team))) {
            oprPoints += 10 - opr.indexOf(parseInt(team));
        }

        fetch(`https://www.thebluealliance.com/api/v3/team/frc${team}/event/2025mndu/matches`, tbaOptions)
            .then((response) => response.json())
            .then((json) => {
                for (let m = 0; m < json.length; m++) {
                    //console.log(json[m]);

                    // Check rank points
                    if (json[m].alliances.blue.team_keys.includes(`frc${team}`)) {
                        extraRankPoints += json[m].score_breakdown.blue.rp;
                    }
                    if (json[m].alliances.red.team_keys.includes(`frc${team}`)) {
                        extraRankPoints += json[m].score_breakdown.red.rp;
                    }

                    // Check for tie
                    if (json[m].winning_alliance == 'tie') {
                        teamTies++;
                        extraRankPoints--;
                        continue;
                    }

                    // Check for win
                    if (json[m].comp_level == 'qm') {
                        if (json[m].winning_alliance == 'blue' && json[m].alliances.blue.team_keys.includes(`frc${team}`)) {
                            teamWinsQualifications++;
                            extraRankPoints -= 3;
                            continue;
                        }
                        if (json[m].winning_alliance == 'red' && json[m].alliances.red.team_keys.includes(`frc${team}`)) {
                            teamWinsQualifications++;
                            extraRankPoints -= 3;
                            continue;
                        }
                    }

                    if (json[m].comp_level == 'sf') {
                        if (json[m].winning_alliance == 'blue' && json[m].alliances.blue.team_keys.includes(`frc${team}`)) {
                            teamWinsSemis++;
                            continue;
                        }
                        if (json[m].winning_alliance == 'red' && json[m].alliances.red.team_keys.includes(`frc${team}`)) {
                            teamWinsSemis++;
                            continue;
                        }
                    }

                    if (json[m].comp_level == 'f') {
                        if (json[m].winning_alliance == 'blue' && json[m].alliances.blue.team_keys.includes(`frc${team}`)) {
                            teamWinsFinals++;
                            continue;
                        }
                        if (json[m].winning_alliance == 'red' && json[m].alliances.red.team_keys.includes(`frc${team}`)) {
                            teamWinsFinals++;
                            continue;
                        }
                    }
                }
                if (team == 7619) {
                    console.log((extraRankPoints), (teamWinsQualifications * 3), (teamTies * 2), (teamWinsSemis * 4), (teamWinsFinals >= 2 ? 0 : 5), oprPoints);
                }
                resolve((extraRankPoints) + (teamWinsQualifications * 3) + (teamTies * 2) + (teamWinsSemis * 4) + (teamWinsFinals >= 2 ? 0 : 5) + oprPoints);
            });
    });
}

function calculateTeamAwardData(team) {
    let teamAwardPoints = 0;

    return new Promise((resolve, reject) => {

        fetch(`https://www.thebluealliance.com/api/v3/team/frc${team}/event/2025mndu/awards`, tbaOptions)
            .then((response) => response.json())
            .then((json) => {
                for (let i = 0; i < json.length; i++) {
                    //console.log(json[i]);
                    switch (json[i].award_type) {
                        case 0:
                            teamAwardPoints += 8;
                            break;
                        case 9:
                            teamAwardPoints += 8;
                            break;
                        case 16:
                            teamAwardPoints += 7;
                            break;
                        case 29:
                            teamAwardPoints += 7;
                            break;
                        default:
                            teamAwardPoints += 5;
                            break;
                    }
                }
                resolve(teamAwardPoints);
            });
    });
}

async function run() {
    await getEventOPR();
    await getScores();
    console.warn('Done');
    showResults();
}

function showResults() {
    resultsTable.innerHTML = `<tr>
    <th>Player</th>
    <th>Total</th>
    <th>Pick 1</th>
    <th>Pick 2</th>
    <th>Pick 3</th>
</tr>`;

    let sortedPlayerPoints = totalTeamPoints.toSorted((a, b) => b - a);
    console.log(sortedPlayerPoints);

    for (let i = 0; i < sortedPlayerPoints.length; i++) {
        let tempRow = document.createElement('tr');
        tempRow.innerHTML = `
        <td>${playerData[totalTeamPoints.indexOf(sortedPlayerPoints[i])].name}</td>
        <td>${sortedPlayerPoints[i]}</td>
        <td><strong>${playerData[totalTeamPoints.indexOf(sortedPlayerPoints[i])].duluthPicks[0]}:</strong> ${teamPoints[totalTeamPoints.indexOf(sortedPlayerPoints[i])][0]}</td>
        <td><strong>${playerData[totalTeamPoints.indexOf(sortedPlayerPoints[i])].duluthPicks[1]}:</strong> ${teamPoints[totalTeamPoints.indexOf(sortedPlayerPoints[i])][1]}</td>
        <td><strong>${playerData[totalTeamPoints.indexOf(sortedPlayerPoints[i])].duluthPicks[2]}:</strong> ${teamPoints[totalTeamPoints.indexOf(sortedPlayerPoints[i])][2]}</td>
        `;
        resultsTable.appendChild(tempRow);
        console.log(teamOrder[i]);
    }
}

run();