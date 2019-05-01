const { ipcRenderer } = require('electron');

const Store = require('electron-store');
const store = new Store();

const data = require('../data');

window.onload = () => {
    Vue.component('modal', {
        props: ['time'],
        template: '#modal-template'
    })
    
    const app = new Vue({
        el: '#app',
        data: {
            message: 'Hello Vue!',
            showModal: false,
            time: '00:00',
            interval: null,
            displayTeams: []
        },
        methods: {
            sendStartup: function(dbTeams) {
                let data = {
                    name: 'teams',
                    teams: dbTeams
                }
    
                // Send Team data to Controller view to list current number of teams
                ipcRenderer.send('send-data-from-scoreboard-to-controller', data);
            },

            getClass: function(property) {
                let classes = {}

                switch (property) {
                    case 'teams':
                        classes = {
                            'teams-container-wrap': this.displayTeams.length > 5,
                            'teams-container': !(this.displayTeams.length > 5)
                        }

                        break;
                    case 'team':
                        classes = {
                            'team-container-wrap': this.displayTeams.length > 5,
                            'team-container': !(this.displayTeams.length > 5)
                        }

                        break;
                    case 'team-name':
                        classes = {
                            'team-name-wrap': this.displayTeams.length > 5,
                            'team-name': !(this.displayTeams.length > 5)
                        }

                        break;
                }

                return classes;
            },

            saveTeams: function(teams = data.teams, reset = false) {
                let dbTeams = store.get('teams')
                console.log('save teams')

                if(dbTeams === undefined || dbTeams === null || reset) {
                    store.set('teams', data.teams)
                    console.log('Store team set')

                    dbTeams = data.teams
                } else {
                    store.set('teams', teams)
                    console.log('Store team new')

                    dbTeams = teams
                }

                console.log('WOW', dbTeams)

                return dbTeams
            },

            sortTeams: function(teams, order = 'alphabetical') {
                console.log('Sort Teams')

                return teams.sort(function(a, b) {
                    if(order == 'alphabetical')
                        return a.shortcut.localeCompare(b.shortcut);
                    
                    return b.score - a.score
                })
            },

            timer: function(minutes = 0, seconds = 0) {
                let data = this.formatTime(minutes, seconds);

                minutes = data.minutes;
                seconds = data.seconds;

                app.interval = setInterval(function() {
                    if(minutes != 0 && seconds < 0) {
                        minutes -= 1; seconds = 59;
                    }

                    app.time = app.twoDigitFormat(minutes) + ':' + app.twoDigitFormat(seconds)
                    seconds -= 1;

                    if(minutes == 0 && seconds < 0)
                        clearInterval(app.interval)

                }, 1000)
            },

            formatTime: function(minutes = 0, seconds = 0) {
                minutes = parseInt(minutes);
                seconds = parseInt(seconds);

                if(seconds >= 60) {
                    let addMinutes = seconds / 60
                    minutes += addMinutes
                    seconds = seconds % 60
                }

                minutes = Math.floor(minutes)

                return {
                    minutes,
                    seconds
                }
            },

            twoDigitFormat: function(n = 0) {
                return n > 9 ? "" + n: "0" + n;
            },

            getIndex: function(search) {
                let index = 0;

                this.displayTeams.forEach((college, i) => {
                    if(college.shortcut == search) 
                        index = i
                });

                return index;
            }
        },
        created: function () {
            console.log('SCOREBOARD CREATED')
            let getDbTeams = store.get('teams')
    
            let dbTeams = this.saveTeams(getDbTeams)

            console.log('DBTEAMS', dbTeams)
            dbTeams = this.sortTeams(dbTeams)

            this.displayTeams = dbTeams

            this.sendStartup(dbTeams);

            // Listen to messages from Controller
            ipcRenderer.on('message-from-controller-to-scoreboard', (event, arg) => {
                console.log('Message from controller', arg)

                switch(arg.name) {
                    case 'add':
                        let index1 = this.getIndex(arg.college)
                        this.displayTeams[index1].score += arg.value;
                        break;
                    case 'minus':
                        let index2 = this.getIndex(arg.college)
                        this.displayTeams[index2].score -= arg.value;
                        break;
                    case 'sort':
                        this.displayTeams = this.sortTeams(this.displayTeams, arg.order)
                        break;
                    case 'finals': 
                        let sorted = this.sortTeams(this.displayTeams, arg.order)
                        this.displayTeams = sorted.slice(0,5);
                        break;
                    case 'timer-start':
                        if(!app.showModal) {
                            app.showModal = true;
                            let minutes = parseInt(arg.time.minutes) || 0
                            let seconds = parseInt(arg.time.seconds) || 0

                            console.log(app.showModal, minutes, seconds);
                            let fixTime = app.formatTime(minutes, seconds);

                            app.time = app.twoDigitFormat(fixTime.minutes) + ':' + app.twoDigitFormat(fixTime.seconds);
                        } else {
                            let minutes = parseInt(arg.time.minutes) || 0
                            let seconds = parseInt(arg.time.seconds) || 0

                            console.log(app.showModal, minutes, seconds);
                            app.timer(minutes, seconds)
                        }

                        break;
                    case 'timer-reset': 
                        if(app.showModal) {
                            clearInterval(app.interval);
                            app.interval = null;
                            app.showModal = false;

                            app.timer(0, 0)
                        }

                        break;
                    case 'scoreboard-reset': 
                        store.set('teams', data.teams);

                        let dbTeams = this.sortTeams(store.get('teams'))
                        this.displayTeams = dbTeams

                        this.sendStartup(dbTeams)
                        break;
                    default:
                        console.log('Message from controller (unknown):', arg)
                }

                if(arg.name !== 'scoreboard-reset') {
                    let saveTeams = this.saveTeams(this.displayTeams)
                    console.log('Save New Teams', saveTeams)
                }
            });
        }
    })
}