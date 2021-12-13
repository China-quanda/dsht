<template>
  <div>
<!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="9">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="orderlist" border stripe >
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
        <el-table-column label="是否付款" width="80px">
          <template slot-scope="scope">
           <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
           <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
        <el-table-column label="下单时间"  width="140px">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      background >
    </el-pagination>
    </el-card>
    <!-- 修改地址的对话框 -->
    <el-dialog
  title="修改地址"
  :visible.sync="editdialogVisible"
  width="50%"
  @close="editClose">
  <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px" >
  <el-form-item label="省市区/县" prop="address1">
    <el-cascader :options="cityData" v-model="editForm.address1"></el-cascader>
  </el-form-item>
  <el-form-item label="详细地址" prop="address2">
    <el-input v-model="editForm.address2"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editdialogVisible = false">确 定</el-button>
  </span>
</el-dialog>
 <!-- 物流的对话框 -->
    <el-dialog
  title="物流进度"
  :visible.sync="progressDialogVisible"
  width="50%">
  <!-- 时间线 -->
  <el-timeline >
    <el-timeline-item
      v-for="(activity, index) in progressInfo"
      :key="index"
      :timestamp="activity.time">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
</el-dialog>

  </div>
</template>

<script>
import cityData from './citydata'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 订单列表数据
      orderlist: [],
      total: 0,
      editdialogVisible: false,
      editForm: {
        address1: [],
        address2: ''
      },
      editRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      cityData,
      progressDialogVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表数据
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表数据失败！')
      }
      this.orderlist = res.data.goods
      this.total = res.data.total
      console.log(this.orderlist)
    },
    // 触发了每页显示条数
    handleSizeChange (pagesize) {
      console.log(pagesize)
      this.queryInfo.pagesize = pagesize
      this.getOrderList()
    },
    // 触发了页码
    handleCurrentChange (pagenum) {
      console.log(pagenum)
      this.queryInfo.pagenum = pagenum
      this.getOrderList()
    },
    // 展示修改地址的对话框
    showBox () {
      this.editdialogVisible = true
    },
    // 监听修改地址对话框关闭事件
    editClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 展示物流信息对话框
    async showProgress () {
      this.progressDialogVisible = true
      const { data: res } = await this.$http.get('kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败！')
      }
      this.progressInfo = res.data
      console.log(this.progressInfo)
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination{
  margin-top: 15px;
  text-align: center;
}
.el-cascader{
  width: 100%;
}
</style>
