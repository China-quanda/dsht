<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区 -->
    <el-card class="box-card">
      <!-- 搜索 与添加-->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input
            clearable
            placeholder="请输入内容"
            v-model="queryInfo.query"
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" size="min" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="username" label="姓名" width="120">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180">
        </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="row">
            <el-switch
              v-model="row.row.mg_state"
              @change="userStateChanged(row.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      title="编辑用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleClose"
    >
      <div>
        <p>当前的用户：{{ userinfo.username }}</p>
        <p>当前的角色：{{ userinfo.role_name }}</p>
        <p>
          分配新角色：
          <template>
            <el-select v-model="selecteRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </template>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义验证邮箱的规则
    const checkEmail = (rule, value, cb) => {
      const pattern = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/
      if (pattern.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱!'))
    }
    // 自定义验证手机号的规则
    const checkMobile = (rule, value, cb) => {
      const regMobile = /0?(13|14|15|17|18|19)[0-9]{9}/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号码!'))
    }
    return {
      //   获取用户列表的参数对象
      queryInfo: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 2
      },
      // 用户列表数据
      userList: [],
      // 数据总条数
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 15,
            message: '用户名的长度在3～15个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 25,
            message: '用户名的长度在6～25个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制编辑用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户对象
      editForm: {},
      // 编辑用户表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 分配角色对话框 默认隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userinfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的Id值
      selecteRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户列表
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听switch事件 更改状态
    async userStateChanged (userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听 添加用户对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定 添加用户
    addUser () {
      // 1,先对表单进行预校验
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 2，校验成功后可以发起网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        // 隐藏对话框
        this.addDialogVisible = false
        // 重新获取用户最新数据
        this.getUserList()
      })
    },
    // 点击编辑 对话框
    async showEditDialog (id) {
      // 点击编辑按钮弹出编辑按钮对话框
      this.editDialogVisible = true
      // 发起网络请求数据
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败！')
      }
      // 把请求到的数据赋值给data
      this.editForm = res.data
    },
    // 监听编辑用户对话框的关闭事件
    editDialogClosed () {
      // 重置表单数据
      this.$refs.editFormRef.resetFields()
    },
    // 编辑用户信息 并提交
    editUser () {
      // 1先对表单数据进行验证
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        // 2发起网络请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getUserList()
        // 提示修改成功
        this.$message.success(res.meta.msg)
      })
    },
    // 点击删除按钮 根据id删除对应的用户信息
    async removeUserById (id) {
      const confirmResult = await this.$confirm('是否删除该用户 ？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      // 确认 返回 confirm
      // 取消 返回 cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除该用户失败！ 请重试！')
      }
      this.$message.success('删除成功!')
      this.getUserList()
    },
    // 点击分配权限 显示分配权限对话框
    async setRole (userinfo) {
      this.userinfo = userinfo
      // 在展示对话框之前，先获取所有角色的列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    async saveRoleInfo () {
      if (!this.selecteRoleId) {
        return this.$message.error('请选择要分配的角色!')
      }
      const { data: res } = await this.$http.put(`users/${this.userinfo.id}/role`, { rid: this.selecteRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败！')
      }
      this.$message.success('更新角色成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色对话框的关闭事件
    setRoleClose () {
      this.selecteRoleId = ''
      this.userinfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
  text-align: center;
}
</style>
