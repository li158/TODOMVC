(function (window) {
// 'use strict';

function judge (todos,attr,val){
	for (var i = 0; i < todos.length; i++) {
        if (todos[i][attr] == val) {
            return todos[i];
        }
    }
}

//声明一个对象存储进行事项类别筛选的函数
let filters = {
	all (todos){
		return todos
	},
	active (todos){
		return todos.filter(todo => !todo.completed)
	},
	completed (todos){
		//书写函数判断是否存在completed为true,如果有todoType则为completed,如果没有则todoType为all
		var isCompleted = judge(todos,"completed",true);
		if(!isCompleted){
			return todos
		}else{
			return todos.filter(todo => todo.completed)
		}
	}
}

//封装函数以本地保存数据
const TODOS_KEY = "todos_vue";//在设置localStorage时需要指定一个键
let todoStorage = {//声明对象保存数据
	get (){//使用get方法读取数据
		return JSON.parse(localStorage.getItem(TODOS_KEY)) || [];
	},
	set (todos){//使用set方法更新本地存储
		localStorage.setItem(TODOS_KEY,JSON.stringify(todos));
	}
}

new Vue({
	el: "#app",
	data: {
		todos: todoStorage.get(),//用于存储事项信息
		newTodo: "",//临时存储新增内容，后续将值赋值到todos
		editingText: null,//保存当前编辑的内容
		beforeText: "",//保存编辑之前的内容
		todoType: "all",//保存事项的类别

	},
	methods: {
		//底部数量计算单位是否复数
		showS (word){
			return word + (this.amount === 1 ? '' : 's');
		},
		//添加内容
		addTodo (){
			var value = this.newTodo.trim();
			//利用时间戳做每一项的id，保证id不重复
			var time = new Date();
			var randomId = time.getMinutes() + time.getSeconds()
			//在回车时去除空格比直接写v-model.trim速度会略微提升，因为v-model.trim是在每次输入时就判断
			if(!value) return;
			console.log(randomId);
			this.todos.push({id:randomId,title:value,completed:false})
			this.newTodo = "";
		},
		//删除当前事项
		removeSingle (todo){
			var idx = this.todos.indexOf(todo);
			this.todos.splice(idx,1);
		},
		//删除已完成事项
		removeCompleted (){
			// this.todos = this.todos.filter(todo => !todo.completed);
			//优化：因为筛选了状态，所以可以根据filters筛选结果获取没有完成的事项
			this.todos = filters.active(this.todos)
		},
		//编辑时保存当前编辑的内容
		editText (todo){
			this.editingText = todo;
			this.beforeText = todo.title;
		},
		//取消编辑，并还原编辑之前的内容
		cancelEdit (todo){
			this.editingText = null;
			todo.title = this.beforeText;
		},
		//保存编辑
		editDone (todo){
			// 回车键也会触发失去焦点事件，所以同时使用时需要检测
			if(!this.editingText) return;
			this.editingText = null;
			todo.title = todo.title.trim();
			//判断保存编辑时内容是否为空
			if(todo.title === ""){
				this.removeSingle(todo)
			}
		}
	},
	computed: {
		//事项筛选处理,根据todoType获取数据
		filteredTodo (){
			return filters[this.todoType](this.todos);
		},
		//计算底部数量展示
		amount (){
			//使用箭头函数简写下面代码
			// return this.todos.filter(todo => !todo.completed).length;
			//优化：因为筛选了状态，所以可以根据filters筛选结果获取没有完成的事项
			return filters["active"](this.todos).length;
			// return this.todos.filter(function (todo){
			// 	return !todo.completed
			// }).length;
		},
		//全选与否
		allDone: {
			get (){
				return this.amount === 0;
			},
			set (value){//value代表全选按钮的状态
				this.todos.forEach(todo => {
					todo.completed = value;
				})
			}
		}
	},
	//通过自定义局部指令控制正在编辑的输入框自动获取焦点
	directives:{
		"auto-focus" (el,binding){
			//通过binding.value判断当前是否正在编辑并自动获取焦点
			if(binding.value){
				el.focus()
			}
		}
	},
	watch: {
		todos: {
			deep: true,
			handler: todoStorage.set
		}
	}
})



})(window);
