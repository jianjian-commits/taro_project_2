指引都写在 guides 下

比如 初始化是 
init/guides/xxx.js，切里面的组件需要 guideTypeHOC 包裹

# 注意

引导涉及 selector 去获取想要的 dom，通过 id 和 className 去获取，但是并不是所有都可以很方便的通过 id 和 className 去获得。甚至大部分只能通过 className 去获得，甚至需要入侵到组件内部

所以可能导致引导失效，如果失效就要重新调整了

但是要注意代码要谨慎，做好容错逻辑
