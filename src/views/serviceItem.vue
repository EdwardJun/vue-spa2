<style lang="sass">
    @import '../sass/page/serviceItem.scss';
</style>
<template>
    <div class="page" id="service-item-page" :scope="itemType" style="height: 100%;">
        <header>
            <div class="header">
                <div class="cover" @click="imageList ? imageMask = true:''"><img :src="coverUrl" />
                    <p class="num" v-if="imageList"><i class="ic-img"></i>{{imageList.length}}</p>
                </div>
                <div class="detail">
                    <div class="name">{{itemName}}</div>
                    <div class="club" v-if="sortExtendPriceList[0] && sortExtendPriceList[0].itemList[0]">
                        <span>￥{{sortExtendPriceList[0].itemList[0].price / 100}}<span> /{{sortExtendPriceList[0].itemList[0].amount}}{{sortExtendPriceList[0].itemList[0].unitName}}</span></span>
                        <i class="club-name">{{sortExtendPriceList[0].name}}</i>
                    </div> 
                    <div class="extend" v-if="sortExtendPriceList[0] && sortExtendPriceList[0].itemList[1]">加钟 ￥{{sortExtendPriceList[0].itemList[1].price / 100}} /{{sortExtendPriceList[0].itemList[1].amount}}{{sortExtendPriceList[0].itemList[1].unitName}}</div>
                    <!-- 如果没有会员价 原价样式会切换 -->
                    <div class="origin" v-if="sortExtendPriceList.length > 0">
                        <div class="price" v-if="mainPriceList.itemList && mainPriceList.itemList[0]">
                            <span>原价: </span><span>￥{{mainPriceList.itemList[0].price / 100}}</span><span> /{{mainPriceList.itemList[0].amount}}{{mainPriceList.itemList[0].unitName}}</span>
                        </div>
                        <div class="extend" v-if="mainPriceList.itemList && mainPriceList.itemList[1]">加钟 ￥{{ mainPriceList.itemList[1].price / 100}} /{{mainPriceList.itemList[1].amount}}{{mainPriceList.itemList[1].unitName}}</div>
                    </div>
                    <div class="originOtherStyle" v-else>
                        <div class="priceOtherStyle" v-if="mainPriceList.itemList && mainPriceList.itemList[0]">
                            <span>￥{{mainPriceList.itemList[0].price / 100}}</span><span> /{{mainPriceList.itemList[0].amount}}{{mainPriceList.itemList[0].unitName}}</span>
                        </div>
                        <div class="extendOtherStyle" v-if="mainPriceList.itemList && mainPriceList.itemList[1]">加钟 ￥{{ mainPriceList.itemList[1].price / 100}} /{{mainPriceList.itemList[1].amount}}{{mainPriceList.itemList[1].unitName}}</div>
                    </div>
                </div>
            </div>
        </header>
        <!-- 会员专享 -->
        <!-- 当会员价的个数 大于等于2时 才显示 -->
        <section class="only-member" v-if="sortExtendPriceList.length >= 2">
            <div class="title">
                <div>会员专享</div>
                <!-- 开通会员跳转 后续会有需求 -->
                <!-- <div>开通会员<span class="openMember-icon"></span></div> -->
            </div>
            <div class="member-wrap">
                <div class="member-con" v-for="(sortItem, sortIndex) in sortExtendPriceList" :key="sortIndex">
                    <div class="label">{{sortItem.name}}</div>
                    <div class="price" v-if="sortItem.itemList && sortItem.itemList[0]">￥{{sortItem.itemList[0].price / 100}} /<span>{{sortItem.itemList[0].amount}}{{sortItem.itemList[0].unitName}}</span></div>
                    <div class="extend" v-if="sortItem.itemList && sortItem.itemList[1]">加钟: {{sortItem.itemList[1].price / 100}} /{{sortItem.itemList[1].amount}}{{sortItem.itemList[1].unitName}}</div>
                </div>
                <div class="member-bottom-line"></div>
            </div>
        </section>
        <section class="margin-area"></section>
        <!--项目说明-->
        <section class="wrap">
            <div class="title">详情</div>
            <div class="content description" v-if="description" v-html="description"></div>
            <div class="content description" v-else="description">暂无项目说明</div>
        </section>
        <!--关联技师&项目-->
        <section class="margin-area"></section>
        <section class="wrap">
            <div class="title">推荐</div>
            <div class="content">
                <div class="tab-wrap">
                    <ul class="tab">
                        <li @click="dochangeTab('tech')"><a :class="{active:currentTab == 'tech'}">项目技师</a></li>
                        <li @click="dochangeTab('act')"><a :class="{active:currentTab == 'act'}">相关活动</a></li>
                    </ul>
                </div> 
                <!--关联技师-->
                <ul class="items tech-list" v-if="itemType =='spa' && currentTab == 'tech'">
                    <li class="empty" v-if="techList.length == 0">暂无关联技师</li>
                    <li class="item" v-if="techList.length != 0" v-for="(item, itemIndex) in techList"
                        @click="doClickTechDetail(item.id, item.status)" :key="itemIndex">
                        <div class="avatar">
                            <img :src="item.avatarUrl || global.defaultHeader">
                            <p class="status free" v-if="item.status == 'free'">闲</p>
                            <p class="status busy" v-if="item.status == 'busy'">忙</p>
                        </div>
                        <div class="detail">
                            <p class="name">{{item.name}} <span v-if="item.serialNo">{{item.serialNo}}</span></p>
                            <p class="star" v-if="item.star != 0">{{item.star / 10}}</p>
                            <p class="star" v-if="item.star == 0">暂无</p>
                            <a class="doit">约Ta</a>
                        </div>
                    </li>
                </ul>
                <!--关联活动-->
                <ul class="items act-list" v-if="currentTab == 'act'">
                    <li class="empty" v-if="activeList.length == 0">暂无关联活动</li>
                    <li class="item " v-if="activeList.length != 0" v-for="item in activeList">
                        <div class="avatar" v-if="item.actType=='itemCard'">
                            <img :src="item.smallImageUrl || global.defaultServiceItemImgUrl">
                            <p class="type item_package" v-if="item.cardType == 'item_package'">套餐</p>
                            <p class="type credit_gift" v-if="item.cardType == 'credit_gift'">积分</p>
                            <p class="type item_card" v-if="item.cardType == 'item_card'">次卡</p>
                        </div>
                        <div class="avatar" v-if="item.actType=='groupBuy'">
                            <img :src="item.itemImageUrl || global.defaultServiceItemImgUrl">
                            <p class="type item_package">拼团</p>
                        </div>
                        <div class="detail" @click="doClickActDetail(item.id,item.cardType)" v-if="item.actType=='itemCard'">
                            <p class="name">{{item.name}} <span v-if="item.serialNo">{{item.serialNo}}</span></p>
                            <p class="time">活动时间：
                                <span v-if="item.endTime">至{{item.endTime}}结束</span>
                                <span v-if="!item.endTime">无限制</span>
                            </p>
                            <i class="icon-arrow-right"></i>
                        </div>
                        <div class="detail" @click="doClickGroupBuyActDetail(item)" v-if="item.actType=='groupBuy'">
                            <p class="name">{{item.name}}</p>
                            <p class="time">活动时间：{{ item.activityPeriod }}</p>
                            <i class="icon-arrow-right"></i>
                        </div>
                    </li>
                </ul>
            </div>
        </section>
        <!--相册-->
        <transition name="fade">
            <div class="image-box" v-if="imageMask" @click="imageMask = false">
                <swiper class="pic-swipe" :options="swiperOption">
                    <swiper-slide v-for="(pic,index) in imageList" :key="index">
                        <div class="img-box"><img :src="pic"/></div>
                    </swiper-slide>
                    <div class="swiper-pagination" slot="pagination"></div>
                </swiper>
            </div>
        </transition>
    </div>
</template>
<script>
    import Global from '../libs/global'
    import ItemPriceFormatter from '../filters/item-price-formatter'
    import Util from '../libs/util'
    import GroupBuyAct from '../components/group-buy-act'
    import eventHub from '../libs/hub'

    export default {
        components: {
            GroupBuyAct
        },
        data () {
            return {
                global: Global.data,
                serviceItemId: '',
                itemType: '',
                itemName: '',
                coverUrl: '',
                imageList: [],
                priceList: [],
                mainPriceList: [],
                extendPriceList: [], // 会员价数组
                sortExtendPriceList: [], // 排序后的会员价数组
                description: [],
                currentTab: 'tech',
                techList: [],
                imageMask: false,

                canOrder: true, // 是否可以预约
                appointType: '',
                telephone: [], // 电话

                category: 'serviceItem',

                activeList: [],
                swiperOption: {
                    observeParents: true,
                    zoom: true,
                    zoomMax: 2,
                    pagination: '.swiper-pagination'
                }
            }
        },
        created () {
            let that = this
            let global = that.global
            that.$http.get('../api/v1/club/category/getCategoryItemList/new', {params: {clubId: global.clubId}}).then(res => {
                res = res.body
                if (res.statusCode == 200) {}
            })
            let pageParam = global.currPage.query
            that.serviceItemId = pageParam.id
            if (!that.serviceItemId) {
                return that.$router.back()
            } else { // 查询推荐项目
                that.$http.get('../api/v2/project/item',
                    {
                        params: {itemId: pageParam.id}
                    }
                ).then((res) => {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        that.itemType = res.scope || 'spa'
                        that.itemName = res.name
                        that.coverUrl = res.coverUrl || global.defaultServiceItemImgUrl
                        that.imageList = res.imageUrlList
                        that.priceList = res.priceList
                        // price
                        that.mainPriceList = res.priceList[0]
                        if (res.priceList.length > 1) {
                            res.priceList.forEach((item, index) => {
                                if (index > 0) {
                                    that.extendPriceList.push(item)
                                }
                            })
                        }
                        if (that.extendPriceList.length > 1) {
                            // 根据价格从小到大排序
                            that.sortExtendPriceList = [...that.extendPriceList.sort(Util.sortBy('price', true, 'itemList'))]
                        } else {
                            that.sortExtendPriceList = [...that.extendPriceList]
                        }
                        that.description = res.description
                        that.queryTechList()
                        that.queryActiveList()
                        global.loading = false
                    } else {
                        Util.tipShow(global.loadError)
                        return that.$router.back()
                    }
                }, function () {
                    Util.tipShow(global.loadError)
                    return that.$router.back()
                })
            }
        },
        computed: {},
        filters: {
            itemPriceFormatter: ItemPriceFormatter
        },
        methods: {
            queryTechList () {
                let that = this
                that.$http.get('../api/v2/project/spa/item/tech/list', {
                    params: {itemId: that.serviceItemId}
                }).then(res => {
                    res = res.body
                    if (res.statusCode == 200) {
                        that.techList = res.respData
                    }
                })
            },
            queryActiveList () {
                let that = this
                let global = that.global
                that.$http.get('../api/v2/project/item/activity/list', {
                    params: {itemId: that.serviceItemId, clubId: global.clubId}
                }).then((res) => {
                    res = res.body
                    if (res.statusCode == 200) {
                        res = res.respData
                        let activeList = []
                        if (res.itemCard) {
                            res.itemCard.forEach(item => {
                                item.actType = 'itemCard'
                                activeList.push(item)
                            })
                        }
                        if (res.groupBuy) {
                            res.groupBuy.forEach(item => {
                                item.actType = 'groupBuy'
                                activeList.push(item)
                            })
                        }
                        that.activeList = activeList
                    }
                })
            },
            dochangeTab (type) {
                let that = this
                that.currentTab = type
            },
            // 技师详情
            doClickTechDetail (techId, status) {
                let that = this
                Global.setUmengStatistics(that.category, '约ta', '首页项目详情页预约')
                if (status == 'rest') {
                    Util.tipShow('该技师正在休假中，请预约其他技师')
                    return false
                }
                // 查询会所的预约类型
                that.$http.get('../api/v2/club/technician/{techId}/section/bottom', {params: {techId: techId}}).then(function (appointRes) {
                    appointRes = appointRes.body
                    if (appointRes.statusCode == 200) {
                        appointRes = appointRes.respData
                        that.telephone = appointRes.telephone ? appointRes.telephone.split(',') : []
                        that.appointType = appointRes.appointType
                        if (that.canOrder) {
                            if (that.appointType == 'phone') {
                                if (!that.global.isLogin) { // 未登录，跳转到登录页
                                    that.$router.push({name: 'login'})
                                } else if (that.telephone.length == 0) {
                                    Util.tipShow('暂无联系电话！')
                                } else {
                                    eventHub.$emit('change-tel-detail', true)
                                }
                            } else if (that.appointType == 'paid' || that.appointType == 'paid_full') {
                                if (!that.global.userAgent.isWX) {
                                    if (Global.checkAccess('confirmOrder')) {
                                        Util.tipShow('此会所需支付预约，请在微信客户端中打开！')
                                    } else {
                                        Util.tipShow('会所未开通预约权限！')
                                    }
                                } else {
                                    that.$router.push({
                                        name: 'confirmOrder',
                                        query: {techId: techId, itemId: that.serviceItemId, clubId: that.global.clubId}
                                    })
                                }
                            } else if (that.appointType == 'appoint') {
                                that.$router.push({
                                    name: 'confirmOrder',
                                    query: {techId: techId, itemId: that.serviceItemId, clubId: that.global.clubId}
                                })
                            } else {
                                Util.tipShow('会所不支持线上预约！')
                            }
                        }
                    }
                })
                // let params = {id: techId}
                // that.$router.push({name: 'technicianDetail', query: params})
            },
            // 套餐详情
            doClickActDetail (itemId, type) {
                let that = this
                // console.log({id: itemId, type: type})
                switch (type) {
                case 'item_package':
                    that.$router.push({name: 'itemPackageDetail', query: {id: itemId, type: type}})
                    break
                case 'credit_gift':
                    that.$router.push({name: 'itemPackageDetail', query: {id: itemId, type: type}})
                    break
                case 'item_card':
                    that.$router.push({name: 'itemCardDetail', query: {id: itemId, type: type}})
                    break
                }
            },
            doClickGroupBuyActDetail (item) {
                this.$router.push({name: 'groupBuyActDetail', query: {id: item.id}})
            }
        }
    }
</script>
