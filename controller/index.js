const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;

window.onload = () => {
    new Vue({
        el: '#app',
        data: {
            message: 'Hello Vue!',
            teams: [],
            level: 1,
            increment: 5,
            orderModel: 'alphabetical',
            minutes: 0,
            seconds: 0,
        },
        methods: {
            levelSelected: function(level) {
                if(level == this.level) {
                    return {
                        'font-weight': 'bold' 
                    }
                } else {
                    return {}
                }
            },

            changeIncrement: function(level, value) {
                this.level = level
                this.increment = value
            },

            addScore: function(index, college) {
                console.log('Add 1 in:', index)

                let data = {
                    name: 'add',
                    value: this.increment,
                    index,
                    college
                }

                ipcRenderer.send('send-data-from-controller-to-scoreboard', data);
            },

            minusScore: function(index, college) {
                console.log('Minus 1 in:', index)

                let data = {
                    name: 'minus',
                    value: this.increment,
                    index,
                    college
                }

                ipcRenderer.send('send-data-from-controller-to-scoreboard', data);
            },

            proceedFinals: function() {
                console.log('Proceed Finals');

                let data = {
                    name: 'finals',
                    order: 'ranking'
                }

                let options  = {
                    buttons: ['Yes', 'Cancel'],
                    message: 'Are you sure you want to proceed to Finals?'
                }

                let response = dialog.showMessageBox(options)

                if(response == 0)
                    ipcRenderer.send('send-data-from-controller-to-scoreboard', data);
            },

            startTimer: function() {
                console.log('Start Timer');

                let data = {
                    name: 'timer-start',
                    time: {
                        minutes: this.minutes,
                        seconds: this.seconds
                    }
                }

                ipcRenderer.send('send-data-from-controller-to-scoreboard', data);
            },

            stopTimer: function() {
                console.log('Reset Timer');

                let data = {
                    name: 'timer-reset',
                    time: {
                        minutes: this.minutes,
                        seconds: this.seconds
                    }
                }

                ipcRenderer.send('send-data-from-controller-to-scoreboard', data);
            },

            autoTimer: function(minutes = 0, seconds = 0) {
                this.minutes = minutes;
                this.seconds = seconds;
            },

            resetScoreboard: function() {
                let data = {
                    name: 'scoreboard-reset',
                }

                let options  = {
                    buttons: ['Yes', 'Cancel'],
                    message: 'Are you sure you want to reset the Scoreboard?'
                }

                let response = dialog.showMessageBox(options)

                if(response == 0)
                    ipcRenderer.send('send-data-from-controller-to-scoreboard', data);
                    
                console.log(response)
            }
        },
        created: function() {
            console.log('CONTROLLER CREATED')

            // Listen to messages from Controller
            ipcRenderer.on('message-from-scoreboard-to-controller', (event, arg) => {
                console.log('Message from Scoreboard', arg)

                this.teams = (arg.name == 'teams') && arg.teams;
            });
        },
        watch: {
            orderModel: function(val, oldVal) {
                console.log(val)

                let data = {
                    name: 'sort',
                    order: val
                }

                ipcRenderer.send('send-data-from-controller-to-scoreboard', data);
            },

            minutes: function(val, oldVal) { 
                app.minutes = val || 0
                console.log('New', app.minutes)
            },

            seconds: function(val, oldVal) {
                app.seconds = val || 0
                console.log('New', app.seconds)
            }
        }
    })
}