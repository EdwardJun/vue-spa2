<style lang="sass">
    @import '../sass/page/worldCup.scss';
</style>
<template>
    <div class="page" id="world-cup-page">
        <div class="item-mask" v-if="global.reminds.worldCupInlet==1">
            <div class="item-pre" @click="doClickSession(matchData.preActivityId, matchData.baseActivityId)" v-if="matchData.preActivityId">上一场</div>
            <div class="item-pre" @click="doClickBase(matchData.baseActivityId)" v-if="matchData.quickBtn==1">当前场</div>
            <div class="item-date">{{ matchData.matchDate }}</div>
            <div class="item-next" @click="doClickSession(matchData.nextActivityId, matchData.baseActivityId)" v-if="matchData.nextActivityId">下一场</div>
        </div>
        <div class="item-container">
            <div class="top-bg">
                <router-link :to="{ path: '/' + global.clubId + '/home' }" tag="div" class="home" ></router-link>
            </div>

            <!--即将开始/敬请期待-->
            <div class="item-start" v-show="global.reminds.worldCupInlet==1" v-if="matchData.matchStatus == 1 || matchData.matchStatus == 0 || matchData.status == 3">
                <div class="item-bg">
                    <!-- matchStatus  0待定，1已上线，2即将开始，3进行中，4已结束 -->
                    <div class="item-title" v-if="matchData.matchStatus == 1">
                        <div>竞猜开始时间</div>
                        <div>{{ matchData.guessStartTime }} 至 {{ matchData.guessEndTime }}</div>
                    </div>
                    <div class="item-title-expect" v-if="matchData.matchStatus == 0">敬请期待!</div>
                    <div class="item-title-end" v-if="matchData.matchStatus == 3">本场竞猜活动已结束</div>
                    <div class="item-country">
                        <div :style="{ backgroundImage : 'url('+(matchData.leftTeamImgUrl || './static/images/ball.png')+')' }"><span>{{ matchData.leftTeam }}</span></div>
                        <div :style="{ backgroundImage : 'url('+(matchData.rightTeamImgUrl || './static/images/ball.png')+')' }"><span>{{ matchData.rightTeam }}</span></div>
                    </div>
                </div>
            </div>

            <!-- 会所关闭活动显示 -->
            <div class="item-start item-over" v-if="global.reminds.worldCupInlet==0">
                <div class="item-bg">
                    <div></div>
                </div>
            </div>

            <!-- 进行中 -->
            <div class="item-get-on" v-show="global.reminds.worldCupInlet==1" v-if="matchData.matchStatus==2 || matchData.status == 0 || matchData.status == 1 || matchData.status == 2 ">
                <div class="item-bg">
                    <!-- matchData.matchStatus != 3  -->
                    <div class="item-title" v-if="matchData.guessEndTime > matchData.systemTime">
                        <div>距离本场竞猜结束</div>
                         <count-down @worldCupTimer="worldCupTimer" v-if="matchData.guessEndTime && matchData.systemTime" :end-time="matchData.guessEndTime" :current-time="matchData.systemTime"></count-down>
                    </div>
                    <div class="item-title" v-if="matchData.systemTime >= matchData.guessEndTime"><div>本场竞猜活动已结束</div></div>
                    <div class="item-country">
                        <div :style="{ backgroundImage : 'url('+(matchData.leftTeamImgUrl || './static/images/ball.png')+')' }"><span v-if="matchData.matchStatus!=2">{{ matchData.leftTeam }}</span></div>
                        <div :style="{ backgroundImage : 'url('+(matchData.rightTeamImgUrl || './static/images/ball.png')+')' }"><span v-if="matchData.matchStatus!=2">{{ matchData.rightTeam }}</span></div>
                    </div>
                    <div class="item-btn-vs" v-if="matchData.matchStatus==2">
                        <div @click="doClickSelcted(matchData.leftTeam, 'left')" :class="{ active: guessTeamStatus=='left' }">{{ matchData.leftTeam }} <div>胜</div></div>
                        <div @click="doClickSelcted('平局', 'center')" :class="{ active: guessTeamStatus=='center' }">平局</div>
                        <div @click="doClickSelcted(matchData.rightTeam, 'right')" :class="{ active: guessTeamStatus=='right' }">{{ matchData.rightTeam }} <div>胜</div></div>
                    </div>
                    <div class="item-result" v-if="matchData.matchStatus==3">
                        <div>我的竞猜： {{ matchData.guessTeam }}</div>
                        <div>比赛结果： {{ matchData.status==0? '待公布' : matchData.winTeam + '&nbsp;&nbsp;&nbsp;胜' }}</div>
                    </div>
                </div>
            </div>

            <div class="item-gift active"  v-if="global.reminds.worldCupInlet==1 && matchData.matchStatus != 0">
                <div class="item-title">竞猜正确将获得：</div>
                <div class="item-class-gift" :class="{ active: matchData.status==3 || matchData.status==1 }">
                    <div v-for="(item, index) in matchData.itemList" :key="index" :class="'couponType' + item.type">
                        <i>{{ item.type==0?'积分':(item.type==1?'礼品券':item.type==2? '优惠券':'项目券')}}</i>
                        <span v-if="item.type!=0"><span>{{ item.itemName }}</span> * {{ item.count }}</span>
                        <span v-if="item.type==0">{{ item.count }}</span>
                    </div>
                </div>
                <div class="item-describe" v-if="matchData.status!=1 && matchData.status!=2">* 奖品将于本场比赛结束后自动发放</div>
                <div class="item-describe" v-if="matchData.status==1">很遗憾，本次竞猜未中奖...</div>
                <div class="item-describe" v-if="matchData.status==2">奖品已发放，详情请前往 <router-link tag="span" :to="{ name: 'personal' }">个人中心</router-link> 查看</div>

                <!-- await：待揭晓 not-winning:未中奖 winning:中奖  not-participate: 未参与-->
                <div class="mask" v-if="matchData.matchStatus == 3" :class="{ awaits: matchData.status == 0, notWinning: matchData.status == 1, winning: matchData.status == 2, notParticipate: matchData.status == 3 }"></div>

            </div>
        </div>

        <div class="item-bottom">
            <router-link v-if="matchData.matchStatus!=2 || global.reminds.worldCupInlet==0" tag="div" class="item-btn" :to="{ name : 'activities' }">更多活动</router-link>
            <div class="item-btn" v-if="matchData.matchStatus==2" @click="doClickCommit()" :class="{ active: !guessTeamStatus }">提交竞猜</div>
            <router-link :to="{ name: 'worldCupList' }" tag="div" class="item-btn" v-if="matchData.matchStatus==3 && matchData.status != 3" >查看竞猜记录</router-link>
        </div>
        
        
        <div class="item-end" v-show="timeStatus">
            <div>
                <div></div>
                <div @click="doClickCon()">我知道了</div>
            </div>
        </div>
    </div>
</template>
<script>
    import Global from '../libs/global'
    import Util from '../libs/util'
    import eventHub from '../libs/hub'
    import CountDown from '../components/world-cup-count-dowm'

    export default {
        components: {
            CountDown
        },
        data () {
            return {
                global: Global.data,
                guessTeam: '',
                guessTeamStatus: '',
                activityId: '',
                baseActivityId: '',
                timeStatus: false,
                cupDescribe: '竞猜正确后奖品将直接发放到绑定的手机号上，到店凭手机号即可使用',
                matchData: {}
            }
        },
        created () {
            let that = this
            let global = that.global
            let query = global.currPage.query
            that.activityId = query.actId || ''
            // console.log(global.reminds.worldCupInlet)
            if (global.reminds.worldCupInlet == 0) {
                this.global.loading = false
                return
            }
            this.queryMatch()
            this.startTimer()
        },
        methods: {
            startTimer () {
                let that = this
                let timer = setInterval(function () {
                    let thisDate = Util.dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')
                    if (that.matchData && thisDate > that.matchData.guessStartTime) {
                        that.queryMatch()
                        clearInterval(timer)
                    }
                }, 6000)
            },
            queryMatch () {
                let that = this
                that.matchData.guessEndTime = ''
                this.global.loading = false
                that.$http.get('../api/v2/user/worldcup/betting/match/info', {
                    params: {
                        clubId: that.global.clubId || '',
                        worldCupActivityId: that.activityId,
                        baseActivityId: that.baseActivityId
                    }
                }).then(res => {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData || []
                        if (res.matchDate) {
                            let matchDate = res.matchDate.split(' ')[0].split('-')
                            res.matchDate = matchDate[1] + '月' + matchDate[2] + '日'
                        }
                        that.guessTeamStatus = ''
                        that.matchData = res
                    } else {
                        Util.tipShow(res.msg || '获取数据失败！')
                    }
                })
            },
            /**
             * 上一场 下一场
             */
            doClickSession (actId, baseId) {
                this.activityId = actId
                this.baseActivityId = baseId
                this.$router.push({name: 'worldCup', query: {actId: actId}})
                this.queryMatch()
            },
            /**
             * 当前场
             */
            doClickBase (baseId) {
                this.baseActivityId = baseId
                this.activityId = baseId // 点击当前场时worldCupActivityId传baseActivityId的值
                this.$router.push({name: 'worldCup', query: {actId: baseId}})
                this.queryMatch()
            },
            doClickSelcted (guessTeam, guessTeamStatus) {
                this.guessTeam = guessTeam
                this.guessTeamStatus = guessTeamStatus
            },
            doClickCommit () {
                let that = this
                if (!that.global.userTel) {
                    return eventHub.$emit('pop-bind-phone', that.cupDescribe)
                }
                let thisDate = Util.dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')
                if (that.matchData.guessEndTime < thisDate) {
                    return
                }
                if (!that.guessTeam) {
                    return
                }
                that.$http.get('../api/v2/user/worldcup/match/betting', {
                    params: {
                        clubId: that.global.clubId || '',
                        guessTeam: that.guessTeam,
                        worldCupActivityId: that.matchData.worldCupActivityId
                    }
                }).then(res => {
                    res = res.body
                    if (res.statusCode == 200) {
                        Util.tipShow('参与竞猜成功')
                        that.queryMatch()
                    } else {
                        Util.tipShow(res.msg || '参与竞猜失败')
                    }
                }, function () {
                    Util.tipShow('参与竞猜失败')
                })
            },
            /**
             * 活动结束后的回调
             */
            worldCupTimer (status) {
                // 未参与时需要弹窗
                if (this.matchData.matchStatus == 2 && this.matchData.status == 4) {
                    this.timeStatus = status
                } else {
                    this.queryMatch()
                }
            },
            doClickCon () {
                this.timeStatus = false
                this.queryMatch()
            }
        }
    }
</script>
