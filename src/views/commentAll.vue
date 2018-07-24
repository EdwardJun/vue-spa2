<style lang="sass">
    @import '../sass/page/commentAll.scss';
</style>
<template>
    <div class="page" id="comment-all-page">
        <div class="item-comment-tab">
            <div v-if="commentLabelCountList.length > 0" :class="{ active: labelItem.key==currLabel }" @click="doClickLabel(labelItem.key)" v-for="(labelItem, labelIndex) in commentLabelCountList" :key="labelIndex">{{ labelItem.desc }}<span>（{{ labelItem.count }}）</span></div>
            <div v-if="commentLabelCountList.length == 0">全部<span>（0）</span></div>
        </div>

        <div class="item-comment-list" v-if="commentList.length > 0">
            <ul class="comments-list">
                <li class="comments-item" v-for="(commentItem, commentIndex) in commentList" :key="commentIndex">
                    <div class="comments-item_h">
                        <div :style="{ 'background-image': 'url('+ (commentItem.userInfo.avatarUrl || global.defaultCommentsHeader) +')' }"></div>
                        <div>{{ commentItem.userInfo.name }}</div>
                        <div>{{ commentItem.createdAt }}</div>
                    </div>
                    <div v-if="!commentItem.onlyReward" class="comments-grade">评分 <div><div :style="{ width: commentItem.rate + '%' }"></div></div></div>
                    <div v-if="!commentItem.onlyReward">
                        <div class="comments-item_bd" >{{ commentItem.comment }}</div>
                        <div class="comments-item_ft">
                            <div><label v-if="commentItem.impression"> {{ commentItem.impression }}</label><span v-if="commentItem.integralAmount||commentItem.rewardAmount">赞赏 <i v-if="commentItem.rewardType=='integral'">{{ commentItem.integralAmount }}积分</i><i v-if="commentItem.rewardType=='money'">￥{{ commentItem.rewardAmount }}</i></span></div>
                        </div>
                    </div>
                    <div v-if="commentItem.onlyReward" class="only-reward">
                        <div><span v-if="commentItem.integralAmount||commentItem.rewardAmount">赞赏 <i v-if="commentItem.rewardType=='integral'">{{ commentItem.integralAmount }} 积分</i><i v-if="commentItem.rewardType=='money'">￥{{ commentItem.rewardAmount }}</i></span></div>
                    </div>
                </li>
            </ul>
            <div class="data-load-tip" :class="{ none : !showDataLoadTip }"><div>加载数据</div></div>
            <div class="finish-load-tips" v-if="showFinishLoadTip" :class="{ none : showFinishLoadTip }"><div>数据已加载完</div></div>
            <div class="no-cup" v-show="commentList.length==0 && !isAddData">数据已加载完</div>
        </div>

        <div class="item-not-comment" v-if="commentList.length <= 0">
            <div></div>
            <div>暂无评论...</div>
            <router-link tag="div" :to="{ name : 'technicianDetail', query : { id: techId } }">返回</router-link>
        </div>
    </div>
</template>
<script>
    import Global from '../libs/global'
    import Api from '../libs/api'
    import Util from '../libs/util'

    export default {
        data () {
            return {
                global: Global.data,
                commentLabelCountList: [],
                commentList: [],
                page: 1,
                pageSize: 20,
                showDataLoadTip: false, // 显示数据正在加载
                showFinishLoadTip: false, // 显示已经加载完成
                isDataAddEnd: false, // 数据是否已加载完
                isAddData: false, // 数据是否正在加载
                currLabel: '',
                techId: ''
            }
        },
        created () {
            let that = this
            let global = that.global
            let query = global.currPage.query
            that.techId = query.techId
            global.loading = false
            that.queryLabelCount()
            that.queryCommentList(1, '')
            window.addEventListener('scroll', that.doHandlerListScroll, true)
        },
        methods: {
            /**
             * 全部评论各个标签的评论个数
             */
            queryLabelCount () {
                let that = this
                that.$http.get(Api.COMMENT_LABEL_COUNT, {params: { techId: that.techId }}).then(res => {
                    res = res.body
                    if (res.statusCode == 200) {
                        that.commentLabelCountList = res.respData || []
                    }
                })
            },
            doClickLabel (key) {
                if (this.currLabel != key) {
                    this.queryCommentList(1, key)
                }
                this.currLabel = key
            },
            queryCommentList (page, key) {
                let that = this
                console.log(key)
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

                that.$http.get(Api.COMMENT_LIST, {
                    params: {
                        commentTag: key || '',
                        techId: that.techId,
                        pageSize: that.pageSize,
                        page: page
                    }
                }).then(res => {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData || []
                        that.handlerCommentData(res, page)
                    } else {
                        Util.tipShow(res.msg || '获取数据失败！')
                    }
                })
            },
            handlerCommentData (res, page) {
                let that = this
                if (page == 1) {
                    that.commentList = res
                    if (res.length == 0) {
                        that.isDataAddEnd = true
                    } else if (res.length < that.pageSize) {
                        that.isDataAddEnd = true
                        that.showFinishLoadTip = true
                    }
                } else {
                    res.forEach(item => {
                        that.commentList.push(item)
                    })
                    if (res.length < that.pageSize) {
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
                    that.queryCommentList()
                }
            }
        }
    }
</script>
