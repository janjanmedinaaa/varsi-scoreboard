const { ipcRenderer } = require('electron');

window.onload = () => {
    new Vue({
        el: '#app',
        data: {
            message: 'Hello Vue!',
            teams: [],
            level: 1,
            increment: 5,
            orderModel: 'alphabetical'
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

            addScore: function(index) {
                console.log('Add 1 in:', index)

                let data = {
                    name: 'add',
                    value: this.increment,
                    index
                }

                ipcRenderer.send('send-data-from-controller-to-scoreboard', data);
            },

            minusScore: function(index) {
                console.log('Minus 1 in:', index)

                let data = {
                    name: 'minus',
                    value: this.increment,
                    index
                }

                ipcRenderer.send('send-data-from-controller-to-scoreboard', data);
            },

            proceedFinals: function() {
                console.log('Proceed Finals');

                let data = {
                    name: 'finals',
                    order: 'ranking'
                }

                ipcRenderer.send('send-data-from-controller-to-scoreboard', data);
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
            }
        }
    })
}