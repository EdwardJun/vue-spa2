<style lang="sass">
    @import '../sass/page/worldCupList.scss';
</style>
<template>
    <div class="page" id="world-cup-list-page" :style="{ height : global.winHeight+'px' }">
        <router-link v-if="worldCupList.length <= 0 && global.clubId" class="title item-title" tag="div" :to="{ path: '/'+global.clubId+'/home' }"><div :style="{ 'background-image': 'url('+global.clubLogo+')'}"></div>{{ global.clubName }}</router-link>
        <div class="world-cup-wrap" v-if="global.reminds.worldCupInlet == 1 && worldCupList.length > 0">
            <ul>
                <li v-for="(cupItem, cupIndex) in worldCupList" :key="cupIndex">
                    <div class="item-top">
                        <router-link tag="div" class="title" :to="{ path: '/' + cupItem.clubId + '/home' }">
                            <span>{{ cupItem.clubName }}</span>
                        </router-link>
                        <i @click="doSwitchClose(cupItem)" :class="{closed: cupItem.isClosed}"></i>
                    </div>
                    <router-link tag="div" class="item-team" v-if="cupItem.isClosed" v-for="(recordItem, recordIndex) in cupItem.recordList" :key="recordIndex" :to="{ path: '/'+ cupItem.clubId +'/worldCup', query: {actId: recordItem.worldCupActivityId}}">
                        <div class="item-country">
                            <div><i :style="{ 'background-image': 'url('+ (recordItem.leftTeamImageUrl || global.defaultHeader) +')' }"></i> {{ recordItem.leftTeam }}</div><div class="item-vs">VS</div><div><i :style="{ 'background-image': 'url('+ (recordItem.rightTeamImageUrl || global.defaultHeader) +')' }"></i> {{ recordItem.rightTeam }}</div>
                            <!-- winning: 中奖  not_winning：未中奖  awaits: 待揭晓-->
                            <div :class="{ winning: recordItem.status == 2, not_winning: recordItem.status == 1, awaits: recordItem.status == 0 }"></div>
                        </div>
                        <div class="item-victory">我的竞猜：{{ recordItem.guessTeam }}<span v-if="recordItem.winTeam!='平局'">胜</span></div>
                        <div class="item-result">比赛结果：{{ recordItem.winTeam }}<span v-if="recordItem.winTeam && recordItem.winTeam!='平局'">胜</span><span v-if="!recordItem.winTeam">待公布</span></div>
                        <div class="item-date">{{ recordItem.createTime }}</div>
                    </router-link>
                </li>
            </ul>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><div>加载数据</div></div>
            <div class="finish-load-tip" :class="{ none : !showFinishLoadTip }"><div>已加载完全部数据</div></div>
            <div class="no-cup" v-show="worldCupList.length==0 && !isAddData">已加载完全部数据</div>
        </div>
        <div class="not-data" v-if="worldCupList.length <= 0">
            <div><span>暂无数据</span></div>
        </div>
    </div>
</template>
<script>
    import Global from '../libs/global'
    import Util from '../libs/util'

    export default {
        data () {
            return {
                global: Global.data,
                busy: false, // 是否正在加载过程中
                worldCupList: [],
                page: 1,
                pageSize: 20,
                showDataLoadTip: false, // 显示数据正在加载
                showFinishLoadTip: false, // 显示已经加载完成
                isDataAddEnd: false, // 数据是否已加载完
                isAddData: false // 数据是否正在加载
            }
        },
        created () {
            let that = this
            if (that.global.reminds.worldCupInlet == 0) {
                this.global.loading = false
                return
            }
            that.queryWorldCupList(1)
            window.addEventListener('scroll', that.doHandlerListScroll, true)
        },
        methods: {
            queryWorldCupList (page) {
                let that = this

                if (that.isAddData) {
                    return
                }
                that.isAddData = true
                page = page || that.page + 1

                // 更新数据加载提示
                that.showDataLoadTip = true
                that.showFinishLoadTip = false
                that.isDataAddEnd = false
                that.global.loading = false
                that.$http.get('../api/v2/user/worldcup/betting/record/list', {
                    params: {
                        page: page,
                        pageSize: that.pageSize,
                        clubId: that.global.clubId || ''
                    }
                }).then(res => {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData || []
                        that.handlerWorldCupData(res, page)
                    } else {
                        Util.tipShow(res.msg || '获取数据失败！')
                    }
                })
            },
            handlerWorldCupData (res, page) {
                const that = this
                let recordCount = 0
                res.forEach(item => {
                    item.isClosed = true
                    recordCount += item.recordList.length
                    that.worldCupList.push(item)
                })
                if (page == 1) {
                    if (recordCount == 0) {
                        that.isDataAddEnd = true
                    } else if (recordCount < that.pageSize) {
                        that.isDataAddEnd = true
                        that.showFinishLoadTip = true
                    }
                } else {
                    if (recordCount < that.pageSize) {
                        that.isDataAddEnd = true
                        that.showFinishLoadTip = true
                    }
                }
                that.page = page
                that.isAddData = false
                that.showDataLoadTip = false
            },
            doHandlerListScroll () {
                const that = this
                const body = document.body
                const global = that.global
                const scrTop = document.documentElement.scrollTop || document.body.scrollTop
                if (!that.isDataAddEnd && scrTop + global.winHeight * 1.4 > body.scrollHeight) {
                    that.queryWorldCupList()
                }
            },
            doSwitchClose (cupItem) {
                cupItem.isClosed = !cupItem.isClosed
            }
        }
    }
</script>