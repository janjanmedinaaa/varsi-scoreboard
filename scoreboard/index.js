const { ipcRenderer } = require('electron');

window.onload = () => {
    const app = new Vue({
        el: '#app',
        data: {
            message: 'Hello Vue!',
            teams: [
                {
                    image: '../assets/angkas.png',
                    name: 'College of Fine Arts and Design',
                    shortcut: 'CFAD',
                    score: 0,
                    total: 0
                },
                {
                    image: '../assets/angkas.png',
                    name: 'Institute of Information and Computing Sciences',
                    shortcut: 'IICS',
                    score: 0,
                    total: 0
                },
                {
                    image: '../assets/angkas.png',
                    name: 'Conservatory of Music',
                    shortcut: 'COM',
                    score: 0,
                    total: 0
                },
                {
                    image: '../assets/angkas.png',
                    name: 'College of Sciences',
                    shortcut: 'COS',
                    score: 0,
                    total: 0
                },
                {
                    image: '../assets/angkas.png',
                    name: 'College of Tourism and Hospitality Management',
                    shortcut: 'CTHM',
                    score: 0,
                    total: 0
                },
                {
                    image: '../assets/angkas.png',
                    name: 'College of Nursing',
                    shortcut: 'CON',
                    score: 0,
                    total: 0
                }
            ]
        },
        methods: {
            getClass: function(property) {
                let classes = {}

                switch (property) {
                    case 'teams':
                        classes = {
                            'teams-container-wrap': this.teams.length > 5,
                            'teams-container': !(this.teams.length > 5)
                        }

                        break;
                    case 'team':
                        classes = {
                            'team-container-wrap': this.teams.length > 5,
                            'team-container': !(this.teams.length > 5)
                        }

                        break;
                    case 'team-name':
                        classes = {
                            'team-name-wrap': this.teams.length > 5,
                            'team-name': !(this.teams.length > 5)
                        }

                        break;
                }

                return classes;
            },

            sortTeams: function(teams, order = 'alphabetical') {
                console.log('Sort Teams')

                return teams.sort(function(a, b) {
                    if(order == 'alphabetical')
                        return a.shortcut.localeCompare(b.shortcut);
                    
                    return b.score - a.score
                })
            }
        },
        created: function () {
            console.log('SCOREBOARD CREATED')
            this.teams = this.sortTeams(this.teams)

            let data = {
                name: 'teams',
                teams: this.teams
            }

            // Send Team data to Controller view to list current number of teams
            ipcRenderer.send('send-data-from-scoreboard-to-controller', data);

            // Listen to messages from Controller
            ipcRenderer.on('message-from-controller-to-scoreboard', (event, arg) => {
                // console.log('Message from controller', arg)

                switch(arg.name) {
                    case 'add':
                        this.teams[arg.index].score += arg.value;
                        break;
                    case 'minus':
                        this.teams[arg.index].score -= arg.value;
                        break;
                    case 'sort':
                        this.teams = this.sortTeams(this.teams, arg.order)
                        break;
                    case 'finals': 
                        let sorted = this.sortTeams(this.teams, arg.order)
                        this.teams = sorted.slice(0,5);
                        break;
                    default:
                        console.log('Message from controller (unknown):', arg)
                }
            });
        }
    })
}