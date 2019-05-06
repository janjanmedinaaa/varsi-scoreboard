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

            toSeconds: function(minutes = 0, seconds = 0) {
                return seconds + (minutes * 60)
            },

            autoTimer: function(seconds = 0) {
                let currTimer = this.toSeconds(this.minutes, this.seconds);
                
                currTimer += seconds;
                
                let format = this.formatTime(0, currTimer)

                this.minutes = format.minutes;
                this.seconds = format.seconds;
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

            addToTotalScore: function() {
                let data = {
                    name: 'add-to-total',
                }

                let options  = {
                    buttons: ['Yes', 'Cancel'],
                    message: 'Are you sure you want to add the current score to the total score?'
                }

                let response = dialog.showMessageBox(options)

                if(response == 0)
                    ipcRenderer.send('send-data-from-controller-to-scoreboard', data);
                    
                console.log(response)
            },

            sortScoreboard: function(order) {
                let data = {
                    name: 'sort',
                    order: order
                }

                ipcRenderer.send('send-data-from-controller-to-scoreboard', data);
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