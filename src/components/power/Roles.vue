<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-button type="primary" @click="addRoles">添加角色</el-button>
      <el-table :data="roleslist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',i1 === 0 ? 'bdtop' : '','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag  closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id" >
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag  type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRoles(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRoles(scope.row.id)"
              >删除</el-button
            >
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form
        :model="addRolesFrom"
        :rules="addRolesFromRules"
        ref="addRolesFromRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesFrom.roleDesc" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        :model="editRolesFrom"
        :rules="addRolesFromRules"
        ref="editRolesFromRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesFrom.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesFrom.roleDesc" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
  title="分配权限"
  :visible.sync="steRightDialogVisible"
  width="50%" @close="steRightClose">
  <!-- 树形控件 -->
  <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="steRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表数据
      roleslist: [],
      // 默认隐藏对话框
      addDialogVisible: false,
      // 添加表单数据
      addRolesFrom: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单的验证规则对象
      addRolesFromRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '角色描述', trigger: 'blur' },
          {
            min: 2,
            max: 50,
            message: '长度在 2 到 50 个字符',
            trigger: 'blur'
          }
        ]
      },
      // 编辑角色对话框 默认不显示
      editDialogVisible: false,
      // 根据id查询到的用户对象
      editRolesFrom: {},
      // 分配权限对话框 默认隐藏
      steRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配权限的id
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.roleslist = res.data
    },
    // 点击添加角色按钮 弹出添加用户对话框
    addRoles () {
      this.addDialogVisible = true
    },
    // 监听添加角色 关闭对话框的事件
    addDialogClose () {
      // 关闭对话框 自动重置表单数据
      this.$refs.addRolesFromRef.resetFields()
    },
    // 点击对话框 确认 添加角色
    add () {
      // 1,先判断表单数据是否通过验证
      this.$refs.addRolesFromRef.validate(async (valid) => {
        if (!valid) return
        // 2,验证成功后 发起网络请求
        const { data: res } = await this.$http.post('roles', this.addRolesFrom)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败 ！')
        }
        this.addDialogVisible = false
        this.getRolesList()
        this.$message.success('添加角色成功！')
      })
    },
    // 删除角色 根据id删除角色信息
    deleteRoles (id) {
      this.$confirm('是否删除该角色 ？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('roles/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error('删除该角色失败！ 请重试！')
          }
          this.getRolesList()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 点击编辑按钮 弹出编辑角色对话框
    async editRoles (id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取该角色失败！')
      }
      this.editRolesFrom = res.data
      console.log(this.editRolesFrom)
    },
    // 监听编辑角色 关闭事件
    editDialogClose () {
      // 关闭对话框 自动重置表单数据
      this.$refs.editRolesFromRef.resetFields()
    },
    // 点击编辑角色对话框确定按钮 更新该角色信息
    edit () {
      this.$refs.editRolesFromRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editRolesFrom.roleId,
          {
            roleName: this.editRolesFrom.roleName,
            roleDesc: this.editRolesFrom.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('编辑该角色信息失败！')
        }
        this.editDialogVisible = false
        this.getRolesList()
        this.$message.success('更新该角色信息成功')
      })
    },
    // 根据id删除对应的权限
    removeRightById (role, rightId) {
      // 弹框提示用户是否删除
      this.$confirm('是否删除权限？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        }
        role.children = res.data
        this.$message({
          type: 'success',
          message: '删除权限成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取所有权限列表失败!')
      }
      // 把获取到的所有权限保存到data中
      this.rightsList = res.data
      console.log(this.rightsList)
      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.defKeys)
      this.steRightDialogVisible = true
    },
    // 通过递归的形式 获取角色下所有三级权限的id，并保存到数组中 defKeys 数组中
    getLeafKeys (node, arr) {
      // 如果当前node节点不包含children属性。则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    steRightClose () {
      this.defKeys = []
    },
    // 点击确定为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.steRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;
}
.bdtop{
  border-top: 1px solid #eee;

}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
