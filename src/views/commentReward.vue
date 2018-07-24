<style lang="sass">
    @import '../sass/page/commentReward.scss';
</style>
<template>
    <div class="page" id="comment-reward-page">
        <div class="item-tech" v-if="techData">
            <div class="item-tech-head" :style="{ backgroundImage: 'url('+ techData.avatarUrl +')' }"></div>
            <div class="item-tech-info">
                <div class="item-tech-name">{{ techData.name }}<span>{{ techData.serialNo }}</span></div>
                <div class="item-tech-desc">您的评价能帮助到其他小伙伴哦！</div>
            </div>
        </div>

        <!-- 第一次评论 -->
        <div>
            <div class="item-comment" v-if="dataStars.length>0">
                <div class="item-comment-stars">
                    <div class="item-comment-face" v-for="(item, index) in dataStars" :key="index" @click="doClickCommentStar(item, index)" :class="{ active: item.starStatus }">
                        <div>{{ item.description }}</div>
                        <div class="item-face"></div>
                        <div class="item-star"></div>
                    </div>
                    <div class="item-comment-labels">
                        <div v-for="(item, index) in tagList" :key="index" :class="{ active: item.tagStatus }" @click="doClickTag(item, index)">{{ item.name }}</div>
                    </div>
                </div>
            </div>

            <div class="item-write-comment">
                <textarea maxlength="200" ref="commentInput" @focus="onTextareaFocus()" @blur="onTextareaBlur()" v-model="commentInputText"></textarea>
                <span class="item-write-click" :class="{ none: !showTextareaPlaceholder }">请为我的服务，留下您宝贵的意见吧~</span>
                <div class="item-write-anonymous"><span :class="{active: isAnonymous}" @click="doCheckAnonymous()">匿名</span><span><i>{{ commentInputText.length }}/</i>200</span></div>
            </div>

            <div class="item-reward" v-if="creditSwitchOn || moneySwitchOn">
                <div class="item-reward-dashed">
                    <p></p>
                    <div>赞赏一波</div>
                </div>
                <!-- global.userAgent.isWX -->
                <div class="item-reward-tab" v-if="creditSwitchOn && moneySwitchOn">
                    <div :class="{ active: currTab == index }" @click="doClickTab(index)" v-for="(item, index) in tabList" :key="index">{{ item }}</div>
                    <p class="user-integral">(个人积分：{{ currIntegralAccount }})</p>
                </div>
                <div class="item-reward-money" v-if="currTab == 0 && moneySwitchOn">
                    <div class="money" v-for="(item, index) in moneySettingList" :key="index" @click="doClickRedPackageReward(item, index, 'money')" :class="{ active: item.redStatus }">
                        <div :class="'amountType' + item.amountType"><span v-if="item.amountType == 1">{{ item.amount | MoneyFormatter }}</span></div>
                        <div>{{ item.amountType == 2 ? '其他金额' : item.description }}</div>
                    </div>
                </div>
                <!-- global.userAgent.isWX -->
                <div class="item-reward-integral" v-if="currTab == 1 && creditSwitchOn">
                    <div class="integral" v-for="(item, index) in creditSettingList" :key="index" :class="{ active: item.creditStatus, insuInte: item.credit>currIntegralAccount }" @click="doClickCredit(item, index, 'integral')">
                        <div :style="{ backgroundImage: 'url('+ (item.imgPath || defaultImageUrl) +')' }"></div>
                        <div>{{ item.credit }}</div>
                    </div>
                    <div class="user-integral" v-if="!creditSwitchOn && !moneySwitchOn">(个人积分：{{ currIntegralAccount }})</div>
                </div>
            </div>

            <div class="item-reward-none" v-if="rewardSwitch && rewardFefaultStatus">
                <div @click="doClickRewardMoney()"></div>
                <div>满意您就给个打赏呗！</div>
            </div>
        </div>

         <div class="item-no"></div>
        <div class="item-submit-button" @click="querySaveComment()">发表评价</div>

        <div class="pop-modal item-comment-success" :class="{ active: commentSuccess }">
            <div>
                <div></div>
                <div>评论成功</div>
                <div><div @click="doClickSuccess()">确定</div></div>
            </div>
        </div>

        <div class="pop-modal item-comment-reward" :class="{ active: showCustomMoney }">
            <div>
                <div></div>
                <div>感谢您的打赏</div>
                <div>
                    <input :placeholder="`最多不超过${moneyLimit / 100}元`" type="text" maxlength="6" v-model="customMoney" @input="doInputCustomMoney">
                </div>
                <div><div @click="doClickReward()">打赏</div></div>
                <span @click="doClickCancleReward()"></span>
            </div>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import Global from '../libs/global'
    import Util from '../libs/util'
    import MoneyFormatter from '../filters/money-formatter'
    import Api from '../libs/api'
    import im from '../libs/im'
    import eventHub from '../libs/hub'
    export default {
        filters: {
            MoneyFormatter
        },
        data () {
            return {
                global: Global.data,
                rewardFefaultStatus: true,
                tabList: ['红包', '积分'],
                currTab: 0,
                showTextareaPlaceholder: true,
                moneySettingList: [], // 金额打赏
                creditSettingList: [], // 积分打赏
                creditSwitchOn: false, // 积分打赏开关
                moneySwitchOn: false, // 金额打赏开关
                moneyLimit: '', // 打赏金额限制
                showCustomMoney: false,
                defaultImageUrl: './static/images/techReward/default.png',
                currIntegralAccount: 0,
                currIndex: 4,
                tagList: [], // 印象标签列表
                dataStars: [], // 星级选择列表
                commentInputText: '', // 评论内容
                belongingsId: '', // 礼物id,打赏金额时不传
                isAnonymous: false, // Y匿名N不匿名，默认为N
                customMoney: '', // 打赏金额
                rewardType: '', // 打赏类型
                star: '5', // 星级 1代表1星，2代表2星，3代表3星，4代表4星，5代表5星
                tagIds: '', // 标签id
                selectedImpression: [], // 印象标签id
                commentSuccess: false,
                currentCreditList: [],
                commentSwitch: true, // 评论开关
                rewardSwitch: false, // 打赏开关
                isUserRewardPage: false,
                amountType: '',
                qrcodeId: '',
                qrcodeType: '',
                prePayId: '',
                techId: '',
                orderId: '',
                clubId: '',
                type: '',
                commentId: '',
                techData: {}
            }
        },
        created () {
            let that = this
            let global = that.global
            let query = global.currPage.query
            let ss = Util.sessionStorage
            that.qrcodeId = ss('qrcodeId') || ''
            that.qrcodeType = ss('qrcodeType') || ''
            that.techId = query.techId != 'undefined' ? query.techId : ''
            that.clubId = query.clubId || global.clubId
            that.orderId = query.orderId != 'undefined' ? query.orderId : query.id || ''
            that.commentId = query.commentId || ''
            if (!that.clubId) {
                Util.tipShow('页面缺少clubId参数')
                return setTimeout(() => { that.$router.back() }, 1000)
            }
            if (!that.techId) {
                Util.tipShow('页面缺少techId参数')
                return setTimeout(() => { that.$router.back() }, 1000)
            }
            that.queryCommentSwitch() // 评论开关
            that.queryIsRewardOn() // 打赏开关
        },
        methods: {
            init () {
                let that = this
                that.queryTechInfo()
            },
            /**
             * 评论开关
             * 查询是否开启评论
             * 开启评论显示第一次评论页面，否则显示二次评论页面
             */
            queryCommentSwitch () {
                let that = this
                that.$http.get(Api.COMMENT_SWITCH, {
                    params: { clubId: that.clubId }
                }).then(res => {
                    res = res.body
                    if (res.statusCode == 200) {
                        that.commentSwitch = res.respData
                        if (res.respData) { // 开启评论
                            that.init()
                        } else {
                            that.queryIsRewardOn() // 打赏开关
                        }
                    }
                })
            },
            /**
             * 打赏开关
             */
            queryIsRewardOn () {
                let that = this
                that.$http.get(Api.REWARD_ISREWARDON, {params: {clubId: that.clubId}}).then(res => {
                    res = res.body
                    if (res.statusCode == 200) {
                        that.rewardSwitch = res.respData
                        if (res.respData && !that.commentSwitch) {
                            // console.log('评论已关闭' + res.isUserRewardPage)
                            that.$router.push({name: 'twoCommentReward', query: {techId: that.techId, orderId: that.orderId}})
                        } else if (!res.respData && !that.commentSwitch) { // 金额打赏开启
                            that.getPrize()
                        }
                    }
                })
            },
            /**
             * 获取技师信息
             */
            queryTechInfo () {
                let that = this
                let global = that.global
                that.$http.get(Api.CLUB_SHARED_TECHNICIAN, {
                    params: {
                        id: that.techId,
                        type: 'tech',
                        commentId: that.commentId
                    }
                }).then(res => {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        that.isUserRewardPage = res.isUserRewardPage // 当天已评论过一次显示二次评论页
                        if (res.isUserRewardPage) { // 当天已评论过一次
                            // console.log('当天已评论过一次' + res.isUserRewardPage)
                            that.$router.push({name: 'twoCommentReward', query: {techId: that.techId}})
                        } else { // 当天未评论过
                            that.queryStarTag()
                        }
                        that.techData = res.tech
                        that.techData.avatarUrl = that.techData.avatarUrl || global.defaultHeader
                        that.clubId = that.techData.clubId
                        global.loading = false
                    }
                })
            },
            /**
             * 金额打赏 积分打赏
             */
            queryReward () {
                let that = this
                that.$http.get(Api.USER_REWARD_SETTING, {
                    params: { clubId: that.clubId }
                }).then(res => {
                    res = res.body
                    if (res.statusCode == 200) {
                        let data = res.respData
                        that.moneySettingList = data.moneySettingList || [] // 金额打赏
                        that.creditSettingList = data.creditSettingList || [] // 积分打赏
                        that.creditSwitchOn = data.creditSwitchOn // 积分打赏开关
                        that.moneySwitchOn = data.moneySwitchOn // 金额打赏开关
                        that.moneyLimit = data.moneyLimit // 打赏金额限制
                        that.rewardFefaultStatus = false
                        that.queryCreditAccount()
                    } else if (res.statusCode == 204) {
                        Util.tipShow(res.msg)
                        that.getPrize()
                    } else {
                        that.rewardFefaultStatus = false
                        Util.tipShow(res.msg)
                    }
                })
            },
            /**
             * 获取星级等级和标签描述
             */
            queryStarTag () {
                let that = this
                that.$http.get(Api.COMMENT_EACH_STAR_TAG).then(res => {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData || []
                        res.map((item, index) => {
                            if (index == 4) item.starStatus = true
                            else item.starStatus = false
                            item.tagList.map(subItem => {
                                subItem.tagStatus = false
                            })
                        })
                        that.dataStars = res
                        console.log(that.dataStars)
                        that.tagList = res[res.length - 1].tagList
                    }
                })
            },
            /**
             * 红包打赏
             */
            doClickRedPackageReward (item, index, type) {
                let that = this
                that.rewardType = item.redStatus ? '' : type
                that.showCustomMoney = item.amountType == 2 // 其他金额

                that.moneySettingList.map((redItem, redIndex) => {
                    if (index == redIndex && redItem.amountType != 2) {
                        redItem.redStatus = !item.redStatus
                    } else {
                        redItem.redStatus = false
                    }
                })
                that.creditSettingList.map((creditItem) => {
                    creditItem.creditStatus = false
                })
                // 打赏金额赋值
                that.customMoney = item.amountType != 2 && item.redStatus ? (item.amount / 100) : ''
                that.belongingsId = '' // 金额打赏时 积分id置为0
                that.amountType = item.amountType
                Vue.set(that.moneySettingList, index, that.moneySettingList[index])
            },
            /**
             * 积分打赏
             */
            doClickCredit (item, index, type) {
                let that = this
                if (item.credit > that.currIntegralAccount) {
                    return
                }
                that.rewardType = item.creditStatus ? '' : type
                that.belongingsId = !item.creditStatus ? item.belongingsId : ''
                that.customMoney = 0 // 积分打赏时 金额价格置为0
                that.currentCreditList = item

                that.creditSettingList.map((creditItem, creditIndex) => {
                    if (index == creditIndex && item.credit <= that.currIntegralAccount) {
                        creditItem.creditStatus = !item.creditStatus
                    } else {
                        creditItem.creditStatus = false
                    }
                })
                that.moneySettingList.map((moneyItem) => {
                    moneyItem.redStatus = false
                })
                Vue.set(that.creditSettingList, index, that.creditSettingList[index])
            },
            /**
             * 弹窗 打赏按钮
             */
            doClickReward () {
                let that = this
                that.showCustomMoney = false
                if (!that.customMoney) that.rewardType = ''
                that.moneySettingList.map((redItem, redIndex) => {
                    if (redItem.amountType == 2 && that.customMoney) redItem.redStatus = true
                })
            },
            /**
             * 弹窗 关闭按钮
             */
            doClickCancleReward () {
                this.customMoney = ''
                this.showCustomMoney = false
                this.rewardType = ''
                this.moneySettingList.map((redItem, redIndex) => {
                    redItem.redStatus = false
                })
            },
            /**
             * 匿名评价
             */
            doCheckAnonymous () {
                this.isAnonymous = !this.isAnonymous
            },
            /**
             * 红包 积分 tab切换
             */
            doClickTab (index) {
                this.currTab = index
            },
            /**
             * 星际评论选择
             */
            doClickCommentStar (item, index) {
                this.dataStars.map((subItem, subIndex) => {
                    if (index == subIndex) {
                        subItem.starStatus = true
                    } else {
                        subItem.starStatus = false
                    }
                })
                this.star = item.star
                this.currIndex = index
                this.tagList = item.tagList
            },
            /**
             * 标签选择
             */
            doClickTag (impressionItem, impressionIndex) {
                let that = this
                let selectedList = that.selectedImpression
                let tagList = that.tagList
                if (impressionItem.tagStatus) { // 取消选中
                    Vue.set(tagList, impressionIndex, {id: impressionItem.id, name: impressionItem.name, tagStatus: false})
                    for (let i = 0; i < selectedList.length; i++) {
                        if (selectedList[i] == impressionItem.id) {
                            selectedList.splice(i, 1)
                            break
                        }
                    }
                } else { // 选中
                    if (selectedList.length == 3) {
                        for (let i = 0; i < tagList.length; i++) {
                            if (tagList[i].id == selectedList[0]) {
                                Vue.set(tagList, i, {
                                    id: tagList[i].id,
                                    name: tagList[i].name,
                                    tagStatus: false
                                })
                                break
                            }
                        }
                        selectedList.splice(0, 1)
                    }
                    Vue.set(tagList, impressionIndex, {id: impressionItem.id, name: impressionItem.name, tagStatus: true})
                    selectedList.push(impressionItem.id)
                }
                that.onResetMoneyReward()
            },
            /**
             * 取消支付后不选中打赏区域
             */
            onResetMoneyReward () {
                // 点击相应的星级，会显示相对应的5个标签，在这5个标签中，最多选择3个，不能跨星级选择标签 。在当前星级选择标签后更改星级，若未在新星级选择新标签，则已选择旧标签仍保留，若在新星级选择新标签，则在旧星级选择的标签全部失效。
                this.dataStars.map((subItem, subIndex) => {
                    if (subIndex != this.currIndex) {
                        subItem.tagList.map(tagItem => {
                            tagItem.tagStatus = false
                        })
                    }
                })
            },
            onTextareaFocus () {
                this.showTextareaPlaceholder = false
            },
            onTextareaBlur () {
                if (this.commentInputText.length == 0) {
                    this.showTextareaPlaceholder = true
                }
            },
            doClickRewardMoney () {
                this.queryReward()
            },
            /**
             * 其他金额 金额控制
             */
            doInputCustomMoney () {
                var that = this
                var val = that.customMoney
                if (val.length == 1) {
                    if (/\D/.test(val)) {
                        val = ''
                    }
                } else {
                    val = val.replace(/[^\d.]/g, '')
                    var dotIndex = 0
                    val = val.replace(/\./g, function () {
                        if (dotIndex == 0) {
                            dotIndex = arguments[1]
                            return '.'
                        } else {
                            return ''
                        }
                    })
                    if (dotIndex > 0) {
                        val = val.substring(0, dotIndex + 3)
                    }
                }
                if (val) {
                    val = val.substr(0, 6)
                }
                that.customMoney = val
            },
            /**
             * 获取当前账户积分
             */
            queryCreditAccount () {
                let that = this
                Global.getCreditAccount(that.clubId).then(creditRes => {
                    if (creditRes && creditRes[0]) {
                        that.currIntegralAccount = creditRes[0].amount
                    }
                })
            },
            resetMoney () {
                let that = this
                that.moneySettingList.map((moneyItem, moneyIndex) => {
                    moneyItem.redStatus = false
                    Vue.set(that.moneySettingList, moneyIndex, that.moneySettingList[moneyIndex])
                })
                that.customMoney = 0
                that.rewardType = ''
            },
            /**
             * 调起微信支付
             */
            doInvokeWxPay (res, num) {
                let that = this
                let payInfo = JSON.parse(res.respData)
                that.prePayId = payInfo.package.split('=')[1]
                that.orderId = payInfo.bizId
                Global.wxJsBridgeReady(() => {
                    WeixinJSBridge.invoke('getBrandWCPayRequest', {
                        appId: payInfo.appId,
                        timeStamp: payInfo.timeStamp + '',
                        nonceStr: payInfo.nonceStr,
                        package: payInfo.package,
                        signType: payInfo.signType,
                        paySign: payInfo.paySign
                    }, function (payRes) {
                        if (payRes.err_msg.indexOf('ok') >= 0) { // 支付成功之后
                            that.commentSuccess = true
                            that.$http.post('../api/v2/wx/pay/pay_result', { prePayId: that.prePayId }).then(() => {
                                that.sendMessage(num / 100, 'money')
                            })
                            Global.scanCodeStat(that.global.clubId, that.qrcodeId, that.qrcodeType, 'reward', that.techId)
                        } else {
                            // that.onResetMoneyReward()
                            Util.tipShow('未能成功支付！')
                            that.resetMoney()
                        }
                    })
                })
            },
            /**
             * 发送打赏消息
             */
            sendMessage (val, type, giftId, giftName) {
                let that = this
                let techData = that.techData
                im.ready().then(() => {
                    if (type == 'money') {
                        im.doSendMoneyRewardMessage({
                            to: techData.emchatId,
                            data: {
                                amount: (val - 0).toFixed(2)
                            }
                        })
                    } else {
                        im.doSendGiftRewardMessage({ // 积分礼物打赏
                            to: techData.emchatId,
                            data: { giftId: giftId, giftValue: val, giftName: giftName }
                        })
                    }
                })
            },
            /**
             * 发表评价
             */
            querySaveComment () {
                let that = this
                let global = that.global
                let ua = global.userAgent
                let selectGift = that.currentCreditList
                let selectedImpression = that.selectedImpression
                let selectedImpressionList = []

                let tagList = that.tagList
                // 过滤选择的印象标签
                for (let k = 0; k < tagList.length; k++) {
                    for (let i = 0; i < selectedImpression.length; i++) {
                        if (tagList[k].id == selectedImpression[i]) {
                            selectedImpressionList.push(tagList[k].id)
                        }
                    }
                }

                if (that.rewardType == 'money') {
                    if (Number(that.customMoney) > that.moneyLimit / 100) {
                        Util.tipShow(`最多打赏${that.moneyLimit / 100}元`)
                        return false
                    }
                    if (that.amountType != 0 && !that.customMoney) {
                        Util.tipShow('请输入大于0的金额！')
                        return false
                    }
                    if (!ua.isWX && !ua.isAliPay) {
                        return Util.tipShow('请在微信或支付宝中打开！')
                    }
                } else if (that.rewardType == 'integral') {
                    if (selectGift.credit > that.currIntegralAccount) {
                        eventHub.$emit('set-credit-tip', { amount: selectGift.credit, show: true, type: 'gift' })
                    }
                } else if (that.commentSwitch && that.isUserRewardPage) {
                    return Util.tipShow('请选择打赏金额！')
                }
                that.moneyReward(that.customMoney * 100, selectGift, selectedImpressionList)
            },
            moneyReward (num, selectGift, selectedImpressionList) {
                let that = this
                let global = that.global
                let ua = global.userAgent
                that.$http.post(Api.COMMENT_SAVE, {
                    comment: that.commentInputText, // 评论内容
                    giftId: that.belongingsId, // 礼物id
                    isAnonymous: that.isAnonymous ? 'Y' : 'N', // 是否匿名
                    rewardAmount: num, // 打赏金额
                    star: that.star, // 星级
                    tagIds: selectedImpressionList.join(','), // 标签id
                    techId: that.techId // 技师id
                }).then(res => {
                    res = res.body
                    if (res.statusCode == 200) {
                        if (that.amountType != 0 && that.rewardType == 'money') {
                            if (ua.isWX) {
                                that.doInvokeWxPay(res, num)
                            } else if (ua.isAliPay) {
                                that.doInvokeAliPay(res, num)
                            }
                        } else if (that.rewardType == 'integral') {
                            this.commentSuccess = true
                            that.sendMessage(selectGift.credit, 'gift', selectGift.belongingsId, selectGift.rewardName)
                        } else {
                            that.commentSuccess = true
                            Util.tipShow(res.respData || '')
                        }
                    } else if (res.statusCode == 935801) {
                        Global.getOauthCode('9358', 'tech-reward', 'userInfo')
                    } else {
                        Util.tipShow(res.msg || '支付失败！')
                    }
                })
            },
            /**
             * 调起支付宝支付
             */
            doInvokeAliPay (res, num) {
                let that = this
                let global = that.global
                let payInfo = JSON.parse(res.respData)
                Global.alipayJsBridgeReady(() => {
                    AlipayJSBridge.call('tradePay', {
                        tradeNO: payInfo.tradeNO
                    }, function (result) {
                        if (global.debugMode) {
                            alert('支付宝支付结果：' + JSON.stringify(result))
                            that.commentSuccess = true
                            that.$http.post(Api.PAY_RESULT, { prePayId: that.prePayId }).then(() => {
                                that.sendMessage(num / 100, 'money')
                            })
                            Global.scanCodeStat(that.global.clubId, that.qrcodeId, that.qrcodeType, 'reward', that.techId)
                        }
                        if (result.resultCode == '9000') {
                            that.afterPay(payInfo.bizId)
                        } else if (result.resultCode == '8000') {
                            Util.tipShow('正在处理中！')
                        } else if (result.resultCode == '4000') {
                            Util.tipShow('支付失败！')
                            that.resetMoney()
                        } else if (result.resultCode == '6001' || result.resultCode == '99') {
                            Util.tipShow('您取消了支付！')
                            that.resetMoney()
                        } else if (result.resultCode == '6002') {
                            Util.tipShow('网络连接出错！')
                            that.resetMoney()
                        }
                    })
                })
            },
            doClickSuccess () {
                this.commentSuccess = false
                this.getPrize()
            },
            /**
             * 评论成功跳转页面
             */
            getPrize (orderId) {
                var that = this
                that.$router.push({name: 'fastPaySuccess', query: {orderId: orderId}})
            }
        }
    }
</script>

