<style lang="sass">
    @import '../sass/page/twoCommentReward.scss';
</style>
<template>
    <div class="page" id="two-comment-reward-page">
        <div class="item-tech">
            <div class="item-tech-head" :style="{ backgroundImage: 'url('+ techData.avatarUrl +')' }"></div>
            <div class="item-tech-info">
                <div class="item-tech-name">{{ techData.name }}<span>{{ techData.serialNo }}</span></div>
                <div class="item-tech-desc">您的认可是我进步的动力！</div>
            </div>
        </div>
        <!-- 第二次评论 -->
        <div class="item-two-comment" v-if="global.userAgent.isWX">
            <div class="item" :class="{ active: !creditSwitchOn && !moneySwitchOn }"></div>
            <div class="item-reward" v-if="creditSwitchOn || moneySwitchOn">
                <div class="item-reward-money" v-if="moneySwitchOn">
                    <div class="money" v-for="(item, index) in moneySettingList" :key="index" @click="doClickRedPackageReward(item, index, 'money')" :class="{ active: item.redStatus }">
                        <div :class="'amountType' + item.amountType"><span v-if="item.amountType == 1">{{ item.amount | MoneyFormatter }}</span></div>
                        <div>{{ item.amountType == 2 ? '其他金额' : item.description }}</div>
                    </div>
                </div>
                <div class="item-reward-integral" v-if="creditSwitchOn && global.userAgent.isWX">
                    <div class="integral" v-for="(item, index) in creditSettingList" :key="index" :class="{ active: item.creditStatus, insuInte: item.credit>currIntegralAccount }" @click="doClickCredit(item, index, 'integral')">
                        <div :style="{ backgroundImage: 'url('+ (item.imgPath || defaultImageUrl) +')' }"></div>
                        <div>{{ item.credit }}</div>
                    </div>
                    <div class="user-integral">(个人积分：{{ currIntegralAccount }})</div>
                </div>
            </div>
        </div>

        <div class="item-submit-button" :class="{ active: !global.userAgent.isWX || (!creditSwitchOn && !moneySwitchOn) }" @click="querySaveComment()">打赏</div>
        <div class="pop-modal item-comment-success" :class="{ active: commentSuccess }">
            <div>
                <div></div>
                <div>打赏成功</div>
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
                <div><div @click="doClickReward()">确定</div></div>
                <span @click="doClickCancleReward()"></span>
            </div>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import MoneyFormatter from '../filters/money-formatter'
    import Global from '../libs/global'
    import Util from '../libs/util'
    import Api from '../libs/api'
    import eventHub from '../libs/hub'
    import im from '../libs/im'

    export default {
        filters: {
            MoneyFormatter
        },
        data () {
            return {
                global: Global.data,
                isUserRewardPage: false,
                techId: '',
                commentId: '',
                techData: [],
                clubId: '',
                moneySettingList: [],
                creditSettingList: [],
                creditSwitchOn: true,
                moneySwitchOn: true,
                moneyLimit: '',
                currIntegralAccount: 0,
                rewardType: '',
                qrcodeId: '',
                qrcodeType: '',
                customMoney: '',
                belongingsId: '',
                orderId: '',
                amountType: '',
                commentSuccess: false,
                showCustomMoney: false,
                rewardFefaultStatus: true
            }
        },
        created () {
            let that = this
            let global = that.global
            let query = global.currPage.query
            let ss = Util.sessionStorage
            that.qrcodeId = ss('qrcodeId') || ''
            that.qrcodeType = ss('qrcodeType') || ''
            global.loading = false
            that.techId = query.techId != 'undefined' ? query.techId : ''
            that.clubId = query.clubId || global.clubId
            that.orderId = query.orderId || ''
            that.queryTechInfo()
            // that.queryReward()
        },
        methods: {
            /**
             * 获取技师信息
             */
            queryTechInfo () {
                let that = this
                let global = that.global
                that.$http.get(Api.CLUB_TECH_NICIAN, {
                    params: { techId: that.techId }
                }).then(res => {
                    res = res.body
                    that.techData = res.info
                    that.techData.serialNo = res.info.serialNo
                    that.techData.avatarUrl = res.info.avatarUrl || global.defaultHeader
                    that.techData.emchatId = res.emchatId
                    that.techData.clubName = res.clubName
                    that.clubId = res.info.clubId
                    global.loading = false
                    that.queryReward()
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
                    } else if (res.statusCode == 204) { // 会所关闭打赏
                        Util.tipShow(res.msg)
                        that.getPrize()
                    } else {
                        that.rewardFefaultStatus = false
                        Util.tipShow(res.msg)
                    }
                })
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
                // 打赏金额赋值
                that.customMoney = item.amountType != 2 && item.redStatus ? (item.amount / 100) : ''
                that.belongingsId = ''
                that.creditSettingList.map((creditItem) => {
                    creditItem.creditStatus = false
                })
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
                that.customMoney = 0
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
            resetMoney () {
                let that = this
                that.moneySettingList.map((moneyItem, moneyIndex) => {
                    moneyItem.redStatus = false
                    Vue.set(that.moneySettingList, moneyIndex, that.moneySettingList[moneyIndex])
                })
                that.customMoney = 0
            },
            /**
             * 发表评论
             */
            querySaveComment () {
                let that = this
                let global = that.global
                let ua = global.userAgent
                let selectGift = that.currentCreditList
                // if (!global.userAgent.isWX) {
                //     return
                // }
                console.log(that.rewardType)
                if (!that.rewardType) {
                    return Util.tipShow('请选择一种打赏方式！')
                } else if (that.rewardType == 'money') {
                    if (Number(that.customMoney) > that.moneyLimit / 100) {
                        Util.tipShow(`最多打赏${that.moneyLimit / 100}元`)
                        return false
                    }
                    if (that.amountType != 0 && !that.customMoney) {
                        Util.tipShow('请输入大于0的金额！')
                        return false
                    }
                    if (that.amountType != 0 && !ua.isWX && !ua.isAliPay) {
                        return Util.tipShow('请在微信或支付宝中打开！')
                    }
                } else if (that.rewardType == 'integral') {
                    if (selectGift.credit > that.currIntegralAccount) {
                        eventHub.$emit('set-credit-tip', { amount: selectGift.credit, show: true, type: 'gift' })
                    }
                }
                that.moneyReward(that.customMoney * 100, selectGift)
            },
            moneyReward (num, selectGift) {
                let that = this
                let global = that.global
                let ua = global.userAgent
                that.$http.post(Api.COMMENT_SAVE, {
                    comment: '', // 评论内容
                    giftId: that.belongingsId, // 礼物id
                    isAnonymous: '', // 是否匿名
                    rewardAmount: num, // 打赏金额
                    // rewardType: that.rewardType, // 打赏类型
                    star: '', // 星级
                    tagIds: '', // 标签id
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
             * 取消支付后不选中打赏区域
             */
            onResetMoneyReward () {
                this.dataStars.map((subItem, subIndex) => {
                    if (subIndex != this.currIndex) {
                        subItem.tagList.map(tagItem => {
                            tagItem.tagStatus = false
                        })
                    }
                })
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
                            that.$http.post(Api.PAY_RESULT, { prePayId: that.prePayId }).then(() => {
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
                        }
                    })
                })
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