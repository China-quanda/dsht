<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <!-- 表格区域 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :expand-type="false"
        :selection-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <!-- {{scope.row.cat_name}} -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="swhoeditCate(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateClose"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_name">
          <el-cascader
            class="w100"
            clearable
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
              checkStrictly: true,
            }"
            @change="parentCateChange"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editCateClose"
    >
      <!-- 编辑分类的表单 -->
      <el-form
        :model="editCateForm"
        :rules="addCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      // 总数据条数
      total: 0,
      // 为taba指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      // 添加分类的表单对象
      addCateForm: {
        // 要添加的分类名称
        cat_name: '',
        // 父级分类ID
        cat_pid: 0,
        // 分类的等级，默认为一级
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的数据列表
      parentCateList: [],
      // 级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 编辑对话框 模式隐藏
      editDialogVisible: false,
      // 编辑分类对象
      editCateForm: {}
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败！')
      }
      // 把数据列表赋值给data
      this.cateList = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
      console.log(res.data)
    },
    // 监听pagesize 改变
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum 改变
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击添加按钮 弹出对话框
    showAddCateDialog () {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChange () {
      console.log(this.selectedKeys)
      // 如果selectedKeys 数组中的lenght大于0，证明选择了父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮添加新的分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件 重置表单数据
    addCateClose () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 点击删除按钮 根据id删除分类
    async deleteCate (id) {
      this.$confirm('确认要删除该商品分类吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败!')
        }
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getCateList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 监听编辑对话框的关闭事件
    editCateClose () {},
    // 点击编辑按钮显示编辑对话框
    swhoeditCate (edit) {
      this.editCateForm = edit
      this.editDialogVisible = true
    },
    // 点击了编辑对话框里的确定按钮
    async editCate () {
      const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
      if (res.meta.status !== 200) {
        return this.$message.error('编辑该分类失败！')
      }
      this.$message.success('更新该分类成功')
      this.getCateList()
      this.editDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
  margin-bottom: 15px;
}
.w100 {
  width: 100%;
}
</style>
