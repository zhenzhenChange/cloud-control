<template>
  <div class="MailList">
    <ButtonList :buttonListInfos="buttonListInfos" />
    <Divider dashed />
    <Button type="info" icon="md-refresh" @click="refreshData">刷新数据</Button>
    <PagedTable :data="data" :ref="PagedTableRef" :dataColumns="MailColumns" />
    <CommonComplexModal ref="MailSetComplexModal" />
    <CommonConfirmModal :data="operationData" :ref="ConfirmModalRef" :config="operationConfig" />
    <Drawer width="900" :closable="false" v-model="isShowDrawer">
      <div slot="header" class="header-drawer">
        <div><Icon class="mr-10" color="#2D8CF0" type="md-create" />创建通讯录加粉任务</div>
        <div>
          <Button class="mr-10" type="warning" icon="md-refresh" @click="resetClick">重置</Button>
          <Button type="success" icon="md-checkmark" @click="createFansTask">立即提交</Button>
        </div>
      </div>
      <Row>
        <Col span="11">
          <Input clearable v-model="fansTaskName" placeholder="请设置任务名称">
            <span slot="prepend">任务名称</span>
          </Input>
        </Col>
      </Row>
      <Row class="mt-10">
        <Col span="11">
          <Input v-model="currentGroupName" disabled>
            <span slot="prepend">当前分组</span>
          </Input>
        </Col>
        <Col span="12" offset="1">
          <Input v-model="currentGroupID" disabled>
            <span slot="prepend">分组ID</span>
          </Input>
        </Col>
      </Row>
      <Row class="mt-10">
        <Col span="24">
          <span class="ml-10 mr-10">号码格式</span>
          <RadioGroup v-model="mailType">
            <Radio label="纯手机号"></Radio>
            <Radio label="姓名----手机号"></Radio>
          </RadioGroup>
        </Col>
      </Row>
      <Row class="mt-10">
        <Col span="11" class="span-prefix">
          <div>
            <span class="ml-10 mr-10">号码前缀</span>
            <RadioGroup v-model="prefix">
              <Radio label="开启"></Radio>
              <Radio label="关闭"></Radio>
            </RadioGroup>
          </div>
        </Col>
        <Col span="12" offset="1">
          <Input disabled placeholder="开启后将自动给手机号码加上【+86】前缀" />
        </Col>
      </Row>
      <Row class="mt-10">
        <Col span="6">
          <div class="upload">
            <span class="title ml-10 mr-10">加粉数据</span>
            <Upload
              :show-upload-list="false"
              action="https://www.baidu.com/"
              :before-upload="handleBeforeUpload"
            >
              <Button icon="md-cloud-upload">上传TXT文件</Button>
            </Upload>
          </div>
        </Col>
        <Col span="4" offset="1">
          <Input disabled :placeholder="`数据条数：${mailListLength}`" />
        </Col>
        <Col span="12" offset="1">
          <Input disabled placeholder="每次上传都会清空上一次" />
        </Col>
      </Row>
      <Row class="mt-10">
        <Col span="24">
          <Input
            type="textarea"
            v-model="mailList"
            :autosize="{ minRows: 5, maxRows: 15 }"
            placeholder="请将通讯录粘贴或上传至此处，一条通讯录占一行"
          />
        </Col>
      </Row>
      <Row class="mt-10">
        <Col span="11">
          <Input clearable v-model="passageway" placeholder="可自定义加粉通道">
            <span slot="prepend">加粉通道</span>
          </Input>
        </Col>
        <Col span="12" offset="1">
          <Input disabled placeholder="默认为10通道（通讯录）" />
        </Col>
      </Row>
      <Row class="mt-10">
        <Col span="24">
          <Input clearable v-model="validInfo" placeholder="可自定义验证信息（默认为素材库模板）">
            <span slot="prepend">验证信息</span>
          </Input>
        </Col>
      </Row>
      <Row class="mt-10">
        <Col span="11">
          <Input clearable class="float-left" v-model="startTime" placeholder="请设置开始执行时间">
            <span slot="prepend">执行时间</span>
          </Input>
        </Col>
        <Col span="12" offset="1">
          <Input disabled :placeholder="`任务将于 ${startTime ? startTime : 0} 秒后开始执行`" />
        </Col>
      </Row>
      <Row class="mt-10">
        <Col span="11">
          <Input clearable class="float-left" v-model="blankTime" placeholder="请设置间隔时长">
            <span slot="prepend">间隔时长</span>
          </Input>
        </Col>
        <Col span="12" offset="1">
          <Input
            disabled
            :placeholder="
              `多个账号进行加粉时，为单个账号设置间隔时长 ${blankTime ? blankTime : 0} 秒`
            "
          />
        </Col>
      </Row>
      <Row class="mt-10">
        <Col span="11">
          <Input clearable v-model="requestNum" placeholder="请设置请求数量">
            <span slot="prepend">单号请求</span>
          </Input>
        </Col>
        <Col span="12" offset="1">
          <Input disabled placeholder="每个账号最多可提交的好友申请数" />
        </Col>
      </Row>
      <Row class="mt-10">
        <Col span="11">
          <Input clearable class="float-left" v-model="freqInte" placeholder="请设置频繁间隔">
            <span slot="prepend">频繁间隔</span>
          </Input>
        </Col>
        <Col span="12" offset="1">
          <Input
            disabled
            :placeholder="`每频繁一次隔 ${freqInte ? freqInte : 0} 秒后，重新开始加粉`"
          />
        </Col>
      </Row>
      <Row class="mt-10 mb-10">
        <Col span="11">
          <Input clearable class="float-left" v-model="freqLimit" placeholder="请设置频繁上限">
            <span slot="prepend">频繁上限</span>
          </Input>
        </Col>
        <Col span="12" offset="1">
          <Input disabled :placeholder="`总频繁数达到 ${freqLimit ? freqLimit : 0} 次后，停止加粉`">
          </Input>
        </Col>
      </Row>
    </Drawer>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
export default {
  data() {
    return {
      data: [],
      prefix: "开启",
      freqInte: "",
      mailList: "",
      pageSize: 10,
      pageIndex: 0,
      blankTime: "",
      freqLimit: "",
      startTime: "",
      validInfo: "",
      requestNum: "",
      passageway: "",
      fansTaskName: "",
      operationData: [],
      currentGroupID: "",
      isShowDrawer: false,
      mailType: "纯手机号",
      operationConfig: {},
      currentGroupName: "",
      PagedTableRef: "MailPagedTable",
      ConfirmModalRef: "MailConfirmModal",
      buttonListInfos: [
        { type: "error", icon: "md-trash", id: "clearMailList", name: "清空已上传的通讯录" }
      ],
      MailColumns: [
        { width: 70, align: "center", title: "序号", key: "serialNumber" },
        { align: "center", title: "分组ID", key: "groupId" },
        { align: "center", title: "分组名称", key: "groupName" },
        { align: "center", title: "创建时间", key: "groupCreateDate" },
        { align: "center", title: "组内账号总数", key: "total" },
        {
          width: 230,
          title: "操作",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: { type: "info", icon: "md-person-add" },
                  on: {
                    click: () => {
                      const { groupName, groupId } = params.row
                      this.isShowDrawer = true
                      this.currentGroupID = groupId
                      this.currentGroupName = groupName
                    }
                  }
                },
                "创建通讯录加粉任务"
              )
            ])
          }
        }
      ]
    }
  },
  created() {
    this.initData()
  },
  computed: {
    ...mapGetters(["user_id", "GroupDataTotal"]),
    mailListLength() {
      return this.mailList.split(/[\r\n]/g).filter(item => item !== "").length
    }
  },
  methods: {
    async initData() {
      this.data = []
      this.$nextTick(() => (this.$refs[this.PagedTableRef].total = Number(this.GroupDataTotal)))
      const params = {
        userId: this.user_id,
        size: Number(this.pageSize),
        currentPage: Number(this.pageIndex) + 1
      }
      const data = await this.$http.get("/account/getAllGroup", { params })
      data.forEach(async (item, index) => {
        this.data.push({
          serialNumber: index + 1,
          groupName: item.tbGroupEntity.groupName,
          groupId: String(item.tbGroupEntity.groupId),
          groupCreateDate: this.$options.filters.date(item.tbGroupEntity.groupCreateDate),
          total: item.accountCount
        })
      })
    },
    handleBeforeUpload(file) {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => (this.mailList = reader.result)
      return false
    },
    resetClick() {
      this.fansTaskName = ""
      this.mailList = ""
      this.validInfo = ""
      this.startTime = ""
      this.blankTime = ""
      this.requestNum = ""
      this.freqInte = ""
      this.freqLimit = ""
      this.passageway = ""
    },
    async createFansTask() {
      const msgArr = [
        { name: "任务名称", value: this.fansTaskName },
        { name: "加粉数据", value: this.mailList },
        { name: "执行时间", value: this.startTime },
        { name: "单号请求", value: this.requestNum },
        { name: "间隔时间", value: this.blankTime },
        { name: "频繁间隔", value: this.freqInte },
        { name: "频繁上限", value: this.freqLimit }
      ]
      let flag = false
      msgArr.forEach(item => {
        if (!item.value) {
          this.$Message.warning(`${item.name}不能为空`)
          flag = false
          return
        }
        flag = true
      })

      if (!/^\d+$/.test(this.passageway)) {
        this.$Message.warning(`加粉通道只能为正整数`)
        return
      }
      const rand = Math.floor(Math.random() * (1 - 100) + 100)
      const phoneGroup = `${rand}${this.currentGroupID}`
      const args = {
        content: this.validInfo,
        endTime: 20,
        frequentlyInterval: this.freqInte,
        frequentlyMaxNumber: this.freqLimit,
        groupId: this.currentGroupID,
        interval: this.blankTime,
        maxRequest: this.requestNum,
        origin: Number(this.passageway),
        phoneGroup,
        startTime: this.startTime,
        taskName: this.fansTaskName
      }
      if (flag) {
        const data = []
        const contact = this.mailList.split(/[\r\n]/g).filter(item => item !== "")
        if (this.mailType === "纯手机号") {
          contact.forEach(item => data.push({ name: null, phoneNumber: item }))
        } else {
          contact.forEach(item => {
            const name = item.split(/----/g)[0]
            const phoneNumber = item.split(/----/g)[1]
            data.push({ name, phoneNumber })
          })
        }
        if (this.prefix === "开启") {
          data.forEach(item => (item.phoneNumber = "0086" + item.phoneNumber))
        }
        const upload = { data, userId: this.user_id, phoneGroup, taskName: this.fansTaskName }
        await this.$http.post("/contact/addPhoneToSQL", upload)
        const { msg } = await this.$http.post("/contact/addFriendFromSQL", args)
        this.$Message.info(msg)
        this.resetClick()
      }
    },
    async clearMailList() {
      this.$refs[this.ConfirmModalRef].isShowConfirmModal = false
      const { msg } = await this.$http.post("/contact/clearContact", { user_id: this.user_id })
      this.$Message.info(msg)
    },
    refreshData() {
      this.initData()
    }
  }
}
</script>

<style lang="scss" scoped>
.ivu-radio-group {
  vertical-align: bottom;
}

.header-drawer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upload {
  .title {
    float: left;
    height: 32px;
    display: block;
    line-height: 32px;
  }
}

.span-prefix {
  div {
    height: 32px;
    line-height: 32px;
    span {
      height: 100%;
      padding-top: 1px;
      display: inline-block;
    }
    ::v-deep .ivu-radio-wrapper {
      vertical-align: baseline;
    }
  }
}
</style>
