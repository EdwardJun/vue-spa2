<template>
    <div>
        <p>
            <span class="hours">{{ hour }}</span><i>时</i>
            <span class="minutes">{{ min }}</span><i class="colon">分</i>
            <span class="seconds">{{ sec }}</span><i>秒</i>
        </p>
    </div>
</template>
<script>
    import Global from '../libs/global'
    export default {
        data () {
            return {
                global: Global.data,
                hour: '00',
                min: '00',
                sec: '00',
                currCountTime: 0,
                content: ''
            }
        },
        props: {
            endTime: {
                type: String,
                required: true,
                default: ''
            },
            currentTime: {
                type: String,
                required: true,
                default: ''
            }
        },
        created () {
            let that = this
            if (that.currentTime && that.endTime) {
                let currentDate = new Date(that.currentTime.replace(/-/g, '/'))
                let endDate = new Date(that.endTime.replace(/-/g, '/'))
                let time = endDate.getTime() - currentDate.getTime()
                if (time > 0) {
                    that.startCount(time)
                }
            } else {
                return 0
            }
        },
        methods: {
            startCount (initTotal) {
                let that = this
                that.currCountTime = initTotal
                that.formatTime(that.currCountTime)
                that.doCount()
            },
            doCount () {
                let that = this
                setTimeout(function () {
                    that.currCountTime -= 1000
                    if (that.currCountTime < 1000) {
                        that.currCountTime = 0
                    } else {
                        that.doCount()
                    }
                    that.formatTime(that.currCountTime)
                }, 1000)
            },
            formatTime (millSecond) {
                let that = this
                let floor = Math.floor
                let second = millSecond / 1000
                let sec = floor(second % 60)
                let min = floor(second / 60 % 60)
                let hour = floor(second / 3600)

                that.hour = hour < 10 ? '0' + hour : hour
                that.min = min < 10 ? '0' + min : min
                that.sec = sec < 10 ? '0' + sec : sec
                if (hour == '00' && min == '00' && sec == '00') {
                    this.$emit('worldCupTimer', true)
                }
            }
        }
    }
</script>